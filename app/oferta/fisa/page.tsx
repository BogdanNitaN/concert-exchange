'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { jsPDF } from 'jspdf'
import DatePicker from '@/components/modules/shared/DatePicker'

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
    ora_soundcheck:'', ora_performance:'', durata:'', contact_locatie:'', contact_tehnic:'',
    hotel:'', camere:'', restaurant:'', obs_cazare:'', email_productie:'', email_client:'', reply_to:'alexandra.stefan@forward.ro',
  })
  const [preview, setPreview] = useState('')
  const [msg, setMsg] = useState('')
  const [trimit, setTrimit] = useState(false)
  const [waTel, setWaTel] = useState('')
  const [artQuery, setArtQuery] = useState('')
  const [orasSugestii, setOrasSugestii] = useState<{description: string}[]>([])
  const [showOrasSugg, setShowOrasSugg] = useState(false)
  const [artOpen, setArtOpen] = useState(false)

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

  async function cautaOras(q: string) {
    set('oras', q)
    if (q.length < 2) { setOrasSugestii([]); setShowOrasSugg(false); return }
    try {
      const r = await fetch('/api/places?input=' + encodeURIComponent(q) + '&type=cities')
      const d = await r.json()
      setOrasSugestii(d.predictions || d.suggestions || [])
      setShowOrasSugg(true)
    } catch { setOrasSugestii([]) }
  }

  async function alegeArtist(nume: string) {
    const a = artists.find(x => x.nume === nume)
    setF((p: any) => ({
      ...p, artist: nume,
      camere: a?.cazare || p.camere,
      durata: a?.set_type === 'dj' ? '90 min' : '40 min',
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
    const dest = [...String(f.email_productie || '').split(',').map(x => x.trim()).filter(Boolean), ...(f.email_client ? [f.email_client.trim()] : [])]
    if (!confirm('Trimiți fișa REALĂ către:\n\n' + dest.join('\n') + '\n\n(pentru probe folosește butonul TEST)')) return
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
    const noDia = (t: string) => (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0219/g,'s').replace(/\u0218/g,'S').replace(/\u021b/g,'t').replace(/\u021a/g,'T').replace(/\u0103/g,'a').replace(/\u0102/g,'A').replace(/\u00e2/g,'a').replace(/\u00c2/g,'A').replace(/\u00ee/g,'i').replace(/\u00ce/g,'I')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const M = 20, W = 210, R = W - M
    const INK = [28, 25, 23], SUB = [87, 83, 78], GREY = [130, 128, 125]
    let y = 22

    // ===== SUMAR (caseta cu eticheta stanga, ca in HTML) =====
    const sumarH = 24
    doc.setDrawColor(220, 218, 216); doc.setLineWidth(0.3)
    doc.rect(M, y, R - M, sumarH)
    doc.line(M + 34, y, M + 34, y + sumarH)
    doc.setFillColor(245, 245, 244); doc.rect(M, y, 34, sumarH, 'F')
    doc.rect(M, y, R - M, sumarH)  // reconturez dupa fill
    doc.line(M + 34, y, M + 34, y + sumarH)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(SUB[0], SUB[1], SUB[2])
    doc.text('SUMAR', M + 5, y + 6)
    doc.setFontSize(13); doc.setTextColor(INK[0], INK[1], INK[2])
    doc.text(noDia((f.artist || '').toUpperCase()), M + 40, y + 7)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(SUB[0], SUB[1], SUB[2])
    doc.text(noDia([dataRoPDF(f.data_eveniment), (f.oras || '').toUpperCase()].filter(Boolean).join(', ')), M + 40, y + 14)
    doc.setFont('helvetica', 'bold'); doc.setTextColor(INK[0], INK[1], INK[2])
    doc.text(noDia((f.locatie || '').toUpperCase()), M + 40, y + 20)
    y += sumarH + 10

    // titlu sectiune: banda gri centrata (ca in HTML)
    const titluSectiune = (t: string) => {
      doc.setFillColor(245, 245, 244); doc.rect(M, y, R - M, 9, 'F')
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(INK[0], INK[1], INK[2])
      doc.text(noDia(t.toUpperCase()), W / 2, y + 6, { align: 'center' })
      y += 13
    }

    // rand: eticheta stanga (gri), valoare dreapta, linie sub
    const rand = (et: string, val: string) => {
      if (!val) return
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(GREY[0], GREY[1], GREY[2])
      doc.text(noDia(et.toUpperCase()), M + 2, y + 5)
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(INK[0], INK[1], INK[2])
      const liniiVal = doc.splitTextToSize(noDia(val), R - M - 52)
      doc.text(liniiVal, M + 48, y + 5)
      const h = Math.max(liniiVal.length * 5, 9)
      doc.setDrawColor(232, 230, 228); doc.setLineWidth(0.2)
      doc.line(M, y + h, R, y + h)
      y += h
    }

    // ===== sectiuni (fidel HTML) =====
    titluSectiune('Detalii eveniment')
    rand('Data', dataRoPDF(f.data_eveniment))
    rand('Oras', (f.oras || '').toUpperCase())
    rand('Locatie', (f.locatie || '').toUpperCase())
    rand('Observatii', f.obs_eveniment)

    titluSectiune('Technical rider')
    rand('Ora soundcheck', f.ora_soundcheck)
    rand('Ora performance', f.ora_performance)
    rand('Durata', f.durata)
    rand('Contact locatie', f.contact_locatie)
    rand('Contact tehnic', f.contact_tehnic)

    if (f.hotel || f.camere || f.restaurant || f.obs_cazare) {
      titluSectiune('Accommodation rider')
      rand('Hotel', (f.hotel || '').toUpperCase())
      rand('Camere', f.camere)
      rand('Restaurant', f.restaurant)
      rand('Observatii', f.obs_cazare)
    }

    // ===== FOOTER cu powered by gigx (x verde) =====
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(GREY[0], GREY[1], GREY[2])
    doc.text('Forward Agency  \u00b7  Ghetarilor no 2, sector 1  \u00b7  Bucuresti, PO 014106', M, 285)
    // powered by gig + x verde + .ro
    doc.setFontSize(8); doc.setTextColor(150, 148, 145)
    const pref = 'powered by gig'
    const wPref = doc.getTextWidth(pref)
    const wX = doc.getTextWidth('x')
    const wSuf = doc.getTextWidth('.ro')
    const total = wPref + wX + wSuf
    let px = R - total
    doc.text(pref, px, 291); px += wPref
    doc.setTextColor(5, 150, 105); doc.text('x', px, 291); px += wX
    doc.setTextColor(150, 148, 145); doc.text('.ro', px, 291)

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
    const eMobil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    if (eMobil && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      // telefon: share nativ cu PDF atasat, o singura data
      try { await navigator.share({ files: [file], title: 'Fisa ' + f.artist }) } catch {}
      return
    }
    // desktop: descarca PDF O SINGURA DATA + deschide WhatsApp Web
    doc.save(filename)
    const tel = waTel.replace(/[^0-9]/g, '')
    const num = tel ? (tel.startsWith('40') ? tel : '40' + tel.replace(/^0/, '')) : ''
    setTimeout(() => window.open(`https://web.whatsapp.com/send?${num ? 'phone=' + num + '&' : ''}text=${encodeURIComponent('Fisa eveniment ' + f.artist + ' - atasez PDF-ul (descarcat)')}`, '_blank'), 400)
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

  function enterUrmator(e: React.KeyboardEvent<HTMLDivElement>) {
    // doar pe mobil: Enter sare la urmatorul camp (pe desktop ramane Tab nativ)
    const eMobil = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
    if (!eMobil || e.key !== 'Enter') return
    const t = e.target as HTMLElement
    if (t.tagName !== 'INPUT') return
    if ((t as HTMLInputElement).dataset.noenter === '1') return
    e.preventDefault()
    const box = e.currentTarget
    const inputs = Array.from(box.querySelectorAll('input')).filter(i => !(i as HTMLInputElement).disabled && (i as HTMLInputElement).type !== 'hidden')
    const idx = inputs.indexOf(t as HTMLInputElement)
    if (idx >= 0 && idx < inputs.length - 1) (inputs[idx + 1] as HTMLInputElement).focus()
  }
  return (
    <div style={{minHeight:'100vh', background:UI.bg, fontFamily:F, padding:'20px 14px 60px'}}>
      <div style={{maxWidth:'620px', margin:'0 auto'}} onKeyDown={enterUrmator}>
        <div style={{marginBottom:'18px'}}>
          <Link href="/oferta" style={{fontSize:'13px', color:UI.green, fontWeight:700, textDecoration:'none'}}>← Înapoi la deviz</Link>
          <div style={{fontSize:'22px', fontWeight:800, color:UI.ink, marginTop:'6px'}}>Fișă eveniment</div>
        </div>

        <div style={card}>
          <div style={{fontSize:'12px', fontWeight:800, color:UI.green, marginBottom:'12px', textTransform:'uppercase', letterSpacing:'0.05em'}}>Artist</div>
          <label style={lbl}>Artist</label>
          <div style={{position:'relative'}}>
            <input data-noenter="1" value={f.artist} onChange={e => { set('artist', e.target.value); setArtQuery(e.target.value); setArtOpen(true) }} onFocus={() => setArtOpen(true)} placeholder="Caută artistul…" style={inp} />
            {artOpen && artQuery.length > 0 && (
              <div style={{position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'white', border:'1.5px solid '+UI.line, borderRadius:'10px', boxShadow:'0 6px 20px rgba(0,0,0,0.1)', zIndex:20, maxHeight:'220px', overflowY:'auto'}}>
                {artists.filter(a => a.nume.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(artQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''))).slice(0, 6).map(a => (
                  <div key={a.nume} onClick={() => { alegeArtist(a.nume); setArtOpen(false); setArtQuery('') }} style={{padding:'10px 12px', cursor:'pointer', fontSize:'14px', color:UI.ink, borderBottom:'1px solid '+UI.bg}}>
                    {a.nume}{a.tip === 'intermediere' ? <span style={{color:UI.faint, fontSize:'11px'}}> · extern</span> : null}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{marginTop:'10px'}}>
            <label style={lbl}>Email echipă artist (separate prin virgulă)</label>
            <input value={f.email_productie} onChange={e => set('email_productie', e.target.value)} placeholder="tehnic@…, manager@…" style={inp} />
            <div style={{fontSize:'10.5px', color:UI.faint, marginTop:'4px'}}>Se salvează automat pentru artistul ăsta la trimitere.</div>
          </div>
        </div>

        <div style={card}>
          <div style={{fontSize:'12px', fontWeight:800, color:UI.green, marginBottom:'12px', textTransform:'uppercase', letterSpacing:'0.05em'}}>Eveniment</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
            <div><label style={lbl}>Data</label><DatePicker value={f.data_eveniment} onChange={(v: string) => set('data_eveniment', v)} placeholder="Alege data" /></div>
            <div style={{position:'relative'}}><label style={lbl}>Oraș</label><input data-noenter="1" value={f.oras} onChange={e => cautaOras(e.target.value)} onBlur={() => setTimeout(() => setShowOrasSugg(false), 150)} style={inp} />
              {showOrasSugg && orasSugestii.length > 0 && (
                <div style={{position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'white', border:'1.5px solid '+UI.line, borderRadius:'10px', boxShadow:'0 6px 20px rgba(0,0,0,0.1)', zIndex:20, maxHeight:'200px', overflowY:'auto'}}>
                  {orasSugestii.slice(0, 6).map((sg, i) => (
                    <div key={i} onClick={() => { set('oras', sg.description); setShowOrasSugg(false) }} style={{padding:'9px 12px', cursor:'pointer', fontSize:'13px', color:UI.ink, borderBottom: i < Math.min(orasSugestii.length,6)-1 ? '1px solid '+UI.bg : 'none'}}>{sg.description}</div>
                  ))}
                </div>
              )}
              </div>
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
            <div><label style={lbl}>Durată</label><input value={f.durata} onChange={e => set('durata', e.target.value)} placeholder="40 min" style={inp} /></div>
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
