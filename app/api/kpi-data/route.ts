// app/api/kpi-data/route.ts
// GET cu headere 'x-kpi-nume' + 'x-kpi-parola': agent -> propriul panou; admin -> toti agentii.
// POST (admin): obiectiv | agent-nou | parola | toggle-activ
// Valorile pleaca in RON + curs BNR al zilei; conversia se face in UI la acelasi curs peste tot.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const supa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

let cursCache: { curs: number; zi: string } | null = null;
async function cursBNR(): Promise<number> {
  const azi = new Date().toISOString().slice(0, 10);
  if (cursCache?.zi === azi) return cursCache.curs;
  try {
    const r = await fetch('https://www.bnr.ro/nbrfxrates.xml', { next: { revalidate: 3600 } });
    const xml = await r.text();
    const m = xml.match(/<Rate currency="EUR">([\d.]+)<\/Rate>/);
    const curs = m ? parseFloat(m[1]) : 5.1;
    cursCache = { curs, zi: azi };
    return curs;
  } catch { return cursCache?.curs || 5.1; }
}

async function auth(req: NextRequest) {
  const nume = String(req.headers.get('x-kpi-nume') || '').trim();
  const parola = String(req.headers.get('x-kpi-parola') || '').trim();
  if (!nume || !parola) return null;
  const { data } = await supa.from('agenti')
    .select('id, nume, nume_afisat, rol, activ, obiectiv_anual_eur')
    .ilike('nume', nume).eq('parola', parola).eq('activ', true).maybeSingle();
  return data || null;
}

export async function GET(req: NextRequest) {
  const eu = await auth(req);
  if (!eu) return NextResponse.json({ error: 'Nume sau parola gresite' }, { status: 401 });
  const curs = await cursBNR();
  const an = new Date().getFullYear();

  const esteAdmin = eu.rol === 'admin';
  let agQ = supa.from('agenti').select('id, nume, nume_afisat, rol, activ, obiectiv_anual_eur').order('nume');
  if (!esteAdmin) agQ = agQ.eq('id', eu.id);
  const { data: agenti } = await agQ;
  const ids = (agenti || []).map(a => a.id);

  const { data: kpi } = await supa.from('kpi_saptamanal')
    .select('*').eq('an', an).in('agent_id', ids).order('saptamana');

  const { data: log } = await supa.from('kpi_upload_log')
    .select('an, saptamana, incarcat_la').order('incarcat_la', { ascending: false }).limit(1);

  return NextResponse.json({
    eu: { id: eu.id, nume: eu.nume, rol: eu.rol },
    curs, an,
    agenti: agenti || [],
    kpi: kpi || [],
    ultimulUpload: log?.[0] || null,
  });
}

export async function POST(req: NextRequest) {
  const eu = await auth(req);
  if (!eu || eu.rol !== 'admin') return NextResponse.json({ error: 'Acces interzis' }, { status: 401 });
  const body = await req.json();

  if (body.actiune === 'obiectiv') {
    const { error } = await supa.from('agenti')
      .update({ obiectiv_anual_eur: body.obiectivEur === '' ? null : Number(body.obiectivEur) })
      .eq('id', body.agentId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  if (body.actiune === 'agent-nou') {
    const { error } = await supa.from('agenti')
      .insert({ nume: String(body.nume).trim(), parola: String(body.parola).trim(), rol: 'agent', activ: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  if (body.actiune === 'parola') {
    const { error } = await supa.from('agenti').update({ parola: String(body.parola).trim() }).eq('id', body.agentId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  if (body.actiune === 'toggle-activ') {
    const { data: a } = await supa.from('agenti').select('activ').eq('id', body.agentId).single();
    const { error } = await supa.from('agenti').update({ activ: !a?.activ }).eq('id', body.agentId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Actiune necunoscuta' }, { status: 400 });
}
