'use client';
// app/kpi/page.tsx — panou individual agent v2
// Propus vs Confirmat (S/L/T derivat din saptamana ISO), KPI individuali, top artisti, reper medie agentie.

import { useEffect, useState } from 'react';

const fmt = (n: number) => Math.round(n).toLocaleString('ro-RO');
const C = {
  bg: '#f5f5f7', card: '#ffffff', border: '#e7e5e4', ink: '#101014',
  grey: '#78716c', green: '#059669', amber: '#d97706', red: '#dc2626',
};
const card: React.CSSProperties = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 };
const LUNI = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// luna in care cade joia saptamanii ISO — o singura axa a adevarului
function lunaDinSaptamana(an: number, sapt: number): number {
  const jan4 = new Date(Date.UTC(an, 0, 4));
  const zi = jan4.getUTCDay() || 7;
  const luni1 = new Date(jan4); luni1.setUTCDate(jan4.getUTCDate() - (zi - 1));
  const joi = new Date(luni1); joi.setUTCDate(luni1.getUTCDate() + (sapt - 1) * 7 + 3);
  return joi.getUTCMonth();
}

function Semafor({ val, tinta, directie }: { val: number; tinta: number | null; directie: string }) {
  if (tinta === null || tinta === undefined) return null;
  let ok = false;
  if (directie === 'sub') ok = val < tinta;
  else if (directie === 'sub_egal') ok = val <= tinta;
  else ok = val >= tinta;
  const aproape = !ok && (directie === 'peste' ? val >= tinta * 0.85 : val <= tinta * 1.2);
  const col = ok ? C.green : aproape ? C.amber : C.red;
  return <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 5, background: col, marginRight: 8 }} />;
}

