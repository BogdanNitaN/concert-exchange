export default function TierLegend() {
  return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'16px', padding:'10px 18px', background:'white', borderBottom:'1px solid #f0f0ef', flexWrap:'wrap', position:'sticky', top:'56px', zIndex:50}}>
      <span style={{fontSize:'10px', color:'#a8a29e', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em'}}>Tier</span>
      <span className="tier-legend-item" style={{fontSize:'11px', display:'flex', alignItems:'center', gap:'6px', position:'relative', cursor:'help'}}>
        <span style={{background:'#eacda3', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', color:'white'}}>A++ · Icon</span>
        <span>10.000€+</span>
        <span className="tier-legend-tooltip">Top tier — vinde singur orice eveniment</span>
      </span>
      <span className="tier-legend-item" style={{fontSize:'11px', display:'flex', alignItems:'center', gap:'6px', position:'relative', cursor:'help'}}>
        <span style={{background:'#7c3aed', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', color:'white'}}>A+ · Premium</span>
        <span>5.000–10.000€</span>
        <span className="tier-legend-tooltip">Tracțiune puternică — vânzări consistente</span>
      </span>
      <span className="tier-legend-item" style={{fontSize:'11px', display:'flex', alignItems:'center', gap:'6px', position:'relative', cursor:'help'}}>
        <span style={{background:'#78716c', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', color:'white'}}>A · Select</span>
        <span>până la 5.000€</span>
        <span className="tier-legend-tooltip">Atracție solidă — fan base loial</span>
      </span>
    </div>
  )
}
