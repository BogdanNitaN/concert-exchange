import { NextRequest, NextResponse } from 'next/server'

const CHARTEX_BASE = 'https://api.chartex.com'

async function chartexFetch(path: string) {
  try {
    const res = await fetch(CHARTEX_BASE + path, {
      headers: {
        'X-APP-ID': process.env.CHARTEX_APP_ID || '',
        'X-APP-TOKEN': process.env.CHARTEX_APP_TOKEN || '',
      },
      next: { revalidate: 3600 }
    })
    return await res.json()
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action') || 'trending'
  const country = request.nextUrl.searchParams.get('country') || 'RO'
  const limit = request.nextUrl.searchParams.get('limit') || '20'
  const artistName = request.nextUrl.searchParams.get('artist') || ''
  const tiktokUsername = request.nextUrl.searchParams.get('tiktok') || ''
  const instagramUsername = request.nextUrl.searchParams.get('instagram') || ''

  try {
    if (action === 'trending') {
      const data = await chartexFetch(
        `/external/v1/tiktok-sounds/?country_codes=${country}&sort_by=tiktok_last_7_days_video_count&limit=${limit}&only_music=true`
      )
      return NextResponse.json(data)
    }

    if (action === 'artist_full') {
      const result: any = {
        // TikTok sounds
        topSongs: [],
        totalTiktokViews: 0,
        total7DaysVideos: 0,
        soundsCount: 0,
        bestTrendingPosition: 0,
        // TikTok account
        tiktokFollowers: 0,
        tiktokFollowers7DaysGrowth: 0,
        // Songs cross-platform
        spotifyStreams: 0,
        youtubeViews: 0,
        shazamCount: 0,
        // Instagram
        instagramFollowers: 0,
        instagramReels: 0,
        // Status
        hypeStatus: null,
      }

      const ourArtist = artistName.toLowerCase().trim()

      // 1. TikTok trending RO
      const trending = await chartexFetch(
        `/external/v1/tiktok-sounds/?country_codes=${country}&sort_by=tiktok_last_7_days_video_count&limit=100&only_music=true`
      )
      if (trending?.data?.items) {
        trending.data.items.forEach((s: any, idx: number) => {
          const itemArtist = (s.artists || s.tiktok_sound_creator_name || '').toLowerCase().trim()
          if (itemArtist && (itemArtist.includes(ourArtist) || ourArtist.includes(itemArtist))) {
            result.totalTiktokViews += s.total_video_views || 0
            result.total7DaysVideos += s.tiktok_last_7_days_video_count || 0
            result.soundsCount++
            result.topSongs.push({
              name: s.song_name || s.tiktok_name_of_sound,
              tiktokViews: s.total_video_views,
              videos7Days: s.tiktok_last_7_days_video_count,
              image: s.song_image_url || s.tiktok_image_url,
              soundLink: s.tiktok_official_link,
            })
            if (result.bestTrendingPosition === 0 || idx + 1 < result.bestTrendingPosition) {
              result.bestTrendingPosition = idx + 1
            }
          }
        })
      }

      // 2. Songs cross-platform search
      const songs = await chartexFetch(
        `/external/v1/songs/?country_codes=${country}&sort_platform=spotify&sort_column=all_time&limit=100&search=${encodeURIComponent(artistName)}`
      )
      if (songs?.data?.items) {
        songs.data.items.forEach((s: any) => {
          const itemArtist = (s.artists || '').toLowerCase().trim()
          if (itemArtist && (itemArtist.includes(ourArtist) || ourArtist.includes(itemArtist))) {
            result.spotifyStreams += s.spotify_streams || 0
            result.youtubeViews += s.youtube_views || 0
            result.shazamCount += s.shazam_count || 0
          }
        })
      }

      // 3. TikTok account stats (daca avem username)
      if (tiktokUsername) {
        const ttAcc = await chartexFetch(`/external/v1/tiktok/accounts/${tiktokUsername}/metadata/`)
        if (ttAcc && !ttAcc.error) {
          result.tiktokFollowers = ttAcc.total_followers || 0
          result.tiktokFollowers7DaysGrowth = ttAcc.last_7_days_followers_count || 0
        }
      }

      // 4. Instagram account (daca avem username)
      if (instagramUsername) {
        const igAcc = await chartexFetch(`/external/v1/instagram/accounts/${instagramUsername}/metadata/`)
        if (igAcc && !igAcc.error) {
          result.instagramFollowers = igAcc.total_followers || 0
        }
      }

      // 5. Hype Status - prioritate descrescatoare
      if (result.bestTrendingPosition > 0 && result.bestTrendingPosition <= 10) {
        result.hypeStatus = 'hot'
      } else if (result.bestTrendingPosition > 0 && result.bestTrendingPosition <= 50) {
        result.hypeStatus = 'trending'
      } else if (result.total7DaysVideos > 100) {
        result.hypeStatus = 'viral_launch'
      } else if (result.totalTiktokViews > 1000000 || result.spotifyStreams > 1000000) {
        result.hypeStatus = 'established'
      } else if (result.totalTiktokViews > 100000 || result.spotifyStreams > 100000 || result.tiktokFollowers > 10000) {
        result.hypeStatus = 'active'
      } else {
        result.hypeStatus = 'verified'
      }

      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
