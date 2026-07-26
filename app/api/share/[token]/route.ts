import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ARTISTS_DATA } from '@/lib/artists-data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params
  try {
    const { data: link } = await supabase.from('roster_links').select('*').eq('token', token).single()
    if (!link || !link.activ) return NextResponse.json({ ok: false, error: 'Link invalid sau dezactivat.' }, { status: 404 })
    if (new Date(link.expira_la) < new Date()) return NextResponse.json({ ok: false, error: 'Linkul a expirat. Cere unul nou.' }, { status: 410 })

    const { data: imgs } = await supabase.from('artist_images').select('name, image_url')
    const imgMap: Record<string, string> = {}
    for (const i of imgs || []) imgMap[i.name] = i.image_url

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
          preturi = {
            standard: fee,
            revelion: Math.round(fee * (sh.mult_revelion ?? 2)),
            prom: Math.round(fee * (sh.mult_prom ?? 1)),
          }
        } else {
          preturi = { deLa: fee }
        }
      }
      return {
        nume: a.nume,
        genuri: meta?.genres || [],
        tier: meta?.tier || null,
        poza: imgMap[a.nume] || null,
        epk: sh.epk_url || null,
        riderTehnic: sh.rider_tehnic_url || null,
        riderAcomodare: sh.rider_acomodare_url || null,
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
      payload = { tip: 'artist', artist: fa(a) }
    }

    await supabase.from('roster_views').insert({
      token,
      artist_vazut: link.scop === 'roster' ? null : link.scop,
      user_agent: req.headers.get('user-agent') || null,
    })

    return NextResponse.json({
      ok: true,
      destinatar: link.destinatar,
      audienta: link.tip_audienta,
      expiraLa: link.expira_la,
      ...payload,
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'Eroare tehnica.' }, { status: 500 })
  }
}
