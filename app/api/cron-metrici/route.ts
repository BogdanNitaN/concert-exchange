import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { esteAscuns } from '@/lib/genuri-catalog'
import { cerAccesCron } from '@/lib/auth-api'

export const maxDuration = 300

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
)

export async function GET(req: Request) {
  const blocat = await cerAccesCron(req)
  if (blocat) return blocat
  try {
    const origin = new URL(req.url).origin
    const { data: toti } = await supabase.from('oferta_artisti').select('nume, tip')
    const { data: imgs } = await supabase.from('artist_images').select('name, spotify_id')
    const idMap: Record<string, string> = {}
    for (const i of imgs || []) if (i.name && i.spotify_id) idMap[i.name] = String(i.spotify_id).split('-')[0]

    const lista = (toti || []).filter(a => a.tip !== 'intermediere' && !esteAscuns(a.nume))
    const azi = new Date().toISOString().slice(0, 10)
    let salvati = 0, ratati = 0

    for (const a of lista) {
      try {
        const sid = idMap[a.nume] || ''
        const r = await fetch(origin + '/api/chartex?action=artist_full&artist=' + encodeURIComponent(a.nume) + (sid ? '&spotify_id=' + encodeURIComponent(sid) : '') + '&country=RO', { cache: 'no-store' })
        const d = await r.json()
        const asc = d.spotifyMonthlyListeners || 0
        const sf = d.spotifyFollowers || 0
        const ig = d.instagramFollowers || 0
        const tt = d.tiktokFollowers || 0
        // reach = audienta, nu consum: urmaritori si ascultatori, nu vizualizari
        const reach = asc + sf + ig + tt
        if (reach === 0) { ratati++; continue }
        await supabase.from('artist_metrics').upsert({
          nume: a.nume, data: azi,
          ascultatori_lunari: asc, spotify_followers: sf,
          instagram_followers: ig, tiktok_followers: tt,
          tiktok_clipuri: d.totalTiktokVideos || 0,
          youtube_views: d.youtubeViews || 0,
          shazam: d.shazamCount || 0,
          reach_total: reach,
        }, { onConflict: 'nume,data' })
        salvati++
      } catch { ratati++ }
    }
    return NextResponse.json({ ok: true, data: azi, salvati, ratati, total: lista.length })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 })
  }
}
