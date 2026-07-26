import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ARTISTS_DATA } from '@/lib/artists-data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function iaLink(token: string) {
  const { data: link } = await supabase.from('roster_links').select('*').eq('token', token).single()
  if (!link || !link.activ) return { err: NextResponse.json({ ok: false, error: 'Link invalid sau dezactivat.' }, { status: 404 }) }
  if (new Date(link.expira_la) < new Date()) return { err: NextResponse.json({ ok: false, error: 'Linkul a expirat. Cere unul nou de la Forward.' }, { status: 410 }) }
  return { link }
}

export async function GET(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params
  try {
    const { link, err } = await iaLink(token)
    if (err) return err

    const { data: imgs } = await supabase.from('artist_images').select('name, image_url, spotify_id')
    const imgMap: Record<string, string> = {}
    const idMap: Record<string, string> = {}
    for (const i of imgs || []) {
      if (i.name) {
        imgMap[i.name] = i.image_url
        if (i.spotify_id) idMap[i.name.toLowerCase().trim()] = String(i.spotify_id).split('-')[0]
      }
    }

    const { data: shares } = await supabase.from('artist_share').select('*')
    const shareMap: Record<string, any> = {}
    for (const sh of shares || []) shareMap[sh.nume] = sh

    const fa = (a: any) => {
      const meta = (ARTISTS_DATA as unknown as any[]).find(x => (x.name || '').toLowerCase() === (a.nume || '').toLowerCase())
      const sh = shareMap[a.nume] || {}
      const fee = a.fee_standard || 0
      let preturi: any = null
      if (link.arata_preturi && fee > 0) {
        if (link.tip_audienta === 'b2b') {
          preturi = { standard: fee, revelion: Math.round(fee * (sh.mult_revelion ?? 2)), prom: Math.round(fee * (sh.mult_prom ?? 1)) }
        } else {
          preturi = { deLa: fee }
        }
      }
      return {
        nume: a.nume, genuri: meta?.genres || [], tier: meta?.tier || null,
        poza: imgMap[a.nume] || null,
        epk: sh.epk_url || null, riderTehnic: sh.rider_tehnic_url || null, riderAcomodare: sh.rider_acomodare_url || null, ucmr: sh.ucmr_url || null, docs: sh.docs_url || null,
        logistica: {
          persoane: a.nr_persoane || null,
          format: a.format_show || null,
          durata: a.durata_default || null,
          leiKm: a.lei_km || null,
          transportMoneda: a.transport_moneda || 'lei',
          bileteAvion: a.bilete_avion || null,
          cazare: a.cazare || null,
          cazareFixa: a.cazare_fixa || null,
          diurna: a.diurna_fixa || null,
        },
        preturi,
      }
    }

    let payload: any
    if (link.scop === 'roster') {
      const { data: toti } = await supabase.from('oferta_artisti').select('*')
      let lista = (toti || []).filter(a => (shareMap[a.nume]?.afisabil ?? true))
      if (link.filtru_gen) {
        const g = link.filtru_gen.toLowerCase()
        lista = lista.filter(a => {
          const meta = (ARTISTS_DATA as unknown as any[]).find(x => (x.name || '').toLowerCase() === (a.nume || '').toLowerCase())
          return (meta?.genres || []).some((x: string) => x.toLowerCase() === g)
        })
      }
      payload = { tip: 'roster', artisti: lista.map(fa).sort((a, b) => (b.preturi?.standard || 0) - (a.preturi?.standard || 0)) }
    } else {
      const { data: a } = await supabase.from('oferta_artisti').select('*').eq('nume', link.scop).single()
      if (!a) return NextResponse.json({ ok: false, error: 'Artist negasit.' }, { status: 404 })
      const artist: any = fa(a)
      // statistici live (doar pe pagina de un artist)
      try {
        const origin = new URL(req.url).origin
        const sid = idMap[a.nume.toLowerCase().trim()] || ''
        const rc = await fetch(origin + '/api/chartex?action=artist_full&artist=' + encodeURIComponent(a.nume) + (sid ? '&spotify_id=' + encodeURIComponent(sid) : '') + '&country=RO', { cache: 'no-store' })
        const dc = await rc.json()
        artist.stats = {
          monthlyListeners: dc.spotifyMonthlyListeners || 0,
          spotifyFollowers: dc.spotifyFollowers || 0,
          tiktokFollowers: dc.tiktokFollowers || 0,
          instagramFollowers: dc.instagramFollowers || 0,
        }
      } catch {}
      payload = { tip: 'artist', artist }
    }

    await supabase.from('roster_views').insert({
      token, actiune: 'view',
      artist_vazut: link.scop === 'roster' ? null : link.scop,
      user_agent: req.headers.get('user-agent') || null,
    })

    return NextResponse.json({ ok: true, destinatar: link.destinatar, audienta: link.tip_audienta, expiraLa: link.expira_la, ...payload })
  } catch {
    return NextResponse.json({ ok: false, error: 'Eroare tehnica.' }, { status: 500 })
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params
  try {
    const { link, err } = await iaLink(token)
    if (err) return err
    const body = await req.json()
    await supabase.from('roster_views').insert({
      token, actiune: String(body.actiune || 'tap').slice(0, 40),
      artist_vazut: body.artist ? String(body.artist).slice(0, 80) : (link.scop === 'roster' ? null : link.scop),
      user_agent: req.headers.get('user-agent') || null,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
