'use client';
// app/kpi/page.tsx — panou agent v7: obiectivele lunii primele, cardul DE FACUT
// (cat mai ai de propus ca sa-ti atingi targetul), KPI individuali, agentia, artisti, istoric.

import { useEffect, useState } from 'react';

const fmt = (n: number) => Math.round(n).toLocaleString('ro-RO');
const C = {
  bg: '#f5f5f7', card: '#ffffff', border: '#e7e5e4', ink: '#101014',
  grey: '#78716c', green: '#059669', amber: '#d97706', red: '#dc2626',
};
const card: React.CSSProperties = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 };
const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
  borderBottom: `1px solid ${C.border}`,
};
const LUNI = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DEFINITII: Record<string, { titlu: string; text: string }> = {
  obiective: { titlu: 'Obiectivele lunii', text: 'Se numara evenimentele care AU LOC in luna aceasta (data evenimentului in luna). O confirmare facuta azi pentru o luna viitoare apare la luna respectiva. Eu incarc raportul saptamanal; barele se actualizeaza la fiecare incarcare.' },
  de_facut: { titlu: 'De facut', text: 'Cat mai ai de propus ca sa-ti atingi targetul lunii: restul de confirmat, impartit la conversia ta in valoare de anul asta, iti da volumul de propus. Numarul de evenimente e estimat la fee-ul tau mediu. E o estimare statistica, nu o garantie — dar e directia corecta a efortului.' },
  rata_conf: { titlu: 'Rata de confirmare', text: 'Numarul evenimentelor confirmate impartit la numarul celor propuse, pe numar, nu pe valoare. Tinta: 20%.' },
  anulare: { titlu: 'Rata de anulare', text: 'Valoarea anulata impartita la valoarea confirmata plus anulata, pe tot anul. Se masoara in VALOARE — o anulare de 20.000 EUR cantareste cat zece de 2.000. Tinta: sub 4%.' },
  gap: { titlu: 'Saptamani fara propuneri', text: 'Cea mai lunga serie de saptamani consecutive fara nicio propunere noua, de la inceputul anului. Pipeline-ul intermitent e cel mai bun predictor al lunilor slabe. Tinta: maxim 1.' },
  conversie: { titlu: 'Conversie valoare', text: 'Confirmat impartit la Propus, in valoare, pe tot anul. Peste 30% esti in media agentiei.' },
  top3: { titlu: 'Concentrarea pe top 3 artisti', text: 'Cat la suta din rulajul tau confirmat vine din primii 3 artisti. Peste 35-40% inseamna dependenta.' },
  cota_agentie: { titlu: 'Cota din rulajul agentiei', text: 'Cat la suta din rulajul confirmat al agentiei e generat de tine.' },
  agentie: { titlu: 'Obiectivele generale', text: 'Rulajul intregii echipe fata de obiectivul anual al agentiei, si rulajul tau anual fata de obiectivul tau. Partea ta conteaza in ambele bare.' },
  carry: { titlu: 'Vandut in 2025 pentru 2026', text: 'Evenimente contractate anul trecut cu executie anul acesta. Intra in rulaj si in gradul de realizare, dar nu in indicatorii de efort: conversie, anulari, ritm.' },
  segmente: { titlu: 'Segmentele tale', text: 'Conversia ta in valoare pe fiecare tip de eveniment. Doar segmentele cu minim 5 propuneri.' },
  istoric: { titlu: 'Istoric propus vs confirmat', text: 'Bara gri = cat ai propus in perioada. Bara verde = cat s-a confirmat, pe aceeasi scara. Badge-ul = rata de confirmare pe numar (confirmate/propuse, tinta 20%). Linia neagra = targetul lunii, unde exista.' },
};

