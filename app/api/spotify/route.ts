import { NextRequest, NextResponse } from 'next/server'

async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    },
    body: 'grant_type=client_credentials'
  })
  const data = await res.json()
  return data.access_token
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'No URL' }, { status: 400 })

  try {
    // Extragem artist ID din URL Spotify
    const match = url.match(/artist\/([a-zA-Z0-9]+)/)
    if (!match) return NextResponse.json({ error: 'Invalid Spotify URL' }, { status: 400 })
    
    const artistId = match[1]
    const token = await getSpotifyToken()
    
    const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    })
    const data = await res.json()
    
    return NextResponse.json({
      name: data.name,
      genres: data.genres,
      followers: data.followers?.total,
      popularity: data.popularity,
      image: data.images?.[0]?.url,
      spotifyUrl: data.external_urls?.spotify
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
