import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function persoane(c: string): number {
  if (!c) return 0
  c = c.toLowerCase()
  let t = 0
  const m = [...c.matchAll(/(\d+)\s*(sng|single|dbl|dubl[ae]?|duble|twin|matrimonial[ae]?|suit[ae]?|camer[ae]?)/g)]
  for (const x of m) {
    const n = +x[1], tip = x[2]
    if (tip.includes('dbl') || tip.includes('dubl') || tip.includes('twin') || tip.includes('camer')) t += n * 2
    else t += n
  }
  return t
}

export async function PATCH(req: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const b = await req.json()
    if (!b.nume_original) return NextResponse.json({ ok: false }, { status: 400 })
    const updates: any = {}
    if (b.nume !== undefined) updates.nume = b.nume
    if (b.fee_standard !== undefined) updates.fee_standard = Number(b.fee_standard) || 0
    if (b.lei_km !== undefined) updates.lei_km = Number(b.lei_km) || 0
    if (b.transport_moneda !== undefined) updates.transport_moneda = b.transport_moneda
    if (b.cazare !== undefined) { updates.cazare = b.cazare; updates.nr_persoane = persoane(b.cazare) }
    if (b.bilete_avion !== undefined) updates.bilete_avion = Number(b.bilete_avion) || 0
    if (b.alcool_default !== undefined) updates.alcool_default = Number(b.alcool_default) || 0
    if (b.categorie !== undefined) updates.categorie = b.categorie
    if (b.tip !== undefined) updates.tip = b.tip
    if (b.set_type !== undefined) updates.set_type = b.set_type
    if (b.durata_default !== undefined) updates.durata_default = b.durata_default
    if (b.diurna_fixa !== undefined) updates.diurna_fixa = b.diurna_fixa ? Number(b.diurna_fixa) : null
    if (b.observatii !== undefined) updates.observatii = b.observatii
    const { error } = await supabase.from('oferta_artisti').update(updates).eq('nume', b.nume_original)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { searchParams } = new URL(req.url)
    const nume = searchParams.get('nume')
    if (!nume) return NextResponse.json({ ok: false }, { status: 400 })
    const { error } = await supabase.from('oferta_artisti').delete().eq('nume', nume)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
