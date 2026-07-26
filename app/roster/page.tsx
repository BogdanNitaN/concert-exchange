'use client'
import { useState, useEffect, useMemo } from 'react'

const F = 'Montserrat, sans-serif'
const UI = { bg:'#f5f5f7', ink:'#1c1917', sub:'#57534e', faint:'#a8a29e', line:'#e7e5e4', green:'#059669' }

const TIER_MAP: Record<string, {label: string, color: string, tip: string}> = {
  'A++': {label: 'HEADLINER', color: '#b8860b', tip: 'Top tier - vinde singur orice eveniment'},
  'Premium': {label: 'HEADLINER', color: '#b8860b', tip: 'Top tier - vinde singur orice eveniment'},
  'A+': {label: 'POWER DRAW', color: '#7c3aed', tip: 'Tractiune puternica - vanzari consistente'},
  'A': {label: 'SOLID', color: '#44403c', tip: 'Atractie solida - fan base loial'},
}

export default function RosterPublic() {
  const [artisti, setArtisti] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [gen, setGen] = useState('')

  useEffect(() => {
    fetch('/api/roster-public').then(r => r.json()).then(d => setArtisti(d.artisti || []))
  }, [])

  const genuri = useMemo(() => {
    const gs = new Set<string>()
    for (const a of artisti) for (const g of a.genuri) gs.add(g)
    return Array.from(gs).sort()
  }, [artisti])

  const filtrati = useMemo(() => {
    let l = artisti
    if (gen) l = l.filter(a => a.genuri.includes(gen))
    if (q.trim()) l = l.filter(a => a.nume.toLowerCase().includes(q.trim().toLowerCase()))
    return l
  }, [artisti, q, gen])

  return (
    <div style={{minHeight:'100vh', background:UI.bg, fontFamily:F}}>
      <nav style={{borderBottom:'1px solid '+UI.line, background:'white', height:'56px', display:'flex', alignItems:'center', padding:'0 20px', gap:'8px', position:'sticky', top:0, zIndex:100}}>
        <img src="/gigx-mark.png" width={24} height={24} alt="" style={{display:'block'}} />
        <span style={{fontSize:'20px', fontWeight:800, letterSpacing:'-0.5px', color:UI.ink}}>GIG<span style={{color:UI.green}}>x</span></span>
        <span style={{fontSize:'13px', fontWeight:700, color:UI.sub, marginLeft:'6px'}}>Catalog Artisti Forward</span>
      </nav>

      <div style={{maxWidth:'1080px', margin:'0 auto', padding:'26px 16px 50px'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'10px', marginBottom:'22px'}}>
          {[['HEADLINER', '#b8860b', 'Top tier - vinde singur orice eveniment'], ['POWER DRAW', '#7c3aed', 'Tractiune puternica - vanzari consistente'], ['SOLID', '#44403c', 'Atractie solida - fan base loial']].map(([l, c, t]) => (
            <div key={l} style={{padding:'13px 15px', background:'white', border:'1px solid '+UI.line, borderRadius:'14px', position:'relative', overflow:'hidden'}}>
              <div style={{position:'absolute', top:'12px', right:0, width:'3px', height:'calc(100% - 24px)', background:c, borderTopLeftRadius:'2px', borderBottomLeftRadius:'2px'}} />
              <div style={{fontSize:'12px', fontWeight:800, color:c, letterSpacing:'0.05em'}}>{l}</div>
              <div style={{fontSize:'11px', color:UI.sub, fontWeight:500, marginTop:'4px'}}>{t}</div>
            </div>
          ))}
        </div>

        <div style={{display:'flex', gap:'10px', marginBottom:'18px', flexWrap:'wrap'}}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cauta artist..."
            style={{flex:'1 1 220px', padding:'11px 15px', borderRadius:'11px', border:'1.5px solid '+UI.line, fontSize:'14px', fontFamily:F, outline:'none', background:'white'}} />
          <select value={gen} onChange={e => setGen(e.target.value)}
            style={{padding:'11px 14px', borderRadius:'11px', border:'1.5px solid '+UI.line, fontSize:'13px', fontFamily:F, fontWeight:600, background:'white', color:UI.ink, cursor:'pointer'}}>
            <option value="">Toate genurile</option>
            {genuri.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'14px'}}>
          {filtrati.map(a => {
            const tier = a.tier ? TIER_MAP[a.tier] : null
            return (
              <div key={a.nume} style={{background:'white', border:'1px solid '+UI.line, borderRadius:'16px', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                {a.poza
                  ? <img src={a.poza} alt={a.nume} loading="lazy" style={{width:'100%', aspectRatio:'1', objectFit:'cover', display:'block'}} />
                  : <div style={{width:'100%', aspectRatio:'1', background:UI.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'34px', fontWeight:800, color:UI.faint}}>{a.nume.charAt(0)}</div>}
                <div style={{padding:'12px 13px 13px'}}>
                  <div style={{fontSize:'14px', fontWeight:800, color:UI.ink, letterSpacing:'-0.3px', lineHeight:1.2}}>{a.nume}</div>
                  {a.genuri.length > 0 && <div style={{fontSize:'11px', color:UI.faint, fontWeight:600, marginTop:'3px'}}>{a.genuri.slice(0, 2).join(' · ')}</div>}
                  {tier && <span title={tier.tip} style={{display:'inline-block', marginTop:'8px', fontSize:'9px', fontWeight:800, color:'white', background:tier.color, padding:'3px 8px', borderRadius:'5px', letterSpacing:'0.06em', cursor:'help'}}>{tier.label}</span>}
                  <a href={'https://wa.me/40751144109?text=' + encodeURIComponent('Buna Bogdan, as vrea o oferta pentru ' + a.nume + ' - catalog GIGx')} target="_blank"
                    style={{display:'block', textAlign:'center', marginTop:'10px', padding:'8px', background:UI.bg, color:UI.ink, borderRadius:'9px', fontSize:'11px', fontWeight:700, textDecoration:'none'}}>
                    Cere oferta
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{fontSize:'11px', color:UI.faint, marginTop:'32px', textAlign:'center', lineHeight:1.6}}>
          Forward Agency · Bogdan Nita · bogdan@forward.ro · +40 751 144 109
        </div>
      </div>
    </div>
  )
}