function lunaDinSaptamana(an: number, sapt: number): number {
  const jan4 = new Date(Date.UTC(an, 0, 4));
  const zi = jan4.getUTCDay() || 7;
  const luni1 = new Date(jan4); luni1.setUTCDate(jan4.getUTCDate() - (zi - 1));
  const joi = new Date(luni1); joi.setUTCDate(luni1.getUTCDate() + (sapt - 1) * 7 + 3);
  return joi.getUTCMonth();
}
function statusKpi(val: number, tinta: number | null, directie: string): 'ok' | 'aproape' | 'rau' | 'neutru' {
  if (tinta === null || tinta === undefined) return 'neutru';
  let ok = false;
  if (directie === 'sub') ok = val < tinta;
  else if (directie === 'sub_egal') ok = val <= tinta;
  else ok = val >= tinta;
  if (ok) return 'ok';
  const aproape = directie === 'peste' ? val >= tinta * 0.85 : val <= tinta * 1.2;
  return aproape ? 'aproape' : 'rau';
}
const culoareStatus = (s: string) => s === 'ok' ? C.green : s === 'aproape' ? C.amber : s === 'rau' ? C.red : '#d6d3d1';

function Grupa({ t }: { t: string }) {
  return <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', color: C.grey, margin: '6px 2px -6px' }}>{t}</div>;
}
function Bara({ val, max, culoare, tinta }: { val: number; max: number; culoare: string; tinta?: number | null }) {
  const pct = max > 0 ? Math.min(100, (val / max) * 100) : 0;
  return (
    <div style={{ position: 'relative', height: 10, background: '#f0efee', borderRadius: 5, marginTop: 8, overflow: 'visible' }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${pct}%`, background: culoare, borderRadius: 5, transition: 'width .4s' }} />
      {tinta != null && max > 0 && <div style={{ position: 'absolute', top: -3, bottom: -3, left: `${Math.min(100, (tinta / max) * 100)}%`, width: 2, background: C.ink }} />}
    </div>
  );
}

export default function KpiPage() {
  const [nume, setNume] = useState('');
  const [parola, setParola] = useState('');
  const [sesiune, setSesiune] = useState<{ nume: string; parola: string } | null>(null);
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [perioada, setPerioada] = useState<'S' | 'L' | 'T'>('L');
  const [expl, setExpl] = useState<string | null>(null);
  const [istoricTot, setIstoricTot] = useState(false);

  useEffect(() => {
    const salvat = typeof window !== 'undefined' ? sessionStorage.getItem('kpi_sesiune') : null;
    if (salvat) { const s = JSON.parse(salvat); incarca(s.nume, s.parola); }
  }, []);

  async function incarca(n: string, p: string) {
    setLoading(true); setErr('');
    try {
      const r = await fetch('/api/kpi-data', { headers: { 'x-kpi-nume': n, 'x-kpi-parola': p } });
      const j = await r.json();
      if (!r.ok) { setErr(j.error || 'Nume sau parola gresite'); setSesiune(null); sessionStorage.removeItem('kpi_sesiune'); }
      else { setData(j); setSesiune({ nume: n, parola: p }); sessionStorage.setItem('kpi_sesiune', JSON.stringify({ nume: n, parola: p })); }
    } catch { setErr('Eroare de retea'); }
    setLoading(false);
  }

  if (!sesiune || !data) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <div style={{ ...card, width: '100%', maxWidth: 380, padding: 32 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.ink, marginBottom: 2 }}>GIG<span style={{ color: C.green }}>x</span></div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.grey, marginBottom: 20 }}>KPI Forward</div>
          <input value={nume} onChange={e => setNume(e.target.value)} placeholder="Nume"
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 16, boxSizing: 'border-box', outline: 'none', marginBottom: 10 }} />
          <input value={parola} onChange={e => setParola(e.target.value)} placeholder="Parola" type="password"
            onKeyDown={e => e.key === 'Enter' && nume && parola && incarca(nume.trim(), parola.trim())}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 16, boxSizing: 'border-box', outline: 'none' }} />
          {err && <div style={{ color: C.red, fontSize: 13, marginTop: 10 }}>{err}</div>}
          <button onClick={() => nume && parola && incarca(nume.trim(), parola.trim())} disabled={!nume || !parola || loading}
            style={{ width: '100%', marginTop: 16, padding: '12px 0', borderRadius: 10, border: 'none', background: nume && parola ? C.ink : '#d6d3d1', color: '#fff', fontSize: 15, fontWeight: 600, cursor: nume && parola ? 'pointer' : 'default' }}>
            {loading ? 'Se verifica...' : 'Intra'}
          </button>
        </div>
      </div>
    );
  }

  const { eu, an, agenti, kpi, artisti, segmente, kpiIndividuali, medieAgentie, obiectivAgentieEur, tinteLunare, lunaExec, reusite, sinteze } = data;
  const curs = 1;
  const agent = agenti.find((a: any) => a.id === eu.id) || agenti[0];
  const alMeu = kpi.filter((k: any) => k.agent_id === agent.id);
  const alMeuEfort = alMeu.filter((k: any) => k.saptamana > 0);
  const carryRow = alMeu.find((k: any) => k.saptamana === 0);
  const carryEur = carryRow ? Number(carryRow.valoare_confirmata_ron) : 0;
  const artMei = artisti.filter((a: any) => a.agent_id === agent.id);
  const segMele = (segmente || []).filter((s: any) => s.agent_id === agent.id);
  const saptCurenta = Math.max(0, ...alMeuEfort.map((k: any) => k.saptamana));

  const tot = alMeu.reduce((t: any, k: any) => ({
    conf: t.conf + k.confirmate, vConf: t.vConf + Number(k.valoare_confirmata_ron),
  }), { conf: 0, vConf: 0 });
  const totE = alMeuEfort.reduce((t: any, k: any) => ({
    prop: t.prop + k.propuneri, vOf: t.vOf + Number(k.valoare_ofertata_ron),
    conf: t.conf + k.confirmate, vConf: t.vConf + Number(k.valoare_confirmata_ron),
    anul: t.anul + k.anulate, vAnul: t.vAnul + Number(k.valoare_anulata_ron),
  }), { prop: 0, vOf: 0, conf: 0, vConf: 0, anul: 0, vAnul: 0 });

  const confEur = tot.vConf / curs;
  const conversie = totE.vOf > 0 ? (totE.vConf / totE.vOf) * 100 : 0;
  const rataConfAn = totE.prop > 0 ? (totE.conf / totE.prop) * 100 : 0;
  const rataAnulare = (totE.vConf + totE.vAnul) > 0 ? (totE.vAnul / (totE.vConf + totE.vAnul)) * 100 : 0;
  const feeMediu = totE.conf > 0 ? (totE.vConf / curs) / totE.conf : 0;

  let gapMax = 0, gap = 0;
  const propPeSapt = new Map<number, number>(alMeuEfort.map((k: any) => [k.saptamana, k.propuneri] as [number, number]));
  for (let s = 1; s <= saptCurenta; s++) {
    if ((propPeSapt.get(s) || 0) === 0) { gap++; gapMax = Math.max(gapMax, gap); } else gap = 0;
  }

  const top3 = artMei.slice(0, 3).reduce((s: number, a: any) => s + Number(a.valoare_confirmata_ron), 0);
  const top3Pct = tot.vConf > 0 ? (top3 / tot.vConf) * 100 : 0;
  const cotaAgentie = medieAgentie.totalConfirmatRon > 0 ? (tot.vConf / medieAgentie.totalConfirmatRon) * 100 : 0;

  const valoriKpi: Record<string, { val: number; text: string; def: string }> = {
    anulare: { val: rataAnulare, text: `${rataAnulare.toFixed(1)}%`, def: 'anulare' },
    gap: { val: gapMax, text: String(gapMax), def: 'gap' },
    conversie: { val: conversie, text: `${conversie.toFixed(1)}%`, def: 'conversie' },
    top3: { val: top3Pct, text: `${top3Pct.toFixed(1)}%`, def: 'top3' },
    cota_agentie: { val: cotaAgentie, text: `${cotaAgentie.toFixed(1)}%`, def: 'cota_agentie' },
  };
  const kpiMei = kpiIndividuali.filter((k: any) => k.agent_id === agent.id && valoriKpi[k.cheie]);

  // luna curenta: tinte + executie
  const azi = new Date();
  const lunaCur = azi.getMonth() + 1;
  const zileLuna = new Date(azi.getFullYear(), lunaCur, 0).getDate();
  const ritmLuna = (azi.getDate() / zileLuna) * 100;
  const tintaLuna = (tinteLunare || []).find((t: any) => t.agent_id === agent.id && t.luna === lunaCur);
  const execLuna = (lunaExec || []).find((l: any) => l.agent_id === agent.id && l.luna === lunaCur);
  const execN = execLuna ? execLuna.executate : 0;
  const execV = execLuna ? Number(execLuna.valoare_executata) : 0;
  const propLunaCur = alMeuEfort.filter((k: any) => lunaDinSaptamana(an, k.saptamana) === lunaCur - 1).reduce((s: number, k: any) => s + k.propuneri, 0);
  const propLunaCurV = alMeuEfort.filter((k: any) => lunaDinSaptamana(an, k.saptamana) === lunaCur - 1).reduce((s: number, k: any) => s + Number(k.valoare_ofertata_ron), 0) / curs;
  const confLunaCur = alMeuEfort.filter((k: any) => lunaDinSaptamana(an, k.saptamana) === lunaCur - 1).reduce((s: number, k: any) => s + k.confirmate, 0);
  const rataConfLuna = propLunaCur > 0 ? (confLunaCur / propLunaCur) * 100 : 0;
  const volumT = tintaLuna?.volum_t ? Number(tintaLuna.volum_t) : null;
  const nrEvT = tintaLuna?.nr_ev_t ? Number(tintaLuna.nr_ev_t) : null;
  const rataT = tintaLuna?.rata_conf_t ? Number(tintaLuna.rata_conf_t) : 20;
  const ramasV = volumT ? Math.max(0, volumT - execV) : 0;
  const ramasN = nrEvT ? Math.max(0, nrEvT - execN) : 0;
  const dePropusV = ramasV > 0 && conversie > 5 ? ramasV / (conversie / 100) : 0;
  const dePropusN = feeMediu > 0 && dePropusV > 0 ? Math.ceil(dePropusV / feeMediu) : 0;
  const peRitmV = volumT ? (execV / volumT) * 100 >= ritmLuna - 3 : null;

  const obiectiv = agent.obiectiv_anual_eur ? Number(agent.obiectiv_anual_eur) : null;
  const ritmCalendar = (saptCurenta / 52) * 100;
  const proiectie = saptCurenta > 0 ? carryEur + ((confEur - carryEur) / saptCurenta) * 52 : confEur;
  const agentieEur = medieAgentie.totalConfirmatRon / curs;
  const progresAgentie = obiectivAgentieEur ? Math.min(100, (agentieEur / Number(obiectivAgentieEur)) * 100) : null;

  const segCuConv = segMele
    .map((s: any) => ({ ...s, conv: Number(s.valoare_ofertata_ron) > 0 ? (Number(s.valoare_confirmata_ron) / Number(s.valoare_ofertata_ron)) * 100 : 0 }))
    .filter((s: any) => s.propuneri >= 5);
  const forta = segCuConv.length ? segCuConv.reduce((a: any, b: any) => a.conv >= b.conv ? a : b) : null;
  const slab = segCuConv.length > 1 ? segCuConv.reduce((a: any, b: any) => a.conv <= b.conv ? a : b) : null;

  type P = { eticheta: string; luna: number; vOf: number; vConf: number; prop: number; conf: number };
  function grupeaza(mod: 'S' | 'L' | 'T'): P[] {
    if (mod === 'S') {
      return alMeuEfort.filter((k: any) => k.saptamana > saptCurenta - 8).map((k: any) => ({
        eticheta: `W${k.saptamana}`, luna: -1, vOf: Number(k.valoare_ofertata_ron), vConf: Number(k.valoare_confirmata_ron),
        prop: k.propuneri, conf: k.confirmate,
      }));
    }
    const grup = new Map<number, P>();
    for (const k of alMeuEfort) {
      const luna = lunaDinSaptamana(an, k.saptamana);
      const idx = mod === 'L' ? luna : Math.floor(luna / 3);
      const et = mod === 'L' ? LUNI[luna] : `T${Math.floor(luna / 3) + 1}`;
      const g = grup.get(idx) || { eticheta: et, luna: mod === 'L' ? luna + 1 : -1, vOf: 0, vConf: 0, prop: 0, conf: 0 };
      g.vOf += Number(k.valoare_ofertata_ron); g.vConf += Number(k.valoare_confirmata_ron);
      g.prop += k.propuneri; g.conf += k.confirmate;
      grup.set(idx, g);
    }
    return [...grup.entries()].sort((a, b) => a[0] - b[0]).map(e => e[1]);
  }
  const perioadeToate = grupeaza(perioada).slice().reverse(); // cele mai recente sus
  const perioade = istoricTot ? perioadeToate : perioadeToate.slice(0, 3);
  const maxP = Math.max(1, ...perioadeToate.map(p => p.vOf));

  const tileStyle = (ok: boolean | null): React.CSSProperties => ({
    padding: '14px 16px', background: '#fafaf9', borderRadius: 12, cursor: 'pointer',
    borderTop: `3px solid ${ok === null ? '#d6d3d1' : ok ? C.green : C.amber}`,
  });

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ ...glass, position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 19, fontWeight: 800, color: C.ink }}>GIG<span style={{ color: C.green }}>x</span> <span style={{ fontWeight: 600, color: C.grey, fontSize: 15 }}>· KPI</span></div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{agent.nume_afisat || agent.nume}</span>
            <button onClick={() => { sessionStorage.removeItem('kpi_sesiune'); setSesiune(null); setData(null); }}
              style={{ border: 'none', background: 'none', color: C.grey, fontSize: 13, cursor: 'pointer' }}>Iesire</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {(reusite || []).length > 0 && (
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: C.ink }}>
            🏆 {(reusite || []).map((r: any) => r.agentId === agent.id
              ? `Ti-ai atins targetul pe ${LUNI[r.luna - 1]} (${Math.round(r.procent)}%)`
              : `${r.nume} si-a atins targetul pe ${LUNI[r.luna - 1]}`).join(' · ')}
          </div>
        )}

        {(() => {
          const ale = (sinteze || []).filter((x: any) => x.publicat && x.text && x.text.trim());
          if (!ale.length) return null;
          const sMax = Math.max(...ale.map((x: any) => x.saptamana));
          const curente = ale.filter((x: any) => x.saptamana === sMax);
          const personala = curente.find((x: any) => x.agent_id === agent.id);
          const generala = curente.find((x: any) => !x.agent_id);
          if (!personala && !generala) return null;
          return (
            <>
              <Grupa t={`SINTEZA SAPTAMANII · W${sMax}`} />
              <div style={{ ...card, borderLeft: `4px solid ${C.green}` }}>
                {personala && <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{personala.text}</div>}
                {personala && generala && <div style={{ height: 1, background: C.border, margin: '12px 0' }} />}
                {generala && <div style={{ fontSize: 13, color: C.grey, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}><b style={{ color: C.ink }}>Echipa:</b> {generala.text}</div>}
              </div>
            </>
          );
        })()}

        <Grupa t={`OBIECTIVELE TALE · ${LUNI[lunaCur - 1].toUpperCase()}`} />
        <div style={{ ...card, padding: 16 }} onClick={() => setExpl('obiective')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.grey, marginBottom: 12 }}>
            <span>ziua {azi.getDate()} din {zileLuna} · linia neagra = unde ar trebui sa fii azi</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
            <div style={tileStyle(peRitmV)} onClick={e => { e.stopPropagation(); setExpl('obiective'); }}>
              <div style={{ fontSize: 12, color: C.grey }}>Volum executat (vanzare bruta)</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.ink }}>{fmt(execV)} <span style={{ fontSize: 13, fontWeight: 600, color: C.grey }}>/ {volumT ? fmt(volumT) : '—'} EUR</span></div>
              {volumT ? <Bara val={execV} max={volumT} culoare={peRitmV ? C.green : C.amber} tinta={volumT * (ritmLuna / 100)} /> : <div style={{ fontSize: 12, color: C.grey, marginTop: 6 }}>Target nesetat.</div>}
              {volumT && <div style={{ fontSize: 12, color: ramasV > 0 ? C.ink : C.green, marginTop: 6 }}>{ramasV > 0 ? <span>Mai ai <b>{fmt(ramasV)} EUR</b>.</span> : <b>Atins si depasit cu {fmt(execV - volumT)} EUR.</b>}</div>}
            </div>
            <div style={tileStyle(nrEvT ? execN / nrEvT * 100 >= ritmLuna - 3 : null)} onClick={e => { e.stopPropagation(); setExpl('obiective'); }}>
              <div style={{ fontSize: 12, color: C.grey }}>Evenimente executate</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.ink }}>{execN} <span style={{ fontSize: 13, fontWeight: 600, color: C.grey }}>/ {nrEvT ?? '—'}</span></div>
              {nrEvT ? <Bara val={execN} max={nrEvT} culoare={execN / nrEvT * 100 >= ritmLuna - 3 ? C.green : C.amber} tinta={nrEvT * (ritmLuna / 100)} /> : <div style={{ fontSize: 12, color: C.grey, marginTop: 6 }}>Target nesetat.</div>}
              {nrEvT && <div style={{ fontSize: 12, color: ramasN > 0 ? C.ink : C.green, marginTop: 6 }}>{ramasN > 0 ? <span>Mai ai <b>{ramasN} evenimente</b>.</span> : <b>Atins.</b>}</div>}
            </div>
            <div style={tileStyle(rataConfLuna >= rataT)} onClick={e => { e.stopPropagation(); setExpl('rata_conf'); }}>
              <div style={{ fontSize: 12, color: C.grey }}>Rata de confirmare (nr) · luna asta</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: rataConfLuna >= rataT ? C.green : rataConfLuna >= rataT * 0.75 ? C.amber : C.red }}>{rataConfLuna.toFixed(0)}% <span style={{ fontSize: 13, fontWeight: 600, color: C.grey }}>/ tinta {rataT}%</span></div>
              <div style={{ fontSize: 12, color: C.grey, marginTop: 6 }}>{confLunaCur} confirmate din {propLunaCur} propuse · anual: {rataConfAn.toFixed(0)}%</div>
            </div>
            <div style={tileStyle(rataAnulare < 4)} onClick={e => { e.stopPropagation(); setExpl('anulare'); }}>
              <div style={{ fontSize: 12, color: C.grey }}>Rata de anulare (valoare) · an</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: rataAnulare < 4 ? C.green : rataAnulare < 6 ? C.amber : C.red }}>{rataAnulare.toFixed(1)}% <span style={{ fontSize: 13, fontWeight: 600, color: C.grey }}>/ sub 4%</span></div>
              <div style={{ fontSize: 12, color: C.grey, marginTop: 6 }}>{fmt(totE.vAnul / curs)} EUR anulati din {fmt((totE.vConf + totE.vAnul) / curs)}</div>
            </div>
          </div>
        </div>

        {volumT && ramasV > 0 && (
          <div style={{ ...card, background: '#101014', border: 'none', cursor: 'pointer' }} onClick={() => setExpl('de_facut')}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', color: '#a8a29e', marginBottom: 8 }}>DE FACUT · {LUNI[lunaCur - 1].toUpperCase()}</div>
            <div style={{ fontSize: 16, color: '#fff', lineHeight: 1.55 }}>
              Mai ai <b style={{ color: '#34d399' }}>{fmt(ramasV)} EUR</b> de confirmat{ramasN > 0 ? <span> (~{ramasN} evenimente)</span> : null}.
              La conversia ta de {conversie.toFixed(0)}%, asta inseamna <b style={{ color: '#34d399' }}>~{fmt(dePropusV)} EUR de propus</b>{dePropusN > 0 ? <span> — circa <b style={{ color: '#34d399' }}>{dePropusN} propuneri</b> la fee-ul tau mediu de {fmt(feeMediu)} EUR</span> : null}.
            </div>
            <div style={{ fontSize: 13, color: '#a8a29e', marginTop: 10 }}>Luna asta ai propus {fmt(propLunaCurV)} EUR ({propLunaCur} propuneri). Apasa pentru cum se calculeaza.</div>
          </div>
        )}

        {kpiMei.length > 0 && (
          <>
            <Grupa t="OBIECTIVELE TALE ADAPTATE" />
            <div style={card}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {kpiMei.map((k: any) => {
                  const st = statusKpi(valoriKpi[k.cheie].val, k.tinta, k.directie);
                  return (
                    <div key={k.id} onClick={() => setExpl(valoriKpi[k.cheie].def)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#fafaf9', borderRadius: 10, borderLeft: `4px solid ${culoareStatus(st)}`, cursor: 'pointer' }}>
                      <div style={{ fontSize: 14, color: C.ink }}>{k.eticheta}</div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: culoareStatus(st) === '#d6d3d1' ? C.ink : culoareStatus(st) }}>{valoriKpi[k.cheie].text}</div>
                        {k.tinta !== null && <div style={{ fontSize: 11, color: C.grey }}>tinta: {k.directie === 'peste' ? 'peste' : 'sub'} {k.tinta}{k.cheie === 'gap' ? '' : '%'}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <Grupa t="OBIECTIVELE GENERALE" />
        <div style={{ ...card, cursor: 'pointer' }} onClick={() => setExpl('agentie')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>Anul tau</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>{fmt(confEur)} <span style={{ fontWeight: 400, color: C.grey }}>/ {obiectiv ? fmt(obiectiv) : '—'} EUR</span></div>
          </div>
          {obiectiv ? <Bara val={confEur} max={obiectiv} culoare={(confEur / obiectiv) * 100 >= ritmCalendar - 2 ? C.green : C.amber} tinta={obiectiv * (ritmCalendar / 100)} /> : null}
          <div style={{ fontSize: 12, color: C.grey, marginTop: 6 }}>
            {carryEur > 0 && <span onClick={e => { e.stopPropagation(); setExpl('carry'); }}>Include {fmt(carryEur)} EUR vanduti in 2025. </span>}
            In ritmul actual termini anul la <b style={{ color: C.ink }}>{fmt(proiectie)} EUR</b>.
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>Forward Agency</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>{fmt(agentieEur)} <span style={{ fontWeight: 400, color: C.grey }}>/ {obiectivAgentieEur ? fmt(Number(obiectivAgentieEur)) : '—'} EUR</span></div>
          </div>
          {progresAgentie !== null ? <Bara val={agentieEur} max={Number(obiectivAgentieEur)} culoare={progresAgentie >= ritmCalendar - 2 ? C.green : C.amber} tinta={Number(obiectivAgentieEur) * (ritmCalendar / 100)} /> : <div style={{ fontSize: 12, color: C.grey, marginTop: 6 }}>Obiectivul agentiei nesetat.</div>}
        </div>

        {artMei.length > 0 && (
          <>
            <Grupa t="TOP ARTISTI CONFIRMATI" />
            <div style={{ ...card, cursor: 'pointer' }} onClick={() => setExpl('top3')}>
              <div style={{ fontSize: 12, color: C.grey, marginBottom: 12 }}>Top 3 = {top3Pct.toFixed(1)}% din rulajul tau</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {artMei.slice(0, 7).map((a: any) => (
                  <div key={a.artist} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: C.ink }}>{a.artist}</span>
                    <span style={{ color: C.grey }}>{a.confirmate} ev. · <b style={{ color: C.ink }}>{fmt(Number(a.valoare_confirmata_ron) / curs)} EUR</b></span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {forta && (
          <div style={{ ...card, cursor: 'pointer' }} onClick={() => setExpl('segmente')}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 10 }}>Segmentele tale</div>
            <div style={{ display: 'grid', gridTemplateColumns: slab && slab.segment !== forta.segment ? '1fr 1fr' : '1fr', gap: 10 }}>
              <div style={{ padding: '10px 14px', background: '#ecfdf5', borderRadius: 10, borderLeft: `4px solid ${C.green}` }}>
                <div style={{ fontSize: 12, color: C.grey }}>Forta ta</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, textTransform: 'capitalize' }}>{forta.segment} <span style={{ color: C.green, fontSize: 13 }}>{forta.conv.toFixed(0)}%</span></div>
              </div>
              {slab && slab.segment !== forta.segment && (
                <div style={{ padding: '10px 14px', background: '#fef2f2', borderRadius: 10, borderLeft: `4px solid ${C.red}` }}>
                  <div style={{ fontSize: 12, color: C.grey }}>De lucrat</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, textTransform: 'capitalize' }}>{slab.segment} <span style={{ color: C.red, fontSize: 13 }}>{slab.conv.toFixed(0)}%</span></div>
                </div>
              )}
            </div>
          </div>
        )}

        <Grupa t="ISTORIC" />
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, cursor: 'pointer' }} onClick={() => setExpl('istoric')}>Propus vs Confirmat</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['S', 'L', 'T'] as const).map(p => (
                <button key={p} onClick={() => setPerioada(p)}
                  style={{ padding: '6px 14px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: perioada === p ? C.ink : '#f0efee', color: perioada === p ? '#fff' : C.grey }}>
                  {p === 'S' ? 'Saptamanal' : p === 'L' ? 'Lunar' : 'Trimestrial'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {perioade.map(p => {
              const tL = p.luna > 0 ? (tinteLunare || []).find((t: any) => t.agent_id === agent.id && t.luna === p.luna) : null;
              const tgt = tL?.volum_t ? Number(tL.volum_t) : null;
              const cv = p.prop > 0 ? (p.conf / p.prop) * 100 : 0;
              const bg = cv >= 20 ? '#ecfdf5' : cv >= 15 ? '#fffbeb' : '#fef2f2';
              const col = cv >= 20 ? C.green : cv >= 15 ? C.amber : C.red;
              return (
                <div key={p.eticheta} onClick={() => setExpl('istoric')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 13, color: C.ink }}>{p.eticheta}</span>
                    {p.prop > 0 && <span style={{ background: bg, color: col, fontWeight: 800, fontSize: 11, padding: '2px 7px', borderRadius: 6 }}>{cv.toFixed(0)}% confirmare ({p.conf}/{p.prop})</span>}
                  </div>
                  <div style={{ fontSize: 11, color: C.grey, marginBottom: 2 }}>Propus <b style={{ color: C.ink }}>{fmt(p.vOf / curs)} EUR</b> ({p.prop} ev)</div>
                  <div style={{ height: 8, background: '#f0efee', borderRadius: 4, marginBottom: 5, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(p.vOf / maxP) * 100}%`, background: '#a8a29e', borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 11, color: C.grey, marginBottom: 2 }}>Confirmat <b style={{ color: C.green }}>{fmt(p.vConf / curs)} EUR</b> ({p.conf} ev){tgt ? <span> · target {fmt(tgt)}</span> : null}</div>
                  <div style={{ position: 'relative', height: 8, background: '#f0efee', borderRadius: 4, overflow: 'visible' }}>
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${(p.vConf / maxP) * 100}%`, background: C.green, borderRadius: 4 }} />
                    {tgt && <div style={{ position: 'absolute', top: -3, bottom: -3, left: `${Math.min(100, (tgt / maxP) * 100)}%`, width: 2, background: C.ink }} />}
                  </div>
                </div>
              );
            })}
          </div>
          {perioadeToate.length > 3 && (
            <button onClick={() => setIstoricTot(!istoricTot)}
              style={{ marginTop: 14, width: '100%', padding: '10px 0', borderRadius: 10, border: `1px solid ${C.border}`, background: '#fafaf9', color: C.ink, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {istoricTot ? 'Arata doar ultimele 3' : `Vezi tot anul (${perioadeToate.length} perioade)`}
            </button>
          )}
        </div>

        <div style={{ fontSize: 12, color: C.grey, textAlign: 'center', paddingBottom: 8 }}>
          Apasa pe orice card ca sa vezi ce inseamna. Valorile in EUR, direct din Booking Reporting.
        </div>
      </div>

      {expl && DEFINITII[expl] && (
        <div onClick={() => setExpl(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(16,16,20,0.4)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '20px 20px 0 0', padding: '24px 20px 34px', width: '100%', maxWidth: 720, boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ width: 36, height: 4, background: '#d6d3d1', borderRadius: 2, margin: '0 auto 16px' }} />
            <div style={{ fontSize: 17, fontWeight: 800, color: C.ink, marginBottom: 8 }}>{DEFINITII[expl].titlu}</div>
            <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.55 }}>{DEFINITII[expl].text}</div>
            <button onClick={() => setExpl(null)} style={{ marginTop: 18, width: '100%', padding: '12px 0', borderRadius: 10, border: 'none', background: C.ink, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Am inteles</button>
          </div>
        </div>
      )}
    </div>
  );
}
