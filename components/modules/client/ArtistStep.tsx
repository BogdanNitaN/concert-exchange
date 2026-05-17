'use client'

const ARTISTS = [
  { id:1, name:"Maria Cânt", genres:["Pop","Folk"], feeMin:3000, feeMax:5000, tier:"A+", available:true, transport:200, cazare:"1x Cameră dublă", nrBileteAvion:0, costPerKm:2 },
  { id:2, name:"Florentin & Band", genres:["Cover Band","Lăutărească"], feeMin:2000, feeMax:3500, tier:"A", available:true, transport:150, cazare:"2x Cameră dublă", nrBileteAvion:0, costPerKm:2 },
  { id:3, name:"DJ Cristian", genres:["Dance","Pop"], feeMin:1500, feeMax:2500, tier:"A", available:true, transport:100, cazare:"1x Cameră dublă", nrBileteAvion:1, costPerKm:2 },
  { id:4, name:"Formația Bucuria", genres:["Populară","Lăutărească"], feeMin:2500, feeMax:4000, tier:"A+", available:true, transport:180, cazare:"2x Cameră dublă", nrBileteAvion:0, costPerKm:1.5 },
  { id:5, name:"Jazz Quartet", genres:["Jazz"], feeMin:1800, feeMax:3000, tier:"A", available:true, transport:120, cazare:"2x Cameră dublă", nrBileteAvion:0, costPerKm:2 },
  { id:6, name:"DJ Armin V.", genres:["EDM","Dance"], feeMin:8000, feeMax:15000, tier:"Premium", available:true, transport:500, cazare:"1x Suită", nrBileteAvion:2, costPerKm:3 },
  { id:7, name:"Taraful Regal", genres:["Populară","Lăutărească"], feeMin:1500, feeMax:2500, tier:"A", available:true, transport:120, cazare:"3x Cameră dublă", nrBileteAvion:0, costPerKm:1.5 },
]

interface Props {
  budget: number
  setBudget: (v: number) => void
  eventTypeLabel: string
  selectedArtist: any
  setSelectedArtist: (a: any) => void
  onBack: () => void
  onNext: () => void
}

