'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Send, Copy, Check } from 'lucide-react'

const F = 'Montserrat,sans-serif'
const UI = {
  ink: '#1c1917', sub: '#57534e', faint: '#a8a29e',
  line: '#e7e5e4', lineStrong: '#d6d3d1', dark: '#1c1917',
  green: '#059669', radiusSm: '10px',
}

type Msg = { role: 'user' | 'assistant', text: string }

export default function AsistentPage() {
  const [mesaje, setMesaje] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiat, setCopiat] = useState<number | null>(null)
  const jos = useRef<HTMLDivElement>(null)

  useEffect(() => { jos.current?.scrollIntoView({ behavior: 'smooth' }) }, [mesaje, loading])

  async function trimite() {
    const text = input.trim()
    if (!text || loading) return
    const noi: Msg[] = [...mesaje, { role: 'user', text }]
    setMesaje(noi); setInput(''); setLoading(true)
    try {
      const r = await fetch('/api/asistent', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: noi.map(m => ({ role: m.role, content: m.text })) }),
      })
      const d = await r.json()
      setMesaje(m => [...m, { role: 'assistant', text: d.raspuns || d.error || 'Eroare necunoscuta.' }])
    } catch {
      setMesaje(m => [...m, { role: 'assistant', text: 'Eroare de retea. Incearca din nou.' }])
    }
    setLoading(false)
  }

  const sugestii = [
    'Cine e liber pe 14 august?',
    'Ce fee are Grasu XXL?',
    'Artisti hip-hop sub 5000 EUR',
  ]

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(160deg, #eceef2 0%, #e8eaf0 45%, #dde1ea 100%)', fontFamily:F, display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', display:'flex', alignItems:'center', gap:'16px', borderBottom:'1px solid '+UI.line, background:'rgba(255,255,255,0.7)', backdropFilter:'blur(8px)', position:'sticky', top:0, zIndex:10}}>
        <Link href="/oferta" style={{fontSize:'20px', fontWeight:800, letterSpacing:'-0.5px', color:UI.ink, textDecoration:'none'}}>GIG<span style={{color:UI.green}}>x</span></Link>
        <div style={{fontSize:'14px', fontWeight:700, color:UI.sub}}>Asistent</div>
        <div style={{marginLeft:'auto', display:'flex', gap:'14px'}}>
          <Link href="/oferta" style={{fontSize:'13px', color:UI.sub, textDecoration:'none', fontWeight:600}}>Oferta</Link>
          <Link href="/oferta/disponibilitate" style={{fontSize:'13px', color:UI.sub, textDecoration:'none', fontWeight:600}}>Disponibilitate</Link>
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
            }}>{m.text}</div>
            {m.role === 'assistant' && (
              <button onClick={() => { navigator.clipboard.writeText(m.text); setCopiat(i); setTimeout(() => setCopiat(null), 1500) }}
                style={{marginTop:'4px', padding:'4px 8px', background:'none', border:'none', cursor:'pointer', color: copiat === i ? UI.green : UI.faint, display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', fontFamily:F}}>
                {copiat === i ? <Check size={13} /> : <Copy size={13} />}{copiat === i ? 'Copiat' : 'Copiază'}
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div style={{display:'flex', justifyContent:'flex-start', marginBottom:'12px'}}>
            <div style={{padding:'12px 16px', borderRadius:'14px', background:'white', border:'1px solid '+UI.line, fontSize:'14px', color:UI.faint}}>
              Caut in calendar si roster...
            </div>
          </div>
        )}
        <div ref={jos} />
      </div>

      <div style={{position:'fixed', bottom:0, left:0, right:0, background:'rgba(255,255,255,0.9)', backdropFilter:'blur(8px)', borderTop:'1px solid '+UI.line, padding:'14px 16px'}}>
        <div style={{maxWidth:'760px', margin:'0 auto', display:'flex', gap:'10px'}}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') trimite() }}
            placeholder="Scrie o intrebare..."
            style={{flex:1, padding:'13px 16px', borderRadius:UI.radiusSm, border:'1.5px solid '+UI.lineStrong, fontSize:'14px', fontFamily:F, outline:'none', background:'white'}}
          />
          <button onClick={trimite} disabled={loading || !input.trim()}
            style={{padding:'13px 20px', background: loading || !input.trim() ? '#e7e5e4' : UI.dark, color: loading || !input.trim() ? UI.faint : 'white', border:'none', borderRadius:UI.radiusSm, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', gap:'6px', fontSize:'14px', fontWeight:700, fontFamily:F}}>
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
