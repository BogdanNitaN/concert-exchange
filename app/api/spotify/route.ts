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

function calcVibes(features: any[]) {
  if (!features.length) return []
  const avg = (key: string) => features.reduce((s, f) => s + (f[key] || 0), 0) / features.length
  
  const energy = avg('energy')
  const danceability = avg('danceability')
  const valence = avg('valence')
  const acousticness = avg('acousticness')
  const tempo = avg('tempo')

  const vibes: string[] = []
  
  if (energy > 0.75 && danceability > 0.7) vibes.push('hype')
  if (energy > 0.7 && tempo > 120) vibes.push('festival')
  if (danceability > 0.75 && valence > 0.6) vibes.push('dayparty')
  if (energy < 0.5 && acousticness > 0.3) vibes.push('chill')
  if (valence > 0.7 && danceability > 0.6 && energy < 0.75) vibes.push('petrecere')
  if (acousticness > 0.4 && energy < 0.5) vibes.push('elegant')
  if (tempo > 130 && danceability > 0.8) vibes.push('rooftop')
  if (energy > 0.6 && valence < 0.4) vibes.push('nostalgic')

  return vibes.length > 0 ? vibes : ['petrecere']
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'No URL' }, { status: 400 })

  try {
    const match = url.match(/artist\/([a-zA-Z0-9]+)/)
    if (!match) return NextResponse.json({ error: 'Invalid Spotify URL' }, { status: 400 })
    
    const artistId = match[1]
    const token = await getSpotifyToken()
    const headers = { 'Authorization': 'Bearer ' + token }

    // Date artist
    const artistRes = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, { headers })
    const artist = await artistRes.json()

    // Top tracks
    const tracksRes = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=RO`, { headers })
    const tracksData = await tracksRes.json()
    const topTracks = (tracksData.tracks || []).slice(0, 5)

    // Audio features pentru top 5 piese
    let audioFeatures: any[] = []
    if (topTracks.length > 0) {
      const ids = topTracks.map((t: any) => t.id).join(',')
      const featuresRes = await fetch(`https://api.spotify.com/v1/audio-features?ids=${ids}`, { headers })
      const featuresData = await featuresRes.json()
      audioFeatures = (featuresData.audio_features || []).filter(Boolean)
    }

    // Fallback - calculam vibes din genuri daca audio features nu merg
    let vibes = calcVibes(audioFeatures)
    if (vibes.length === 0 && artist.genres) {
      const g = artist.genres.join(' ').toLowerCase()
      if (g.includes('dance') || g.includes('edm') || g.includes('electronic')) vibes.push('hype', 'festival', 'dayparty')
      if (g.includes('pop')) vibes.push('petrecere')
      if (g.includes('hip hop') || g.includes('rap')) vibes.push('hype', 'rooftop')
      if (g.includes('jazz') || g.includes('soul') || g.includes('r&b')) vibes.push('elegant', 'chill')
      if (g.includes('rock')) vibes.push('festival', 'hype')
      if (g.includes('folk') || g.includes('acoustic')) vibes.push('chill', 'nostalgic')
      if (g.includes('latin') || g.includes('reggaeton')) vibes.push('dayparty', 'petrecere')
      if (vibes.length === 0) vibes.push('petrecere')
    }
    const avgFeatures = audioFeatures.length > 0 ? {
      energy: Math.round(audioFeatures.reduce((s, f) => s + f.energy, 0) / audioFeatures.length * 100),
      danceability: Math.round(audioFeatures.reduce((s, f) => s + f.danceability, 0) / audioFeatures.length * 100),
      valence: Math.round(audioFeatures.reduce((s, f) => s + f.valence, 0) / audioFeatures.length * 100),
      acousticness: Math.round(audioFeatures.reduce((s, f) => s + f.acousticness, 0) / audioFeatures.length * 100),
      tempo: Math.round(audioFeatures.reduce((s, f) => s + f.tempo, 0) / audioFeatures.length),
    } : null

    return NextResponse.json({
      name: artist.name,
      genres: artist.genres,
      followers: artist.followers?.total,
      popularity: artist.popularity,
      image: artist.images?.[0]?.url,
      spotifyUrl: artist.external_urls?.spotify,
      vibes,
      audioFeatures: avgFeatures,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
