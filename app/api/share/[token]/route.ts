import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ARTISTS_DATA } from '@/lib/artists-data'
import { genuriPentru, esteAscuns, tierPentru } from '@/lib/genuri-catalog'

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
      // pe linkurile de revelion, pretul si logistica vin din profilul de sarbatori
      const rev: any = link.scop === 'revelion' ? a.revelion : null
      const fee = (rev && typeof rev.baza === 'number') ? rev.baza : (a.fee_standard || 0)
      let preturi: any = null
      if (link.arata_preturi && fee > 0) {
        if (rev) {
          preturi = { standard: fee, deLa: fee }
        } else if (link.tip_audienta === 'b2b') {
          preturi = { standard: fee, revelion: Math.round(fee * (sh.mult_revelion ?? 2)), prom: Math.round(fee * (sh.mult_prom ?? 1)) }
        } else {
          preturi = { deLa: fee }
        }
      }
      return {
        nume: a.nume, genuri: genuriPentru(a.nume, meta?.genres || []), tier: tierPentru(a.nume, meta?.tier || null, fee),
        poza: imgMap[a.nume] || null,
        epk: sh.epk_url || null, riderTehnic: sh.rider_tehnic_url || null, riderAcomodare: sh.rider_acomodare_url || null, ucmr: sh.ucmr_url || null, docs: sh.docs_url || null,
        logistica: {
          landed: a.landed || false,
          persoane: a.nr_persoane || null,
          format: a.format_show || null,
          durata: a.set_type === 'dj' ? '90-120 min' : (a.durata_default || null),
          leiKm: rev ? (rev.eurKm ?? null) : (a.lei_km || null),
          transportMoneda: rev ? 'euro' : (a.transport_moneda || 'lei'),
          bileteAvion: rev ? (rev.bilete ?? null) : (a.bilete_avion || null),
          cazare: rev ? (rev.cazare || null) : (a.cazare || null),
          cazareFixa: rev ? (rev.cazareFixa ?? null) : (a.cazare_fixa || null),
          diurna: rev ? (rev.diurna ?? null) : (a.diurna_fixa || null),
          nota: rev ? (rev.nota || null) : null,
        },
        preturi,
      }
    }

    let payload: any
    if (link.scop === 'revelion') {
      const { data: toti } = await supabase.from('oferta_artisti').select('*')
      const lista = (toti || []).filter(a => a.revelion && !esteAscuns(a.nume))
      payload = { tip: 'roster', revelion: true, artisti: lista.map(fa).sort((a, b) => (b.preturi?.standard || 0) - (a.preturi?.standard || 0)) }
    } else if (link.scop === 'roster') {
      const { data: toti } = await supabase.from('oferta_artisti').select('*')
      let lista = (toti || []).filter(a => a.tip !== 'intermediere' && !esteAscuns(a.nume) && (shareMap[a.nume]?.afisabil ?? true))
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

    return NextResponse.json({ ok: true, destinatar: link.destinatar, audienta: link.tip_audienta, expiraLa: link.expira_la, ascundeContacte: !!link.ascunde_contacte, ...payload })
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
