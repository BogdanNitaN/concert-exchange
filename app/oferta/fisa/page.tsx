'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { jsPDF } from 'jspdf'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const F = 'Montserrat,sans-serif'
const UI = { bg:'#f5f5f7', ink:'#1c1917', sub:'#57534e', faint:'#a8a29e', line:'#e7e5e4', green:'#059669', greenSoft:'#ecfdf5' }
const inp: React.CSSProperties = { width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1.5px solid '+UI.line, fontSize:'14px', fontFamily:F, color:UI.ink, outline:'none', boxSizing:'border-box', background:'white' }
const lbl: React.CSSProperties = { fontSize:'11px', fontWeight:700, color:UI.sub, textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:'5px', display:'block' }
const card: React.CSSProperties = { background:'white', border:'1px solid '+UI.line, borderRadius:'14px', padding:'16px 18px', marginBottom:'14px' }

export default function FisaEveniment() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [artists, setArtists] = useState<any[]>([])
  const [locatii, setLocatii] = useState<any[]>([])
  const [f, setF] = useState<any>({
    artist:'', data_eveniment:'', oras:'', locatie:'', obs_eveniment:'',
    ora_soundcheck:'Se stabilește împreună cu contactul tehnic', ora_performance:'', durata:'', contact_locatie:'', contact_tehnic:'',
    hotel:'', camere:'', restaurant:'', obs_cazare:'', email_productie:'', email_client:'', reply_to:'alexandra.stefan@forward.ro',
  })
  const [preview, setPreview] = useState('')
  const [msg, setMsg] = useState('')
  const [trimit, setTrimit] = useState(false)
  const [waTel, setWaTel] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) { setAuthed(true); incarca() } else setChecking(false)
    })
  }, [])

  async function incarca() {
    setChecking(false)
    const rl = await fetch('/api/fisa-eveniment').then(r => r.json()).catch(() => ({ locatii: [], artisti: [] }))
    setArtists(rl.artisti || [])
    setLocatii(rl.locatii || [])
  }

  function set(k: string, v: string) { setF((p: any) => ({ ...p, [k]: v })); setPreview('') }

  async function alegeArtist(nume: string) {
    const a = artists.find(x => x.nume === nume)
    setF((p: any) => ({
      ...p, artist: nume,
      camere: a?.cazare || p.camere,
      durata: a?.set_type === 'dj' ? '90-120 min' : (a?.durata_default || p.durata),
      restaurant: a?.diurna_fixa ? `Diurnă ${a.diurna_fixa} lei/pers` : p.restaurant,
      email_productie: a?.email_productie || '',
    }))
    setPreview('')
  }

  function alegeLocatie(nume: string) {
    const l = locatii.find(x => x.nume === nume)
    setF((p: any) => ({ ...p, locatie: nume, oras: l?.oras || p.oras, contact_locatie: l?.contact_locatie || p.contact_locatie, contact_tehnic: l?.contact_tehnic || p.contact_tehnic }))
    setPreview('')
  }

  async function vezi() {
    const r = await fetch('/api/fisa-eveniment', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...f, actiune:'preview' }) })
    const d = await r.json()
    if (d.ok) setPreview(d.html)
  }

  async function trimite() {
    if (!f.email_productie && !f.email_client) { setMsg('Adaugă cel puțin un email.'); return }
    setTrimit(true); setMsg('')
    // salveaza emailul artistului si locatia pentru data viitoare
    if (f.artist && f.email_productie) fetch('/api/fisa-eveniment', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ actiune:'salveaza_email_artist', artist:f.artist, email_productie:f.email_productie }) })
    if (f.locatie) fetch('/api/fisa-eveniment', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ actiune:'salveaza_locatie', locatie:f.locatie, oras:f.oras, contact_locatie:f.contact_locatie, contact_tehnic:f.contact_tehnic }) })
    const r = await fetch('/api/fisa-eveniment', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...f, actiune:'trimite' }) })
    const d = await r.json()
    setTrimit(false)
    setMsg(d.ok ? '✓ Trimisă către: ' + (d.trimisLa || []).join(', ') : 'Eroare: ' + (d.error || 'necunoscută'))
  }

  function genereazaPDF(): any {
    const noDia = (t: string) => (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ș/g,'s').replace(/Ș/g,'S').replace(/ț/g,'t').replace(/Ț/g,'T').replace(/ă/g,'a').replace(/Ă/g,'A').replace(/â/g,'a').replace(/Â/g,'A').replace(/î/g,'i').replace(/Î/g,'I')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const M = 20, W = 210
    let y = 22

    // bara laterala verticala
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(160,160,160)
    doc.text('B O O K I N G   D E T A I L S', 8, 150, { angle: 90 })

    // SUMAR box
    doc.setDrawColor(220,218,216); doc.setLineWidth(0.3)
    doc.rect(M, y, W - 2*M, 22)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(90,85,80)
    doc.text('SUMAR', M + 4, y + 7)
    doc.setFontSize(11); doc.setTextColor(28,25,23)
    doc.text(noDia((f.artist || '').toUpperCase()), M + 30, y + 6)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(90,85,80)
    doc.text(noDia(dataRoPDF(f.data_eveniment) + (f.oras ? ', ' + f.oras.toUpperCase() : '')), M + 30, y + 12)
    doc.setFont('helvetica', 'bold'); doc.setTextColor(28,25,23)
    doc.text(noDia((f.locatie || '').toUpperCase()), M + 30, y + 18)
    y += 34

    const sectiune = (titlu: string, randuri: [string, string][]) => {
      doc.setFillColor(245,245,244); doc.rect(M, y, W - 2*M, 9, 'F')
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(40,37,35)
      doc.text(noDia(titlu), W/2, y + 6, { align: 'center' })
      y += 13
      doc.setDrawColor(230,228,226); doc.setLineWidth(0.2)
      for (const [et, val] of randuri.filter(r => r[1])) {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(90,85,80)
        doc.text(noDia(et), M + 2, y + 5)
        doc.setFont('helvetica', 'normal'); doc.setTextColor(28,25,23)
        doc.text(noDia(val), M + 52, y + 5)
        doc.line(M, y + 8, W - M, y + 8)
        y += 9
      }
      y += 6
    }

    sectiune('DETALII EVENIMENT', [['DATA', dataRoPDF(f.data_eveniment)], ['ORAS', f.oras], ['LOCATIE', f.locatie], ['OBSERVATII', f.obs_eveniment]])
    sectiune('TECHNICAL RIDER', [['ORA SOUNDCHECK', f.ora_soundcheck], ['ORA PERFORMANCE', f.ora_performance], ['DURATA', f.durata], ['CONTACT LOCATIE', f.contact_locatie], ['CONTACT TEHNIC', f.contact_tehnic]])
    sectiune('ACCOMMODATION RIDER', [['HOTEL', f.hotel], ['CAMERE', f.camere], ['RESTAURANT', f.restaurant], ['OBSERVATII', f.obs_cazare]])

    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(150,150,150)
    doc.text('Forward Agency  ·  Ghetarilor no 2, sector 1, Bucuresti  ·  www.forward.ro', W/2, 285, { align: 'center' })

    return doc
  }

  function dataRoPDF(d: string): string {
    if (!d) return ''
    const L = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie']
    const m = d.slice(0,10).match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!m) return d
    return parseInt(m[3],10) + ' ' + L[parseInt(m[2],10)-1] + ' ' + m[1]
  }

  async function trimiteWhatsApp() {
    const doc = genereazaPDF()
    const filename = `Fisa_${(f.artist||'eveniment').replace(/[^a-zA-Z0-9]/g,'_')}_${f.data_eveniment||''}.pdf`
    const blob = doc.output('blob')
    const file = new File([blob], filename, { type: 'application/pdf' })
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'Fisa ' + f.artist }); return } catch {}
    }
    // desktop / fallback: descarca PDF + deschide WhatsApp
    doc.save(filename)
    const tel = waTel.replace(/[^0-9]/g, '')
    const num = tel ? (tel.startsWith('40') ? tel : '40' + tel.replace(/^0/, '')) : ''
    setTimeout(() => window.open(`https://wa.me/${num}?text=${encodeURIComponent('Fisa eveniment ' + f.artist + ' - atasez PDF-ul')}`, '_blank'), 400)
  }

  async function testeaza() {
    setTrimit(true); setMsg('')
    const r = await fetch('/api/fisa-eveniment', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...f, actiune:'test' }) })
    const d = await r.json()
    setTrimit(false)
    setMsg(d.ok ? '✓ TEST trimis către bogdan@forward.ro (nimic salvat)' : 'Eroare test: ' + (d.error || 'necunoscută'))
  }

    function whatsapp() {
    const txt = `Fișă eveniment ${f.artist}\n${f.data_eveniment}${f.oras ? ', ' + f.oras : ''}\n${f.locatie}\n\nPerformance: ${f.ora_performance} (${f.durata})\nSoundcheck: ${f.ora_soundcheck}\nContact tehnic: ${f.contact_tehnic}\nHotel: ${f.hotel} — ${f.camere}`
    const tel = waTel.replace(/[^0-9]/g, '')
    window.open(`https://wa.me/${tel ? (tel.startsWith('40') ? tel : '40' + tel.replace(/^0/, '')) : ''}?text=${encodeURIComponent(txt)}`, '_blank')
  }

  if (checking) return <div style={{minHeight:'100vh', background:UI.bg, fontFamily:F, display:'flex', alignItems:'center', justifyContent:'center', color:UI.faint}}>Se încarcă…</div>
  if (!authed) return <div style={{minHeight:'100vh', background:UI.bg, fontFamily:F, display:'flex', alignItems:'center', justifyContent:'center'}}><div style={{textAlign:'center'}}><div style={{fontWeight:800, color:UI.ink, marginBottom:8}}>Autentificare necesară</div><Link href="/oferta" style={{color:UI.green, fontWeight:700, textDecoration:'none'}}>→ Mergi la /oferta</Link></div></div>

  return (
    <div style={{minHeight:'100vh', background:UI.bg, fontFamily:F, padding:'20px 14px 60px'}}>
      <div style={{maxWidth:'620px', margin:'0 auto'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px'}}>
          <div style={{fontSize:'21px', fontWeight:800, color:UI.ink}}>Fișă eveniment</div>
          <Link href="/oferta" style={{fontSize:'13px', color:UI.green, fontWeight:700, textDecoration:'none'}}>← Deviz</Link>
        </div>

        <div style={card}>
          <div style={{fontSize:'12px', fontWeight:800, color:UI.green, marginBottom:'12px', textTransform:'uppercase', letterSpacing:'0.05em'}}>Artist</div>
          <label style={lbl}>Artist</label>
          <input list="artisti-list" value={f.artist} onChange={e => alegeArtist(e.target.value)} placeholder="Caută artistul… (ex: rar → rareș)" style={inp} />
          <datalist id="artisti-list">{artists.map(a => <option key={a.nume} value={a.nume}>{a.tip === 'intermediere' ? a.nume + ' (extern)' : a.nume}</option>)}</datalist>
          <div style={{marginTop:'10px'}}>
            <label style={lbl}>Email echipă artist (separate prin virgulă)</label>
            <input value={f.email_productie} onChange={e => set('email_productie', e.target.value)} placeholder="tehnic@…, manager@…" style={inp} />
            <div style={{fontSize:'10.5px', color:UI.faint, marginTop:'4px'}}>Se salvează automat pentru artistul ăsta la trimitere.</div>
          </div>
        </div>

        <div style={card}>
          <div style={{fontSize:'12px', fontWeight:800, color:UI.green, marginBottom:'12px', textTransform:'uppercase', letterSpacing:'0.05em'}}>Eveniment</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
            <div><label style={lbl}>Data</label><input type="date" value={f.data_eveniment} onChange={e => set('data_eveniment', e.target.value)} style={inp} /></div>
            <div><label style={lbl}>Oraș</label><input value={f.oras} onChange={e => set('oras', e.target.value)} style={inp} /></div>
          </div>
          <div style={{marginTop:'10px'}}>
            <label style={lbl}>Locație (alege salvată sau scrie nouă)</label>
            <input list="locatii-list" value={f.locatie} onChange={e => alegeLocatie(e.target.value)} placeholder="Nibiru Costinești / Primăria X / firma Y" style={inp} />
            <datalist id="locatii-list">{locatii.map(l => <option key={l.id} value={l.nume} />)}</datalist>
          </div>
          <div style={{marginTop:'10px'}}><label style={lbl}>Observații</label><input value={f.obs_eveniment} onChange={e => set('obs_eveniment', e.target.value)} style={inp} /></div>
        </div>

        <div style={card}>
          <div style={{fontSize:'12px', fontWeight:800, color:UI.green, marginBottom:'12px', textTransform:'uppercase', letterSpacing:'0.05em'}}>Show</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
            <div><label style={lbl}>Ora performance</label><input value={f.ora_performance} onChange={e => set('ora_performance', e.target.value)} placeholder="21:30" style={inp} /></div>
            <div><label style={lbl}>Durată</label><input value={f.durata} onChange={e => set('durata', e.target.value)} placeholder="20 min" style={inp} /></div>
          </div>
          <div style={{marginTop:'10px'}}><label style={lbl}>Ora soundcheck</label><input value={f.ora_soundcheck} onChange={e => set('ora_soundcheck', e.target.value)} style={inp} /></div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginTop:'10px'}}>
            <div><label style={lbl}>Contact locație</label><input value={f.contact_locatie} onChange={e => set('contact_locatie', e.target.value)} style={inp} /></div>
            <div><label style={lbl}>Contact tehnic</label><input value={f.contact_tehnic} onChange={e => set('contact_tehnic', e.target.value)} style={inp} /></div>
          </div>
        </div>

        <div style={card}>
          <div style={{fontSize:'12px', fontWeight:800, color:UI.green, marginBottom:'12px', textTransform:'uppercase', letterSpacing:'0.05em'}}>Cazare</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
            <div><label style={lbl}>Hotel</label><input value={f.hotel} onChange={e => set('hotel', e.target.value)} style={inp} /></div>
            <div><label style={lbl}>Camere</label><input value={f.camere} onChange={e => set('camere', e.target.value)} style={inp} /></div>
          </div>
          <div style={{marginTop:'10px'}}><label style={lbl}>Restaurant / diurnă</label><input value={f.restaurant} onChange={e => set('restaurant', e.target.value)} style={inp} /></div>
          <div style={{marginTop:'10px'}}><label style={lbl}>Observații</label><input value={f.obs_cazare} onChange={e => set('obs_cazare', e.target.value)} style={inp} /></div>
        </div>

        <div style={card}>
          <div style={{fontSize:'12px', fontWeight:800, color:UI.green, marginBottom:'12px', textTransform:'uppercase', letterSpacing:'0.05em'}}>Trimitere</div>
          <label style={lbl}>Email client</label>
          <input value={f.email_client} onChange={e => set('email_client', e.target.value)} placeholder="client@…" style={inp} />
          <div style={{fontSize:'10.5px', color:UI.faint, margin:'6px 0 12px'}}>De la Forward Agency · reply către Alexandra · CC bogdan@forward.ro</div>
          <div style={{display:'flex', gap:'8px', alignItems:'flex-end'}}>
            <div style={{flex:1}}><label style={lbl}>WhatsApp (opțional)</label><input value={waTel} onChange={e => setWaTel(e.target.value)} placeholder="07…" style={inp} /></div>
            <button onClick={trimiteWhatsApp} style={{padding:'10px 14px', background:'#25D366', color:'white', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'13px', cursor:'pointer', whiteSpace:'nowrap'}}>WhatsApp</button>
          </div>
        </div>

        <div style={{display:'flex', gap:'10px', marginTop:'4px'}}>
          <button onClick={vezi} style={{flex:1, padding:'13px', background:'white', color:UI.ink, border:'1.5px solid '+UI.line, borderRadius:'12px', fontWeight:700, fontSize:'14px', cursor:'pointer'}}>Vezi fișa</button>
          <button onClick={trimite} disabled={trimit} style={{flex:1, padding:'13px', background:UI.ink, color:'white', border:'none', borderRadius:'12px', fontWeight:700, fontSize:'14px', cursor:'pointer', opacity:trimit?0.6:1}}>{trimit ? 'Se trimite…' : 'Trimite pe email'}</button>
        </div>
        <button onClick={testeaza} disabled={trimit} style={{width:'100%', marginTop:'10px', padding:'11px', background:'white', color:UI.sub, border:'1.5px dashed '+UI.line, borderRadius:'12px', fontWeight:700, fontSize:'13px', cursor:'pointer', opacity:trimit?0.6:1}}>🧪 Trimite TEST (doar la tine, nu salvează nimic)</button>
        {msg && <div style={{marginTop:'12px', padding:'12px', borderRadius:'10px', background:msg.startsWith('✓')?UI.greenSoft:'#fef2f2', color:msg.startsWith('✓')?UI.green:'#dc2626', fontSize:'13px', fontWeight:600}}>{msg}</div>}

        {preview && (
          <div style={{marginTop:'18px'}}>
            <div style={{fontSize:'12px', fontWeight:700, color:UI.sub, marginBottom:'8px'}}>Previzualizare</div>
            <iframe srcDoc={preview} style={{width:'100%', height:'640px', border:'1px solid '+UI.line, borderRadius:'12px', background:'white'}} />
          </div>
        )}
      </div>
    </div>
  )
}
