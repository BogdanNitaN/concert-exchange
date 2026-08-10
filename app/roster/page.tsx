'use client'
import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { esteFaraTop } from '@/lib/genuri-catalog'

function useIsMobile() {
  const [m, setM] = useState(false)
  useEffect(() => {
    const c = () => setM(window.innerWidth < 640)
    c(); window.addEventListener('resize', c)
    return () => window.removeEventListener('resize', c)
  }, [])
  return m
}

const F = 'Montserrat, sans-serif'
const UI = { bg:'#f5f5f7', ink:'#1c1917', sub:'#57534e', faint:'#a8a29e', line:'#e7e5e4', green:'#059669' }

const TIER_MAP: Record<string, {label: string, color: string, text: string, tip: string, ord: number}> = {
  'A++': {label: 'Icon', color: '#eacda3', text: 'white', tip: 'Top tier — vinde singur orice eveniment', ord: 0},
  'Premium': {label: 'Icon', color: '#eacda3', text: 'white', tip: 'Top tier — vinde singur orice eveniment', ord: 0},
  'A+': {label: 'Premium', color: '#7c3aed', text: 'white', tip: 'Tracțiune puternică — vânzări consistente', ord: 1},
  'A': {label: 'Select', color: '#78716c', text: 'white', tip: 'Atracție solidă — fan base loial', ord: 2},
}
const TIERS = [
  { range: 'A++', label: 'Icon', color: '#eacda3', text: 'white', tip: 'Top tier — vinde singur orice eveniment' },
  { range: 'A+', label: 'Premium', color: '#7c3aed', text: 'white', tip: 'Tracțiune puternică — vânzări consistente' },
  { range: 'A', label: 'Select', color: '#78716c', text: 'white', tip: 'Atracție solidă — fan base loial' },
]
const ordTier = (t: string | null) => (t && TIER_MAP[t]) ? TIER_MAP[t].ord : 3
const rangeTier = (t: string) => t === 'Premium' ? 'A++' : t
const slugA = (n: string) => (n || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/['\u2018\u2019\u0060]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function Card({ a, onTier }: { a: any, onTier: (r: string) => void }) {
  const tier = a.tier ? TIER_MAP[a.tier] : null
  return (
    <div style={{background:'white', border:'1px solid '+UI.line, borderRadius:'16px', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
      <Link href={'/a/' + slugA(a.nume)} style={{display:'block'}}>
      {a.poza
        ? <img src={a.poza} alt={a.nume} loading="lazy" width={300} height={300} style={{width:'100%', aspectRatio:'1', objectFit:'cover', display:'block'}} />
        : <div style={{width:'100%', aspectRatio:'1', background:UI.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'34px', fontWeight:800, color:UI.faint}}>{a.nume.charAt(0)}</div>}
      </Link>
      <div style={{padding:'12px 13px 13px'}}>
        <Link href={'/a/' + slugA(a.nume)} style={{fontSize:'14px', fontWeight:800, color:UI.ink, letterSpacing:'-0.3px', lineHeight:1.2, textDecoration:'none', display:'block'}}>{a.nume}</Link>
        {a.genuri.length > 0 && <div style={{fontSize:'11px', color:UI.faint, fontWeight:600, marginTop:'3px'}}>{a.genuri.slice(0, 2).join(' · ')}</div>}
        {tier && <span title={tier.tip} onClick={() => onTier(rangeTier(a.tier))} style={{display:'inline-block', marginTop:'8px', fontSize:'9px', fontWeight:800, color:tier.text, background:tier.color, padding:'3px 8px', borderRadius:'5px', letterSpacing:'0.06em', cursor:'pointer'}}>{rangeTier(a.tier)} · {tier.label}</span>}
        <a href={'https://wa.me/40751144109?text=' + encodeURIComponent('Buna Bogdan, as vrea o oferta pentru ' + a.nume + ' - catalog GIGx')} target="_blank"
          style={{display:'block', textAlign:'center', marginTop:'10px', padding:'8px', background:UI.bg, color:UI.ink, borderRadius:'9px', fontSize:'11px', fontWeight:700, textDecoration:'none'}}>
          Cere oferta
        </a>
      </div>

    </div>
  )
}

const GRID: any = { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'14px' }

export default function RosterPublic() {
  const [artisti, setArtisti] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [gen, setGen] = useState('')
  const [tierExplicat, setTierExplicat] = useState('')
  const [tierRotativ, setTierRotativ] = useState(0)
  const [tierColapsat, setTierColapsat] = useState(false)
  const isMobile = useIsMobile()
  useEffect(() => {
    if (!isMobile || tierColapsat) return
    const t = setInterval(() => setTierRotativ(r => (r + 1) % 3), 2200)
    return () => clearInterval(t)
  }, [isMobile, tierColapsat])

  useEffect(() => {
    fetch('/api/roster-public').then(r => r.json()).then(d => setArtisti(d.artisti || []))
  }, [])

  const genuri = useMemo(() => {
    const gs = new Set<string>()
    for (const a of artisti) for (const g of a.genuri) gs.add(g)
    return Array.from(gs).sort()
  }, [artisti])

  const cauta = q.trim().toLowerCase()
  const filtrati = useMemo(() => {
    let l = artisti
    if (gen) l = l.filter(a => a.genuri.includes(gen))
    if (cauta) l = l.filter(a => a.nume.toLowerCase().includes(cauta))
    return [...l].sort((a, b) => ordTier(a.tier) - ordTier(b.tier))
  }, [artisti, cauta, gen])

  const eFiltrat = !!(gen || cauta)
  const top = useMemo(() => artisti.filter(a => ordTier(a.tier) === 0 && !esteFaraTop(a.nume)).sort((a, b) => ordTier(a.tier) - ordTier(b.tier)), [artisti])
  const topSet = useMemo(() => new Set(top.map(a => a.nume)), [top])
  const peGenuri = useMemo(() => {
    const m: Record<string, any[]> = {}
    for (const a of artisti) {
      if (topSet.has(a.nume)) continue
      const g = a.genuri[0] || 'Alte genuri'
      if (!m[g]) m[g] = []
      m[g].push(a)
    }
    for (const g of Object.keys(m)) m[g].sort((a, b) => ordTier(a.tier) - ordTier(b.tier))
    return Object.entries(m).sort((x, y) => y[1].length - x[1].length)
  }, [artisti, topSet])

  const chip = (activ: boolean): any => ({
    padding:'9px 15px', borderRadius:'20px', border:'1.5px solid '+(activ ? UI.ink : UI.line), cursor:'pointer',
    fontFamily:F, fontSize:'12px', fontWeight:700, background: activ ? UI.ink : 'white', color: activ ? 'white' : UI.sub, whiteSpace:'nowrap', flexShrink:0,
  })

  return (
    <div style={{minHeight:'100vh', background:UI.bg, fontFamily:F}}>
      <nav style={{borderBottom:'1px solid '+UI.line, background:'white', height:'56px', display:'flex', alignItems:'center', padding:'0 20px', gap:'8px', position:'sticky', top:0, zIndex:100}}>
        <Link href="/" style={{display:'inline-flex', alignItems:'center', gap:'8px', textDecoration:'none'}}>
          <img src="/gigx-mark.png" width={24} height={24} alt="" style={{display:'block'}} />
          <span style={{fontSize:'20px', fontWeight:800, letterSpacing:'-0.5px', color:UI.ink}}>GIG<span style={{color:UI.green}}>x</span></span>
        </Link>
        <span style={{fontSize:'13px', fontWeight:700, color:UI.sub, marginLeft:'6px'}}>Catalog Artisti Forward</span>
      </nav>

      {isMobile ? (
        <div style={{background:'#101014', borderBottom:'1px solid #101014', padding:'12px 16px', position:'sticky', top:'56px', zIndex:50}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <span style={{background:'#eacda3', fontSize:'10px', fontWeight:800, padding:'3px 10px', borderRadius:'6px', color:'white', opacity: tierColapsat || tierRotativ === 0 ? 1 : 0.45, transition:'opacity 0.3s'}}>A++ · Icon</span>
              <span style={{background:'#7c3aed', fontSize:'10px', fontWeight:800, padding:'3px 10px', borderRadius:'6px', color:'white', opacity: tierColapsat || tierRotativ === 1 ? 1 : 0.45, transition:'opacity 0.3s'}}>A+ · Premium</span>
              <span style={{background:'#78716c', fontSize:'10px', fontWeight:800, padding:'3px 10px', borderRadius:'6px', color:'white', opacity: tierColapsat || tierRotativ === 2 ? 1 : 0.45, transition:'opacity 0.3s'}}>A · Select</span>
            </div>
            <span onClick={() => setTierColapsat(c => !c)} style={{color:'#a8a29e', fontSize:'13px', fontWeight:700, marginLeft:'10px', flexShrink:0, cursor:'pointer', padding:'2px 4px'}}>{tierColapsat ? '▾' : '▴'}</span>
          </div>
          {!tierColapsat && (
            <div style={{textAlign:'center', fontSize:'12px', color:'#d6d3d1', fontWeight:600, marginTop:'8px', transition:'opacity 0.3s'}}>
              {tierRotativ === 0 ? '10.000€+' : tierRotativ === 1 ? '5.000–10.000€' : 'până la 5.000€'}
            </div>
          )}
        </div>
      ) : (
      <div style={{display:'flex', alignItems:'center', gap:'14px', padding:'10px 16px', background:'#101014', borderBottom:'1px solid #101014', flexWrap:'wrap', position:'sticky', top:'56px', zIndex:50, justifyContent:'center'}}>
        <div style={{display:'flex', alignItems:'center', gap:'14px', width:'max-content'}}>
        <span style={{fontSize:'10px', color:'#78716c', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em'}}>Tier</span>
        <span className="tier-legend-item" style={{fontSize:'11px', color:'#d6d3d1', fontWeight:600, display:'flex', alignItems:'center', gap:'6px', position:'relative', cursor:'help', flexShrink:0}}>
          <span style={{background:'#eacda3', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', color:'white'}}>A++ · Icon</span>
          <span>10.000€+</span>
          <span className="tier-legend-tooltip">Top tier — vinde singur orice eveniment</span>
        </span>
        <span className="tier-legend-item" style={{fontSize:'11px', color:'#d6d3d1', fontWeight:600, display:'flex', alignItems:'center', gap:'6px', position:'relative', cursor:'help', flexShrink:0}}>
          <span style={{background:'#7c3aed', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', color:'white'}}>A+ · Premium</span>
          <span>5.000–10.000€</span>
          <span className="tier-legend-tooltip">Tracțiune puternică — vânzări consistente</span>
        </span>
        <span className="tier-legend-item" style={{fontSize:'11px', color:'#d6d3d1', fontWeight:600, display:'flex', alignItems:'center', gap:'6px', position:'relative', cursor:'help', flexShrink:0}}>
          <span style={{background:'#78716c', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', color:'white'}}>A · Select</span>
          <span>până la 5.000€</span>
          <span className="tier-legend-tooltip">Atracție solidă — fan base loial</span>
        </span>
        </div>
      </div>
      )}

      <div style={{maxWidth:'1080px', margin:'0 auto', padding:'26px 16px 50px'}}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cauta artist..."
          style={{width:'100%', boxSizing:'border-box', padding:'12px 16px', borderRadius:'12px', border:'1.5px solid '+UI.line, fontSize:'14px', fontFamily:F, outline:'none', background:'white', marginBottom:'12px'}} />
        <div style={{display:'flex', gap:'8px', overflowX:'auto', WebkitOverflowScrolling:'touch', paddingBottom:'6px', marginBottom:'20px'}}>
          <button onClick={() => setGen('')} style={chip(!gen)}>Toti</button>
          {genuri.map(g => <button key={g} onClick={() => setGen(gen === g ? '' : g)} style={chip(gen === g)}>{g}</button>)}
        </div>

        {eFiltrat ? (filtrati.length === 0 ? (
          <div style={{padding:'30px 20px', background:'#101014', borderRadius:'18px', textAlign:'center'}}>
            <div style={{fontSize:'15px', fontWeight:800, color:'#F5F2EC', letterSpacing:'-0.3px'}}>Nu ai gasit artistul potrivit?</div>
            <div style={{fontSize:'12.5px', color:'#a8a29e', fontWeight:500, marginTop:'6px', lineHeight:1.5}}>Rosterul Forward e doar inceputul. Avem acces direct la orice artist roman sau international.</div>
            <a href={'https://wa.me/40751144109?text=' + encodeURIComponent('Buna Bogdan, caut ' + (q.trim() || 'un artist') + ' pentru un eveniment - catalog GIGx')} target="_blank"
              style={{display:'inline-block', marginTop:'14px', padding:'10px 20px', background:UI.green, color:'white', borderRadius:'10px', fontSize:'12px', fontWeight:700, textDecoration:'none'}}>
              {q.trim() ? 'Cere oferta pentru "' + q.trim() + '"' : 'Spune-ne ce artist cauti'}
            </a>
          </div>
        ) : (
          <div style={GRID}>
            {filtrati.map(a => <Card key={a.nume} a={a} onTier={r => { setTierExplicat(r); window.scrollTo({top: 0, behavior: 'smooth'}) }} />)}
          </div>
        )) : (
          <>
            {top.length > 0 && (
              <div style={{marginBottom:'28px'}}>
                <div style={{fontSize:'12px', fontWeight:800, color:UI.ink, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'12px'}}>Top artisti <span style={{color:UI.faint, fontWeight:700}}>· {top.length}</span></div>
                <div style={GRID}>
                  {top.map(a => <Card key={a.nume} a={a} onTier={r => { setTierExplicat(r); window.scrollTo({top: 0, behavior: 'smooth'}) }} />)}
                </div>
              </div>
            )}
            {peGenuri.map(([g, lista]) => (
              <div key={g} style={{marginBottom:'28px'}}>
                <div style={{fontSize:'12px', fontWeight:800, color:UI.sub, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'12px'}}>{g} <span style={{color:UI.faint, fontWeight:700}}>· {lista.length}</span></div>
                <div style={GRID}>
                  {lista.map((a: any) => <Card key={a.nume} a={a} onTier={r => { setTierExplicat(r); window.scrollTo({top: 0, behavior: 'smooth'}) }} />)}
                </div>
              </div>
            ))}
          </>
        )}

        {!(eFiltrat && filtrati.length === 0) && (
        <div style={{marginTop:'36px', padding:'22px 20px', background:'#101014', borderRadius:'18px', textAlign:'center'}}>
          <div style={{fontSize:'15px', fontWeight:800, color:'#F5F2EC', letterSpacing:'-0.3px'}}>Nu ai gasit artistul potrivit?</div>
          <div style={{fontSize:'12.5px', color:'#a8a29e', fontWeight:500, marginTop:'6px', lineHeight:1.5}}>Rosterul Forward e doar inceputul. Avem acces direct la orice artist roman sau international - spune-ne ce cauti si il aducem in oferta ta.</div>
          <a href={'https://wa.me/40751144109?text=' + encodeURIComponent('Buna Bogdan, caut un artist care nu e in catalog - ')} target="_blank"
            style={{display:'inline-block', marginTop:'14px', padding:'10px 20px', background:UI.green, color:'white', borderRadius:'10px', fontSize:'12px', fontWeight:700, textDecoration:'none'}}>
            Spune-ne ce artist cauti
          </a>
        </div>
        )}
        <div style={{fontSize:'11px', color:UI.faint, marginTop:'20px', textAlign:'center', lineHeight:1.6}}>
          Forward Agency · Bogdan Nita · bogdan@forward.ro · +40 751 144 109
        </div>
      </div>

      
    </div>
  )
}