export default function KpiPage() {
  const [nume, setNume] = useState('');
  const [parola, setParola] = useState('');
  const [sesiune, setSesiune] = useState<{ nume: string; parola: string } | null>(null);
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [perioada, setPerioada] = useState<'S' | 'L' | 'T'>('S');

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
          <div style={{ fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 4 }}>KPI Forward</div>
          <div style={{ fontSize: 14, color: C.grey, marginBottom: 20 }}>Intra cu numele si parola ta</div>
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

  const { eu, curs, an, agenti, kpi, artisti, kpiIndividuali, medieAgentie } = data;
  const agent = agenti.find((a: any) => a.id === eu.id) || agenti[0];
  const alMeu = kpi.filter((k: any) => k.agent_id === agent.id);
  const artMei = artisti.filter((a: any) => a.agent_id === agent.id);
  const saptCurenta = Math.max(0, ...alMeu.map((k: any) => k.saptamana));

  const tot = alMeu.reduce((t: any, k: any) => ({
    prop: t.prop + k.propuneri, vOf: t.vOf + Number(k.valoare_ofertata_ron),
    conf: t.conf + k.confirmate, vConf: t.vConf + Number(k.valoare_confirmata_ron),
    anul: t.anul + k.anulate, vAnul: t.vAnul + Number(k.valoare_anulata_ron),
  }), { prop: 0, vOf: 0, conf: 0, vConf: 0, anul: 0, vAnul: 0 });

  const confEur = tot.vConf / curs;
  const obiectiv = agent.obiectiv_anual_eur ? Number(agent.obiectiv_anual_eur) : null;
  const progres = obiectiv ? Math.min(100, (confEur / obiectiv) * 100) : 0;
  const ritmCalendar = (saptCurenta / 52) * 100;
  const necesarSapt = obiectiv && saptCurenta < 52 ? Math.max(0, (obiectiv - confEur) / (52 - saptCurenta)) : 0;
  const peRitm = obiectiv ? progres >= ritmCalendar - 2 : null;

  const conversie = tot.vOf > 0 ? (tot.vConf / tot.vOf) * 100 : 0;
  const rataAnulare = (tot.vConf + tot.vAnul) > 0 ? (tot.vAnul / (tot.vConf + tot.vAnul)) * 100 : 0;

  let gapMax = 0, gap = 0;
  const propPeSapt = new Map(alMeu.map((k: any) => [k.saptamana, k.propuneri]));
  for (let s = 1; s <= saptCurenta; s++) {
    if ((propPeSapt.get(s) || 0) === 0) { gap++; gapMax = Math.max(gapMax, gap); } else gap = 0;
  }

  const top3 = artMei.slice(0, 3).reduce((s: number, a: any) => s + Number(a.valoare_confirmata_ron), 0);
  const top3Pct = tot.vConf > 0 ? (top3 / tot.vConf) * 100 : 0;
  const cotaAgentie = medieAgentie.totalConfirmatRon > 0 ? (tot.vConf / medieAgentie.totalConfirmatRon) * 100 : 0;

  const valoriKpi: Record<string, { val: number; text: string }> = {
    anulare: { val: rataAnulare, text: `${rataAnulare.toFixed(1)}%` },
    gap: { val: gapMax, text: String(gapMax) },
    conversie: { val: conversie, text: `${conversie.toFixed(1)}%` },
    top3: { val: top3Pct, text: `${top3Pct.toFixed(1)}%` },
    cota_agentie: { val: cotaAgentie, text: `${cotaAgentie.toFixed(1)}%` },
  };
  const kpiMei = kpiIndividuali.filter((k: any) => k.agent_id === agent.id && valoriKpi[k.cheie]);

  // Propus vs Confirmat pe perioada aleasa
  type P = { eticheta: string; vOf: number; vConf: number };
  const perioade: P[] = [];
  if (perioada === 'S') {
    const ultimele = alMeu.filter((k: any) => k.saptamana > saptCurenta - 8);
    for (const k of ultimele) perioade.push({ eticheta: `W${k.saptamana}`, vOf: Number(k.valoare_ofertata_ron), vConf: Number(k.valoare_confirmata_ron) });
  } else {
    const grup = new Map<number, P>();
    for (const k of alMeu) {
      const luna = lunaDinSaptamana(an, k.saptamana);
      const idx = perioada === 'L' ? luna : Math.floor(luna / 3);
      const et = perioada === 'L' ? LUNI[luna] : `T${Math.floor(luna / 3) + 1}`;
      const g = grup.get(idx) || { eticheta: et, vOf: 0, vConf: 0 };
      g.vOf += Number(k.valoare_ofertata_ron); g.vConf += Number(k.valoare_confirmata_ron);
      grup.set(idx, g);
    }
    perioade.push(...[...grup.entries()].sort((a, b) => a[0] - b[0]).map(e => e[1]));
  }
  const maxP = Math.max(1, ...perioade.map(p => p.vOf));

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: '24px 16px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.ink }}>{agent.nume_afisat || agent.nume}</div>
            <div style={{ fontSize: 13, color: C.grey }}>Anul {an} · pana la Week {saptCurenta} · curs BNR {curs.toFixed(4)}</div>
          </div>
          <button onClick={() => { sessionStorage.removeItem('kpi_sesiune'); setSesiune(null); setData(null); }}
            style={{ border: 'none', background: 'none', color: C.grey, fontSize: 13, cursor: 'pointer' }}>Iesire</button>
        </div>

        <div style={card}>
          <div style={{ fontSize: 13, color: C.grey, marginBottom: 6 }}>Rulaj confirmat {an}</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: C.ink }}>{fmt(confEur)} EUR</div>
          {obiectiv ? (
            <>
              <div style={{ position: 'relative', height: 14, background: '#f0efee', borderRadius: 7, marginTop: 14, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, width: `${progres}%`, background: peRitm ? C.green : C.amber, borderRadius: 7, transition: 'width .4s' }} />
                <div style={{ position: 'absolute', top: -2, bottom: -2, left: `${ritmCalendar}%`, width: 2, background: C.ink }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.grey, marginTop: 8 }}>
                <span>{progres.toFixed(1)}% din {fmt(obiectiv)} EUR</span>
                <span>ritm calendar: {ritmCalendar.toFixed(0)}%</span>
              </div>
              <div style={{ marginTop: 12, padding: '10px 14px', background: peRitm ? '#ecfdf5' : '#fffbeb', borderRadius: 10, fontSize: 14, color: C.ink }}>
                {peRitm ? 'Esti pe ritm.' : 'Sub ritm.'} Iti trebuie <b>{fmt(necesarSapt)} EUR / saptamana</b> pana la finalul anului.
              </div>
            </>
          ) : (
            <div style={{ marginTop: 12, fontSize: 14, color: C.grey }}>Obiectiv anual nesetat inca.</div>
          )}
        </div>

        {kpiMei.length > 0 && (
          <div style={card}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 12 }}>KPI-urile tale</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {kpiMei.map((k: any) => (
                <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#fafaf9', borderRadius: 10 }}>
                  <div style={{ fontSize: 14, color: C.ink }}><Semafor val={valoriKpi[k.cheie].val} tinta={k.tinta} directie={k.directie} />{k.eticheta}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{valoriKpi[k.cheie].text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>Propus vs Confirmat</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['S', 'L', 'T'] as const).map(p => (
                <button key={p} onClick={() => setPerioada(p)}
                  style={{ padding: '6px 14px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: perioada === p ? C.ink : '#f0efee', color: perioada === p ? '#fff' : C.grey }}>
                  {p === 'S' ? 'Saptamanal' : p === 'L' ? 'Lunar' : 'Trimestrial'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {perioade.map(p => (
              <div key={p.eticheta}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.grey, marginBottom: 3 }}>
                  <span style={{ fontWeight: 600 }}>{p.eticheta}</span>
                  <span>{fmt(p.vConf / curs)} / {fmt(p.vOf / curs)} EUR{p.vOf > 0 ? ` · ${((p.vConf / p.vOf) * 100).toFixed(0)}%` : ''}</span>
                </div>
                <div style={{ position: 'relative', height: 16, background: '#f0efee', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, width: `${(p.vOf / maxP) * 100}%`, background: '#d6d3d1', borderRadius: 8 }} />
                  <div style={{ position: 'absolute', inset: 0, width: `${(p.vConf / maxP) * 100}%`, background: C.green, borderRadius: 8 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: C.grey, marginTop: 8 }}>Gri = propus, verde = confirmat. Lunile derivate din saptamana de raportare.</div>
        </div>

        {artMei.length > 0 && (
          <div style={card}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Top artisti (confirmat)</div>
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
        )}

        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 12 }}>Tu vs media agentiei</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ padding: '10px 14px', background: '#fafaf9', borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: C.grey }}>Rulaj confirmat</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.ink }}>{fmt(confEur)} EUR</div>
              <div style={{ fontSize: 12, color: C.grey }}>media: {fmt(medieAgentie.confirmatRon / curs)} EUR</div>
            </div>
            <div style={{ padding: '10px 14px', background: '#fafaf9', borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: C.grey }}>Conversie valoare</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.ink }}>{conversie.toFixed(1)}%</div>
              <div style={{ fontSize: 12, color: C.grey }}>media: {medieAgentie.conversie.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: C.grey, textAlign: 'center', paddingBottom: 8 }}>
          Valorile in EUR la cursul BNR al zilei. Sursa: Booking Reporting.
        </div>
      </div>
    </div>
  );
}
