import { NextRequest, NextResponse } from 'next/server'

const CHARTEX_BASE = 'https://api.chartex.com'

async function chartexFetch(path: string) {
  const res = await fetch(CHARTEX_BASE + path, {
    headers: {
      'X-APP-ID': process.env.CHARTEX_APP_ID || '',
      'X-APP-TOKEN': process.env.CHARTEX_APP_TOKEN || '',
    },
    next: { revalidate: 3600 }
  })
  return res.json()
}

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action') || 'trending'
  const country = request.nextUrl.searchParams.get('country') || 'RO'
  const limit = request.nextUrl.searchParams.get('limit') || '20'
  const artistName = request.nextUrl.searchParams.get('artist') || ''

  try {
    if (action === 'trending') {
      const data = await chartexFetch(
        `/external/v1/tiktok-sounds/?country_codes=${country}&sort_by=tiktok_last_7_days_video_count&limit=${limit}&only_music=true`
      )
      return NextResponse.json(data)
    }

    if (action === 'artist_full') {
      const result: any = {
        topSongs: [],
        totalTiktokViews: 0,
        total7DaysVideos: 0,
        soundsCount: 0,
        bestTrendingPosition: 0,
      }

      const trending = await chartexFetch(
        `/external/v1/tiktok-sounds/?country_codes=${country}&sort_by=tiktok_last_7_days_video_count&limit=100&only_music=true`
      )
      const items = trending.data?.items || []
      const ourArtist = artistName.toLowerCase().trim()

      items.forEach((s: any, idx: number) => {
        const itemArtist = (s.artists || s.tiktok_sound_creator_name || '').toLowerCase().trim()
        if (itemArtist && ourArtist && (itemArtist.includes(ourArtist) || ourArtist.includes(itemArtist))) {
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

      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
