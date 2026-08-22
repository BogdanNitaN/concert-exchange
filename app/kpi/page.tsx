'use client';
// app/kpi/page.tsx — panou individual agent (login nume + parola)
// Stil GIGx: bg #f5f5f7, carduri albe border #e7e5e4, inline styles.

import { useEffect, useState } from 'react';

const fmt = (n: number) => Math.round(n).toLocaleString('ro-RO');
const C = {
  bg: '#f5f5f7', card: '#ffffff', border: '#e7e5e4', ink: '#101014',
  grey: '#78716c', green: '#059669', amber: '#d97706', red: '#dc2626',
};

export default function KpiPage() {
  const [nume, setNume] = useState('');
  const [parola, setParola] = useState('');
  const [sesiune, setSesiune] = useState<{ nume: string; parola: string } | null>(null);
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

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
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, width: '100%', maxWidth: 380 }}>
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

  const { eu, curs, an, agenti, kpi } = data;
  const agent = agenti.find((a: any) => a.id === eu.id) || agenti[0];
  const alMeu = kpi.filter((k: any) => k.agent_id === agent.id);
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
  const feeMediu = tot.conf > 0 ? confEur / tot.conf : 0;

  let gapMax = 0, gap = 0;
  const propPeSapt = new Map(alMeu.map((k: any) => [k.saptamana, k.propuneri]));
  for (let s = 1; s <= saptCurenta; s++) {
    if ((propPeSapt.get(s) || 0) === 0) { gap++; gapMax = Math.max(gapMax, gap); } else gap = 0;
  }

  const ultimele12 = alMeu.filter((k: any) => k.saptamana > saptCurenta - 12);
  const maxBar = Math.max(1, ...ultimele12.map((k: any) => Number(k.valoare_confirmata_ron)));

  const semafor = (ok: boolean, atentie: boolean) => ok ? C.green : atentie ? C.amber : C.red;
  const kpis = [
    { l: 'Conversie valoare', v: `${conversie.toFixed(1)}%`, c: semafor(conversie >= 30, conversie >= 20) },
    { l: 'Rata anulare', v: `${rataAnulare.toFixed(1)}%`, c: semafor(rataAnulare < 4, rataAnulare < 8) },
    { l: 'Fee mediu confirmat', v: `${fmt(feeMediu)} EUR`, c: C.ink },
    { l: 'Propuneri total', v: fmt(tot.prop), c: C.ink },
    { l: 'Confirmate total', v: fmt(tot.conf), c: C.ink },
    { l: 'Sapt. fara propuneri (max)', v: String(gapMax), c: semafor(gapMax <= 1, gapMax <= 2) },
  ];

  const card: React.CSSProperties = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 };

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
                <div style={{ position: 'absolute', top: -2, bottom: -2, left: `${ritmCalendar}%`, width: 2, background: C.ink }} title="ritm calendaristic" />
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {kpis.map(k => (
            <div key={k.l} style={{ ...card, padding: 14 }}>
              <div style={{ fontSize: 12, color: C.grey }}>{k.l}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: k.c, marginTop: 4 }}>{k.v}</div>
            </div>
          ))}
        </div>

        <div style={card}>
          <div style={{ fontSize: 13, color: C.grey, marginBottom: 10 }}>Confirmat pe ultimele 12 saptamani (EUR)</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 110 }}>
            {ultimele12.map((k: any) => (
              <div key={k.saptamana} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div title={`${fmt(Number(k.valoare_confirmata_ron) / curs)} EUR`}
                  style={{ width: '100%', borderRadius: 4, background: Number(k.valoare_confirmata_ron) > 0 ? C.green : '#e7e5e4', height: `${Math.max(4, (Number(k.valoare_confirmata_ron) / maxBar) * 90)}px` }} />
                <div style={{ fontSize: 10, color: C.grey }}>{k.saptamana}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 12, color: C.grey, textAlign: 'center', paddingBottom: 8 }}>
          Valorile in EUR la cursul BNR al zilei. Sursa: Booking Reporting.
        </div>
      </div>
    </div>
  );
}
