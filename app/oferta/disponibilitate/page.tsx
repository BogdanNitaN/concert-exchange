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
  const [mod, setMod] = useState<'data' | 'artist' | 'perioada'>('data')
  const [dataStart, setDataStart] = useState('')
  const [dataEnd, setDataEnd] = useState('')
  const [ziuaDeschisa, setZiuaDeschisa] = useState<string>('')
  const [zileSelectate, setZileSelectate] = useState<Set<string>>(new Set())
  function toggleZiSelectata(artist: string, data: string) {
    const k = artist + '|' + data
    setZileSelectate(prev => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n })
  }
  const [ocupateDeschise, setOcupateDeschise] = useState<Set<number>>(new Set())
  const [showExpandat, setShowExpandat] = useState<Set<number>>(new Set())
  function toggleShow(idx: number) { setShowExpandat(prev => { const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n }) }
  const [indispExpandat, setIndispExpandat] = useState<Set<number>>(new Set())
  function toggleIndisp(idx: number) { setIndispExpandat(prev => { const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n }) }
  function toggleOcupate(idx: number) { setOcupateDeschise(prev => { const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n }) }
  const [artistCautat, setArtistCautat] = useState('')
  const [rezArtist, setRezArtist] = useState<any[]>([])
  const [dataArtist, setDataArtist] = useState('')
  const [dataArtist2, setDataArtist2] = useState('')
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
    // paralelizez: toti artistii deodata (nu secvential) - mult mai rapid la multi
    const rezultate = await Promise.all(nume.map(async (n) => {
      try {
        const q = '/api/calendar-artist-liber?artist=' + encodeURIComponent(n) + (oras ? '&oras=' + encodeURIComponent(oras) : '') + (dataArtist ? '&data=' + dataArtist : '') + (dataArtist2 ? '&data2=' + dataArtist2 : '') + (mod === 'perioada' && dataStart ? '&dataStart=' + dataStart : '') + (mod === 'perioada' && dataEnd ? '&dataEnd=' + dataEnd : '')
        const r = await fetch(q)
        const d = await r.json()
        return { cautat: n, ...d }
      } catch { return { cautat: n, ok: false } }
    }))
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
  // helper: lista {artist, data, rosterData} din zilele bifate in perioada
  function zileSelectateLista() {
    const rez: any[] = []
    zileSelectate.forEach((k: string) => {
      const [artist, data] = k.split('|')
      const ra = rezArtist.find((r: any) => r.artist === artist)
      rez.push({ artist, data, rosterData: ra?.rosterData || {} })
    })
    return rez.sort((a, b) => a.artist.localeCompare(b.artist) || a.data.localeCompare(b.data))
  }
  function copiazaPerioada() {
    const lista = zileSelectateLista()
    if (lista.length === 0) return
    // grupez pe artist
    const peArtist: Record<string, string[]> = {}
    lista.forEach((z: any) => { (peArtist[z.artist] = peArtist[z.artist] || []).push(lunaData(z.data)) })
    const txt = Object.entries(peArtist).map(([a, zile]) => '*' + a + '*: ' + zile.join(', ')).join('\n')
    navigator.clipboard.writeText(txt)
    setCopiat(true); setTimeout(() => setCopiat(false), 1800)
  }
  function trimitePerioadaInOferta() {
    const lista = zileSelectateLista()
    if (lista.length === 0) return
    // grupez pe artist: O SINGURA linie per artist, cu toate zilele lui ca optiuni (un pret pt oricare)
    const peArtist: Record<string, any> = {}
    lista.forEach((z: any) => {
      if (!peArtist[z.artist]) peArtist[z.artist] = { artist: z.artist, rosterData: z.rosterData, zile: [] }
      peArtist[z.artist].zile.push(z.data)
    })
    const grupuri = Object.values(peArtist)
    // toate selectiile pe o singura data? -> data globala
    const dateUnice = Array.from(new Set(lista.map((z: any) => z.data)))
    const dataGlobala = dateUnice.length === 1 ? dateUnice[0] : null
    const linii_complete = grupuri.map((g: any) => {
      const rd = g.rosterData || {}
      const zileText = g.zile.map((d: string) => lunaData(d)).join(', ')
      return {
        artistNume: g.artist,
        dateOptiuni: g.zile.length > 1 ? zileText : '',
        formatSelectat: '', durata: rd.durata_default || '40 min',
        tipPret: 'Standard', feeLista: rd.fee_standard || 0, fee: rd.fee_standard || 0,
        leiKm: rd.lei_km || 0, useMarja: true, cazare: rd.cazare || '', persoane: rd.nr_persoane || 0,
        bileteAvion: rd.bilete_avion || 0, restulRutier: true, tipMasa: 'alacarte', zile: 1,
        diurnaPerPers: 180, diurnaFixa: rd.diurna_fixa || 0, cazareFixa: rd.cazare_fixa || 0, useAlcool: false, alcool: rd.alcool_default || 0,
        useCag: false, cagProcent: 0, cagSuma: 0, cagMod: 'procent',
      }
    })
    const oferta = { oras: oras || null, data_eveniment: dataGlobala, linii_complete }
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
  function ziRelativa(dataIso: string, offset: number): string {
    const d = new Date(dataIso + 'T12:00:00'); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10)
  }
  function renderStatusCard(pd: any, idx: number, keySuffix: string) {
    if (!pd) return null
    const st: string = pd.status || (pd.liber ? 'liber' : 'ocupat')
    const cfgMap: Record<string, any> = { liber: { bg:'#f0fdf4', bd:'#86efac', col:UI.green, txt:'✓ LIBER' }, ocupat: { bg:'#fef2f2', bd:'#fca5a5', col:'#dc2626', txt:'✗ OCUPAT' }, verifica: { bg:'#faf5ff', bd:'#d8b4fe', col:'#7c3aed', txt:'○ VERIFICĂ' } }
    const cfg = cfgMap[st] || cfgMap.ocupat
    // context logistic: ziua -1 (de unde vine), +1 (unde merge)
    const ziMinus = ziRelativa(pd.data, -1), ziPlus = ziRelativa(pd.data, 1)
    const evMinus = (pd.context || []).filter((e: any) => e.data === ziMinus)
    const evPlus = (pd.context || []).filter((e: any) => e.data === ziPlus)
    const restContext = (pd.context || []).filter((e: any) => e.data !== ziMinus && e.data !== ziPlus)
    const expKey = keySuffix + '-' + idx
    const linieCtx = (e: any, i: number) => (
      <div key={i} style={{padding:'3px 0'}}>
        <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'12px'}}>
          <span style={{fontWeight:700, minWidth:'56px', color: eWeekend(e.data) ? '#ea580c' : UI.sub}}>{lunaData(e.data)}{eWeekend(e.data) ? ' ·wk' : ''}</span>
          <span style={{fontSize:'8px', fontWeight:800, textTransform:'uppercase', padding:'2px 5px', borderRadius:'4px', color:'white', background: badgeCol(e.tip)}}>{badgeLabel(e.tip)}</span>
          <span style={{color:UI.sub}}>{e.titlu}</span>
        </div>
        {(e.descriere || e.created) && <div style={{fontSize:'10px', color:UI.faint, marginLeft:'64px'}}>{e.descriere ? e.descriere.slice(0,70) : ''}{e.descriere && e.created ? ' · ' : ''}{e.created ? 'pus ' + dataCreare(e.created) : ''}</div>}
      </div>
    )
    return (
      <div>
        <div style={{marginTop:'10px', marginBottom:'10px', padding:'14px', borderRadius:UI.radiusSm, background: cfg.bg, border:'1.5px solid '+cfg.bd}}>
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
        {/* logistica: ziua dinainte / ziua dupa */}
        {(evMinus.length > 0 || evPlus.length > 0) && (
          <div style={{marginBottom:'8px', padding:'10px 12px', background:'#f8fafc', borderRadius:UI.radiusSm, border:'1px solid '+UI.line}}>
            <div style={{fontSize:'10px', fontWeight:800, color:UI.purple, textTransform:'uppercase', marginBottom:'6px'}}>Logistică (de unde vine / unde merge)</div>
            {evMinus.length > 0 && <div style={{marginBottom:'4px'}}><span style={{fontSize:'11px', fontWeight:700, color:UI.sub}}>← ziua dinainte:</span>{evMinus.map(linieCtx)}</div>}
            {evPlus.length > 0 && <div><span style={{fontSize:'11px', fontWeight:700, color:UI.sub}}>→ ziua după:</span>{evPlus.map(linieCtx)}</div>}
          </div>
        )}
        {restContext.length > 0 && (
          <div style={{marginBottom:'8px'}}>
            <div style={{fontSize:'11px', fontWeight:800, color:UI.sub, textTransform:'uppercase', marginBottom:'6px'}}>Alte zile ±3</div>
            {(contextExpandat.has(idx) ? restContext : restContext.slice(0, 2)).map(linieCtx)}
            {restContext.length > 2 && <button onClick={() => toggleContext(idx)} style={{marginTop:'4px', padding:'4px 0', background:'none', border:'none', color:UI.purple, fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:F}}>{contextExpandat.has(idx) ? 'Arată mai puțin' : '+ ' + (restContext.length - 2) + ' zile'}</button>}
          </div>
        )}
      </div>
    )
  }
  function renderMiniCalendar(perioada: any[], idx: number, artist: string) {
    if (!perioada || perioada.length === 0) return null
    const culoare: Record<string, string> = { liber: '#86efac', ocupat: '#fca5a5', verifica: '#d8b4fe' }
    const culoareText: Record<string, string> = { liber: '#166534', ocupat: '#991b1b', verifica: '#6b21a8' }
    const nrLibere = perioada.filter((z: any) => z.status === 'liber').length
    // ferestre de zile libere consecutive (pentru turnee)
    const ferestre: any[] = []
    let curent: any[] = []
    perioada.forEach((z: any) => {
      if (z.status === 'liber') curent.push(z)
      else { if (curent.length >= 2) ferestre.push([...curent]); curent = [] }
    })
    if (curent.length >= 2) ferestre.push([...curent])
    ferestre.sort((a, b) => b.length - a.length)
    // zile ocupate (pentru lista expandabila)
    const zileOcup = perioada.filter((z: any) => z.status !== 'liber')
    // grupez pe saptamani: aliniez prima zi dupa ziua saptamanii (Luni=0)
    const primaZi = new Date(perioada[0].data + 'T12:00:00')
    let offset = primaZi.getDay() - 1; if (offset < 0) offset = 6 // Luni=0..Duminica=6
    const celule: any[] = []
    for (let i = 0; i < offset; i++) celule.push(null)
    perioada.forEach((z: any) => celule.push(z))
    const ziLuna = (iso: string) => parseInt(iso.slice(8, 10), 10)
    const zileSapt = ['L', 'M', 'Mi', 'J', 'V', 'S', 'D']
    const ziDetaliu = ziuaDeschisa && perioada.find((z: any) => z.data === ziuaDeschisa && z.data.slice(0,7) === ziuaDeschisa.slice(0,7))
    return (
      <div style={{marginTop:'10px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px'}}>
          <span style={{fontSize:'13px', fontWeight:800, color:UI.green}}>{nrLibere} zile libere</span>
          <span style={{fontSize:'12px', color:UI.faint}}>din {perioada.length} în perioadă</span>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'4px', maxWidth:'320px'}}>
          {zileSapt.map((zs, i) => <div key={'h'+i} style={{fontSize:'9px', fontWeight:700, color:UI.faint, textAlign:'center', paddingBottom:'2px'}}>{zs}</div>)}
          {celule.map((z: any, i: number) => {
            if (!z) return <div key={'e'+i} />
            const sel = ziuaDeschisa === z.data
            const wk = eWeekend(z.data)
            const wkLiber = wk && z.status === 'liber'
            const bifat = zileSelectate.has(artist + '|' + z.data)
            const eLibera = z.status === 'liber'
            return (
              <button key={z.data} onClick={() => { setZiuaDeschisa(sel ? '' : z.data); if (eLibera) toggleZiSelectata(artist, z.data) }} title={z.data + (wk ? ' (weekend)' : '') + (eLibera ? ' - click pt selectare' : '')}
                style={{position:'relative', aspectRatio:'1', border: bifat ? '2.5px solid '+UI.ink : (sel ? '2px solid '+UI.ink : (wkLiber ? '2px solid #16a34a' : '1px solid rgba(0,0,0,0.06)')), borderRadius:'7px', background: wkLiber ? '#22c55e' : (culoare[z.status] || '#e7e5e4'), color: wkLiber ? 'white' : (culoareText[z.status] || UI.sub), fontSize:'11px', fontWeight: wkLiber ? 800 : 700, cursor:'pointer', fontFamily:F, display:'flex', alignItems:'center', justifyContent:'center', padding:0, boxShadow: bifat ? '0 0 0 2px white, 0 0 0 4px '+UI.ink : (wkLiber ? '0 2px 6px rgba(34,197,94,0.4)' : 'none')}}>
                {ziLuna(z.data)}
                {bifat && <span style={{position:'absolute', top:'-6px', right:'-6px', width:'16px', height:'16px', borderRadius:'50%', background:UI.ink, color:'white', fontSize:'10px', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center'}}>✓</span>}
              </button>
            )
          })}
        </div>
        <div style={{display:'flex', gap:'12px', marginTop:'8px', fontSize:'10px', color:UI.sub}}>
          <span><span style={{display:'inline-block', width:'10px', height:'10px', borderRadius:'3px', background:'#86efac', marginRight:'4px', verticalAlign:'middle'}} />liber</span>
          <span><span style={{display:'inline-block', width:'10px', height:'10px', borderRadius:'3px', background:'#fca5a5', marginRight:'4px', verticalAlign:'middle'}} />ocupat</span>
          <span><span style={{display:'inline-block', width:'10px', height:'10px', borderRadius:'3px', background:'#d8b4fe', marginRight:'4px', verticalAlign:'middle'}} />verifică</span>
        </div>
        {ferestre.length > 0 && (
          <div style={{marginTop:'10px'}}>
            <div style={{fontSize:'10px', fontWeight:800, color:UI.green, textTransform:'uppercase', marginBottom:'5px'}}>Ferestre libere consecutive</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
              {ferestre.slice(0, 5).map((f: any, i: number) => (
                <span key={i} style={{fontSize:'12px', fontWeight:700, color:'#166534', background:'#f0fdf4', border:'1px solid #86efac', borderRadius:'7px', padding:'4px 9px'}}>{f.length} zile: {lunaData(f[0].data)} - {lunaData(f[f.length-1].data)}</span>
              ))}
            </div>
          </div>
        )}
        {zileOcup.length > 0 && (
          <div style={{marginTop:'10px'}}>
            <button onClick={() => toggleOcupate(idx)} style={{background:'none', border:'none', color:UI.purple, fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:F, padding:0}}>{ocupateDeschise.has(idx) ? 'Ascunde' : 'Vezi'} zilele ocupate ({zileOcup.length})</button>
            {ocupateDeschise.has(idx) && (
              <div style={{marginTop:'6px'}}>
                {zileOcup.map((z: any, i: number) => (
                  <div key={i} style={{padding:'5px 0', borderBottom:'1px solid '+UI.line}}>
                    <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'12px'}}>
                      <span style={{fontWeight:700, minWidth:'56px', color: eWeekend(z.data) ? '#ea580c' : UI.sub}}>{lunaData(z.data)}{eWeekend(z.data) ? ' ·wk' : ''}</span>
                      {z.evenimente.map((e: any, j: number) => (
                        <span key={j} style={{display:'inline-flex', alignItems:'center', gap:'5px'}}>
                          <span style={{fontSize:'8px', fontWeight:800, textTransform:'uppercase', padding:'2px 5px', borderRadius:'4px', color:'white', background: badgeCol(e.tip)}}>{badgeLabel(e.tip)}</span>
                          <span style={{color:UI.sub}}>{e.titlu}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {ziDetaliu && (
          <div style={{marginTop:'10px', padding:'12px', background:'#faf9f7', borderRadius:UI.radiusSm, border:'1px solid '+UI.line}}>
            <div style={{fontSize:'12px', fontWeight:800, color:UI.ink, marginBottom:'6px'}}>{lunaData(ziDetaliu.data)}{eWeekend(ziDetaliu.data) ? ' (weekend)' : ''}</div>
            {ziDetaliu.evenimente.length === 0 ? <div style={{fontSize:'12px', color:UI.green, fontWeight:700}}>✓ liber</div> : ziDetaliu.evenimente.map((e: any, i: number) => (
              <div key={i} style={{display:'flex', alignItems:'center', gap:'6px', marginTop:'3px'}}>
                <span style={{fontSize:'8px', fontWeight:800, textTransform:'uppercase', padding:'2px 5px', borderRadius:'4px', color:'white', background: badgeCol(e.tip)}}>{badgeLabel(e.tip)}</span>
                <span style={{fontSize:'12px', color:UI.sub}}>{e.titlu}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
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
          <button onClick={() => setMod('data')} title="Toți artiștii liberi într-o anumită zi" style={{padding:'8px 18px', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F, background: mod==='data'?'white':'transparent', color: mod==='data'?UI.green:UI.sub, boxShadow: mod==='data'?'0 2px 8px rgba(5,150,105,0.15)':'none', borderBottom: mod==='data'?'2px solid '+UI.green:'2px solid transparent'}}>După dată</button>
          <button onClick={() => setMod('artist')} title="Un artist, pe una sau două date punctuale (cu context logistic)" style={{padding:'8px 18px', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F, background: mod==='artist'?'white':'transparent', color: mod==='artist'?UI.green:UI.sub, boxShadow: mod==='artist'?'0 2px 8px rgba(5,150,105,0.15)':'none', borderBottom: mod==='artist'?'2px solid '+UI.green:'2px solid transparent'}}>După artist</button>
          <button onClick={() => setMod('perioada')} title="Un artist pe un interval întreg — calendar cu zilele libere și ocupate" style={{padding:'8px 18px', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F, background: mod==='perioada'?'white':'transparent', color: mod==='perioada'?UI.green:UI.sub, boxShadow: mod==='perioada'?'0 2px 8px rgba(5,150,105,0.15)':'none', borderBottom: mod==='perioada'?'2px solid '+UI.green:'2px solid transparent'}}>Perioadă</button>
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
          <button onClick={cauta} disabled={!data || loading} style={{padding:'11px 28px', background:UI.green, color:'white', border:'none', borderRadius:UI.radiusSm, fontSize:'14px', fontWeight:700, cursor: (!data||loading) ? 'wait' : 'pointer', fontFamily:F, opacity:(!data||loading)?0.6:1, boxShadow:'0 2px 8px rgba(5,150,105,0.3)'}}>{loading ? 'Se verifică...' : 'Verifică'}</button>
        </div>
        ) : (
        <div style={{background:UI.card, borderRadius:UI.radius, border:'1px solid '+UI.line, padding:'20px', marginBottom:'20px', boxShadow:UI.shadow, display:'flex', gap:'12px', alignItems:'flex-end', flexWrap:'wrap'}}>
          <div>
            <label style={{fontSize:'11px', fontWeight:700, color:UI.sub, textTransform:'uppercase', display:'block', marginBottom:'6px'}}>Artist</label>
            <input type="text" placeholder="ex: Motans, Delia" value={artistCautat} onChange={e => setArtistCautat(e.target.value)} onKeyDown={e => e.key==='Enter' && cautaArtist()} style={{...inp, width:'220px'}} />
          </div>
          <div>
            <label style={{fontSize:'11px', fontWeight:700, color:UI.sub, textTransform:'uppercase', display:'block', marginBottom:'6px'}}>{mod === 'perioada' ? 'De la' : 'Data (opțional)'}</label>
            <div style={{width:'220px'}}><DatePicker value={mod === 'perioada' ? dataStart : dataArtist} onChange={v => mod === 'perioada' ? setDataStart(v) : setDataArtist(v)} placeholder={mod === 'perioada' ? 'Început' : 'Orice dată'} /></div>
          </div>
          <div>
            <label style={{fontSize:'11px', fontWeight:700, color:UI.sub, textTransform:'uppercase', display:'block', marginBottom:'6px'}}>{mod === 'perioada' ? 'Până la' : 'Data 2 (opțional)'}</label>
            <div style={{width:'220px'}}><DatePicker value={mod === 'perioada' ? dataEnd : dataArtist2} onChange={v => mod === 'perioada' ? setDataEnd(v) : setDataArtist2(v)} placeholder={mod === 'perioada' ? 'Sfârșit' : 'A doua dată'} /></div>
          </div>
          <div>
            <label style={{fontSize:'11px', fontWeight:700, color:UI.sub, textTransform:'uppercase', display:'block', marginBottom:'6px'}}>Oraș (opțional, pt. zonă)</label>
            <input type="text" placeholder="ex: Oradea" value={oras} onChange={e => setOras(e.target.value)} style={inp} />
          </div>
          <button onClick={cautaArtist} disabled={!artistCautat || loadingArtist} style={{padding:'11px 28px', background:UI.purple, color:'white', border:'none', borderRadius:UI.radiusSm, fontSize:'14px', fontWeight:700, cursor: (!artistCautat||loadingArtist) ? 'wait' : 'pointer', fontFamily:F, opacity:(!artistCautat||loadingArtist)?0.6:1, boxShadow:'0 2px 8px rgba(124,58,237,0.3)'}}>{loadingArtist ? 'Se caută...' : 'Caută'}</button>
        </div>
        )}

        {loading && <div style={{textAlign:'center', color:UI.sub, padding:'40px'}}>Se verifică calendarele artiștilor...</div>}

        {loadingArtist && <div style={{textAlign:'center', color:UI.sub, padding:'40px'}}>Se cauta calendarul artistului...</div>}

        {(mod === 'artist' || mod === 'perioada') && rezArtist.length > 0 && (
          <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
            {mod === 'perioada' && (() => {
              const cuP = rezArtist.filter((ra: any) => ra.ok && ra.gasit && ra.perioada?.length)
              if (cuP.length < 2) return null
              // zile unde TOTI sunt liberi
              const toateZilele = cuP[0].perioada.map((z: any) => z.data)
              const comune = toateZilele.filter((data: string) => cuP.every((ra: any) => { const zi = ra.perioada.find((z: any) => z.data === data); return zi && zi.status === 'liber' }))
              if (comune.length === 0) return <div style={{background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:UI.radiusSm, padding:'12px 16px', fontSize:'13px', color:'#991b1b', fontWeight:600}}>Nicio zi în care toți {cuP.length} artiștii să fie liberi în perioadă.</div>
              // grupez comunele in ferestre
              const fer: any[] = []; let cur: string[] = []
              comune.forEach((d: string, i: number) => {
                if (i === 0) { cur = [d]; return }
                const prev = new Date(comune[i-1] + 'T12:00:00'); const now = new Date(d + 'T12:00:00')
                if (Math.round((now.getTime() - prev.getTime())/86400000) === 1) cur.push(d)
                else { fer.push([...cur]); cur = [d] }
              })
              if (cur.length) fer.push(cur)
              return (
                <div style={{background:'#f0fdf4', border:'1.5px solid #86efac', borderRadius:UI.radiusSm, padding:'14px 16px'}}>
                  <div style={{fontSize:'12px', fontWeight:800, color:'#166534', textTransform:'uppercase', marginBottom:'8px'}}>Zile când toți {cuP.length} sunt liberi ({comune.length})</div>
                  <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
                    {fer.map((f: string[], i: number) => (
                      <span key={i} style={{fontSize:'13px', fontWeight:700, color:'#166534', background:'white', border:'1px solid #86efac', borderRadius:'7px', padding:'5px 10px'}}>{f.length === 1 ? lunaData(f[0]) : lunaData(f[0]) + ' - ' + lunaData(f[f.length-1]) + ' (' + f.length + ' zile)'}</span>
                    ))}
                  </div>
                </div>
              )
            })()}
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
              const pd2 = ra.peData2
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

                  {/* mod perioada: mini-calendar colorat */}
                  {mod === 'perioada' ? (
                    renderMiniCalendar(ra.perioada, idx, ra.artist)
                  ) : pd ? (
                    pd2 ? (
                      <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'12px', marginTop:'6px'}}>
                        <div>{renderStatusCard(pd, idx, 'd1')}</div>
                        <div>{renderStatusCard(pd2, idx, 'd2')}</div>
                      </div>
                    ) : (
                      renderStatusCard(pd, idx, 'd1')
                    )
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
                      {ra.ultimaInZona && <div style={{fontSize:'13px', color:UI.sub}}>ultima data in zona: {lunaData(ra.ultimaInZona.data)}, {ra.ultimaInZona.oras} ({ra.ultimaInZona.km} km){ra.ultimaInZona.titlu ? ' — ' + ra.ultimaInZona.titlu : ''}</div>}
                    </div>
                  )}

                  {!pd && indispViitor.length > 0 && (
                    <div style={{marginTop:'12px'}}>
                      <div style={{fontSize:'12px', fontWeight:800, color:'#dc2626', marginBottom:'8px'}}>Perioade indisponibile ({indispViitor.length})</div>
                      {(indispExpandat.has(idx) ? indispViitor : indispViitor.slice(0, 3)).map((e: any, i: number) => (
                        <div key={i} style={{padding:'5px 0', borderBottom:'1px solid '+UI.line}}>
                          <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'13px'}}>
                            <span style={{fontSize:'8px', fontWeight:800, textTransform:'uppercase', padding:'2px 5px', borderRadius:'4px', color:'white', background: badgeCol(e.tip)}}>{badgeLabel(e.tip)}</span>
                            <span style={{fontWeight:700, color:UI.ink}}>{afiseazaInterval(e)}</span><span style={{color:UI.sub}}>{e.titlu}</span>
                          </div>
                        </div>
                      ))}
                      {indispViitor.length > 3 && (
                        <button onClick={() => toggleIndisp(idx)} style={{marginTop:'6px', padding:'4px 0', background:'none', border:'none', color:UI.purple, fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:F}}>{indispExpandat.has(idx) ? 'Arată mai puțin' : '+ ' + (indispViitor.length - 3) + ' perioade'}</button>
                      )}
                    </div>
                  )}
                  {!pd && showViitor.length > 0 && (
                    <div style={{marginTop:'12px'}}>
                      <div style={{fontSize:'12px', fontWeight:800, color:UI.ink, marginBottom:'8px'}}>Show-uri programate ({showViitor.length})</div>
                      {(showExpandat.has(idx) ? showViitor : showViitor.slice(0, 4)).map((e: any, i: number) => (
                        <div key={i} style={{padding:'5px 0', borderBottom:'1px solid '+UI.line}}>
                          <div style={{display:'flex', gap:'10px', fontSize:'13px', color:UI.sub}}>
                            <span style={{fontWeight:700, color:UI.ink, minWidth:'90px'}}>{afiseazaInterval(e)}</span><span>{e.titlu}</span>
                          </div>
                          {(e.descriere || e.created) && <div style={{fontSize:'10px', color:UI.faint, marginLeft:'80px'}}>{e.descriere ? e.descriere.slice(0,70) : ''}{e.descriere && e.created ? ' · ' : ''}{e.created ? 'pus ' + dataCreare(e.created) : ''}</div>}
                        </div>
                      ))}
                      {showViitor.length > 4 && (
                        <button onClick={() => toggleShow(idx)} style={{marginTop:'6px', padding:'4px 0', background:'none', border:'none', color:UI.purple, fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:F}}>{showExpandat.has(idx) ? 'Arată mai puțin' : '+ ' + (showViitor.length - 4) + ' show-uri'}</button>
                      )}
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
        {mod === 'perioada' && zileSelectate.size > 0 && (
          <div style={{position:'sticky', bottom:'20px', marginTop:'20px', background:UI.dark, borderRadius:UI.radius, padding:'16px 20px', boxShadow:'0 8px 30px rgba(0,0,0,0.25)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', flexWrap:'wrap'}}>
            <span style={{fontSize:'14px', fontWeight:700, color:'white'}}>{zileSelectate.size} {zileSelectate.size === 1 ? 'zi selectată' : 'zile selectate'}</span>
            <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
              <button onClick={() => setZileSelectate(new Set())} style={{padding:'10px 16px', background:'rgba(255,255,255,0.15)', color:'white', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F}}>Golește</button>
              <button onClick={copiazaPerioada} style={{padding:'10px 16px', background: copiat ? UI.green : 'rgba(255,255,255,0.15)', color:'white', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F, transition:'background 0.2s'}}>{copiat ? '✓ Copiat' : 'Copiază'}</button>
              <button onClick={trimitePerioadaInOferta} style={{display:'flex', alignItems:'center', gap:'6px', padding:'10px 16px', background:UI.green, color:'white', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F}}><Send size={14} /> Trimite în ofertă</button>
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
                      <div style={{display:'flex', alignItems:'center', gap:'10px', background:UI.card, borderRadius:'10px', borderTop:'1px solid '+(bifati.has(l.artist)?UI.green:UI.greenSoft), borderRight:'1px solid '+(bifati.has(l.artist)?UI.green:UI.greenSoft), borderBottom:'1px solid '+(bifati.has(l.artist)?UI.green:UI.greenSoft), borderLeft:'3px solid '+UI.green, padding:'10px 14px'}}>
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
