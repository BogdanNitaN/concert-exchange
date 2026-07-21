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
  const [rezArtist, setRezArtist] = useState<any>(null)
  const [loadingArtist, setLoadingArtist] = useState(false)
  async function cautaArtist() {
    if (!artistCautat.trim()) return
    setLoadingArtist(true); setRezArtist(null)
    try {
      const r = await fetch('/api/calendar-artist-liber?artist=' + encodeURIComponent(artistCautat) + (oras ? '&oras=' + encodeURIComponent(oras) : ''))
      const d = await r.json()
      setRezArtist(d)
    } catch { setRezArtist({ ok: false }) }
    setLoadingArtist(false)
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
        bileteAvion: rd.bilete_avion || 0, restulRutier: false, tipMasa: 'diurna', zile: 1,
        diurnaPerPers: 0, diurnaFixa: 0, cazareFixa: 0, useAlcool: false, alcool: 0,
        useCag: false, cagProcent: 0, cagSuma: 0, cagMod: 'procent',
      }
    })
    const oferta = { oras: oras || null, data_eveniment: data || null, linii_complete }
    try { localStorage.setItem('oferta_edit', JSON.stringify(oferta)) } catch {}
    window.location.href = '/oferta'
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
            <input type="text" placeholder="ex: The Motans" value={artistCautat} onChange={e => setArtistCautat(e.target.value)} onKeyDown={e => e.key==='Enter' && cautaArtist()} style={{...inp, width:'220px'}} />
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

        {mod === 'artist' && rezArtist && rezArtist.ok && rezArtist.gasit === false && (
          <div style={{background:UI.card, borderRadius:UI.radius, border:'1px solid '+UI.line, padding:'24px', textAlign:'center', color:UI.sub}}>Nu am gasit un calendar pentru acest artist. Incearca alta scriere.</div>
        )}
        {mod === 'artist' && rezArtist && rezArtist.gasit && (() => {
          const showuri = rezArtist.ocupate.filter((e: any) => e.tip === 'show')
          const blocari = rezArtist.ocupate.filter((e: any) => e.tip === 'blocat')
          const note = rezArtist.ocupate.filter((e: any) => e.tip === 'nota')
          const showViitor = showuri.filter((e: any) => e.viitor)
          const showTrecut = showuri.filter((e: any) => !e.viitor)
          return (
            <div style={{background:UI.card, borderRadius:UI.radius, border:'1px solid '+UI.line, padding:'24px', boxShadow:UI.shadow}}>
              <div style={{fontSize:'20px', fontWeight:800, color:UI.ink, marginBottom:'4px'}}>{rezArtist.artist}</div>
              <div style={{fontSize:'12px', color:UI.faint, marginBottom:'18px'}}>{showViitor.length} show-uri programate, {blocari.length} blocari, restul liber</div>
              {oras && (rezArtist.inOrasViitor?.length > 0 || rezArtist.ultimaInZona) && (
                <div style={{background:'#faf9f7', border:'1px solid '+UI.line, borderRadius:UI.radiusSm, padding:'14px', marginBottom:'18px'}}>
                  <div style={{fontSize:'11px', fontWeight:800, color:UI.purple, textTransform:'uppercase', marginBottom:'8px'}}>In zona {oras}</div>
                  {rezArtist.inOrasViitor?.map((e: any, i: number) => (
                    <div key={i} style={{fontSize:'13px', color:'#c2410c', fontWeight:600, marginBottom:'4px'}}>deja programat: {lunaData(e.data)}, {e.titlu} ({e.km} km)</div>
                  ))}
                  {rezArtist.ultimaInZona && (
                    <div style={{fontSize:'13px', color:UI.sub, marginTop:'4px'}}>ultima data in zona: {lunaData(rezArtist.ultimaInZona.data)}, {rezArtist.ultimaInZona.oras} ({rezArtist.ultimaInZona.km} km)</div>
                  )}
                </div>
              )}
              {showViitor.length > 0 && (
                <div style={{marginBottom:'16px'}}>
                  <div style={{fontSize:'12px', fontWeight:800, color:UI.ink, marginBottom:'8px'}}>Show-uri programate ({showViitor.length})</div>
                  {showViitor.map((e: any, i: number) => (
                    <div key={i} style={{display:'flex', gap:'10px', fontSize:'13px', color:UI.sub, padding:'5px 0', borderBottom:'1px solid '+UI.line}}>
                      <span style={{fontWeight:700, color:UI.ink, minWidth:'70px'}}>{lunaData(e.data)}</span>
                      <span>{e.titlu}</span>
                    </div>
                  ))}
                </div>
              )}
              {blocari.length > 0 && (
                <div style={{marginBottom:'16px'}}>
                  <div style={{fontSize:'12px', fontWeight:800, color:'#dc2626', marginBottom:'8px'}}>Blocari ({blocari.length})</div>
                  {blocari.map((e: any, i: number) => (
                    <div key={i} style={{display:'flex', gap:'10px', fontSize:'13px', color:UI.sub, padding:'4px 0'}}>
                      <span style={{fontWeight:700, minWidth:'70px'}}>{lunaData(e.data)}</span>
                      <span>{e.titlu}</span>
                    </div>
                  ))}
                </div>
              )}
              {note.length > 0 && (
                <details style={{marginTop:'8px'}}>
                  <summary style={{fontSize:'12px', fontWeight:700, color:UI.faint, cursor:'pointer'}}>Note si context ({note.length})</summary>
                  <div style={{marginTop:'8px'}}>
                    {note.map((e: any, i: number) => (
                      <div key={i} style={{display:'flex', gap:'10px', fontSize:'12px', color:UI.faint, padding:'3px 0'}}>
                        <span style={{minWidth:'70px'}}>{lunaData(e.data)}</span>
                        <span>{e.titlu}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
              {showTrecut.length > 0 && (
                <details style={{marginTop:'8px'}}>
                  <summary style={{fontSize:'12px', fontWeight:700, color:UI.faint, cursor:'pointer'}}>Show-uri trecute ({showTrecut.length})</summary>
                  <div style={{marginTop:'8px'}}>
                    {showTrecut.map((e: any, i: number) => (
                      <div key={i} style={{display:'flex', gap:'10px', fontSize:'12px', color:UI.faint, padding:'3px 0'}}>
                        <span style={{minWidth:'70px'}}>{lunaData(e.data)}</span>
                        <span>{e.titlu}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )
        })()}

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
      </div>
    </div>
  )
}
