'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CalendarSearch, ArrowLeft, Check, X, Send } from 'lucide-react'
import DatePicker from '@/components/modules/shared/DatePicker'
const F = 'Montserrat,sans-serif'
const UI = {
  bg: '#f5f5f7', card: '#ffffff', ink: '#1c1917', sub: '#57534e', faint: '#a8a29e',
  line: '#e7e5e4', green: '#059669', greenSoft: '#f0fdf4', purple: '#7c3aed', dark: '#1c1917',
  radius: '16px', radiusSm: '12px',
  shadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)',
}
const GENURI = [
  { key: 'pop', label: 'Pop' }, { key: 'balcanic_pop', label: 'Balcanic Pop' },
  { key: 'manele', label: 'Manele' }, { key: 'trap', label: 'Trap' },
  { key: 'rap', label: 'Rap/Hip-Hop' }, { key: 'dance', label: 'Dance' },
  { key: 'rock', label: 'Rock' }, { key: 'lautareasca', label: 'Lăutărească' },
  { key: 'petrecere', label: 'Petrecere' }, { key: 'cover', label: 'Cover' }, { key: 'altele', label: 'Altele' },
]
const GEN_LABEL: Record<string,string> = Object.fromEntries(GENURI.map(g => [g.key, g.label]))
interface Ev { titlu: string; descriere: string; allDay: boolean }
interface Rez { artist: string; calendar: string; calendarId: string; gen: string; rosterData: any; liber: boolean | null; evenimente: Ev[] }

