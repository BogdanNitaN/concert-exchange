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

  try {
    if (action === 'trending') {
      // Top TikTok sounds in Romania
      const data = await chartexFetch(
        `/external/v1/tiktok-sounds/?country_codes=${country}&sort_by=tiktok_last_7_days_video_count&limit=${limit}&only_music=true`
      )
      return NextResponse.json(data)
    }

    if (action === 'songs') {
      // Top songs trending in Romania
      const data = await chartexFetch(
        `/external/v1/songs/?country_codes=${country}&sort_platform=tiktok&sort_column=tiktok_last_7_days_video_count&limit=${limit}`
      )
      return NextResponse.json(data)
    }

    if (action === 'artist_metadata') {
      const spotifyId = request.nextUrl.searchParams.get('spotify_id')
      if (!spotifyId) return NextResponse.json({ error: 'No spotify_id' }, { status: 400 })
      const data = await chartexFetch(`/external/v1/tiktok/accounts/${spotifyId}/metadata/`)
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