export default function ArtistStep({ budget, setBudget, eventTypeLabel, selectedArtist, setSelectedArtist, onBack, onNext }: Props) {
  const inBudgetArtists = budget > 0 ? ARTISTS.filter(a => a.feeMax <= budget) : ARTISTS
  const overBudgetArtists = budget > 0 ? ARTISTS.filter(a => a.feeMax > budget && a.feeMin <= budget * 1.5) : []

  return (
    <div>
      <div style={{textAlign:'center', marginBottom:'24px'}}>
        <h1 style={{fontSize:'28px', fontWeight:800, color:'#1c1917', marginBottom:'8px'}}>Alege artistul</h1>
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', flexWrap:'wrap'}}>
          <p style={{fontSize:'14px', color:'#78716c', margin:0}}>{eventTypeLabel}</p>
          <div style={{display:'flex', alignItems:'center', gap:'6px', background:'#f5f5f4', borderRadius:'20px', padding:'4px 12px'}}>
            <span style={{fontSize:'12px', color:'#78716c', fontWeight:600}}>Buget:</span>
            <input type="number" value={budget || ''} onChange={e => setBudget(Number(e.target.value))} placeholder="€"
              style={{width:'80px', border:'none', background:'transparent', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', fontWeight:700}} />
            <span style={{fontSize:'12px', color:'#78716c'}}>€</span>
          </div>
        </div>
      </div>

      {inBudgetArtists.length > 0 && (
        <div style={{marginBottom:'20px'}}>
          <div style={{fontSize:'11px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'12px'}}>În bugetul tău</div>
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {inBudgetArtists.map(a => (
              <div key={a.id} onClick={() => setSelectedArtist(selectedArtist?.id === a.id ? null : a)}
                style={{background:'white', border:'2px solid ' + (selectedArtist?.id === a.id ? '#1c1917' : '#e7e5e4'), borderRadius:'14px', padding:'16px 20px', cursor:'pointer', transition:'all 0.2s'}}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
                    <div style={{width:'44px', height:'44px', borderRadius:'12px', background:'#1c1917', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:'14px'}}>
                      {a.name.split(' ').map((n: string) => n[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px'}}>
                        <span style={{fontWeight:700, fontSize:'14px', color:'#1c1917'}}>{a.name}</span>
                        <span style={{fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', background: a.tier === 'Premium' ? '#fef3c7' : a.tier === 'A+' ? '#eff6ff' : '#f5f5f4', color: a.tier === 'Premium' ? '#92400e' : a.tier === 'A+' ? '#1e40af' : '#78716c'}}>{a.tier}</span>
                      </div>
                      <div style={{fontSize:'12px', color:'#a8a29e'}}>{a.genres.join(' • ')}</div>
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:'16px', fontWeight:800, color:'#1c1917'}}>{a.feeMin.toLocaleString()}–{a.feeMax.toLocaleString()}€</div>
                    <div style={{fontSize:'11px', color:'#a8a29e'}}>fee artist</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {overBudgetArtists.length > 0 && (
        <div style={{marginBottom:'20px'}}>
          <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px'}}>
            <div style={{fontSize:'11px', fontWeight:700, color:'#16a34a', textTransform:'uppercase', letterSpacing:'0.06em'}}>✨ Recomandăm — artiști premium</div>
            <div style={{fontSize:'11px', color:'#78716c'}}>puțin peste buget, dar merită</div>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {overBudgetArtists.map(a => (
              <div key={a.id} onClick={() => setSelectedArtist(selectedArtist?.id === a.id ? null : a)}
                style={{background:'#f0fdf4', border:'2px solid ' + (selectedArtist?.id === a.id ? '#16a34a' : '#86efac'), borderRadius:'14px', padding:'16px 20px', cursor:'pointer', transition:'all 0.2s', position:'relative'}}>
                <div style={{position:'absolute', top:'12px', right:'16px', background:'#16a34a', color:'white', fontSize:'10px', fontWeight:700, padding:'3px 10px', borderRadius:'20px'}}>✨ Recomandat</div>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
                    <div style={{width:'44px', height:'44px', borderRadius:'12px', background:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:'14px'}}>
                      {a.name.split(' ').map((n: string) => n[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px'}}>
                        <span style={{fontWeight:700, fontSize:'14px', color:'#1c1917'}}>{a.name}</span>
                        <span style={{fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', background: a.tier === 'Premium' ? '#fef3c7' : '#eff6ff', color: a.tier === 'Premium' ? '#92400e' : '#1e40af'}}>{a.tier}</span>
                      </div>
                      <div style={{fontSize:'12px', color:'#a8a29e'}}>{a.genres.join(' • ')}</div>
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:'16px', fontWeight:800, color:'#16a34a'}}>{a.feeMin.toLocaleString()}–{a.feeMax.toLocaleString()}€</div>
                    <div style={{fontSize:'11px', color:'#16a34a', fontWeight:600}}>puțin peste buget</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{display:'flex', alignItems:'center', gap:'16px', padding:'12px 16px', background:'#f5f5f4', borderRadius:'10px', marginBottom:'16px', flexWrap:'wrap'}}>
        <span style={{fontSize:'10px', color:'#a8a29e', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em'}}>Tier:</span>
        <span style={{fontSize:'11px', color:'#78716c', display:'flex', alignItems:'center', gap:'6px'}}><span style={{background:'#fef3c7', color:'#92400e', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px'}}>Premium</span> 10.000€+</span>
        <span style={{fontSize:'11px', color:'#78716c', display:'flex', alignItems:'center', gap:'6px'}}><span style={{background:'#eff6ff', color:'#1e40af', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px'}}>A+</span> 5.000–9.999€</span>
        <span style={{fontSize:'11px', color:'#78716c', display:'flex', alignItems:'center', gap:'6px'}}><span style={{background:'#f5f5f4', color:'#78716c', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px'}}>A</span> sub 5.000€</span>
      </div>

      <div style={{display:'flex', gap:'12px'}}>
        <button onClick={onBack} style={{padding:'12px 24px', borderRadius:'12px', border:'1px solid #e7e5e4', background:'white', color:'#78716c', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif'}}>← Înapoi</button>
        <button onClick={() => { if(selectedArtist) onNext() }} disabled={!selectedArtist}
          style={{flex:1, background:'#1c1917', color:'white', padding:'12px', borderRadius:'12px', border:'none', cursor: selectedArtist ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif', opacity: selectedArtist ? 1 : 0.4}}>
          Continuă — Alege locația →
        </button>
      </div>
    </div>
  )
}
