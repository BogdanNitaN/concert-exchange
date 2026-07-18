'use client'

import { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import DatePicker from '@/components/modules/shared/DatePicker'

const F = 'Montserrat,sans-serif'
const ADMIN_PASS = 'fwd26'

interface Artist {
  nume: string
  fee_standard: number
  lei_km: number
  cazare: string
  nr_persoane: number
  bilete_avion: number
  alcool_default: number
  categorie: string
}

// un artist adaugat in deviz, cu setarile lui
interface Linie {
  key: string
  artist: Artist
  tipPret: string
  feeLista: number
  fee: number
  leiKm: number
  useMarja: boolean
  cazare: string
  persoane: number
  bileteAvion: number
  tipMasa: 'diurna' | 'alacarte'
  zile: number
  diurnaPerPers: number
  useAlcool: boolean
  alcool: number
  useCag: boolean
  cagProcent: number
  cagSuma: number
  cagMod: 'procent' | 'suma'
  includeExport: boolean
}

const LUNI = ['ianuarie','februarie','martie','aprilie','mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie']
function formatData(v: string): string {
  if (!v) return ''
  // acccepta YYYY-MM-DD sau DD.MM.YYYY
  let d: Date | null = null
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) d = new Date(v)
  else if (/^\d{2}\.\d{2}\.\d{4}/.test(v)) { const [zi,lu,an] = v.split('.'); d = new Date(+an, +lu-1, +zi) }
  if (!d || isNaN(d.getTime())) return v
  return d.getDate() + ' ' + LUNI[d.getMonth()] + ' ' + d.getFullYear()
}

