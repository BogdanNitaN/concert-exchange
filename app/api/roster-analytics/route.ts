import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SB_SECRET = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function areAcces(req: Request) {
  const h = req.headers.get('authorization') || ''
  const t = h.replace('Bearer ', '').trim()
  if (!t) return false
  try {
    const sa = createClient(SB_URL, SB_ANON)
    const { data } = await sa.auth.getUser(t)
    const rol = data?.user?.user_metadata?.role
    return rol === 'oferta_admin' || rol === 'oferta_user'
  } catch { return false }
}
function db() { return createClient(SB_URL, SB_SECRET, { auth: { persistSession: false } }) }

const NU_ARTISTI = new Set(['bal', 'revelion', 'roster', 'piata', 'pop', 'trap', 'rap', 'rock', 'dance', 'dj', 'djs', 'balcanic_pop', 'manele', 'lautareasca', 'latino', 'petrecere', 'cover', 'altele', 'urban', 'special'])
const SEMNALE = new Set(['cta-whatsapp', 'cta-disponibilitate', 'doc-media-kit', 'doc-rider-tehnic', 'doc-rider-acomodare', 'doc-rider-tehnic-si-ospitalitate', 'doc-ucmr', 'pdf-catalog', 'copy-standard', 'copy-catalog', 'calcul-transport'])

export async function GET(req: Request) {
  if (!await areAcces(req)) return NextResponse.json({ ok: false }, { status: 401 })
  const supa = db()

  const { data: linkuri } = await supa.from('roster_links')
    .select('token, destinatar, scop, tip_audienta, activ, created_at')
    .order('created_at', { ascending: false })

  let views: any[] = []
  let de = 0
  while (true) {
    const { data: batch } = await supa.from('roster_views').select('token, artist_vazut, user_agent, created_at, actiune').range(de, de + 999)
    if (!batch || batch.length === 0) break
    views = views.concat(batch)
    if (batch.length < 1000) break
    de += 1000
  }

  const acum = Date.now()
  const zi = 86400000

  let mobil = 0, desktop = 0, vizite7 = 0, vizite30 = 0
  for (const v of views) {
    if (v.user_agent) { if (/Mobile|Android|iPhone|iPad/i.test(v.user_agent)) mobil++; else desktop++ }
    const t = new Date(v.created_at).getTime()
    if (acum - t <= 7 * zi) vizite7++
    if (acum - t <= 30 * zi) vizite30++
  }

  const artisti: Record<string, number> = {}
  for (const v of views) {
    if (!v.artist_vazut) continue
    if (NU_ARTISTI.has(v.artist_vazut.toLowerCase())) continue
    artisti[v.artist_vazut] = (artisti[v.artist_vazut] || 0) + 1
  }
  const topArtisti = Object.entries(artisti).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([nume, n]) => ({ nume, n }))

  const semnalePerCod: Record<string, Record<string, number>> = {}
  for (const v of views) {
    if (!v.actiune) continue
    const act = v.actiune.startsWith('pdf-catalog') ? 'pdf-catalog' : (v.actiune.startsWith('copy-catalog') ? 'copy-catalog' : v.actiune)
    if (!SEMNALE.has(act)) continue
    if (!semnalePerCod[v.token]) semnalePerCod[v.token] = {}
    semnalePerCod[v.token][act] = (semnalePerCod[v.token][act] || 0) + 1
  }
  const destPentru: Record<string, string> = {}
  for (const l of (linkuri || [])) destPentru[l.token] = l.destinatar || l.token
  const semnale = Object.entries(semnalePerCod).map(([token, acts]) => ({
    token, destinatar: destPentru[token] || token,
    total: Object.values(acts).reduce((a: number, b: number) => a + b, 0),
    actiuni: Object.entries(acts).sort((a, b) => b[1] - a[1]).map(([a, n]) => ({ a, n })),
  })).sort((a, b) => b.total - a.total).slice(0, 20)

  const nrViz: Record<string, number> = {}
  const ultima: Record<string, string> = {}
  for (const v of views) {
    nrViz[v.token] = (nrViz[v.token] || 0) + 1
    if (!ultima[v.token] || v.created_at > ultima[v.token]) ultima[v.token] = v.created_at
  }

  const fierbinti = (linkuri || [])
    .map((l: any) => ({ token: l.token, destinatar: l.destinatar || l.token, scop: l.scop, vizite: nrViz[l.token] || 0, ultima: ultima[l.token] || null }))
    .filter((c: any) => c.vizite >= 3 && c.ultima && (acum - new Date(c.ultima).getTime() <= 7 * zi))
    .sort((a: any, b: any) => b.vizite - a.vizite)
    .slice(0, 15)

  const neatinse = (linkuri || [])
    .filter((l: any) => l.activ && (nrViz[l.token] || 0) === 0)
    .map((l: any) => ({ token: l.token, destinatar: l.destinatar || l.token, scop: l.scop, created_at: l.created_at }))
    .slice(0, 30)

  const perZi: Record<string, number> = {}
  for (const v of views) {
    const t = new Date(v.created_at).getTime()
    if (acum - t > 30 * zi) continue
    const zks = new Date(v.created_at).toISOString().slice(0, 10)
    perZi[zks] = (perZi[zks] || 0) + 1
  }
  const activitate = Object.entries(perZi).sort((a, b) => a[0].localeCompare(b[0])).map(([data, n]) => ({ data, n }))

  return NextResponse.json({
    ok: true,
    sumar: { totalVizite: views.length, vizite7, vizite30, mobil, desktop, totalCoduri: (linkuri || []).length, coduriActive: (linkuri || []).filter((l: any) => l.activ).length },
    topArtisti, semnale, fierbinti, neatinse, activitate,
  })
}
