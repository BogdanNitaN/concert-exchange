import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

function supaClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const supa = supaClient();
    const nume = req.headers.get('x-kpi-nume') || '';
    const parola = req.headers.get('x-kpi-parola') || '';
    const { data: eu } = await supa.from('agenti').select('id, rol').eq('nume', nume).eq('parola', parola).single();
    if (!eu || eu.rol !== 'admin') return NextResponse.json({ error: 'Doar admin' }, { status: 403 });

    const form = await req.formData();
    const file = form.get('file') as File | null;
    const mod = String(form.get('mod') || 'verifica');
    if (!file) return NextResponse.json({ error: 'Lipseste fisierul' }, { status: 400 });

    const buf = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buf, { cellDates: true });

    const wsC = wb.Sheets['centralizare'];
    if (!wsC) return NextResponse.json({ error: 'Nu gasesc sheet-ul "centralizare"' }, { status: 400 });
    const rows: any[][] = XLSX.utils.sheet_to_json(wsC, { header: 1, defval: null });

    let dataSnap: string | null = null;
    const g1 = rows[0]?.[6];
    if (g1 instanceof Date) dataSnap = g1.toISOString().slice(0, 10);
    if (!dataSnap) {
      const m = file.name.match(/(\d{2})[._-](\d{2})[._-](\d{4})/);
      if (m) dataSnap = `${m[3]}-${m[2]}-${m[1]}`;
    }
    if (!dataSnap) return NextResponse.json({ error: 'Nu pot determina data snapshotului (celula G1 sau numele fisierului)' }, { status: 400 });

    const { data: agenti } = await supa.from('agenti').select('id, nume');
    const mapAg = new Map((agenti || []).map(a => [a.nume.toLowerCase(), a.id]));

    const acc = new Map<string, { agent_id: string | null; agent_nume: string; client: string; categorie: string; suma_lei: number; zile_max: number }>();
    let randuri = 0, faraAgent = 0;
    const bump = (agent: string, client: string, cat: string, suma: number, zile: number) => {
      const aid = mapAg.get(agent.toLowerCase()) || null;
      if (!aid) faraAgent++;
      const k = `${agent}|${client}|${cat}`;
      const g = acc.get(k) || { agent_id: aid, agent_nume: agent, client, categorie: cat, suma_lei: 0, zile_max: 0 };
      g.suma_lei += suma; g.zile_max = Math.max(g.zile_max, zile);
      acc.set(k, g);
    };

    for (let i = 2; i < rows.length; i++) {
      const r = rows[i]; if (!r) continue;
      const client = String(r[0] || '').trim();
      const agent = String(r[7] || '').trim();
      const suma = Number(r[10]);
      if (!client || !agent || !isFinite(suma) || suma === 0) continue;
      const zile = Number(r[11]) || 0;
      const interval = String(r[12] || '').trim();
      const cat = interval.includes('>') ? 'peste30' : 'sub30';
      bump(agent, client, cat, suma, zile);
      randuri++;
    }

    let randuriLegal = 0;
    const legalName = wb.SheetNames.find(n => n.toUpperCase().startsWith('LEGAL'));
    if (legalName) {
      const rowsL: any[][] = XLSX.utils.sheet_to_json(wb.Sheets[legalName], { header: 1, defval: null });
      for (let i = 1; i < rowsL.length; i++) {
        const r = rowsL[i]; if (!r) continue;
        const client = String(r[1] || '').trim();
        const agent = String(r[6] || '').trim();
        const suma = Number(r[4]);
        if (!client || !agent || !isFinite(suma) || suma === 0) continue;
        bump(agent, client, 'legal', suma, 9999);
        randuriLegal++;
      }
    }

    const linii = [...acc.values()];
    const tot = (cat: string) => linii.filter(l => l.categorie === cat).reduce((s, l) => s + l.suma_lei, 0);
    const sumar = {
      dataSnapshot: dataSnap,
      facturi: randuri, facturiLegal: randuriLegal, liniiDeScris: linii.length,
      clientiUnici: new Set(linii.map(l => l.client)).size,
      randuriFaraAgentInRoster: faraAgent,
      totalLei: Math.round(tot('sub30') + tot('peste30') + tot('legal')),
      sub30Lei: Math.round(tot('sub30')), peste30Lei: Math.round(tot('peste30')), legalLei: Math.round(tot('legal')),
    };

    if (mod !== 'confirma') return NextResponse.json({ ok: true, sumar });

    await supa.from('solduri').delete().eq('data_snapshot', dataSnap);
    for (let i = 0; i < linii.length; i += 400) {
      const { error } = await supa.from('solduri').insert(linii.slice(i, i + 400).map(l => ({ ...l, data_snapshot: dataSnap })));
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, scris: true, sumar });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Eroare' }, { status: 500 });
  }
}
