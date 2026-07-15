'use client'
import { useState, useEffect } from 'react'

function useIsMobile() {
  const [m, setM] = useState(false)
  useEffect(() => {
    const c = () => setM(window.innerWidth < 640)
    c(); window.addEventListener('resize', c)
    return () => window.removeEventListener('resize', c)
  }, [])
  return m
}

export default function TierLegendProm() {
  const isMobile = useIsMobile()
  return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap: isMobile ? '10px' : '16px', padding: isMobile ? '10px 12px' : '12px 18px', background:'#1c1917', borderBottom:'1px solid #292524', flexWrap:'wrap', position:'sticky', top:'56px', zIndex:50}}>
      {!isMobile && <span style={{fontSize:'10px', color:'#78716c', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em'}}>Categorie</span>}
      <span className="tier-legend-item" style={{fontSize:'11px', display:'flex', alignItems:'center', gap:'6px', position:'relative', cursor:'help'}}>
        <span style={{background:'#eacda3', fontSize: isMobile ? '10px' : '11px', fontWeight:700, padding: isMobile ? '3px 8px' : '3px 10px', borderRadius:'7px', color:'white'}}>A++ · Icon</span>
        {!isMobile && <span style={{color:'white'}}>10.000€+</span>}
        <span className="tier-legend-tooltip">Top tier — vinde singur orice eveniment</span>
      </span>
      <span className="tier-legend-item" style={{fontSize:'11px', display:'flex', alignItems:'center', gap:'6px', position:'relative', cursor:'help'}}>
        <span style={{background:'#7c3aed', fontSize: isMobile ? '10px' : '11px', fontWeight:700, padding: isMobile ? '3px 8px' : '3px 10px', borderRadius:'7px', color:'white'}}>A+ · Premium</span>
        {!isMobile && <span style={{color:'white'}}>5.000–10.000€</span>}
        <span className="tier-legend-tooltip">Tracțiune puternică — vânzări consistente</span>
      </span>
      <span className="tier-legend-item" style={{fontSize:'11px', display:'flex', alignItems:'center', gap:'6px', position:'relative', cursor:'help'}}>
        <span style={{background:'#78716c', fontSize: isMobile ? '10px' : '11px', fontWeight:700, padding: isMobile ? '3px 8px' : '3px 10px', borderRadius:'7px', color:'white'}}>A · Select</span>
        {!isMobile && <span style={{color:'white'}}>până la 5.000€</span>}
        <span className="tier-legend-tooltip">Atracție solidă — fan base loial</span>
      </span>
    </div>
  )
}