function useIsMobile() {
  const [m, setM] = useState(false)
  useEffect(() => {
    const check = () => setM(window.innerWidth < 768)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return m
}
export default function DisponibilitatePage() {
  const isMobile = useIsMobile()
  const [authed, setAuthed] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [loginUser, setLoginUser] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [data, setData] = useState('')
  const [oras, setOras] = useState('')
  const [loading, setLoading] = useState(false)
  const [rez, setRez] = useState<{ liberi: Rez[]; ocupati: Rez[]; nrLiberi: number; nrOcupati: number } | null>(null)
  const [filtreGen, setFiltreGen] = useState<Set<string>>(new Set())
  const [bifati, setBifati] = useState<Set<string>>(new Set())
  const [analize, setAnalize] = useState<Record<string, any>>({})
  const [analizand, setAnalizand] = useState<Set<string>>(new Set())
  const [mod, setMod] = useState<'data' | 'artist'>('data')
  const [artistCautat, setArtistCautat] = useState('')
  const [rezArtist, setRezArtist] = useState<any[]>([])
  const [dataArtist, setDataArtist] = useState('')
  const [bifatiArtist, setBifatiArtist] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState('')
  const [copiat, setCopiat] = useState(false)
  const [contextExpandat, setContextExpandat] = useState<Set<number>>(new Set())
  function toggleContext(idx: number) { setContextExpandat(prev => { const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n }) }
  function arataToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500) }
  const [loadingArtist, setLoadingArtist] = useState(false)
  async function cautaArtist() {
    if (!artistCautat.trim()) return
    setLoadingArtist(true); setRezArtist([]); setBifatiArtist(new Set())
    const nume = artistCautat.split(',').map(n => n.trim()).filter(Boolean)
    const rezultate: any[] = []
    for (const n of nume) {
      try {
        const q = '/api/calendar-artist-liber?artist=' + encodeURIComponent(n) + (oras ? '&oras=' + encodeURIComponent(oras) : '') + (dataArtist ? '&data=' + dataArtist : '')
        const r = await fetch(q)
        const d = await r.json()
        rezultate.push({ cautat: n, ...d })
      } catch { rezultate.push({ cautat: n, ok: false }) }
    }
    setRezArtist(rezultate)
    // bifez automat toti liberii pe data cautata
    if (dataArtist) {
      const liberi = rezultate.filter((ra: any) => ra.ok && ra.gasit && ra.peData && ra.peData.liber).map((ra: any) => ra.artist)
      setBifatiArtist(new Set(liberi))
    }
    setLoadingArtist(false)
  }
  function liberiArtist() {
    // cei liberi pe data cautata (doar cand data e pusa)
    return rezArtist.filter((ra: any) => ra.ok && ra.gasit && ra.peData && ra.peData.liber)
  }
  function liberiBifati() {
    // liberi SI bifati (toti pornesc bifati la cautare, debifezi ce excluzi)
    return liberiArtist().filter((ra: any) => bifatiArtist.has(ra.artist))
  }
  function toggleBifaArtist(nume: string) {
    setBifatiArtist(prev => { const n = new Set(prev); n.has(nume) ? n.delete(nume) : n.add(nume); return n })
  }
  function selecteazaTotiLiberi() {
    setBifatiArtist(new Set(liberiArtist().map((ra: any) => ra.artist)))
  }
  function deselecteazaToti() {
    setBifatiArtist(new Set())
  }
  function copiazaLiberi() {
    const liberi = liberiBifati()
    if (liberi.length === 0) return
    const linii = liberi.map((ra: any) => '*' + ra.artist + '*')
    const txt = (dataArtist ? 'Disponibili pe ' + lunaData(dataArtist) + (oras ? ', ' + oras : '') + ':\n\n' : '') + linii.join('\n')
    navigator.clipboard.writeText(txt)
    setCopiat(true); setTimeout(() => setCopiat(false), 1800)
  }
  function trimiteLiberiInOferta() {
    const liberi = liberiBifati()
    if (liberi.length === 0) return
    const linii_complete = liberi.map((ra: any) => {
      const rd = ra.rosterData || {}
      return {
        artistNume: ra.artist,
        formatSelectat: '', durata: rd.durata_default || '40 min',
        tipPret: 'Standard', feeLista: rd.fee_standard || 0, fee: rd.fee_standard || 0,
        leiKm: rd.lei_km || 0, useMarja: true, cazare: rd.cazare || '', persoane: rd.nr_persoane || 0,
        bileteAvion: rd.bilete_avion || 0, restulRutier: true, tipMasa: 'alacarte', zile: 1,
        diurnaPerPers: 180, diurnaFixa: rd.diurna_fixa || 0, cazareFixa: rd.cazare_fixa || 0, useAlcool: false, alcool: rd.alcool_default || 0,
        useCag: false, cagProcent: 0, cagSuma: 0, cagMod: 'procent',
      }
    })
    const oferta = { oras: oras || null, data_eveniment: dataArtist || null, linii_complete }
    try { localStorage.setItem('oferta_edit', JSON.stringify(oferta)) } catch {}
    arataToast('Se trimite în ofertă...')
    setTimeout(() => { window.location.href = '/oferta' }, 500)
  }
  function badgeCol(tip: string): string {
    const m: Record<string,string> = { show: '#2563eb', indisponibil: '#dc2626', echipa: '#78716c', nota: '#a8a29e', blocat: '#dc2626' }
    return m[tip] || '#a8a29e'
  }
  function badgeLabel(tip: string): string {
    const m: Record<string,string> = { show: 'concert', indisponibil: 'indisponibil', echipa: 'echipă', nota: 'notă', blocat: 'blocat' }
    return m[tip] || tip
  }
  function afiseazaInterval(e: any): string {
    if (e.dataEnd && e.dataEnd !== e.data) return lunaData(e.data) + ' - ' + lunaData(e.dataEnd)
    return lunaData(e.data)
  }
  function grupeazaIntervale(evenimente: any[]): any[] {
    // grupez zilele consecutive cu acelasi titlu intr-un interval
    const sortate = [...evenimente].sort((a, b) => a.data.localeCompare(b.data) || a.titlu.localeCompare(b.titlu))
    const rez: any[] = []
    for (const e of sortate) {
      const ultim = rez[rez.length - 1]
      if (ultim && ultim.titlu === e.titlu && ultim.tip === e.tip) {
        const dUltim = new Date(ultim.dataEnd + 'T12:00:00')
        const dE = new Date(e.data + 'T12:00:00')
        const diff = Math.round((dE.getTime() - dUltim.getTime()) / 86400000)
        if (diff === 1) { ultim.dataEnd = e.data; continue }
      }
      rez.push({ ...e, dataEnd: e.data })
    }
    return rez
  }
  function eWeekend(iso: string): boolean {
    try { const z = new Date(iso + 'T12:00:00').getDay(); return z === 0 || z === 5 || z === 6 } catch { return false }
  }
  function lunaData(iso: string): string {
    try { return new Date(iso + 'T12:00:00').toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' }) } catch { return iso }
  }

  async function faLogin() {
    setLoggingIn(true); setLoginErr('')
    const mapRes = await fetch('/api/oferta-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: loginUser.trim() }) })
    const mapData = await mapRes.json()
    if (!mapData.email) { setLoginErr('Utilizator inexistent'); setLoggingIn(false); return }
    if (mapData.blocat) { setLoginErr('Cont blocat'); setLoggingIn(false); return }
    const { data: dd, error } = await supabase.auth.signInWithPassword({ email: mapData.email, password: loginPass })
    if (error) { setLoginErr('Utilizator sau parola gresita'); setLoggingIn(false); return }
    const role = dd.user?.user_metadata?.role
    if (role === 'oferta_admin' || role === 'oferta_user') setAuthed(true)
    else { setLoginErr('Nu ai acces'); await supabase.auth.signOut() }
    setLoggingIn(false)
  }
  useEffect(() => {
    supabase.auth.getSession().then(({ data: dd }) => {
      const user = dd.session?.user
      const role = user?.user_metadata?.role
      if (user && (role === 'oferta_admin' || role === 'oferta_user') && !user?.user_metadata?.blocat) setAuthed(true)
      setCheckingAuth(false)
    })
  }, [])

  async function cauta() {
    if (!data) return
    setLoading(true); setRez(null); setBifati(new Set())
    try {
      const r = await fetch('/api/calendar-disponibilitate?data=' + data)
      const dd = await r.json()
      if (dd.ok) setRez(dd)
    } catch {}
    setLoading(false)
  }

  function toggleGen(g: string) {
    setFiltreGen(prev => { const n = new Set(prev); n.has(g) ? n.delete(g) : n.add(g); return n })
  }
  function toggleBifat(nume: string) {
    setBifati(prev => { const n = new Set(prev); n.has(nume) ? n.delete(nume) : n.add(nume); return n })
  }
  function selecteazaToti() {
    const toti = liberiFiltrati.map(l => l.artist)
    const totiBifati = toti.every(a => bifati.has(a))
    setBifati(totiBifati ? new Set() : new Set(toti))
  }
  function selecteazaGen(genKey: string) {
    const dinGen = (grupati[genKey] || []).map(l => l.artist)
    const totiBifati = dinGen.every(a => bifati.has(a))
    setBifati(prev => {
      const n = new Set(prev)
      if (totiBifati) dinGen.forEach(a => n.delete(a))
      else dinGen.forEach(a => n.add(a))
      return n
    })
  }
  async function analizeaza(l: Rez) {
    if (analize[l.artist]) { setAnalize(prev => { const n = {...prev}; delete n[l.artist]; return n }); return }
    setAnalizand(prev => new Set(prev).add(l.artist))
    try {
      const r = await fetch('/api/calendar-proximitate?calendarId=' + encodeURIComponent(l.calendarId) + '&data=' + data + '&oras=' + encodeURIComponent(oras))
      const d = await r.json()
      if (d.ok) setAnalize(prev => ({ ...prev, [l.artist]: d }))
    } catch {}
    setAnalizand(prev => { const n = new Set(prev); n.delete(l.artist); return n })
  }
  async function analizeazaToti() {
    const deAnalizat = bifatiLista.filter(l => !analize[l.artist])
    for (const l of deAnalizat) { await analizeaza(l) }
  }
  function dataCreare(iso: string): string {
    try {
      return new Date(iso).toLocaleString('ro-RO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Bucharest' })
    } catch { return '' }
  }
  function dataScurta(iso: string): string {
    try { return new Date(iso + 'T12:00:00').toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' }) } catch { return '' }
  }
  function zileText(zile: number): string {
    const abs = Math.abs(zile)
    if (zile < 0) return 'acum ' + abs + (abs === 1 ? ' zi' : ' zile')
    return 'peste ' + abs + (abs === 1 ? ' zi' : ' zile')
  }

  // liberi filtrati pe gen
  const liberiFiltrati = (rez?.liberi || []).filter(l => filtreGen.size === 0 || filtreGen.has(l.gen))
  // grupez pe gen
  const grupati: Record<string, Rez[]> = {}
  for (const l of liberiFiltrati) { (grupati[l.gen] = grupati[l.gen] || []).push(l) }
  const genuriPrezente = GENURI.filter(g => grupati[g.key]?.length)

  const bifatiLista = (rez?.liberi || []).filter(l => bifati.has(l.artist))

  function textExport(bold = false): string {
    const b0 = bold ? '*' : ''
    const linii = [b0 + 'Artiști disponibili' + (data ? ' pe ' + new Date(data).toLocaleDateString('ro-RO', {day:'numeric',month:'long',year:'numeric'}) : '') + (oras ? ' - ' + oras : '') + ':' + b0, '']
    const perGen: Record<string, string[]> = {}
    for (const b of bifatiLista) { (perGen[b.gen] = perGen[b.gen] || []).push(b.artist) }
    for (const g of GENURI) {
      if (perGen[g.key]?.length) linii.push(b0 + g.label + ':' + b0 + ' ' + perGen[g.key].join(', '))
    }
    return linii.join('\n')
  }
  async function exportaPdf() {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const noDia = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ș/g,'s').replace(/Ș/g,'S').replace(/ț/g,'t').replace(/Ț/g,'T').replace(/ă/g,'a').replace(/î/g,'i').replace(/â/g,'a')
    let y = 20
    doc.setFontSize(16); doc.setFont('helvetica','bold')
    doc.text(noDia('Artisti disponibili' + (data ? ' pe ' + new Date(data).toLocaleDateString('ro-RO',{day:'numeric',month:'long',year:'numeric'}) : '') + (oras ? ' - ' + oras : '')), 20, y)
    y += 12
    const perGen: Record<string, string[]> = {}
    for (const b of bifatiLista) { (perGen[b.gen] = perGen[b.gen] || []).push(b.artist) }
    doc.setFontSize(12)
    for (const g of GENURI) {
      if (!perGen[g.key]?.length) continue
      doc.setFont('helvetica','bold'); doc.text(noDia(g.label + ':'), 20, y); y += 7
      doc.setFont('helvetica','normal')
      for (const a of perGen[g.key]) { doc.text(noDia('- ' + a), 25, y); y += 6 }
      y += 3
      if (y > 275) { doc.addPage(); y = 20 }
    }
    doc.save('disponibilitate-' + (data || 'artisti') + '.pdf')
  }

  function trimiteInOferta() {
    if (bifatiLista.length === 0) return
    const linii_complete = bifatiLista.map(b => {
      const rd = b.rosterData || {}
      return {
        artistNume: b.artist,
        formatSelectat: '', durata: '40 min',
        tipPret: 'Standard', feeLista: rd.fee_standard || 0, fee: rd.fee_standard || 0,
        leiKm: rd.lei_km || 0, useMarja: true, cazare: rd.cazare || '', persoane: rd.nr_persoane || 0,
        bileteAvion: rd.bilete_avion || 0, restulRutier: true, tipMasa: 'alacarte', zile: 1,
        diurnaPerPers: 180, diurnaFixa: rd.diurna_fixa || 0, cazareFixa: rd.cazare_fixa || 0, useAlcool: false, alcool: rd.alcool_default || 0,
        useCag: false, cagProcent: 0, cagSuma: 0, cagMod: 'procent',
      }
    })
    const oferta = { oras: oras || null, data_eveniment: data || null, linii_complete }
    try { localStorage.setItem('oferta_edit', JSON.stringify(oferta)) } catch {}
    arataToast('Se trimite în ofertă...')
    setTimeout(() => { window.location.href = '/oferta' }, 500)
  }

  const inp: React.CSSProperties = { padding: '11px 14px', borderRadius: UI.radiusSm, border: '1px solid ' + UI.line, fontSize: '14px', fontFamily: F, boxSizing: 'border-box', outline: 'none' }
  const bg = 'linear-gradient(160deg, #eceef2 0%, #e8eaf0 45%, #dde1ea 100%)'

  if (checkingAuth) return <div style={{minHeight:'100vh', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F, color:UI.sub}}>Verificare...</div>

  if (!authed) return (
    <div style={{minHeight:'100vh', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F, padding:'20px'}}>
      <div style={{background:UI.card, borderRadius:UI.radius, padding:'32px', width:'360px', boxShadow:UI.shadow}}>
        <div style={{fontSize:'20px', fontWeight:800, color:UI.ink, marginBottom:'20px'}}>Disponibilitate artiști</div>
        <input type="text" placeholder="Utilizator" value={loginUser} onChange={e => setLoginUser(e.target.value)} style={{...inp, width:'100%', marginBottom:'10px'}} />
        <input type="password" placeholder="Parolă" value={loginPass} onChange={e => setLoginPass(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') faLogin() }} style={{...inp, width:'100%', marginBottom:'14px'}} />
        {loginErr && <div style={{fontSize:'13px', color:'#dc2626', marginBottom:'12px'}}>{loginErr}</div>}
        <button onClick={faLogin} disabled={loggingIn} style={{width:'100%', padding:'12px', background:UI.dark, color:'white', border:'none', borderRadius:UI.radiusSm, fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:F}}>{loggingIn ? 'Se conectează...' : 'Intră'}</button>
        <a href="/oferta" style={{display:'block', textAlign:'center', marginTop:'16px', fontSize:'13px', color:UI.sub, textDecoration:'none'}}>← Înapoi</a>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh', background:bg, fontFamily:F, padding: isMobile ? '20px 14px' : '40px 20px'}}>
      <div style={{maxWidth:'980px', margin:'0 auto'}}>
        <a href="/oferta" style={{display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'13px', color:UI.sub, textDecoration:'none', marginBottom:'20px'}}><ArrowLeft size={15} /> Înapoi la ofertă</a>
        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'24px'}}>
          <CalendarSearch size={26} strokeWidth={2.2} color={UI.purple} />
          <div>
            <div style={{fontSize:'24px', fontWeight:800, color:UI.ink}}>Disponibilitate artiști</div>
            <div style={{fontSize:'13px', color:UI.faint}}>Verifică cine e liber, bifează și trimite în ofertă</div>
          </div>
        </div>

        {/* toggle mod cautare */}
        <div style={{display:'flex', gap:'0', marginBottom:'16px', background:'#eceef2', borderRadius:UI.radiusSm, padding:'4px', width:'fit-content'}}>
          <button onClick={() => setMod('data')} style={{padding:'8px 18px', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F, background: mod==='data'?'white':'transparent', color: mod==='data'?UI.ink:UI.sub, boxShadow: mod==='data'?'0 1px 3px rgba(0,0,0,0.1)':'none'}}>După dată</button>
          <button onClick={() => setMod('artist')} style={{padding:'8px 18px', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F, background: mod==='artist'?'white':'transparent', color: mod==='artist'?UI.ink:UI.sub, boxShadow: mod==='artist'?'0 1px 3px rgba(0,0,0,0.1)':'none'}}>După artist</button>
        </div>

        {mod === 'data' ? (
        <div style={{background:UI.card, borderRadius:UI.radius, border:'1px solid '+UI.line, padding:'20px', marginBottom:'20px', boxShadow:UI.shadow, display:'flex', gap:'12px', alignItems:'flex-end', flexWrap:'wrap'}}>
          <div>
            <label style={{fontSize:'11px', fontWeight:700, color:UI.sub, textTransform:'uppercase', display:'block', marginBottom:'6px'}}>Data</label>
            <div style={{width:'220px'}}><DatePicker value={data} onChange={v => setData(v)} placeholder="Alege data" /></div>
          </div>
          <div>
            <label style={{fontSize:'11px', fontWeight:700, color:UI.sub, textTransform:'uppercase', display:'block', marginBottom:'6px'}}>Oraș (opțional, pt. calcul)</label>
            <input type="text" placeholder="ex: Cluj-Napoca" value={oras} onChange={e => setOras(e.target.value)} style={inp} />
          </div>
          <button onClick={cauta} disabled={!data || loading} style={{padding:'11px 24px', background:UI.green, color:'white', border:'none', borderRadius:UI.radiusSm, fontSize:'14px', fontWeight:700, cursor: (!data||loading) ? 'wait' : 'pointer', fontFamily:F, opacity:(!data||loading)?0.6:1}}>{loading ? 'Se verifică...' : 'Verifică'}</button>
        </div>
        ) : (
        <div style={{background:UI.card, borderRadius:UI.radius, border:'1px solid '+UI.line, padding:'20px', marginBottom:'20px', boxShadow:UI.shadow, display:'flex', gap:'12px', alignItems:'flex-end', flexWrap:'wrap'}}>
          <div>
            <label style={{fontSize:'11px', fontWeight:700, color:UI.sub, textTransform:'uppercase', display:'block', marginBottom:'6px'}}>Artist</label>
            <input type="text" placeholder="ex: Motans, Delia" value={artistCautat} onChange={e => setArtistCautat(e.target.value)} onKeyDown={e => e.key==='Enter' && cautaArtist()} style={{...inp, width:'220px'}} />
          </div>
          <div>
            <label style={{fontSize:'11px', fontWeight:700, color:UI.sub, textTransform:'uppercase', display:'block', marginBottom:'6px'}}>Data (opțional)</label>
            <div style={{width:'220px'}}><DatePicker value={dataArtist} onChange={v => setDataArtist(v)} placeholder="Orice dată" /></div>
          </div>
          <div>
            <label style={{fontSize:'11px', fontWeight:700, color:UI.sub, textTransform:'uppercase', display:'block', marginBottom:'6px'}}>Oraș (opțional, pt. zonă)</label>
            <input type="text" placeholder="ex: Oradea" value={oras} onChange={e => setOras(e.target.value)} style={inp} />
          </div>
          <button onClick={cautaArtist} disabled={!artistCautat || loadingArtist} style={{padding:'11px 24px', background:UI.purple, color:'white', border:'none', borderRadius:UI.radiusSm, fontSize:'14px', fontWeight:700, cursor: (!artistCautat||loadingArtist) ? 'wait' : 'pointer', fontFamily:F, opacity:(!artistCautat||loadingArtist)?0.6:1}}>{loadingArtist ? 'Se caută...' : 'Caută'}</button>
        </div>
        )}

        {loading && <div style={{textAlign:'center', color:UI.sub, padding:'40px'}}>Se verifică calendarele artiștilor...</div>}

        {loadingArtist && <div style={{textAlign:'center', color:UI.sub, padding:'40px'}}>Se cauta calendarul artistului...</div>}

        {mod === 'artist' && rezArtist.length > 0 && (
          <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
            {[...rezArtist].sort((a: any, b: any) => {
              if (!dataArtist) return 0
              const rank = (r: any) => { if (!r.peData) return 3; if (r.peData.status === 'liber') return 0; if (r.peData.status === 'verifica') return 1; return 2 }
              return rank(a) - rank(b)
            }).map((ra: any, idx: number) => {
              if (!ra.ok || ra.gasit === false) {
                return <div key={idx} style={{background:UI.card, borderRadius:UI.radius, border:'1px solid '+UI.line, padding:'18px', color:UI.sub}}>Nu am gasit calendar pentru „{ra.cautat}".</div>
              }
              const showuri = ra.ocupate.filter((e: any) => e.tip === 'show')
              const note = ra.ocupate.filter((e: any) => e.tip === 'nota')
              const showViitor = grupeazaIntervale(showuri.filter((e: any) => e.viitor))
              // perioade indisponibile viitoare (vacante, off), grupate ca intervale
              const indispViitor = grupeazaIntervale(ra.ocupate.filter((e: any) => e.tip === 'indisponibil' && e.viitor))
              const pd = ra.peData
              return (
                <div key={idx} style={{background:UI.card, borderRadius:UI.radius, border:'1px solid '+UI.line, padding:'24px', boxShadow:UI.shadow}}>
                  <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px'}}>
                    {pd && pd.liber && (
                      <input type="checkbox" checked={bifatiArtist.has(ra.artist)} onChange={() => toggleBifaArtist(ra.artist)} style={{width:'18px', height:'18px', accentColor:UI.green, cursor:'pointer'}} />
                    )}
                    <div style={{fontSize:'20px', fontWeight:800, color:UI.ink}}>{ra.artist}</div>
                  </div>
                  {!pd && typeof ra.zileLibere === 'number' && (
                    <div style={{fontSize:'12px', color:UI.faint, marginBottom:'10px'}}>{ra.zileLibere} zile libere din {ra.totalZile} până la final de an</div>
                  )}

                  {/* daca e data specifica: status + context */}
                  {pd ? (
                    <>
                      {(() => {
                        const st: string = pd.status || (pd.liber ? 'liber' : 'ocupat')
                        const cfgMap: Record<string, any> = { liber: { bg:'#f0fdf4', bd:'#86efac', col:UI.green, txt:'✓ LIBER' }, ocupat: { bg:'#fef2f2', bd:'#fca5a5', col:'#dc2626', txt:'✗ OCUPAT' }, verifica: { bg:'#fffbeb', bd:'#fcd34d', col:'#b45309', txt:'⚠ VERIFICĂ' } }
                        const cfg = cfgMap[st] || cfgMap.ocupat
                        return (
                      <div style={{marginTop:'10px', marginBottom:'14px', padding:'14px', borderRadius:UI.radiusSm, background: cfg.bg, border:'1.5px solid '+cfg.bd}}>
                        <div style={{fontSize:'15px', fontWeight:800, color: cfg.col, marginBottom: pd.evenimente.length ? '8px' : '0'}}>{cfg.txt} pe {lunaData(pd.data)}{eWeekend(pd.data) ? ' (weekend)' : ''}</div>
                        {pd.evenimente.map((e: any, i: number) => (
                          <div key={i} style={{marginTop:'6px'}}>
                            <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                              <span style={{fontSize:'9px', fontWeight:800, textTransform:'uppercase', padding:'2px 6px', borderRadius:'5px', color:'white', background: badgeCol(e.tip)}}>{badgeLabel(e.tip)}</span>
                              <span style={{fontSize:'13px', color:UI.ink}}>{e.titlu}</span>
                            </div>
                            {e.descriere && <div style={{fontSize:'11px', color:UI.faint, marginLeft:'2px'}}>{e.descriere.slice(0,80)}</div>}
                            {e.created && <div style={{fontSize:'10px', color:UI.faint, marginLeft:'2px'}}>pus: {dataCreare(e.created)}</div>}
                          </div>
                        ))}
                      </div>
                        )
                      })()}
                      {pd.context?.length > 0 && (
                        <div style={{marginBottom:'8px'}}>
                          <div style={{fontSize:'11px', fontWeight:800, color:UI.sub, textTransform:'uppercase', marginBottom:'6px'}}>Context ±3 zile</div>
                          {(contextExpandat.has(idx) ? pd.context : pd.context.slice(0, 2)).map((e: any, i: number) => (
                            <div key={i} style={{padding:'4px 0'}}>
                              <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'12px'}}>
                                <span style={{fontWeight:700, minWidth:'56px', color: eWeekend(e.data) ? '#ea580c' : UI.sub}}>{lunaData(e.data)}{eWeekend(e.data) ? ' ·wk' : ''}</span>
                                <span style={{fontSize:'8px', fontWeight:800, textTransform:'uppercase', padding:'2px 5px', borderRadius:'4px', color:'white', background: badgeCol(e.tip)}}>{badgeLabel(e.tip)}</span>
                                <span style={{color:UI.sub}}>{e.titlu}</span>
                              </div>
                              {(e.descriere || e.created) && <div style={{fontSize:'10px', color:UI.faint, marginLeft:'64px'}}>{e.descriere ? e.descriere.slice(0,70) : ''}{e.descriere && e.created ? ' · ' : ''}{e.created ? 'pus ' + dataCreare(e.created) : ''}</div>}
                            </div>
                          ))}
                          {pd.context.length > 2 && (
                            <button onClick={() => toggleContext(idx)} style={{marginTop:'4px', padding:'4px 0', background:'none', border:'none', color:UI.purple, fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:F}}>{contextExpandat.has(idx) ? 'Arată mai puțin' : '+ ' + (pd.context.length - 2) + ' mai multe zile'}</button>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{fontSize:'12px', color:UI.faint, marginBottom:'14px'}}>{showViitor.length} show-uri programate, {indispViitor.length} perioade indisponibile, restul liber</div>
                  )}

                  {/* zona oras */}
                  {oras && (ra.inOrasViitor?.length > 0 || ra.ultimaInZona) && (
                    <div style={{background:'#faf9f7', border:'1px solid '+UI.line, borderRadius:UI.radiusSm, padding:'12px', marginTop:'8px'}}>
                      <div style={{fontSize:'11px', fontWeight:800, color:UI.purple, textTransform:'uppercase', marginBottom:'6px'}}>In zona {oras}</div>
                      {ra.inOrasViitor?.map((e: any, i: number) => (
                        <div key={i} style={{fontSize:'13px', color:'#c2410c', fontWeight:600, marginBottom:'3px'}}>deja programat: {lunaData(e.data)}, {e.titlu} ({e.km} km)</div>
                      ))}
                      {ra.ultimaInZona && <div style={{fontSize:'13px', color:UI.sub}}>ultima data in zona: {lunaData(ra.ultimaInZona.data)}, {ra.ultimaInZona.oras} ({ra.ultimaInZona.km} km)</div>}
                    </div>
                  )}

                  {!pd && indispViitor.length > 0 && (
                    <div style={{marginTop:'12px'}}>
                      <div style={{fontSize:'12px', fontWeight:800, color:'#dc2626', marginBottom:'8px'}}>Perioade indisponibile ({indispViitor.length})</div>
                      {indispViitor.map((e: any, i: number) => (
                        <div key={i} style={{padding:'5px 0', borderBottom:'1px solid '+UI.line}}>
                          <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'13px'}}>
                            <span style={{fontSize:'8px', fontWeight:800, textTransform:'uppercase', padding:'2px 5px', borderRadius:'4px', color:'white', background: badgeCol(e.tip)}}>{badgeLabel(e.tip)}</span>
                            <span style={{fontWeight:700, color:UI.ink}}>{afiseazaInterval(e)}</span><span style={{color:UI.sub}}>{e.titlu}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!pd && showViitor.length > 0 && (
                    <div style={{marginTop:'12px'}}>
                      <div style={{fontSize:'12px', fontWeight:800, color:UI.ink, marginBottom:'8px'}}>Show-uri programate ({showViitor.length})</div>
                      {showViitor.map((e: any, i: number) => (
                        <div key={i} style={{padding:'5px 0', borderBottom:'1px solid '+UI.line}}>
                          <div style={{display:'flex', gap:'10px', fontSize:'13px', color:UI.sub}}>
                            <span style={{fontWeight:700, color:UI.ink, minWidth:'90px'}}>{afiseazaInterval(e)}</span><span>{e.titlu}</span>
                          </div>
                          {(e.descriere || e.created) && <div style={{fontSize:'10px', color:UI.faint, marginLeft:'80px'}}>{e.descriere ? e.descriere.slice(0,70) : ''}{e.descriere && e.created ? ' · ' : ''}{e.created ? 'pus ' + dataCreare(e.created) : ''}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {mod === 'artist' && dataArtist && liberiArtist().length > 0 && (
          <div style={{position:'sticky', bottom:'20px', marginTop:'20px', background:UI.dark, borderRadius:UI.radius, padding:'16px 20px', boxShadow:'0 8px 30px rgba(0,0,0,0.25)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', flexWrap:'wrap'}}>
            <span style={{fontSize:'14px', fontWeight:700, color:'white'}}>{liberiBifati().length} din {liberiArtist().length} selectați pe {lunaData(dataArtist)}</span>
            <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
              <button onClick={() => liberiBifati().length === liberiArtist().length ? deselecteazaToti() : selecteazaTotiLiberi()} style={{padding:'10px 16px', background:'rgba(255,255,255,0.15)', color:'white', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F}}>{liberiBifati().length === liberiArtist().length ? 'Deselectează' : 'Toți'}</button>
              <button onClick={copiazaLiberi} style={{padding:'10px 16px', background: copiat ? UI.green : 'rgba(255,255,255,0.15)', color:'white', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F, transition:'background 0.2s'}}>{copiat ? '✓ Copiat' : 'Copiază'}</button>
              <button onClick={trimiteLiberiInOferta} style={{display:'flex', alignItems:'center', gap:'6px', padding:'10px 16px', background:UI.green, color:'white', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F}}><Send size={14} /> Trimite în ofertă</button>
            </div>
          </div>
        )}
        {mod === 'data' && rez && (
          <>
            {/* filtre gen */}
            <div style={{display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'16px'}}>
              {GENURI.filter(g => (rez.liberi||[]).some(l => l.gen === g.key)).map(g => (
                <button key={g.key} onClick={() => toggleGen(g.key)} style={{fontSize:'12px', fontWeight:700, padding:'6px 12px', borderRadius:'8px', cursor:'pointer', fontFamily:F, border:'1.5px solid '+(filtreGen.has(g.key)?UI.green:UI.line), background:filtreGen.has(g.key)?UI.green:'white', color:filtreGen.has(g.key)?'white':UI.sub}}>{g.label}</button>
              ))}
              {filtreGen.size > 0 && <button onClick={() => setFiltreGen(new Set())} style={{fontSize:'12px', fontWeight:700, padding:'6px 12px', borderRadius:'8px', cursor:'pointer', fontFamily:F, border:'1.5px solid '+UI.line, background:'white', color:UI.faint}}>Toate</button>}
            </div>

            <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr', gap:'16px'}}>
              {/* LIBERI grupati pe gen */}
              <div>
                <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px'}}>
                  <Check size={18} color={UI.green} /><span style={{fontSize:'15px', fontWeight:800, color:UI.ink}}>Liberi ({liberiFiltrati.length})</span>
                  {liberiFiltrati.length > 0 && <button onClick={selecteazaToti} style={{marginLeft:'auto', fontSize:'11px', fontWeight:700, padding:'5px 12px', borderRadius:'7px', border:'1.5px solid '+UI.green, background: liberiFiltrati.every(l => bifati.has(l.artist)) ? UI.green : 'white', color: liberiFiltrati.every(l => bifati.has(l.artist)) ? 'white' : UI.green, cursor:'pointer', fontFamily:F}}>{liberiFiltrati.every(l => bifati.has(l.artist)) ? 'Deselectează' : 'Selectează toți'}</button>}
                </div>
                {genuriPrezente.map(g => (
                  <div key={g.key} style={{marginBottom:'16px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px'}}>
                      <span style={{fontSize:'12px', fontWeight:800, color:UI.purple, textTransform:'uppercase'}}>{g.label} ({grupati[g.key].length})</span>
                      <button onClick={() => selecteazaGen(g.key)} style={{fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', border:'1px solid '+UI.line, background: (grupati[g.key]||[]).every(l => bifati.has(l.artist)) ? UI.purple : 'white', color: (grupati[g.key]||[]).every(l => bifati.has(l.artist)) ? 'white' : UI.sub, cursor:'pointer', fontFamily:F}}>toți</button>
                    </div>
                    {grupati[g.key].map(l => {
                      const a = analize[l.artist]
                      return (
                      <div key={l.artist} style={{marginBottom:'6px'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'10px', background:UI.card, borderRadius:'10px', border:'1px solid '+(bifati.has(l.artist)?UI.green:UI.greenSoft), borderLeft:'3px solid '+UI.green, padding:'10px 14px'}}>
                        <input type="checkbox" checked={bifati.has(l.artist)} onChange={() => toggleBifat(l.artist)} style={{width:'16px', height:'16px', accentColor:UI.green, cursor:'pointer'}} />
                        <span style={{fontSize:'14px', fontWeight:600, color:UI.ink, flex:1}}>{l.artist}</span>
                        {oras && <button onClick={() => analizeaza(l)} disabled={analizand.has(l.artist)} style={{fontSize:'11px', fontWeight:700, padding:'4px 10px', borderRadius:'7px', border:'1.5px solid '+UI.line, background:a?UI.purple:'white', color:a?'white':UI.sub, cursor:'pointer', fontFamily:F}}>{analizand.has(l.artist) ? '...' : a ? 'Ascunde' : 'Analizează'}</button>}
                      </div>
                      {a && (
                        <div style={{background:'#faf9f7', border:'1px solid '+UI.line, borderRadius:'8px', padding:'12px', marginTop:'4px', fontSize:'12px'}}>
                          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:(a.proximitati?.length||a.ultimaInZona)?'10px':'0'}}>
                            <div style={{background: a.ziMinus?'#fff7ed':'#f5f5f4', border:'1px solid '+(a.ziMinus?'#fed7aa':UI.line), borderRadius:'7px', padding:'8px 10px'}}>
                              <div style={{fontSize:'10px', fontWeight:800, color: a.ziMinus?'#c2410c':UI.faint, textTransform:'uppercase', marginBottom:'3px'}}>Ziua dinainte{a.ziMinus ? ' · ' + dataScurta(a.ziMinus.data) : ''}</div>
                              <div style={{fontSize:'12px', fontWeight:600, color: a.ziMinus?UI.ink:UI.faint}}>{a.ziMinus ? a.ziMinus.titlu : 'liber / nimic notat'}</div>
                              {a.ziMinus?.created && <div style={{fontSize:'9px', color:UI.faint, marginTop:'2px'}}>pus: {dataCreare(a.ziMinus.created)}</div>}
                            </div>
                            <div style={{background: a.ziPlus?'#fff7ed':'#f5f5f4', border:'1px solid '+(a.ziPlus?'#fed7aa':UI.line), borderRadius:'7px', padding:'8px 10px'}}>
                              <div style={{fontSize:'10px', fontWeight:800, color: a.ziPlus?'#c2410c':UI.faint, textTransform:'uppercase', marginBottom:'3px'}}>Ziua după{a.ziPlus ? ' · ' + dataScurta(a.ziPlus.data) : ''}</div>
                              <div style={{fontSize:'12px', fontWeight:600, color: a.ziPlus?UI.ink:UI.faint}}>{a.ziPlus ? a.ziPlus.titlu : 'liber / nimic notat'}</div>
                              {a.ziPlus?.created && <div style={{fontSize:'9px', color:UI.faint, marginTop:'2px'}}>pus: {dataCreare(a.ziPlus.created)}</div>}
                            </div>
                          </div>
                          {a.proximitati?.length > 0 && a.proximitati.map((p: any, i: number) => (
                            <div key={i} style={{marginBottom:'5px', color: p.tip==='acelasi_oras' ? '#c2410c' : UI.green, fontWeight:600}}>
                              {p.tip==='acelasi_oras' ? '⚠ acelasi oras' : '✓ poti lega'} ({p.km} km, {zileText(p.zile)}): <span style={{color:UI.sub, fontWeight:500}}>{p.titlu}</span>{p.created && <span style={{color:UI.faint, fontWeight:400, fontSize:'10px'}}> · pus {dataCreare(p.created)}</span>}
                            </div>
                          ))}
                          {a.ultimaInZona && <div style={{color:UI.faint, marginTop:'3px'}}>ultima dată în zonă: {zileText(a.ultimaInZona.zile)} ({a.ultimaInZona.oras}){a.ultimaInZona.created ? ' · pus ' + dataCreare(a.ultimaInZona.created) : ''}</div>}
                          {!a.proximitati?.length && !a.ultimaInZona && <div style={{color:UI.faint, marginTop:'2px'}}>fără alte evenimente în apropiere</div>}
                        </div>
                      )}
                      </div>
                    )})}
                  </div>
                ))}
              </div>

              {/* OCUPATI */}
              <div>
                <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px'}}>
                  <X size={18} color="#dc2626" /><span style={{fontSize:'15px', fontWeight:800, color:UI.ink}}>Ocupați ({rez.nrOcupati})</span>
                </div>
                {rez.ocupati.map(r => (
                  <div key={r.artist} style={{background:UI.card, borderRadius:'10px', border:'1px solid '+UI.line, borderLeft:'3px solid #dc2626', padding:'10px 14px', marginBottom:'8px'}}>
                    <div style={{fontSize:'14px', fontWeight:700, color:UI.ink}}>{r.artist}</div>
                    {r.evenimente.map((e, i) => (
                      <div key={i} style={{marginTop:'3px'}}>
                        <div style={{fontSize:'12px', color:UI.sub}}>{e.titlu}{e.descriere ? ' · ' + e.descriere.slice(0,80) : ''}</div>
                        {(e as any).created && <div style={{fontSize:'10px', color:UI.faint, marginTop:'1px'}}>pus în agendă: {dataCreare((e as any).created)}</div>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* bara actiuni pentru bifati */}
            {bifatiLista.length > 0 && (
              <div style={{position:'sticky', bottom:'20px', marginTop:'24px', background:UI.dark, borderRadius:UI.radius, padding:'16px 20px', boxShadow:'0 8px 30px rgba(0,0,0,0.25)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', flexWrap:'wrap'}}>
                <span style={{fontSize:'14px', fontWeight:700, color:'white'}}>{bifatiLista.length} artiști bifați</span>
                <div style={{display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center'}}>
                  {oras && <button onClick={analizeazaToti} style={{display:'flex', alignItems:'center', gap:'6px', padding:'10px 18px', background:UI.purple, color:'white', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F}}><CalendarSearch size={14} strokeWidth={2.4} /> Analizează toți</button>}
                  {oras && <div style={{width:'1px', height:'26px', background:'rgba(255,255,255,0.2)'}} />}
                  <button onClick={() => { navigator.clipboard.writeText(textExport(true)) }} style={{padding:'10px 16px', background:'rgba(255,255,255,0.15)', color:'white', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F}}>Copiază</button>
                  <button onClick={() => window.open('https://wa.me/?text=' + encodeURIComponent(textExport(true)), '_blank')} style={{padding:'10px 16px', background:'#25D366', color:'white', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F}}>WhatsApp</button>
                  <button onClick={() => window.open('mailto:?subject=' + encodeURIComponent('Artiști disponibili' + (oras?' - '+oras:'')) + '&body=' + encodeURIComponent(textExport()))} style={{padding:'10px 16px', background:'#3b82f6', color:'white', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F}}>Email</button>
                  <button onClick={exportaPdf} style={{padding:'10px 16px', background:'rgba(255,255,255,0.15)', color:'white', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F}}>PDF</button>
                  <button onClick={trimiteInOferta} style={{display:'flex', alignItems:'center', gap:'6px', padding:'10px 16px', background:UI.green, color:'white', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F}}><Send size={14} /> Trimite în ofertă</button>
                </div>
              </div>
            )}
          </>
        )}
      {toast && (
        <div style={{position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)', background:UI.dark, color:'white', padding:'12px 22px', borderRadius:'12px', fontSize:'14px', fontWeight:700, fontFamily:F, boxShadow:'0 8px 30px rgba(0,0,0,0.3)', zIndex:1000, display:'flex', alignItems:'center', gap:'8px'}}>
          <span style={{color:'#34d399', fontSize:'16px'}}>✓</span> {toast}
        </div>
      )}
      </div>
    </div>
  )
}