export default function OfertaPage() {
  const [authed, setAuthed] = useState(false)
  const [passInput, setPassInput] = useState('')
  const [artists, setArtists] = useState<Artist[]>([])
  const [search, setSearch] = useState('')
  const [linii, setLinii] = useState<Linie[]>([])

  const [fromCity, setFromCity] = useState('Bucuresti')
  const [toCity, setToCity] = useState('')
  const [locatie, setLocatie] = useState('')
  const [dataEveniment, setDataEveniment] = useState('')
  const [numeClient, setNumeClient] = useState('')
  const [km, setKm] = useState<number | null>(null)
  const [loadingKm, setLoadingKm] = useState(false)
  const [eurRate, setEurRate] = useState<number | null>(null)
  const [useAdaos, setUseAdaos] = useState(false)
  const [destinatar, setDestinatar] = useState<'' | 'client' | 'intermediar'>('')
  const [institutiePublica, setInstitutiePublica] = useState(false)
  const [adaosProcent, setAdaosProcent] = useState(1)

  useEffect(() => {
    if (!authed) return
    fetch('/api/oferta-artist').then(r => r.json()).then(d => setArtists(d.artists || []))
    fetch('/api/bnr-rate').then(r => r.json()).then(d => { if (d?.rate) setEurRate(d.rate) })
  }, [authed])

  function addArtist(a: Artist) {
    setLinii(prev => [...prev, {
      key: a.nume + '-' + Date.now(),
      artist: a,
      tipPret: 'Standard',
      feeLista: a.fee_standard,
      fee: a.fee_standard,
      leiKm: a.lei_km,
      useMarja: true,
      cazare: a.cazare,
      persoane: a.nr_persoane,
      bileteAvion: a.bilete_avion || 0,
      tipMasa: 'diurna',
      zile: 1,
      diurnaPerPers: 180,
      useAlcool: false,
      alcool: a.alcool_default || 0,
      useCag: false,
      cagProcent: 10,
      cagSuma: 0,
      cagMod: 'procent',
      includeExport: true,
    }])
    setSearch('')
  }

  function updateLinie(key: string, patch: Partial<Linie>) {
    setLinii(prev => prev.map(l => l.key === key ? { ...l, ...patch } : l))
  }
  function removeLinie(key: string) {
    setLinii(prev => prev.filter(l => l.key !== key))
  }

  async function calcTransport() {
    if (!toCity.trim()) return
    setLoadingKm(true)
    try {
      const r = await fetch('/api/distance?to=' + encodeURIComponent(toCity) + '&from=' + encodeURIComponent(fromCity))
      const d = await r.json()
      if (d?.km) setKm(d.km)
    } catch {}
    setLoadingKm(false)
  }

  // calcule per linie
  function calcLinie(l: Linie) {
    const marjaProc = km !== null && km > 300 ? 0.065 : 0.115
    const kmTotal = km !== null ? (l.useMarja ? (km + Math.round(km * marjaProc)) * 2 : km * 2) : 0
    const transportLei = kmTotal > 0 && l.leiKm > 0 ? Math.round(kmTotal * l.leiKm / 10) * 10 : 0
    const diurnaTotal = l.tipMasa === 'diurna' ? l.persoane * l.diurnaPerPers * l.zile : 0
    const alcoolTotal = l.useAlcool ? l.alcool : 0
    const discount = l.feeLista > l.fee ? l.feeLista - l.fee : 0
    const cursAdaos = eurRate ? eurRate * (1 + (useAdaos ? adaosProcent : 0) / 100) : 0
    const savingLei = discount > 0 && eurRate ? Math.round(discount * eurRate) : 0
    let cag = 0
    
    if (l.useCag) {
      if (l.cagMod === 'suma') cag = l.cagSuma
      else { cag = Math.round(l.fee * l.cagProcent / 100); if (cag > 1000) cag = 1000 }
    }
    const netGigx = l.fee - cag
    const feeLeiConv = eurRate ? Math.round(l.fee * (cursAdaos || eurRate)) : 0
    return { kmTotal, transportLei, diurnaTotal, alcoolTotal, discount, cursAdaos, savingLei, cag, netGigx, feeLeiConv }
  }

  function genText(): string {
    const out: string[] = []
    for (const l of linii.filter(x => x.includeExport)) {
      const c = calcLinie(l)
      out.push('*' + l.artist.nume.toUpperCase() + '*')

      if (institutiePublica) {
        // format oficial in lei
        if (dataEveniment) out.push('Disponibilitate: ' + formatData(dataEveniment))
        out.push('Onorariu: ' + c.feeLeiConv.toLocaleString('ro-RO') + ' lei + TVA')
        if (c.transportLei > 0) out.push('Transport: ' + c.transportLei.toLocaleString('ro-RO') + ' lei + TVA')
        out.push('Cazare: ' + l.cazare)
        if (l.tipMasa === 'diurna' && c.diurnaTotal > 0) out.push('Masa: ' + c.diurnaTotal.toLocaleString('ro-RO') + ' lei + TVA')
        if (l.tipMasa === 'alacarte') out.push('Masa: a la carte ' + l.persoane + ' pers (pranz, cina) + mic dejun la hotel')
        if (c.alcoolTotal > 0) out.push('Protocol alcool: ' + c.alcoolTotal.toLocaleString('ro-RO') + ' lei + TVA')
        out.push('Protocol ' + l.persoane + ' persoane')
        // echivalent euro defalcat
        out.push('(echivalent: ' + l.fee + ' EUR onorariu, curs ' + c.cursAdaos.toFixed(4) + ' lei/EUR)')
      } else {
        // format comercial normal
        const parts: string[] = []
        parts.push(l.fee + ' EUR + TVA')
        if (c.transportLei > 0) parts.push('transport ' + l.leiKm + ' lei/km x ' + c.kmTotal + ' km = ' + c.transportLei.toLocaleString('ro-RO') + ' lei + TVA')
        if (km !== null && km > 300 && l.bileteAvion > 0) parts.push(l.bileteAvion + (l.bileteAvion === 1 ? ' bilet avion' : ' bilete avion'))
        parts.push('cazare ' + l.cazare)
        parts.push('protocol ' + l.persoane + ' persoane')
        if (l.tipMasa === 'diurna' && c.diurnaTotal > 0) parts.push('diurna ' + c.diurnaTotal.toLocaleString('ro-RO') + ' lei + TVA')
        if (l.tipMasa === 'alacarte') parts.push('masa a la carte ' + l.persoane + ' pers (pranz, cina) + mic dejun la hotel')
        if (c.alcoolTotal > 0) parts.push('protocol alcool ' + c.alcoolTotal.toLocaleString('ro-RO') + ' lei + TVA')
        out.push(parts.join(' || '))
        if (destinatar === 'client' && c.discount > 0) out.push('SALVEZI: ' + c.discount + ' EUR' + (c.savingLei > 0 ? ' (aprox ' + c.savingLei.toLocaleString('ro-RO') + ' lei)' : ''))
      }
      out.push('')
    }
    return out.join('\n').trim()
  }

  async function downloadPDF() {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const W = 210, M = 18
    let y = 0
    // Helvetica nu suporta diacritice - le scot
    const noDia = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ș/g,'s').replace(/Ș/g,'S').replace(/ț/g,'t').replace(/Ț/g,'T').replace(/ă/g,'a').replace(/Ă/g,'A').replace(/â/g,'a').replace(/Â/g,'A').replace(/î/g,'i').replace(/Î/g,'I')

    // helper: incarca imagine ca dataURL
    async function toDataUrl(url: string): Promise<string | null> {
      try {
        const res = await fetch(url)
        const blob = await res.blob()
        return await new Promise(resolve => {
          const r = new FileReader()
          r.onloadend = () => resolve(r.result as string)
          r.readAsDataURL(blob)
        })
      } catch { return null }
    }

    // === HEADER degradeu turcoaz cu diagonala ===
    const steps = 80
    for (let i = 0; i < steps; i++) {
      const t = i / steps
      const r = Math.round(180 + (100 - 180) * t)  // b4->64
      const g = Math.round(247 + (210 - 247) * t)   // f7->d2
      const b = Math.round(249 + (244 - 249) * t)    // f9->f4
      doc.setFillColor(r, g, b)
      doc.rect((W / steps) * i, 0, W / steps + 0.5, 38, 'F')
    }
    // diagonala: triunghi alb decupat jos-dreapta (forma interesanta)
    doc.setFillColor(255, 255, 255)
    doc.triangle(W, 30, W, 42, W - 60, 42, 'F')
    doc.triangle(0, 38, 0, 44, 70, 44, 'F')

    // logo Forward dreapta
    const logo = await toDataUrl('/forward-logo.png')
    if (logo) doc.addImage(logo, 'PNG', W - M - 34, 8, 34, 21)

    // text header stanga
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16)
    doc.text('FORWARD AGENCY', M, 16)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
    doc.text('Your #1 Artist Booking & Advising Agency', M, 22)

    y = 52

    // === NR OFERTA + validitate (dreapta sus sub header) ===
    const nrOferta = 'GIGX-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random()*9000)+1000)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(140,140,140)
    doc.text('Nr. ' + nrOferta, W - M, 48, { align: 'right' })

    // === DETALII DE COLABORARE ===
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(120,120,120)
    doc.text('DETALII DE COLABORARE', M, y)
    y += 9

    // client MAJUSCULE
    if (numeClient) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.setTextColor(28,25,23)
      doc.text(noDia(numeClient.toUpperCase()), M, y)
      y += 8
    }
    // oras + locatie + data
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(100,100,100)
    const sub = [toCity, locatie].filter(Boolean).join(' · ')
    if (sub) { doc.text(noDia(sub), M, y); y += 5 }
    if (dataEveniment) { doc.text(noDia('Eveniment: ' + formatData(dataEveniment)), M, y); y += 5 }
    y += 6

    // === ARTISTI ===
    const activi = linii.filter(l => l.includeExport)
    for (const l of activi) {
      const c = calcLinie(l)
      if (y > 235) { doc.addPage(); y = 20 }

      // foto artist (stanga)
      const imgUrl = 'https://i.scdn.co/image/' // se ia din DB via prom-images
      let photo: string | null = null
      try {
        const pr = await fetch('/api/oferta-poze')
        const imgs = await pr.json()
        if (imgs[l.artist.nume]) photo = await toDataUrl(imgs[l.artist.nume])
      } catch {}
      const textX = photo ? M + 24 : M
      if (photo) {
        try { doc.addImage(photo, 'JPEG', M, y, 20, 20) } catch {}
      }

      doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(28,25,23)
      doc.text(noDia(l.artist.nume.toUpperCase()), textX, y + 5)
      let ly = y + 11

      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(60,60,60)
      const rows: string[] = []
      rows.push('Onorariu: ' + l.fee + ' EUR + TVA')
      if (c.transportLei > 0) rows.push('Transport: ' + l.leiKm + ' lei/km x ' + c.kmTotal + ' km = ' + c.transportLei.toLocaleString('ro-RO') + ' lei + TVA')
      if (km !== null && km > 300 && l.bileteAvion > 0) rows.push('Avion: ' + l.bileteAvion + (l.bileteAvion === 1 ? ' bilet' : ' bilete') + ' + transfer auto')
      rows.push('Cazare: ' + l.cazare + ' (' + l.persoane + ' persoane)')
      if (l.tipMasa === 'diurna' && c.diurnaTotal > 0) rows.push('Diurna: ' + c.diurnaTotal.toLocaleString('ro-RO') + ' lei + TVA')
      if (l.tipMasa === 'alacarte') rows.push('Masa: a la carte ' + l.persoane + ' pers (pranz, cina) + mic dejun la hotel')
      if (c.alcoolTotal > 0) rows.push('Protocol alcool: ' + c.alcoolTotal.toLocaleString('ro-RO') + ' lei + TVA')
      for (const rr of rows) { doc.text(noDia(rr), textX, ly); ly += 5 }

      if (destinatar === 'client' && c.discount > 0) {
        doc.setFont('helvetica', 'bold'); doc.setTextColor(5,150,105)
        doc.text('SALVEZI: ' + c.discount + ' EUR' + (c.savingLei > 0 ? ' (aprox ' + c.savingLei.toLocaleString('ro-RO') + ' lei)' : ''), textX, ly)
        ly += 5
      }
      y = Math.max(ly, y + 22) + 12
    }

    // validitate pe randuri (respecta latimea)
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5); doc.setTextColor(150,150,150)
    const valid = doc.splitTextToSize('Oferta valabila 48 de ore de la momentul emiterii. Preturile nu includ TVA.', W - 2*M - 2)
    doc.text(valid, M, y)

    // === FOOTER cu ambii contacte ===
    const fy = 258
    doc.setDrawColor(129, 212, 242); doc.setLineWidth(0.8)
    doc.line(M, fy, W - M, fy)
    doc.setLineWidth(0.2)
    // Bogdan - stanga
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(28,25,23)
    doc.text('Bogdan Nita', M, fy + 6)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(80,80,80)
    doc.text('Managing Partner, Artist Booking & Advisor', M, fy + 10.5)
    doc.text('+40 751 144 109  ·  bogdan@forward.ro', M, fy + 14.5)
    // Alexandra - dreapta
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(28,25,23)
    doc.text('Alexandra Stefan', W/2 + 10, fy + 6)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(80,80,80)
    doc.text('Assistant Contracting, Logistics & Booking Support', W/2 + 10, fy + 10.5)
    doc.text('alexandra.stefan@forward.ro', W/2 + 10, fy + 14.5)
    // linia + generat + GIGx jos
    const now = new Date()
    doc.setFontSize(7.5); doc.setTextColor(150,150,150)
    doc.text('Generat: ' + now.toLocaleDateString('ro-RO') + ' ' + now.toLocaleTimeString('ro-RO', {hour:'2-digit',minute:'2-digit'}), M, fy + 24)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9)
    const gx = W - M - 20
    doc.setTextColor(28,25,23); doc.text('powered by GIG', gx, fy + 24)
    const gw = doc.getTextWidth('powered by GIG')
    doc.setTextColor(5,150,105); doc.text('x', gx + gw, fy + 24)

    const filename = 'colaborare-' + (toCity || 'gigx').toLowerCase().replace(/\s+/g,'-') + '.pdf'
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

    if (isMobile && navigator.share) {
      // mobil: share nativ cu PDF atasat
      try {
        const blob = doc.output('blob')
        const file = new File([blob], filename, { type: 'application/pdf' })
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Ofertă GIGx' })
          return
        }
      } catch { /* daca share esueaza, cad pe descarcare */ }
    }
    // desktop sau fallback: descarcare
    doc.save(filename)
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e7e5e4', fontSize: '14px', fontFamily: F, boxSizing: 'border-box', color: '#1c1917' }
  const label: React.CSSProperties = { fontSize: '11px', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }

  if (!authed) {
    return (
      <div style={{minHeight:'100vh', background:'#f5f5f7', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F}}>
        <div style={{background:'white', padding:'40px', borderRadius:'16px', border:'2px solid #e7e5e4', width:'320px'}}>
          <div style={{fontSize:'22px', fontWeight:800, marginBottom:'6px'}}>GIG<span style={{color:'#059669'}}>x</span> Admin</div>
          <div style={{fontSize:'13px', color:'#78716c', marginBottom:'20px'}}>Generator deviz intern</div>
          <input type="password" placeholder="Parola" value={passInput}
            onChange={e => setPassInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && passInput === ADMIN_PASS) setAuthed(true) }}
            style={inputStyle} />
          <button onClick={() => { if (passInput === ADMIN_PASS) setAuthed(true) }}
            style={{width:'100%', marginTop:'12px', padding:'11px', background:'#1c1917', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:F}}>
            Intra
          </button>
        </div>
      </div>
    )
  }

  const filtered = search ? artists.filter(a => a.nume.toLowerCase().includes(search.toLowerCase())) : []

  return (
    <div style={{minHeight:'100vh', background:'#f5f5f7', fontFamily:F, padding:'32px 20px'}}>
      <div style={{maxWidth:'1100px', margin:'0 auto'}}>
        <div style={{fontSize:'24px', fontWeight:800, marginBottom:'24px'}}>GIG<span style={{color:'#059669'}}>x</span> · Generator deviz</div>

        {/* client + eveniment */}
        <div style={{background:'white', padding:'20px', borderRadius:'14px', border:'2px solid #e7e5e4', marginBottom:'20px'}}>
          <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'12px', marginBottom:'12px'}}>
            <div><label style={label}>Denumire client / instituție</label>
              <input value={numeClient} onChange={e => setNumeClient(e.target.value)} placeholder="ex: Primăria Focșani" style={inputStyle} /></div>
            <div><label style={label}>Data eveniment</label>
              <DatePicker value={dataEveniment} onChange={v => setDataEveniment(v)} placeholder="Alege data" /></div>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:'12px', alignItems:'end'}}>
            <div><label style={label}>Oraș plecare</label>
              <input value={fromCity} onChange={e => setFromCity(e.target.value)} style={inputStyle} /></div>
            <div><label style={label}>Destinație</label>
              <input value={toCity} onChange={e => setToCity(e.target.value)} onKeyDown={e => { if (e.key==='Enter') calcTransport() }} style={inputStyle} /></div>
            <div><label style={label}>Locație / Client</label>
              <input value={locatie} onChange={e => setLocatie(e.target.value)} placeholder="ex: Club Nish" style={inputStyle} /></div>
            <button onClick={calcTransport} style={{padding:'10px 20px', background:'#059669', color:'white', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer', fontFamily:F, whiteSpace:'nowrap'}}>
              {loadingKm ? '...' : 'Calculează'}
            </button>
          </div>
          {km !== null && <div style={{fontSize:'13px', color:'#059669', fontWeight:700, marginTop:'10px'}}>Distanță: {km} km dus-întors {(km + Math.round(km*(km>300?0.065:0.115)))*2} km cu marjă</div>}
          <div style={{display:'flex', gap:'16px', marginTop:'12px', alignItems:'center'}}>
            <label style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', cursor:'pointer', fontWeight:700}}>
              <input type="checkbox" checked={useAdaos} onChange={e => setUseAdaos(e.target.checked)} style={{width:'16px', height:'16px', accentColor:'#059669'}} />
              Aplică adaos curs BNR
            </label>
            <label style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', cursor:'pointer', fontWeight:700, color:'#7c3aed'}}>
              <input type="checkbox" checked={institutiePublica} onChange={e => setInstitutiePublica(e.target.checked)} style={{width:'16px', height:'16px', accentColor:'#7c3aed'}} />
              Instituție publică (ofertă în lei)
            </label>
            {useAdaos && <input type="number" step="0.1" value={adaosProcent} onChange={e => setAdaosProcent(Number(e.target.value))} style={{...inputStyle, width:'80px'}} />}
            {eurRate && <span style={{fontSize:'12px', color:'#78716c'}}>Curs BNR: {eurRate.toFixed(4)} lei/€</span>}
          </div>
        </div>

        {/* search adauga artist */}
        <div style={{background:'white', padding:'20px', borderRadius:'14px', border:'2px solid #e7e5e4', marginBottom:'20px', position:'relative'}}>
          <label style={label}>Adaugă artist</label>
          <input placeholder="Caută și adaugă artist..." value={search}
            onChange={e => setSearch(e.target.value)} style={inputStyle} />
          {filtered.length > 0 && (
            <div style={{position:'absolute', top:'100%', left:'20px', right:'20px', background:'white', border:'1px solid #e7e5e4', borderRadius:'8px', marginTop:'4px', maxHeight:'240px', overflowY:'auto', zIndex:10, boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}>
              {filtered.map(a => (
                <div key={a.nume} onClick={() => addArtist(a)}
                  style={{padding:'10px 12px', cursor:'pointer', fontSize:'14px', borderBottom:'1px solid #f5f5f4'}}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f4')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                  {a.nume} <span style={{color:'#a8a29e', fontSize:'12px'}}>· {a.fee_standard}€</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* carduri artisti */}
        {linii.map(l => {
          const c = calcLinie(l)
          return (
            <div key={l.key} style={{background:'white', padding:'20px', borderRadius:'14px', border:'2px solid #e7e5e4', marginBottom:'16px'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                  <input type="checkbox" checked={l.includeExport} onChange={e => updateLinie(l.key, { includeExport: e.target.checked })} style={{width:'18px', height:'18px', accentColor:'#059669'}} />
                  <span style={{fontSize:'18px', fontWeight:800}}>{l.artist.nume}</span>
                </div>
                <button onClick={() => removeLinie(l.key)} style={{background:'none', border:'none', color:'#dc2626', cursor:'pointer', fontSize:'13px', fontWeight:600}}>Șterge</button>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'12px', marginBottom:'12px'}}>
                <div>
                  <label style={label}>Tip preț</label>
                  <select value={l.tipPret} onChange={e => updateLinie(l.key, { tipPret: e.target.value })} style={inputStyle}>
                    <option>Standard</option><option>Bal</option><option>Privat</option><option>Corporate</option><option>Revelion</option>
                  </select>
                </div>
                <div><label style={label}>Preț listă (€)</label>
                  <input type="number" value={l.feeLista} onChange={e => updateLinie(l.key, { feeLista: Number(e.target.value) })} style={{...inputStyle, color:'#a8a29e'}} /></div>
                <div><label style={label}>Ofertă (€)</label>
                  <input type="number" value={l.fee} onChange={e => updateLinie(l.key, { fee: Number(e.target.value) })} style={inputStyle} /></div>
                <div><label style={label}>Lei/km</label>
                  <input type="number" step="0.1" value={l.leiKm} onChange={e => updateLinie(l.key, { leiKm: Number(e.target.value) })} style={inputStyle} /></div>
              </div>

              <div style={{display:'flex', gap:'16px', flexWrap:'wrap', marginBottom:'12px', alignItems:'center'}}>
                <label style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', cursor:'pointer'}}>
                  <input type="checkbox" checked={l.useMarja} onChange={e => updateLinie(l.key, { useMarja: e.target.checked })} style={{width:'16px', height:'16px', accentColor:'#059669'}} />
                  Marjă transport
                </label>
                {c.discount > 0 && <span style={{fontSize:'12px', color:'#059669', fontWeight:700}}>Discount {c.discount} € · economie {c.savingLei.toLocaleString('ro-RO')} lei</span>}
              </div>

              <div style={{marginBottom:'12px'}}>
                <label style={label}>Cazare</label>
                <input value={l.cazare} onChange={e => updateLinie(l.key, { cazare: e.target.value })} style={inputStyle} />
                <div style={{fontSize:'12px', color:'#78716c', marginTop:'4px'}}>Protocol: {l.persoane} persoane{km !== null && km > 300 && l.bileteAvion > 0 ? ' · ' + l.bileteAvion + (l.bileteAvion === 1 ? ' bilet avion' : ' bilete avion') : ''}</div>
              </div>

              <div style={{display:'flex', gap:'8px', marginBottom:'8px'}}>
                <button onClick={() => updateLinie(l.key, { tipMasa: 'diurna' })} style={{flex:1, padding:'8px', borderRadius:'8px', border:'1.5px solid '+(l.tipMasa==='diurna'?'#1c1917':'#e7e5e4'), background:l.tipMasa==='diurna'?'#1c1917':'white', color:l.tipMasa==='diurna'?'white':'#78716c', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F}}>Diurnă</button>
                <button onClick={() => updateLinie(l.key, { tipMasa: 'alacarte' })} style={{flex:1, padding:'8px', borderRadius:'8px', border:'1.5px solid '+(l.tipMasa==='alacarte'?'#1c1917':'#e7e5e4'), background:l.tipMasa==='alacarte'?'#1c1917':'white', color:l.tipMasa==='alacarte'?'white':'#78716c', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F}}>À la carte</button>
              </div>
              {l.tipMasa === 'diurna' ? (
                <div style={{display:'flex', gap:'8px', marginBottom:'12px'}}>
                  <div style={{flex:1}}><label style={label}>Lei/pers/zi</label><input type="number" value={l.diurnaPerPers} onChange={e => updateLinie(l.key, { diurnaPerPers: Number(e.target.value) })} style={inputStyle} /></div>
                  <div style={{flex:1}}><label style={label}>Zile</label><input type="number" value={l.zile} onChange={e => updateLinie(l.key, { zile: Number(e.target.value) })} style={inputStyle} /></div>
                  <div style={{flex:1}}><label style={label}>Total diurnă</label><div style={{padding:'10px 0', fontWeight:700}}>{c.diurnaTotal.toLocaleString('ro-RO')} lei</div></div>
                </div>
              ) : (
                <div style={{fontSize:'13px', color:'#78716c', padding:'8px', background:'#f5f5f4', borderRadius:'8px', marginBottom:'12px'}}>Masă à la carte {l.persoane} pers (prânz, cină) + mic dejun la hotel</div>
              )}

              <label style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', cursor:'pointer', fontWeight:700}}>
                <input type="checkbox" checked={l.useAlcool} onChange={e => updateLinie(l.key, { useAlcool: e.target.checked })} style={{width:'16px', height:'16px', accentColor:'#059669'}} />
                Protocol alcool
              </label>
              {l.useAlcool && <input type="number" placeholder="Sumă lei" value={l.alcool} onChange={e => updateLinie(l.key, { alcool: Number(e.target.value) })} style={{...inputStyle, marginTop:'8px'}} />}

              <div style={{marginTop:'16px', paddingTop:'16px', borderTop:'1px dashed #e7e5e4'}}>
                <label style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', cursor:'pointer', fontWeight:700}}>
                  <input type="checkbox" checked={l.useCag} onChange={e => updateLinie(l.key, { useCag: e.target.checked })} style={{width:'16px', height:'16px', accentColor:'#7c3aed'}} />
                  CAG · comision agenție (intern)
                </label>
                {l.useCag && (
                  <div style={{marginTop:'8px', display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap'}}>
                    <div style={{display:'flex', gap:'4px'}}>
                      <button onClick={() => updateLinie(l.key, { cagMod: 'procent' })} style={{padding:'6px 12px', borderRadius:'6px', border:'1.5px solid '+(l.cagMod==='procent'?'#7c3aed':'#e7e5e4'), background:l.cagMod==='procent'?'#7c3aed':'white', color:l.cagMod==='procent'?'white':'#78716c', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:F}}>%</button>
                      <button onClick={() => updateLinie(l.key, { cagMod: 'suma' })} style={{padding:'6px 12px', borderRadius:'6px', border:'1.5px solid '+(l.cagMod==='suma'?'#7c3aed':'#e7e5e4'), background:l.cagMod==='suma'?'#7c3aed':'white', color:l.cagMod==='suma'?'white':'#78716c', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:F}}>€ fix</button>
                    </div>
                    {l.cagMod === 'procent'
                      ? <input type="number" value={l.cagProcent} onChange={e => updateLinie(l.key, { cagProcent: Number(e.target.value) })} style={{...inputStyle, width:'90px'}} placeholder="%" />
                      : <input type="number" value={l.cagSuma} onChange={e => updateLinie(l.key, { cagSuma: Number(e.target.value) })} style={{...inputStyle, width:'110px'}} placeholder="€" />}
                    <span style={{fontSize:'13px', fontWeight:700, color:'#7c3aed'}}>CAG: {c.cag} € {l.cagMod === 'procent' && c.cag === 1000 ? '(plafon)' : ''}</span>
                    <span style={{fontSize:'13px', color:'#78716c'}}>· Net GIGx: <strong>{c.netGigx} €</strong></span>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* cheia de control + export */}
        {linii.length > 0 && (
          <div style={{background:'#1c1917', padding:'20px', borderRadius:'14px', marginTop:'8px'}}>
            {/* CHEIA DE CONTROL */}
            <div style={{marginBottom:'16px', padding:'14px', borderRadius:'10px', background: destinatar ? 'rgba(5,150,105,0.15)' : 'rgba(234,88,12,0.15)', border:'1.5px solid ' + (destinatar ? 'rgba(5,150,105,0.4)' : 'rgba(234,88,12,0.5)')}}>
              <div style={{fontSize:'13px', fontWeight:700, color: destinatar ? '#6ee7b7' : '#fdba74', marginBottom:'10px', display:'flex', alignItems:'center', gap:'6px'}}>
                {!destinatar && '⚠️ '}Pentru cine este oferta?
              </div>
              <div style={{display:'flex', gap:'8px'}}>
                <button onClick={() => setDestinatar('client')}
                  style={{flex:1, padding:'10px', borderRadius:'8px', border:'1.5px solid ' + (destinatar==='client'?'#059669':'#44403c'), background: destinatar==='client'?'#059669':'transparent', color: destinatar==='client'?'white':'#a8a29e', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:F}}>
                  Client {destinatar==='client' ? '✓' : ''}
                </button>
                <button onClick={() => setDestinatar('intermediar')}
                  style={{flex:1, padding:'10px', borderRadius:'8px', border:'1.5px solid ' + (destinatar==='intermediar'?'#059669':'#44403c'), background: destinatar==='intermediar'?'#059669':'transparent', color: destinatar==='intermediar'?'white':'#a8a29e', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:F}}>
                  Intermediar {destinatar==='intermediar' ? '✓' : ''}
                </button>
              </div>
              {destinatar === 'client' && <div style={{fontSize:'12px', color:'#6ee7b7', marginTop:'8px'}}>Se afișează economia (SALVEZI)</div>}
              {destinatar === 'intermediar' && <div style={{fontSize:'12px', color:'#a8a29e', marginTop:'8px'}}>Sumă fără mențiune de comision</div>}
            </div>

            {/* BUTOANE EXPORT - blocate pana selectezi destinatar */}
            <div style={{display:'flex', gap:'8px', flexWrap:'wrap', opacity: destinatar ? 1 : 0.4, pointerEvents: destinatar ? 'auto' : 'none'}}>
              <button onClick={() => { navigator.clipboard.writeText(genText()); alert('Deviz copiat!') }}
                style={{flex:1, minWidth:'120px', padding:'12px', background:'#059669', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:F}}>Copiază tot</button>
              <button onClick={() => window.open('https://wa.me/?text=' + encodeURIComponent(genText()), '_blank')}
                style={{flex:1, minWidth:'120px', padding:'12px', background:'#25D366', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:F}}>WhatsApp</button>
              <button onClick={() => window.open('mailto:?subject=' + encodeURIComponent('Oferta GIGx ' + toCity) + '&body=' + encodeURIComponent(genText().replace(/\*/g, '')))}
                style={{flex:1, minWidth:'120px', padding:'12px', background:'#3b82f6', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:F}}>Email</button>
              <button onClick={() => downloadPDF()}
                style={{flex:1, minWidth:'120px', padding:'12px', background:'#7c3aed', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:F}}>{typeof window !== 'undefined' && window.innerWidth < 768 ? 'Distribuie PDF' : 'Descarcă PDF'}</button>
            </div>
          </div>
        )}

        {/* zona print (ascunsa pe ecran, apare la print) */}
        <div className="print-only" style={{display:'none'}}>
          <div style={{whiteSpace:'pre-wrap', fontSize:'13px', lineHeight:1.6}}>{genText()}</div>
          <div style={{marginTop:'30px', paddingTop:'16px', borderTop:'1px solid #ccc', fontSize:'11px', color:'#555'}}>
            Ofertă generată: {new Date().toLocaleDateString('ro-RO')} {new Date().toLocaleTimeString('ro-RO', {hour:'2-digit', minute:'2-digit'})}<br/>
            <strong>Bogdan Niță</strong> · Managing Partner, Artist Booking &amp; Advisor · +40 751 144 109
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
          .print-only { display: block !important; position: absolute; top: 0; left: 0; width: 100%; padding: 40px; }
        }
      `}</style>
    </div>
  )
}
