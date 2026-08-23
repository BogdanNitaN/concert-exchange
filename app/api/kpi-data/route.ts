// app/api/kpi-data/route.ts
// GET: agent -> panoul lui (saptamanal + artisti + segmente + kpi individuali); admin -> tot.
// POST (admin): obiectiv | agent-nou | parola | toggle-activ | kpi-tinta

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function getSupa() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!
  );
}

let cursCache: { curs: number; zi: string } | null = null;
async function cursBNR(): Promise<number> {
  const azi = new Date().toISOString().slice(0, 10);
  if (cursCache?.zi === azi) return cursCache.curs;
  try {
    let xml = '';
    for (const u of ['https://curs.bnr.ro/nbrfxrates.xml', 'https://www.bnr.ro/nbrfxrates.xml']) {
      try {
        const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 21600 } });
        const t = await r.text();
        if (t.includes('<Rate currency="EUR"')) { xml = t; break; }
      } catch {}
    }
    const m = xml.match(/<Rate currency="EUR">([\d.]+)<\/Rate>/);
    if (!m) throw new Error('fara EUR in XML');
    const curs = parseFloat(m[1]);
    cursCache = { curs, zi: azi };
    return curs;
  } catch { return cursCache?.curs || 5.1; }
}

async function auth(req: NextRequest) {
  const supa = getSupa();
  const nume = String(req.headers.get('x-kpi-nume') || '').trim();
  const parola = String(req.headers.get('x-kpi-parola') || '').trim();
  if (!nume || !parola) return null;
  const { data } = await supa.from('agenti')
    .select('id, nume, nume_afisat, rol, activ, obiectiv_anual_eur')
    .ilike('nume', nume).eq('parola', parola).eq('activ', true).maybeSingle();
  return data || null;
}

export async function GET(req: NextRequest) {
  const supa = getSupa();
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

  const { data: artisti } = await supa.from('kpi_artist')
    .select('agent_id, artist, propuneri, valoare_ofertata_ron, confirmate, valoare_confirmata_ron')
    .eq('an', an).in('agent_id', ids)
    .order('valoare_confirmata_ron', { ascending: false });

  const { data: segmente } = await supa.from('kpi_segment')
    .select('agent_id, segment, propuneri, valoare_ofertata_ron, confirmate, valoare_confirmata_ron')
    .eq('an', an).in('agent_id', ids)
    .order('valoare_confirmata_ron', { ascending: false });

  const { data: kpiInd } = await supa.from('kpi_individual')
    .select('id, agent_id, eticheta, cheie, tinta, directie')
    .in('agent_id', ids).eq('activ', true);

  const { data: totiKpi } = await supa.from('kpi_saptamanal')
    .select('agent_id, valoare_confirmata_ron, valoare_ofertata_ron, valoare_anulata_ron').eq('an', an);
  const perAgentTot = new Map<string, { c: number; o: number; a: number }>();
  for (const r of totiKpi || []) {
    const t = perAgentTot.get(r.agent_id) || { c: 0, o: 0, a: 0 };
    t.c += Number(r.valoare_confirmata_ron); t.o += Number(r.valoare_ofertata_ron); t.a += Number(r.valoare_anulata_ron);
    perAgentTot.set(r.agent_id, t);
  }
  const activi = [...perAgentTot.values()].filter(t => t.o > 0 || t.c > 0);
  const medieAgentie = {
    confirmatRon: activi.length ? activi.reduce((s, t) => s + t.c, 0) / activi.length : 0,
    totalConfirmatRon: activi.reduce((s, t) => s + t.c, 0),
    conversie: (() => { const o = activi.reduce((s, t) => s + t.o, 0); const c = activi.reduce((s, t) => s + t.c, 0); return o > 0 ? (c / o) * 100 : 0; })(),
  };

  const { data: setari } = await supa.from('setari_kpi').select('cheie, valoare');
  const obiectivAgentieEur = setari?.find(x => x.cheie === 'obiectiv_agentie_eur')?.valoare ?? null;

  const { data: log } = await supa.from('kpi_upload_log')
    .select('an, saptamana, incarcat_la').order('incarcat_la', { ascending: false }).limit(1);

  return NextResponse.json({
    eu: { id: eu.id, nume: eu.nume, rol: eu.rol },
    curs, an,
    agenti: agenti || [],
    kpi: kpi || [],
    artisti: artisti || [],
    segmente: segmente || [],
    kpiIndividuali: kpiInd || [],
    medieAgentie,
    obiectivAgentieEur,
    ultimulUpload: log?.[0] || null,
  });
}

export async function POST(req: NextRequest) {
  const supa = getSupa();
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
  if (body.actiune === 'obiectiv-agentie') {
    const { error } = await supa.from('setari_kpi')
      .upsert({ cheie: 'obiectiv_agentie_eur', valoare: body.valoare === '' ? null : Number(body.valoare) });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  if (body.actiune === 'kpi-tinta') {
    const { error } = await supa.from('kpi_individual')
      .update({ tinta: body.tinta === '' ? null : Number(body.tinta) })
      .eq('id', body.kpiId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Actiune necunoscuta' }, { status: 400 });
}
