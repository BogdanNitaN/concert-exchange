'use client';
// app/kpi/page.tsx — panou agent v4: cockpit grupat (ZBOR/MOTOR/AVERTIZARI/AGENTIA),
// tap pe orice card -> sheet cu explicatie, tabel saptamanal/lunar, neurodesign GIGx.

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
  rulaj: { titlu: 'Rulaj confirmat', text: 'Valoarea totala a evenimentelor tale cu status CONFIRMAT in acest an, convertita in EUR la cursul BNR al zilei. Sursa: Booking Reporting, sheet FWD.' },
  ritm: { titlu: 'Ritmul calendaristic', text: 'Linia neagra de pe bara arata unde ar trebui sa fii daca obiectivul anual s-ar imparti egal pe 52 de saptamani. Verde = esti peste linie. Chihlimbar = sub linie, verdictul iti spune cat iti trebuie pe saptamana ca sa recuperezi.' },
  proiectie: { titlu: 'Proiectia de final de an', text: 'Rulajul tau de pana acum, impartit la saptamanile trecute si inmultit cu 52. Arata unde termini anul daca tii ritmul actual. Nu tine cont de sezonalitate (Revelionul, de exemplu, o va impinge in sus).' },
  propus: { titlu: 'Propus', text: 'Valoarea tuturor ofertelor trimise in perioada respectiva, indiferent daca s-au confirmat sau nu. Sursa: sheet FWD Ofertat.' },
  confirmat: { titlu: 'Confirmat', text: 'Valoarea evenimentelor cu status CONFIRMAT, atribuite saptamanii in care au fost raportate. Anulatele nu intra aici.' },
  conversie: { titlu: 'Conversie valoare', text: 'Confirmat impartit la Propus, in valoare, pe tot anul. Peste 30% esti in media agentiei. E mai stricta decat "conversia reala" din analize (aceea exclude propunerile moarte), deci procentul de aici va fi mereu mai mic.' },
  anulare: { titlu: 'Rata de anulare', text: 'Valoarea anulata impartita la valoarea confirmata plus anulata. Se masoara in VALOARE, nu in numar de evenimente — o anulare de 20.000 EUR cantareste cat zece de 2.000. Tinta generala: sub 4%.' },
  gap: { titlu: 'Saptamani fara propuneri', text: 'Cea mai lunga serie de saptamani consecutive in care nu ai trimis nicio propunere noua, de la inceputul anului. Pipeline-ul intermitent e cel mai bun predictor al lunilor slabe care urmeaza. Tinta: maxim 1.' },
  top3: { titlu: 'Concentrarea pe top 3 artisti', text: 'Cat la suta din rulajul tau confirmat vine din primii 3 artisti. Peste 35-40% inseamna dependenta: daca unul dintre ei se retrage sau isi schimba agentia, iti pierzi o treime din an.' },
  cota_agentie: { titlu: 'Cota din rulajul agentiei', text: 'Cat la suta din rulajul confirmat al intregii agentii e generat de tine. Pentru agentie e sanatos ca nicio persoana sa nu concentreze mai mult de jumatate.' },
  fee: { titlu: 'Fee mediu confirmat', text: 'Rulajul tau confirmat impartit la numarul de evenimente confirmate. Arata pe ce palier de artisti vinzi, nu cat de mult vinzi.' },
  streak: { titlu: 'Seria de saptamani active', text: 'Cate saptamani la rand ai avut minim o propunere noua. Consistenta bate volumul: 10 propuneri pe saptamana timp de 5 saptamani produc mai mult decat 50 intr-una singura.' },
  segmente: { titlu: 'Segmentele tale', text: 'Conversia ta in valoare pe fiecare tip de eveniment (venue, open air, club, privat, festival). Forta = unde castigi cel mai des; De lucrat = unde pierzi. Se afiseaza doar segmentele cu minim 5 propuneri, ca sa nu tragem concluzii din zgomot.' },
  agentie: { titlu: 'Agentia', text: 'Rulajul confirmat al intregii echipe fata de obiectivul anual al agentiei. Partea ta conteaza in bara asta — cand agentia e sub ritm, fiecare saptamana a fiecaruia atarna.' },
  medie: { titlu: 'Tu vs media agentiei', text: 'Reper anonim: media rulajului si a conversiei pe agentii activi. Nu e clasament — e busola care iti spune daca esti peste sau sub nivelul general.' },
  tabel: { titlu: 'Dashboard pe perioade', text: 'Fiecare rand e o saptamana sau o luna: cat ai propus, cat s-a confirmat, conversia perioadei si anulatele. Bara verde din celula arata confirmatul ca parte din propus. Lunile sunt derivate din saptamana de raportare.' },
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

