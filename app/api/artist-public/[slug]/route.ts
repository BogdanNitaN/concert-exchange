import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { genuriPentru, esteAscuns, tierPentru } from '@/lib/genuri-catalog'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
)

export function slugArtist(nume: string): string {
  return (nume || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params
    const cautat = slugArtist(slug)
    const { data: toti } = await supabase.from('oferta_artisti').select('*')
    const a = (toti || []).find((x: any) =>
      x.tip !== 'intermediere' && !esteAscuns(x.nume) && slugArtist(x.nume) === cautat)
    if (!a) return NextResponse.json({ ok: false, error: 'Artist negasit.' }, { status: 404 })

    const { data: sh } = await supabase.from('artist_share').select('*').eq('nume', a.nume).maybeSingle()
    if (sh && sh.afisabil === false) return NextResponse.json({ ok: false, error: 'Artist negasit.' }, { status: 404 })

    const { data: img } = await supabase.from('artist_images').select('image_url, spotify_id').eq('name', a.nume).maybeSingle()

    let stats: any = null
    try {
      const origin = new URL(req.url).origin
      const sid = img?.spotify_id ? String(img.spotify_id).split('-')[0] : ''
      const r = await fetch(origin + '/api/chartex?action=artist_full&artist=' + encodeURIComponent(a.nume) + (sid ? '&spotify_id=' + encodeURIComponent(sid) : '') + '&country=RO', { cache: 'no-store' })
      const d = await r.json()
      stats = {
        monthlyListeners: d.spotifyMonthlyListeners || 0,
        spotifyFollowers: d.spotifyFollowers || 0,
        spotifyStreams: d.spotifyStreams || 0,
        youtubeViews: d.youtubeViews || 0,
        shazamCount: d.shazamCount || 0,
        tiktokVideos: d.totalTiktokVideos || 0,
        tiktokFollowers: d.tiktokFollowers || 0,
        instagramFollowers: d.instagramFollowers || 0,
      }
    } catch {}

    return NextResponse.json({
      ok: true,
      artist: {
        nume: a.nume,
        slug: slugArtist(a.nume),
        genuri: genuriPentru(a.nume, []),
        tier: tierPentru(a.nume, null, a.fee_standard || 0),
        poza: img?.image_url || null,
        durata: a.durata_default || null,
        orasResedinta: a.oras_rezidenta || null,
        bio: a.bio || null,
        spotifyId: img?.spotify_id ? String(img.spotify_id).split('-')[0] : null,
        setType: a.set_type || null,
        // public: doar media kit. Riderul si UCMR raman pe linkurile cu cod.
        mediaKit: sh?.epk_url || null,
        stats,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 })
  }
}
