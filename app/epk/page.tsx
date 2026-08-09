'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const F = 'Montserrat,sans-serif'
const UI = { bg:'#f5f5f7', ink:'#1c1917', sub:'#57534e', faint:'#a8a29e', line:'#e7e5e4', green:'#059669' }
const norm = (s: string) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export default function PaginaEpk() {
  const [artisti, setArtisti] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [stare, setStare] = useState<'incarc' | 'gata'>('incarc')

  useEffect(() => {
    fetch('/api/epk-lista').then(r => r.json()).then(d => { if (d.ok) setArtisti(d.artisti); setStare('gata') }).catch(() => setStare('gata'))
  }, [])

  const lista = artisti.filter(a => !q || norm(a.nume).includes(norm(q)))

  return (
    <div style={{minHeight:'100vh', background:UI.bg, fontFamily:F}}>
      <div style={{maxWidth:'680px', margin:'0 auto', padding:'28px 16px 60px'}}>
        <div style={{textAlign:'center', marginBottom:'20px'}}>
          <div style={{fontSize:'24px', fontWeight:800, color:UI.ink, letterSpacing:'-0.5px'}}>EPK · Forward Agency</div>
          <div style={{fontSize:'13px', color:UI.sub, fontWeight:600, marginTop:'6px'}}>Alege artistul pentru bio, statistici și resurse de producție</div>
        </div>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Caută artist…"
          style={{width:'100%', padding:'13px 16px', borderRadius:'13px', border:'1.5px solid '+UI.line, fontSize:'15px', fontFamily:F, fontWeight:600, color:UI.ink, outline:'none', background:'white', boxSizing:'border-box', marginBottom:'16px'}} />
        {stare === 'incarc' && <div style={{textAlign:'center', color:UI.faint, fontSize:'14px', padding:'40px 0'}}>Se încarcă…</div>}
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:'12px'}}>
          {lista.map(a => (
            <Link key={a.slug} href={'/e/' + a.slug} style={{textDecoration:'none', background:'white', border:'1px solid '+UI.line, borderRadius:'16px', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              {a.poza
                ? <img src={a.poza} alt={a.nume} style={{width:'100%', aspectRatio:'1', objectFit:'cover', display:'block'}} />
                : <div style={{width:'100%', aspectRatio:'1', background:UI.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'34px', fontWeight:800, color:UI.faint}}>{a.nume.charAt(0)}</div>}
              <div style={{padding:'10px 12px'}}>
                <div style={{fontSize:'13.5px', fontWeight:800, color:UI.ink, letterSpacing:'-0.2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{a.nume}</div>
              </div>
            </Link>
          ))}
        </div>
        {stare === 'gata' && lista.length === 0 && <div style={{textAlign:'center', color:UI.faint, fontSize:'14px', padding:'30px 0'}}>Niciun artist găsit.</div>}
      </div>
    </div>
  )
}
