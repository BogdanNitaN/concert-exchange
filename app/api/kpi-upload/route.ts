// app/api/kpi-upload/route.ts
// Upload Booking Reporting xlsx -> parseaza FWD {an} + FWD Ofertat {an} -> kpi_saptamanal
// Doi pasi: POST cu doar fisierul => sumar de validare; POST cu confirm=true => scriere.
// Auth: nume + parola in headere 'x-kpi-nume' / 'x-kpi-parola'.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

export const runtime = 'nodejs';
export const maxDuration = 60;

function getSupa() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!
  );
}

const norm = (s: any) => String(s ?? '').trim();

export async function POST(req: NextRequest) {
  const supa = getSupa();
  try {
    const nume = norm(req.headers.get('x-kpi-nume'));
    const parola = norm(req.headers.get('x-kpi-parola'));
    const { data: admin } = await supa.from('agenti')
      .select('id, rol').ilike('nume', nume).eq('parola', parola).eq('rol', 'admin').eq('activ', true).maybeSingle();
    if (!admin) return NextResponse.json({ error: 'Acces interzis' }, { status: 401 });

    const form = await req.formData();
    const file = form.get('file') as File | null;
    const confirm = form.get('confirm') === 'true';
    if (!file) return NextResponse.json({ error: 'Lipseste fisierul' }, { status: 400 });

    const buf = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buf, { type: 'buffer', cellDates: true });

    const shConf = wb.SheetNames.find(n => /^FWD \d{4}$/i.test(n.trim()));
    const shOfer = wb.SheetNames.find(n => /^FWD Ofertat \d{4}$/i.test(n.trim()));
    if (!shConf || !shOfer) {
      return NextResponse.json({ error: `Nu gasesc sheeturile FWD / FWD Ofertat. Gasit: ${wb.SheetNames.join(', ')}` }, { status: 400 });
    }
    const an = parseInt(shConf.match(/\d{4}/)![0]);

    const agRes = await supa.from('agenti').select('id, nume');
    const agenti = agRes.data || [];
    const byNume = new Map(agenti.map(a => [a.nume.toLowerCase(), a]));
    const necunoscuti = new Set<string>();

    type Row = { propuneri: number; vOf: number; conf: number; vConf: number; anul: number; vAnul: number };
    const acc = new Map<string, Row>();
    const bump = (agentId: string, sapt: number, fn: (r: Row) => void) => {
      const k = `${agentId}|${sapt}`;
      if (!acc.has(k)) acc.set(k, { propuneri: 0, vOf: 0, conf: 0, vConf: 0, anul: 0, vAnul: 0 });
      fn(acc.get(k)!);
    };

    // FWD Ofertat: col A = saptamana, B = AGENT, H = FEE (RON)
    const ofer: any[][] = XLSX.utils.sheet_to_json(wb.Sheets[shOfer], { header: 1 });
    for (let i = 1; i < ofer.length; i++) {
      const r = ofer[i]; if (!r) continue;
      const sapt = Number(r[0]); const nm = norm(r[1]);
      if (!nm || !Number.isInteger(sapt) || sapt < 1 || sapt > 53) continue;
      const ag = byNume.get(nm.toLowerCase());
      if (!ag) { necunoscuti.add(nm); continue; }
      const fee = Number(r[7]) || 0;
      bump(ag.id, sapt, x => { x.propuneri++; x.vOf += fee; });
    }

    // FWD confirmate: A = ctr (sapt sau 2025), B = Agent, J = FEE, M = STATUS EVENIMENT
    const conf: any[][] = XLSX.utils.sheet_to_json(wb.Sheets[shConf], { header: 1 });
    let carryover = 0;
    for (let i = 1; i < conf.length; i++) {
      const r = conf[i]; if (!r) continue;
      const ctr = Number(r[0]); const nm = norm(r[1]);
      if (!nm) continue;
      if (ctr > 100) { carryover++; continue; }
      if (!Number.isInteger(ctr) || ctr < 1 || ctr > 53) continue;
      const ag = byNume.get(nm.toLowerCase());
      if (!ag) { necunoscuti.add(nm); continue; }
      const fee = Number(r[9]) || 0;
      const status = norm(r[12]).toUpperCase();
      if (status === 'CONFIRMAT') bump(ag.id, ctr, x => { x.conf++; x.vConf += fee; });
      else if (status === 'ANULAT') bump(ag.id, ctr, x => { x.anul++; x.vAnul += fee; });
    }

    const saptMax = Math.max(0, ...[...acc.keys()].map(k => Number(k.split('|')[1])));
    const idToNume = new Map(agenti.map(a => [a.id, a.nume]));

    const sumarSapt: Record<string, any> = {};
    const totalAn: Record<string, any> = {};
    for (const [k, v] of acc) {
      const [agentId, s] = k.split('|');
      const nm = idToNume.get(agentId) || '?';
      if (Number(s) === saptMax) sumarSapt[nm] = v;
      const t = totalAn[nm] || (totalAn[nm] = { propuneri: 0, vOf: 0, conf: 0, vConf: 0, anul: 0, vAnul: 0 });
      t.propuneri += v.propuneri; t.vOf += v.vOf; t.conf += v.conf; t.vConf += v.vConf; t.anul += v.anul; t.vAnul += v.vAnul;
    }

    const sumar = {
      an, saptamanaCurenta: saptMax, carryover2025: carryover,
      agentiNecunoscuti: [...necunoscuti],
      ultimaSaptamana: sumarSapt, totalAn,
      randuriDeScris: acc.size,
    };

    if (!confirm) return NextResponse.json({ preview: true, sumar });

    const rows = [...acc.entries()].map(([k, v]) => {
      const [agent_id, s] = k.split('|');
      return {
        agent_id, an, saptamana: Number(s),
        propuneri: v.propuneri, valoare_ofertata_ron: v.vOf,
        confirmate: v.conf, valoare_confirmata_ron: v.vConf,
        anulate: v.anul, valoare_anulata_ron: v.vAnul,
        incarcat_la: new Date().toISOString(),
      };
    });
    const { error } = await supa.from('kpi_saptamanal').upsert(rows, { onConflict: 'agent_id,an,saptamana' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supa.from('kpi_upload_log').insert({ an, saptamana: saptMax, fisier: file.name, sumar });
    return NextResponse.json({ ok: true, sumar });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Eroare la procesare' }, { status: 500 });
  }
}
