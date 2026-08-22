'use client';
// app/kpi/admin/page.tsx — dashboard Bogdan: toti agentii, obiective, upload raport, agenti noi.
// Login cu numele + parola de admin (rol='admin' in tabela agenti).

import { useEffect, useState } from 'react';

const fmt = (n: number) => Math.round(n).toLocaleString('ro-RO');
const C = {
  bg: '#f5f5f7', card: '#ffffff', border: '#e7e5e4', ink: '#101014',
  grey: '#78716c', green: '#059669', amber: '#d97706', red: '#dc2626',
};
const card: React.CSSProperties = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 };

export default function KpiAdmin() {
  const [nume, setNume] = useState('');
  const [parola, setParola] = useState('');
  const [sesiune, setSesiune] = useState<{ nume: string; parola: string } | null>(null);
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [fisier, setFisier] = useState<File | null>(null);
  const [nouNume, setNouNume] = useState('');
  const [nouParola, setNouParola] = useState('');

  useEffect(() => {
    const s = typeof window !== 'undefined' ? sessionStorage.getItem('kpi_admin_sesiune') : null;
    if (s) { const x = JSON.parse(s); incarca(x.nume, x.parola); }
  }, []);

  async function incarca(n: string, p: string) {
    setErr('');
    const r = await fetch('/api/kpi-data', { headers: { 'x-kpi-nume': n, 'x-kpi-parola': p } });
    const j = await r.json();
    if (!r.ok || j.eu?.rol !== 'admin') { setErr(j.error || 'Doar admin'); return; }
    setData(j); setSesiune({ nume: n, parola: p }); sessionStorage.setItem('kpi_admin_sesiune', JSON.stringify({ nume: n, parola: p }));
  }

  async function actiune(body: any) {
    setBusy(true);
    const r = await fetch('/api/kpi-data', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-kpi-nume': sesiune!.nume, 'x-kpi-parola': sesiune!.parola },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (r.ok) incarca(sesiune!.nume, sesiune!.parola); else setErr((await r.json()).error || 'Eroare');
  }

  async function upload(confirm: boolean) {
    if (!fisier) return;
    setBusy(true); setErr('');
    const fd = new FormData();
    fd.append('file', fisier);
    fd.append('confirm', String(confirm));
    const r = await fetch('/api/kpi-upload', { method: 'POST', headers: { 'x-kpi-nume': sesiune!.nume, 'x-kpi-parola': sesiune!.parola }, body: fd });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) { setErr(j.error); setPreview(null); return; }
    if (j.preview) setPreview(j.sumar);
    else { setPreview(null); setFisier(null); incarca(sesiune!.nume, sesiune!.parola); }
  }

  if (!sesiune || !data) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <div style={{ ...card, width: '100%', maxWidth: 380, padding: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 20 }}>KPI · Admin</div>
          <input value={nume} onChange={e => setNume(e.target.value)} placeholder="Nume"
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 16, boxSizing: 'border-box', outline: 'none', marginBottom: 10 }} />
          <input value={parola} onChange={e => setParola(e.target.value)} placeholder="Parola" type="password"
            onKeyDown={e => e.key === 'Enter' && nume && parola && incarca(nume.trim(), parola.trim())}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 16, boxSizing: 'border-box', outline: 'none' }} />
          {err && <div style={{ color: C.red, fontSize: 13, marginTop: 10 }}>{err}</div>}
          <button onClick={() => nume && parola && incarca(nume.trim(), parola.trim())}
            style={{ width: '100%', marginTop: 16, padding: '12px 0', borderRadius: 10, border: 'none', background: C.ink, color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Intra</button>
        </div>
      </div>
    );
  }

  const { curs, an, agenti, kpi, ultimulUpload } = data;
  const saptCurenta = Math.max(0, ...kpi.map((k: any) => k.saptamana));
  const ritmCalendar = (saptCurenta / 52) * 100;

  const perAgent = agenti.map((a: any) => {
    const al = kpi.filter((k: any) => k.agent_id === a.id);
    const t = al.reduce((t: any, k: any) => ({
      prop: t.prop + k.propuneri, vOf: t.vOf + Number(k.valoare_ofertata_ron),
      conf: t.conf + k.confirmate, vConf: t.vConf + Number(k.valoare_confirmata_ron),
      anul: t.anul + k.anulate, vAnul: t.vAnul + Number(k.valoare_anulata_ron),
    }), { prop: 0, vOf: 0, conf: 0, vConf: 0, anul: 0, vAnul: 0 });
    const confEur = t.vConf / curs;
    const ob = a.obiectiv_anual_eur ? Number(a.obiectiv_anual_eur) : null;
    return {
      ...a, ...t, confEur, ob,
      progres: ob ? Math.min(100, (confEur / ob) * 100) : null,
      conversie: t.vOf > 0 ? (t.vConf / t.vOf) * 100 : 0,
      anulare: (t.vConf + t.vAnul) > 0 ? (t.vAnul / (t.vConf + t.vAnul)) * 100 : 0,
    };
  }).sort((x: any, y: any) => y.confEur - x.confEur);

  const totalAgentie = perAgent.reduce((s: number, a: any) => s + a.confEur, 0);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: '24px 16px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.ink }}>Dashboard agenti · {an}</div>
            <div style={{ fontSize: 13, color: C.grey }}>
              Week {saptCurenta} · curs BNR {curs.toFixed(4)} · total agentie {fmt(totalAgentie)} EUR
              {ultimulUpload && ` · ultimul upload: Week ${ultimulUpload.saptamana}`}
            </div>
          </div>
          <button onClick={() => { sessionStorage.removeItem('kpi_admin_sesiune'); setSesiune(null); setData(null); }}
            style={{ border: 'none', background: 'none', color: C.grey, fontSize: 13, cursor: 'pointer' }}>Iesire</button>
        </div>

        {err && <div style={{ ...card, borderColor: C.red, color: C.red, fontSize: 14 }}>{err}</div>}

        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 10 }}>Incarca Booking Reporting</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="file" accept=".xlsx" onChange={e => { setFisier(e.target.files?.[0] || null); setPreview(null); }} style={{ fontSize: 14 }} />
            <button onClick={() => upload(false)} disabled={!fisier || busy}
              style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: fisier ? C.ink : '#d6d3d1', color: '#fff', fontSize: 14, fontWeight: 600, cursor: fisier ? 'pointer' : 'default' }}>
              {busy ? 'Se proceseaza...' : 'Verifica fisierul'}
            </button>
          </div>
          {preview && (
            <div style={{ marginTop: 14, padding: 14, background: '#fafaf9', borderRadius: 12, fontSize: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Week {preview.saptamanaCurenta} · {preview.randuriDeScris} randuri de scris · carryover 2025: {preview.carryover2025} (ignorat)</div>
              {preview.agentiNecunoscuti?.length > 0 && (
                <div style={{ color: C.amber, marginBottom: 8 }}>Agenti necunoscuti (ignorati): {preview.agentiNecunoscuti.join(', ')}</div>
              )}
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead><tr style={{ color: C.grey, textAlign: 'left' }}>
                  <th style={{ padding: 4 }}>Agent (Week {preview.saptamanaCurenta})</th><th>Propuneri</th><th>Confirmate</th><th>Anulate</th>
                </tr></thead>
                <tbody>
                  {Object.entries(preview.ultimaSaptamana).map(([n, v]: any) => (
                    <tr key={n}><td style={{ padding: 4, fontWeight: 600 }}>{n}</td><td>{v.propuneri}</td><td>{v.conf} ({fmt(v.vConf / curs)} EUR)</td><td>{v.anul}</td></tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => upload(true)} disabled={busy}
                style={{ marginTop: 12, padding: '10px 18px', borderRadius: 10, border: 'none', background: C.green, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Confirm — scrie in baza de date
              </button>
            </div>
          )}
        </div>

        {perAgent.filter((a: any) => a.activ).map((a: any) => (
          <div key={a.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.ink }}>{a.nume_afisat || a.nume}</div>
              <div style={{ fontSize: 14, color: C.ink }}><b>{fmt(a.confEur)} EUR</b> confirmat · {a.conf} ev. · conversie {a.conversie.toFixed(1)}% · anulari <span style={{ color: a.anulare >= 8 ? C.red : a.anulare >= 4 ? C.amber : C.green }}>{a.anulare.toFixed(1)}%</span></div>
            </div>
            <div style={{ position: 'relative', height: 12, background: '#f0efee', borderRadius: 6, marginTop: 12, overflow: 'hidden' }}>
              {a.ob ? (
                <>
                  <div style={{ position: 'absolute', inset: 0, width: `${a.progres}%`, background: a.progres! >= ritmCalendar - 2 ? C.green : C.amber, borderRadius: 6 }} />
                  <div style={{ position: 'absolute', top: -2, bottom: -2, left: `${ritmCalendar}%`, width: 2, background: C.ink }} />
                </>
              ) : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', paddingLeft: 8, fontSize: 11, color: C.grey }}>obiectiv nesetat</div>}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10, fontSize: 13, color: C.grey, flexWrap: 'wrap' }}>
              <span>Obiectiv anual (EUR):</span>
              <ObjInput initial={a.ob} onSave={(v: string) => actiune({ actiune: 'obiectiv', agentId: a.id, obiectivEur: v })} />
              {a.ob && <span>{a.progres!.toFixed(1)}% · ritm {ritmCalendar.toFixed(0)}%</span>}
            </div>
          </div>
        ))}

        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 10 }}>Agent nou</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input value={nouNume} onChange={e => setNouNume(e.target.value)} placeholder="Nume (exact ca in raport)"
              style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14 }} />
            <input value={nouParola} onChange={e => setNouParola(e.target.value)} placeholder="parola"
              style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14 }} />
            <button onClick={() => { if (nouNume && nouParola) { actiune({ actiune: 'agent-nou', nume: nouNume, parola: nouParola }); setNouNume(''); setNouParola(''); } }}
              style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: C.ink, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Adauga</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ObjInput({ initial, onSave }: { initial: number | null; onSave: (v: string) => void }) {
  const [v, setV] = useState(initial ? String(initial) : '');
  return (
    <span style={{ display: 'inline-flex', gap: 6 }}>
      <input value={v} onChange={e => setV(e.target.value.replace(/[^\d]/g, ''))} placeholder="obiectiv" inputMode="numeric"
        onWheel={e => (e.target as HTMLElement).blur()}
        style={{ width: 110, padding: '6px 10px', borderRadius: 8, border: '1px solid #e7e5e4', fontSize: 13 }} />
      <button onClick={() => onSave(v)} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#101014', color: '#fff', fontSize: 12, cursor: 'pointer' }}>Salveaza</button>
    </span>
  );
}