function Delta({ acum, medie }: { acum: number; medie: number }) {
  if (medie === 0) return null;
  const dif = ((acum - medie) / medie) * 100;
  if (Math.abs(dif) < 3) return <span style={{ fontSize: 11, color: C.grey }}>≈ media 4 sapt</span>;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: dif > 0 ? C.green : C.red }}>
      {dif > 0 ? '▲' : '▼'} {Math.abs(dif).toFixed(0)}% vs media 4 sapt
    </span>
  );
}

export default function KpiPage() {
  const [nume, setNume] = useState('');
  const [parola, setParola] = useState('');
  const [sesiune, setSesiune] = useState<{ nume: string; parola: string } | null>(null);
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [perioada, setPerioada] = useState<'S' | 'L' | 'T'>('S');
  const [tabelMod, setTabelMod] = useState<'S' | 'L'>('S');
  const [expl, setExpl] = useState<string | null>(null);

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

  const { eu, curs, an, agenti, kpi, artisti, segmente, kpiIndividuali, medieAgentie, obiectivAgentieEur } = data;
  const agent = agenti.find((a: any) => a.id === eu.id) || agenti[0];
  const alMeu = kpi.filter((k: any) => k.agent_id === agent.id);
  const artMei = artisti.filter((a: any) => a.agent_id === agent.id);
  const segMele = (segmente || []).filter((s: any) => s.agent_id === agent.id);
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
  const proiectie = saptCurenta > 0 ? (confEur / saptCurenta) * 52 : 0;

  const conversie = tot.vOf > 0 ? (tot.vConf / tot.vOf) * 100 : 0;
  const rataAnulare = (tot.vConf + tot.vAnul) > 0 ? (tot.vAnul / (tot.vConf + tot.vAnul)) * 100 : 0;
  const feeMediu = tot.conf > 0 ? confEur / tot.conf : 0;

  let gapMax = 0, gap = 0, streak = 0;
  const propPeSapt = new Map<number, number>(alMeu.map((k: any) => [k.saptamana, k.propuneri] as [number, number]));
  for (let s = 1; s <= saptCurenta; s++) {
    if ((propPeSapt.get(s) || 0) === 0) { gap++; gapMax = Math.max(gapMax, gap); } else gap = 0;
  }
  for (let s = saptCurenta; s >= 1; s--) {
    if ((propPeSapt.get(s) || 0) > 0) streak++; else break;
  }

  const saptCur = alMeu.find((k: any) => k.saptamana === saptCurenta);
  const ult4 = alMeu.filter((k: any) => k.saptamana >= saptCurenta - 4 && k.saptamana < saptCurenta);
  const medie4 = (f: (k: any) => number) => ult4.length ? ult4.reduce((s: number, k: any) => s + f(k), 0) / ult4.length : 0;

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

  const segCuConv = segMele
    .map((s: any) => ({ ...s, conv: Number(s.valoare_ofertata_ron) > 0 ? (Number(s.valoare_confirmata_ron) / Number(s.valoare_ofertata_ron)) * 100 : 0 }))
    .filter((s: any) => s.propuneri >= 5);
  const forta = segCuConv.length ? segCuConv.reduce((a: any, b: any) => a.conv >= b.conv ? a : b) : null;
  const slab = segCuConv.length > 1 ? segCuConv.reduce((a: any, b: any) => a.conv <= b.conv ? a : b) : null;

  const agentieEur = medieAgentie.totalConfirmatRon / curs;
  const progresAgentie = obiectivAgentieEur ? Math.min(100, (agentieEur / Number(obiectivAgentieEur)) * 100) : null;

  type P = { eticheta: string; vOf: number; vConf: number; prop: number; conf: number; vAnul: number };
  function grupeaza(mod: 'S' | 'L' | 'T', limita?: number): P[] {
    if (mod === 'S') {
      const list = alMeu.map((k: any) => ({
        eticheta: `W${k.saptamana}`, vOf: Number(k.valoare_ofertata_ron), vConf: Number(k.valoare_confirmata_ron),
        prop: k.propuneri, conf: k.confirmate, vAnul: Number(k.valoare_anulata_ron),
      }));
      return limita ? list.slice(-limita) : list;
    }
    const grup = new Map<number, P>();
    for (const k of alMeu) {
      const luna = lunaDinSaptamana(an, k.saptamana);
      const idx = mod === 'L' ? luna : Math.floor(luna / 3);
      const et = mod === 'L' ? LUNI[luna] : `T${Math.floor(luna / 3) + 1}`;
      const g = grup.get(idx) || { eticheta: et, vOf: 0, vConf: 0, prop: 0, conf: 0, vAnul: 0 };
      g.vOf += Number(k.valoare_ofertata_ron); g.vConf += Number(k.valoare_confirmata_ron);
      g.prop += k.propuneri; g.conf += k.confirmate; g.vAnul += Number(k.valoare_anulata_ron);
      grup.set(idx, g);
    }
    return [...grup.entries()].sort((a, b) => a[0] - b[0]).map(e => e[1]);
  }
  const perioade = grupeaza(perioada, perioada === 'S' ? 8 : undefined);
  const maxP = Math.max(1, ...perioade.map(p => p.vOf));
  const tabel = grupeaza(tabelMod, tabelMod === 'S' ? 10 : undefined).slice().reverse();

  const tap = (cheie: string): React.CSSProperties => ({ cursor: 'pointer' });

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ ...glass, position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 19, fontWeight: 800, color: C.ink }}>GIG<span style={{ color: C.green }}>x</span> <span style={{ fontWeight: 600, color: C.grey, fontSize: 15 }}>· KPI</span></div>
          <button onClick={() => { sessionStorage.removeItem('kpi_sesiune'); setSesiune(null); setData(null); }}
            style={{ border: 'none', background: 'none', color: C.grey, fontSize: 13, cursor: 'pointer' }}>Iesire</button>
        </div>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {agent.nume_afisat || agent.nume}
            {obiectiv && <span style={{ color: peRitm ? C.green : C.amber, marginLeft: 8 }}>{progres.toFixed(0)}% din obiectiv</span>}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {kpiMei.map((k: any) => (
              <span key={k.id} title={k.eticheta} onClick={() => setExpl(valoriKpi[k.cheie].def)}
                style={{ width: 12, height: 12, borderRadius: 6, cursor: 'pointer', background: culoareStatus(statusKpi(valoriKpi[k.cheie].val, k.tinta, k.directie)), border: '1px solid rgba(0,0,0,0.08)' }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 13, color: C.grey }}>Anul {an} · pana la Week {saptCurenta} · curs BNR {curs.toFixed(4)}</div>

        <Grupa t="ZBOR" />
        <div style={{ ...card, ...tap('rulaj'), paddingTop: 24 }} onClick={() => setExpl('rulaj')}>
          <div style={{ fontSize: 13, color: C.grey }}>Rulaj confirmat {an}</div>
          <div style={{ fontSize: 44, fontWeight: 800, color: C.ink, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{fmt(confEur)} <span style={{ fontSize: 22, fontWeight: 600, color: C.grey }}>EUR</span></div>
          {obiectiv ? (
            <>
              <div style={{ marginTop: 10, padding: '12px 14px', background: peRitm ? '#ecfdf5' : '#fffbeb', borderRadius: 10, fontSize: 15, color: C.ink }}>
                <b>{peRitm ? 'Esti pe ritm.' : 'Sub ritm.'}</b> Iti trebuie <b>{fmt(necesarSapt)} EUR / saptamana</b> pana la finalul anului.
              </div>
              <div onClick={e => { e.stopPropagation(); setExpl('ritm'); }} style={{ position: 'relative', height: 14, background: '#f0efee', borderRadius: 7, marginTop: 14, overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ position: 'absolute', inset: 0, width: `${progres}%`, background: peRitm ? C.green : C.amber, borderRadius: 7, transition: 'width .4s' }} />
                <div style={{ position: 'absolute', top: -2, bottom: -2, left: `${ritmCalendar}%`, width: 2, background: C.ink }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.grey, marginTop: 8 }}>
                <span>{progres.toFixed(1)}% din {fmt(obiectiv)} EUR</span>
                <span>ritm calendar: {ritmCalendar.toFixed(0)}%</span>
              </div>
            </>
          ) : (
            <div style={{ marginTop: 10, fontSize: 14, color: C.grey }}>Obiectiv anual nesetat inca.</div>
          )}
          <div onClick={e => { e.stopPropagation(); setExpl('proiectie'); }} style={{ marginTop: 12, fontSize: 13, color: C.grey, cursor: 'pointer' }}>
            In ritmul actual termini anul la <b style={{ color: obiectiv ? (proiectie >= obiectiv ? C.green : C.amber) : C.ink }}>{fmt(proiectie)} EUR</b>{obiectiv ? ` (obiectiv ${fmt(obiectiv)})` : ''}.
          </div>
        </div>

        <Grupa t="MOTOR" />
        {saptCur && (
          <div style={card}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 12 }}>Week {saptCurenta}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
              <div onClick={() => setExpl('propus')} style={{ padding: '10px 14px', background: '#fafaf9', borderRadius: 10, cursor: 'pointer' }}>
                <div style={{ fontSize: 12, color: C.grey }}>Propuneri</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>{saptCur.propuneri}</div>
                <Delta acum={saptCur.propuneri} medie={medie4((k: any) => k.propuneri)} />
              </div>
              <div onClick={() => setExpl('confirmat')} style={{ padding: '10px 14px', background: '#fafaf9', borderRadius: 10, cursor: 'pointer' }}>
                <div style={{ fontSize: 12, color: C.grey }}>Confirmat EUR</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>{fmt(Number(saptCur.valoare_confirmata_ron) / curs)}</div>
                <Delta acum={Number(saptCur.valoare_confirmata_ron)} medie={medie4((k: any) => Number(k.valoare_confirmata_ron))} />
              </div>
              <div onClick={() => setExpl('fee')} style={{ padding: '10px 14px', background: '#fafaf9', borderRadius: 10, cursor: 'pointer' }}>
                <div style={{ fontSize: 12, color: C.grey }}>Fee mediu an</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>{fmt(feeMediu)} EUR</div>
              </div>
            </div>
            {streak > 0 && (
              <div onClick={() => setExpl('streak')} style={{ marginTop: 12, padding: '10px 14px', background: '#ecfdf5', borderRadius: 10, fontSize: 13, color: C.ink, cursor: 'pointer' }}>
                🔥 <b>{streak} saptamani consecutive</b> cu propuneri noi. Nu rupe seria.
              </div>
            )}
          </div>
        )}

        {forta && (
          <div style={{ ...card, cursor: 'pointer' }} onClick={() => setExpl('segmente')}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 12 }}>Segmentele tale</div>
            <div style={{ display: 'grid', gridTemplateColumns: slab && slab.segment !== forta.segment ? '1fr 1fr' : '1fr', gap: 10 }}>
              <div style={{ padding: '12px 14px', background: '#ecfdf5', borderRadius: 10, borderLeft: `4px solid ${C.green}` }}>
                <div style={{ fontSize: 12, color: C.grey }}>Forta ta</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, textTransform: 'capitalize' }}>{forta.segment}</div>
                <div style={{ fontSize: 13, color: C.green, fontWeight: 700 }}>{forta.conv.toFixed(0)}% conversie valoare</div>
              </div>
              {slab && slab.segment !== forta.segment && (
                <div style={{ padding: '12px 14px', background: '#fef2f2', borderRadius: 10, borderLeft: `4px solid ${C.red}` }}>
                  <div style={{ fontSize: 12, color: C.grey }}>De lucrat</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, textTransform: 'capitalize' }}>{slab.segment}</div>
                  <div style={{ fontSize: 13, color: C.red, fontWeight: 700 }}>{slab.conv.toFixed(0)}% conversie valoare</div>
                </div>
              )}
            </div>
          </div>
        )}

        <Grupa t="AVERTIZARI" />
        {kpiMei.length > 0 && (
          <div style={card}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 12 }}>KPI-urile tale</div>
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
        )}

        <Grupa t="AGENTIA" />
        <div style={{ ...card, cursor: 'pointer' }} onClick={() => setExpl('agentie')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>Forward Agency {an}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>{fmt(agentieEur)} EUR</div>
          </div>
          {progresAgentie !== null ? (
            <>
              <div style={{ position: 'relative', height: 12, background: '#f0efee', borderRadius: 6, marginTop: 12, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, width: `${progresAgentie}%`, background: progresAgentie >= ritmCalendar - 2 ? C.green : C.amber, borderRadius: 6 }} />
                <div style={{ position: 'absolute', top: -2, bottom: -2, left: `${ritmCalendar}%`, width: 2, background: C.ink }} />
              </div>
              <div style={{ fontSize: 12, color: C.grey, marginTop: 8 }}>{progresAgentie.toFixed(1)}% din obiectivul agentiei ({fmt(Number(obiectivAgentieEur))} EUR) · ritm {ritmCalendar.toFixed(0)}%</div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: C.grey, marginTop: 8 }}>Obiectivul agentiei nesetat inca.</div>
          )}
          <div onClick={e => { e.stopPropagation(); setExpl('medie'); }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
            <div style={{ padding: '10px 14px', background: '#fafaf9', borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: C.grey }}>Tu vs media (rulaj)</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>{fmt(confEur)} <span style={{ fontWeight: 400, color: C.grey }}>/ {fmt(medieAgentie.confirmatRon / curs)}</span></div>
            </div>
            <div style={{ padding: '10px 14px', background: '#fafaf9', borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: C.grey }}>Tu vs media (conversie)</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>{conversie.toFixed(1)}% <span style={{ fontWeight: 400, color: C.grey }}>/ {medieAgentie.conversie.toFixed(1)}%</span></div>
            </div>
          </div>
        </div>

        <Grupa t="ISTORIC" />
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, cursor: 'pointer' }} onClick={() => setExpl('propus')}>Propus vs Confirmat</div>
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
              <div key={p.eticheta} onClick={() => setExpl('conversie')} style={{ cursor: 'pointer' }}>
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
        </div>

        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, cursor: 'pointer' }} onClick={() => setExpl('tabel')}>Dashboard perioade</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['S', 'L'] as const).map(p => (
                <button key={p} onClick={() => setTabelMod(p)}
                  style={{ padding: '6px 14px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: tabelMod === p ? C.ink : '#f0efee', color: tabelMod === p ? '#fff' : C.grey }}>
                  {p === 'S' ? 'Saptamanal' : 'Lunar'}
                </button>
              ))}
            </div>
          </div>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: C.grey, textAlign: 'right' }}>
                <th style={{ textAlign: 'left', padding: '4px 2px', fontWeight: 600 }}>Perioada</th>
                <th style={{ padding: '4px 2px', fontWeight: 600 }}>Propus</th>
                <th style={{ padding: '4px 2px', fontWeight: 600 }}>Confirmat</th>
                <th style={{ padding: '4px 2px', fontWeight: 600 }}>Conv.</th>
                <th style={{ padding: '4px 2px', fontWeight: 600 }}>Anulat</th>
              </tr>
            </thead>
            <tbody>
              {tabel.map(p => {
                const conv = p.vOf > 0 ? (p.vConf / p.vOf) * 100 : 0;
                return (
                  <tr key={p.eticheta} onClick={() => setExpl('tabel')} style={{ borderTop: `1px solid ${C.border}`, cursor: 'pointer' }}>
                    <td style={{ padding: '8px 2px', fontWeight: 700, color: C.ink }}>{p.eticheta}</td>
                    <td style={{ padding: '8px 2px', textAlign: 'right', color: C.grey }}>{fmt(p.vOf / curs)}</td>
                    <td style={{ padding: '8px 2px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                        <b style={{ color: C.ink }}>{fmt(p.vConf / curs)}</b>
                        <span style={{ display: 'block', width: 64, height: 4, background: '#f0efee', borderRadius: 2, overflow: 'hidden' }}>
                          <span style={{ display: 'block', height: '100%', width: `${Math.min(100, conv)}%`, background: C.green }} />
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '8px 2px', textAlign: 'right', fontWeight: 700, color: conv >= 30 ? C.green : conv >= 20 ? C.amber : C.red }}>{conv.toFixed(0)}%</td>
                    <td style={{ padding: '8px 2px', textAlign: 'right', color: p.vAnul > 0 ? C.red : C.grey }}>{p.vAnul > 0 ? fmt(p.vAnul / curs) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {artMei.length > 0 && (
          <div style={{ ...card, cursor: 'pointer' }} onClick={() => setExpl('top3')}>
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

        <div style={{ fontSize: 12, color: C.grey, textAlign: 'center', paddingBottom: 8 }}>
          Apasa pe orice card ca sa vezi ce inseamna. Valorile in EUR la cursul BNR al zilei.
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
