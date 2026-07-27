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

export async function GET(req: Request) {
  if (!await areAcces(req)) return NextResponse.json({ ok: false }, { status: 401 })
  const supa = db()
  const { data: linkuri } = await supa.from('roster_links')
    .select('token, destinatar, scop, tip_audienta, expira_la, activ, creat_de, created_at')
    .order('created_at', { ascending: false })
  const { data: views } = await supa.from('roster_views').select('token, created_at')
  const nrViz: Record<string, number> = {}
  const ultima: Record<string, string> = {}
  for (const v of (views || [])) {
    nrViz[v.token] = (nrViz[v.token] || 0) + 1
    if (!ultima[v.token] || v.created_at > ultima[v.token]) ultima[v.token] = v.created_at
  }
  const coduri = (linkuri || []).map((l: any) => ({
    ...l, vizualizari: nrViz[l.token] || 0, ultimaVizualizare: ultima[l.token] || null,
  }))
  return NextResponse.json({ ok: true, coduri })
}

export async function POST(req: Request) {
  if (!await areAcces(req)) return NextResponse.json({ ok: false }, { status: 401 })
  const b = await req.json()
  const supa = db()
  let token = (b.token || '').trim().toLowerCase()
  if (!token) {
    for (let i = 0; i < 8; i++) {
      const cand = 'fwd' + Math.floor(1000 + Math.random() * 9000)
      const { data: ex } = await supa.from('roster_links').select('token').eq('token', cand).maybeSingle()
      if (!ex) { token = cand; break }
    }
  }
  if (!token) return NextResponse.json({ ok: false, error: 'nu am putut genera un cod' }, { status: 400 })
  const zile = Number(b.zile) || 30
  const { error } = await supa.from('roster_links').insert({
    token, destinatar: b.destinatar || 'Parteneri Forward',
    tip_audienta: b.tip_audienta === 'direct' ? 'direct' : 'b2b',
    scop: b.scop || 'roster', filtru_gen: b.filtru_gen || null,
    ascunde_contacte: !!b.ascunde_contacte,
    expira_la: new Date(Date.now() + zile * 86400000).toISOString(), activ: true, creat_de: 'admin',
  })
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, token })
}

export async function PATCH(req: Request) {
  if (!await areAcces(req)) return NextResponse.json({ ok: false }, { status: 401 })
  const b = await req.json()
  if (!b.token) return NextResponse.json({ ok: false }, { status: 400 })
  const upd: any = {}
  if (typeof b.activ === 'boolean') upd.activ = b.activ
  if (b.prelungesteZile) upd.expira_la = new Date(Date.now() + Number(b.prelungesteZile) * 86400000).toISOString()
  const { error } = await db().from('roster_links').update(upd).eq('token', b.token)
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
