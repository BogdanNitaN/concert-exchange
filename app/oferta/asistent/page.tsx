'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Send, Copy, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const F = 'Montserrat,sans-serif'
const UI = {
  ink: '#1c1917', sub: '#57534e', faint: '#a8a29e',
  line: '#e7e5e4', lineStrong: '#d6d3d1', dark: '#1c1917',
  green: '#059669', radiusSm: '10px',
}

type Msg = { role: 'user' | 'assistant', text: string, img?: string }

// randare simpla: **bold** devine <strong>, restul text
function fmt(text: string) {
  // pe linii: titluri ## si ###, apoi bold inline
  return text.split('\n').map((linie, li) => {
    const h = linie.match(/^(#{2,3})\s+(.*)$/)
    const continut = h ? h[2] : linie
    const parti = continut.split(/(\*\*[^*]+\*\*)/g).map((p, i) => {
      if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>
      return <span key={i}>{p}</span>
    })
    if (h) return <div key={li} style={{fontWeight:800, fontSize:'15px', marginTop: li > 0 ? '10px' : 0, marginBottom:'2px'}}>{parti}</div>
    if (linie.trim() === '---') return <div key={li} style={{borderTop:'1px solid #e7e5e4', margin:'8px 0'}} />
    return <div key={li}>{parti}{'\u200b'}</div>
  })
}
// text curat pentru copy (fara markdown)
function curata(text: string) {
  return text.replace(/\*\*/g, '').replace(/^#+\s*/gm, '').replace(/^---$/gm, '').replace(/\n{3,}/g, '\n\n')
}

export default function AsistentPage() {
  const [mesaje, setMesaje] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiat, setCopiat] = useState<number | null>(null)
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [nrAzi, setNrAzi] = useState(0)
  const [costAzi, setCostAzi] = useState(0)
  const [statusViu, setStatusViu] = useState('')
  const [imgAtasata, setImgAtasata] = useState<string | null>(null)
  const jos = useRef<HTMLDivElement>(null)

  useEffect(() => { jos.current?.scrollIntoView({ behavior: 'smooth' }) }, [mesaje, loading])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      const role = user?.user_metadata?.role
      const blocat = user?.user_metadata?.blocat
      if (user && (role === 'oferta_admin' || role === 'oferta_user') && !blocat) setAuthed(true)
      else { setAuthed(false); window.location.href = '/oferta' }
    })
    try {
      const azi = new Date().toISOString().slice(0, 10)
      const salvat = JSON.parse(localStorage.getItem('asistent_counter') || '{}')
      setNrAzi(salvat.zi === azi ? salvat.nr : 0)
      setCostAzi(salvat.zi === azi ? (salvat.cost || 0) : 0)
    } catch {}
  }, [])

  function citesteImagine(f: File) {
    // redimensionez + convertesc la JPEG (rezolva HEIC, poze mari de telefon, cost)
    const r = new FileReader()
    r.onload = () => {
      const img = new Image()
      img.onload = () => {
        const MAX = 1400
        let w = img.width, h = img.height
        if (w > MAX || h > MAX) {
          const scala = Math.min(MAX / w, MAX / h)
          w = Math.round(w * scala); h = Math.round(h * scala)
        }
        const cv = document.createElement('canvas')
        cv.width = w; cv.height = h
        const ctx = cv.getContext('2d')
        if (!ctx) { setImgAtasata(String(r.result)); return }
        ctx.drawImage(img, 0, 0, w, h)
        setImgAtasata(cv.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = () => setImgAtasata(String(r.result))
      img.src = String(r.result)
    }
    r.readAsDataURL(f)
  }

  async function trimite() {
    const text = input.trim()
    if (!text || loading) return
    const noi: Msg[] = [...mesaje, { role: 'user', text }]
    setMesaje(noi); setInput(''); setImgAtasata(null); setLoading(true)
    try {
      const azi = new Date().toISOString().slice(0, 10)
      const salvat = JSON.parse(localStorage.getItem('asistent_counter') || '{}')
      const nr = (salvat.zi === azi ? salvat.nr : 0) + 1
      localStorage.setItem('asistent_counter', JSON.stringify({ zi: azi, nr, cost: salvat.zi === azi ? (salvat.cost || 0) : 0 }))
      setNrAzi(nr)
    } catch {}
    try {
      const sess = await supabase.auth.getSession()
      const token = sess.data.session?.access_token || ''
      const r = await fetch('/api/asistent', {
        method: 'POST', headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + token },
        body: JSON.stringify({ messages: noi.map(m => {
          if (m.role === 'user' && m.img) {
            const [meta, data] = m.img.split(',')
            const mediaType = (meta.match(/data:([^;]+)/) || [])[1] || 'image/png'
            return { role: m.role, content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data } },
              { type: 'text', text: m.text },
            ] }
          }
          return { role: m.role, content: m.text }
        }) }),
      })
      let d: any = {}
      if (!r.ok) {
        let detaliu = ''
        try { const je = await r.json(); detaliu = je.error || '' } catch {}
        setStatusViu('')
        setMesaje(m => [...m, { role: 'assistant', text: 'Eroare server (' + r.status + '): ' + (detaliu || 'cererea a fost respinsa - posibil imaginea e prea mare') }])
        setLoading(false)
        return
      }
      const reader = r.body?.getReader()
      if (reader) {
        const decoder = new TextDecoder()
        let buf = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          const linii = buf.split('\n')
          buf = linii.pop() || ''
          for (const linie of linii) {
            if (!linie.trim()) continue
            try {
              const ev = JSON.parse(linie)
              if (ev.tip === 'status') setStatusViu(ev.text)
              if (ev.tip === 'final') d = ev
            } catch {}
          }
        }
      } else {
        d = await r.json()
      }
      setStatusViu('')
      setMesaje(m => [...m, { role: 'assistant', text: d.raspuns || d.error || 'Eroare necunoscuta.' }])
      if (d.cost) {
        try {
          const azi = new Date().toISOString().slice(0, 10)
          const salvat = JSON.parse(localStorage.getItem('asistent_counter') || '{}')
          const cost = (salvat.zi === azi ? (salvat.cost || 0) : 0) + d.cost
          localStorage.setItem('asistent_counter', JSON.stringify({ zi: azi, nr: salvat.nr || 0, cost }))
          setCostAzi(cost)
        } catch {}
      }
    } catch {
      setMesaje(m => [...m, { role: 'assistant', text: 'Eroare de retea sau cerere prea mare. Incearca din nou sau cu o imagine mai mica.' }])
    }
    setLoading(false)
  }

  const sugestii = [
    'Cine e liber pe 14 august?',
    'Ce fee are Grasu XXL?',
    'Artisti hip-hop sub 5000 EUR',
  ]

  if (authed === null) return <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F, color:'#78716c'}}>Verificare acces...</div>
  if (authed === false) return null

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(160deg, #eceef2 0%, #e8eaf0 45%, #dde1ea 100%)', fontFamily:F, display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', display:'flex', alignItems:'center', gap:'16px', borderBottom:'1px solid '+UI.line, background:'rgba(255,255,255,0.7)', backdropFilter:'blur(8px)', position:'sticky', top:0, zIndex:10}}>
        <Link href="/oferta" style={{fontSize:'20px', fontWeight:800, letterSpacing:'-0.5px', color:UI.ink, textDecoration:'none'}}>GIG<span style={{color:UI.green}}>x</span></Link>
        <div style={{fontSize:'14px', fontWeight:700, color:UI.sub}}>Asistent</div>
        <div style={{marginLeft:'auto', display:'flex', gap:'14px', alignItems:'center'}}>
          <span style={{fontSize:'11px', color:UI.faint}}>azi: {nrAzi} întrebări · ~{costAzi < 0.01 && costAzi > 0 ? '<0,01' : costAzi.toFixed(2).replace('.', ',')}$</span>
          <Link href="/oferta" style={{fontSize:'13px', color:UI.sub, textDecoration:'none', fontWeight:600}}>Deviz</Link>
          <Link href="/oferta/disponibilitate" style={{fontSize:'13px', color:UI.sub, textDecoration:'none', fontWeight:600}}>Calendar</Link>
          <Link href="/oferta/istoric" style={{fontSize:'13px', color:UI.sub, textDecoration:'none', fontWeight:600}}>Istoric</Link>
          <Link href="/oferta/roster" style={{fontSize:'13px', color:UI.sub, textDecoration:'none', fontWeight:600}}>Roster</Link>
        </div>
      </div>

      <div style={{flex:1, maxWidth:'760px', width:'100%', margin:'0 auto', padding:'24px 16px 120px'}}>
        {mesaje.length === 0 && (
          <div style={{textAlign:'center', paddingTop:'60px'}}>
            <div style={{fontSize:'22px', fontWeight:800, color:UI.ink, marginBottom:'8px'}}>Cu ce te ajut?</div>
            <div style={{fontSize:'13px', color:UI.faint, marginBottom:'24px'}}>Intreaba despre disponibilitati, preturi, artisti.</div>
            <div style={{display:'flex', flexDirection:'column', gap:'8px', maxWidth:'340px', margin:'0 auto'}}>
              {sugestii.map(s => (
                <button key={s} onClick={() => setInput(s)}
                  style={{padding:'11px 16px', background:'white', border:'1px solid '+UI.line, borderRadius:UI.radiusSm, fontSize:'13px', color:UI.sub, cursor:'pointer', fontFamily:F, textAlign:'left'}}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {mesaje.map((m, i) => (
          <div key={i} style={{display:'flex', flexDirection:'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom:'12px'}}>
            <div style={{
              maxWidth:'85%', padding:'12px 16px', borderRadius:'14px', fontSize:'14px', lineHeight:1.6, whiteSpace:'pre-wrap',
              background: m.role === 'user' ? UI.dark : 'white',
              color: m.role === 'user' ? 'white' : UI.ink,
              border: m.role === 'user' ? 'none' : '1px solid '+UI.line,
            }}>{m.img && <img src={m.img} style={{maxWidth:'200px', borderRadius:'8px', display:'block', marginBottom:'6px'}} />}{m.role === 'assistant' ? fmt(m.text) : m.text}</div>
            {m.role === 'assistant' && (
              <button onClick={() => { navigator.clipboard.writeText(curata(m.text)); setCopiat(i); setTimeout(() => setCopiat(null), 1500) }}
                style={{marginTop:'4px', padding:'4px 8px', background:'none', border:'none', cursor:'pointer', color: copiat === i ? UI.green : UI.faint, display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', fontFamily:F}}>
                {copiat === i ? <Check size={13} /> : <Copy size={13} />}{copiat === i ? 'Copiat' : 'Copiază'}
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div style={{display:'flex', justifyContent:'flex-start', marginBottom:'12px'}}>
            <div style={{padding:'12px 16px', borderRadius:'14px', background:'white', border:'1px solid '+UI.line, fontSize:'14px', color:UI.faint}}>
              {statusViu || 'Analizez intrebarea...'}
            </div>
          </div>
        )}
        <div ref={jos} />
      </div>

      <div style={{position:'fixed', bottom:0, left:0, right:0, background:'rgba(255,255,255,0.9)', backdropFilter:'blur(8px)', borderTop:'1px solid '+UI.line, padding:'14px 16px'}}>
        <div style={{maxWidth:'760px', margin:'0 auto', display:'flex', gap:'10px', position:'relative'}}>
          {imgAtasata && (
            <div style={{position:'absolute', bottom:'100%', left:0, marginBottom:'8px', background:'white', border:'1.5px solid '+UI.lineStrong, borderRadius:'12px', padding:'8px', display:'flex', alignItems:'center', gap:'8px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}>
              <img src={imgAtasata} style={{height:'60px', borderRadius:'6px', display:'block'}} />
              <span style={{fontSize:'12px', fontWeight:700, color:'#059669'}}>✓ Imagine atașată</span>
              <button onClick={() => setImgAtasata(null)} style={{border:'none', background:'#fee2e2', color:'#dc2626', borderRadius:'6px', width:'24px', height:'24px', cursor:'pointer', fontWeight:800, fontSize:'13px'}}>×</button>
            </div>
          )}
          <label style={{padding:'13px 14px', background: imgAtasata ? '#ecfdf5' : 'white', border:'1.5px solid '+(imgAtasata ? '#059669' : UI.lineStrong), borderRadius:UI.radiusSm, cursor:'pointer', fontSize:'16px', display:'flex', alignItems:'center'}}>
            📎
            <input type="file" accept="image/*" style={{display:'none'}} onChange={e => { const f = e.target.files?.[0]; if (f) citesteImagine(f); e.target.value = '' }} />
          </label>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') trimite() }}
            placeholder={imgAtasata ? 'Adauga context pentru imagine (optional)...' : 'Scrie o intrebare...'}
            style={{flex:1, padding:'13px 16px', borderRadius:UI.radiusSm, border:'1.5px solid '+UI.lineStrong, fontSize:'14px', fontFamily:F, outline:'none', background:'white'}}
          />
          <button onClick={trimite} disabled={loading || (!input.trim() && !imgAtasata)}
            style={{padding:'13px 20px', background: loading || (!input.trim() && !imgAtasata) ? '#e7e5e4' : UI.dark, color: loading || (!input.trim() && !imgAtasata) ? UI.faint : 'white', border:'none', borderRadius:UI.radiusSm, cursor: loading || (!input.trim() && !imgAtasata) ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', gap:'6px', fontSize:'14px', fontWeight:700, fontFamily:F}}>
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
