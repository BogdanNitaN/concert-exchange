'use client'

import { CheckCircle2, Star, TrendingUp } from 'lucide-react'

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

  const tierStyle = (tier: string) => {
    if (tier === 'Premium') return { bg: '#f3f0ff', color: '#7c3aed' }
    if (tier === 'A+') return { bg: '#f0fdf4', color: '#059669' }
    return { bg: '#f5f5f4', color: '#44403c' }
  }

  const ArtistCard = ({ a, isOverBudget }: { a: any, isOverBudget?: boolean }) => {
    const isSelected = selectedArtist?.id === a.id
    const ts = tierStyle(a.tier)
    return (
      <div onClick={() => setSelectedArtist(isSelected ? null : a)}
        style={{background: isOverBudget ? '#f0fdf4' : 'white', border:'1.5px solid ' + (isSelected ? (isOverBudget ? '#059669' : '#1c1917') : (isOverBudget ? '#bbf7d0' : '#e7e5e4')), borderRadius:'16px', padding:'18px 20px', cursor:'pointer', transition:'all 0.15s', position:'relative', boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.10)' : '0 1px 3px rgba(0,0,0,0.04)'}}>
        {isOverBudget && (
          <div style={{position:'absolute', top:'14px', right:'16px', background:'#059669', color:'white', fontSize:'10px', fontWeight:700, padding:'3px 10px', borderRadius:'20px', display:'flex', alignItems:'center', gap:'4px'}}>
            <TrendingUp size={10} strokeWidth={2} /> Recomandat
          </div>
        )}
        {isSelected && (
          <div style={{position:'absolute', top:'14px', right: isOverBudget ? '120px' : '16px'}}>
            <CheckCircle2 size={18} color={isOverBudget ? '#059669' : '#1c1917'} strokeWidth={2} />
          </div>
        )}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
            <div style={{width:'46px', height:'46px', borderRadius:'14px', background: isOverBudget ? '#059669' : '#1c1917', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:'14px', letterSpacing:'-0.5px'}}>
              {a.name.split(' ').map((n: string) => n[0]).join('').slice(0,2)}
            </div>
            <div>
              <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px'}}>
                <span style={{fontWeight:700, fontSize:'14px', color:'#1c1917'}}>{a.name}</span>
                <span style={{fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', background: ts.bg, color: ts.color}}>{a.tier}</span>
              </div>
              <div style={{fontSize:'12px', color:'#78716c'}}>{a.genres.join(' · ')}</div>
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:'16px', fontWeight:800, color: isOverBudget ? '#059669' : '#1c1917'}}>{a.feeMin.toLocaleString()}–{a.feeMax.toLocaleString()}€</div>
            <div style={{fontSize:'11px', color:'#a8a29e'}}>fee artist</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{textAlign:'center', marginBottom:'28px'}}>
        <h1 style={{fontSize:'32px', fontWeight:800, color:'#1c1917', marginBottom:'8px', letterSpacing:'-0.5px'}}>Alege artistul</h1>
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', flexWrap:'wrap'}}>
          <p style={{fontSize:'14px', color:'#78716c', margin:0}}>{eventTypeLabel}</p>
          <div style={{display:'flex', alignItems:'center', gap:'6px', background:'#f5f5f4', borderRadius:'20px', padding:'5px 14px'}}>
            <span style={{fontSize:'12px', color:'#78716c', fontWeight:600}}>Buget:</span>
            <input type="number" value={budget || ''} onChange={e => setBudget(Number(e.target.value))} placeholder="€"
              style={{width:'80px', border:'none', background:'transparent', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', fontWeight:700}} />
            <span style={{fontSize:'12px', color:'#78716c'}}>€</span>
          </div>
        </div>
      </div>

      {inBudgetArtists.length > 0 && (
        <div style={{marginBottom:'24px'}}>
          <div style={{fontSize:'11px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'12px'}}>În bugetul tău</div>
          <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
            {inBudgetArtists.map(a => <ArtistCard key={a.id} a={a} />)}
          </div>
        </div>
      )}

      {overBudgetArtists.length > 0 && (
        <div style={{marginBottom:'24px'}}>
          <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px'}}>
            <Star size={12} color='#059669' strokeWidth={2} />
            <div style={{fontSize:'11px', fontWeight:700, color:'#059669', textTransform:'uppercase', letterSpacing:'0.08em'}}>Recomandăm</div>
            <div style={{fontSize:'11px', color:'#78716c'}}>puțin peste buget, dar merită</div>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
            {overBudgetArtists.map(a => <ArtistCard key={a.id} a={a} isOverBudget />)}
          </div>
        </div>
      )}

      <div style={{display:'flex', alignItems:'center', gap:'20px', padding:'14px 18px', background:'#f5f5f4', borderRadius:'12px', marginBottom:'20px', flexWrap:'wrap'}}>
        <span style={{fontSize:'10px', color:'#a8a29e', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em'}}>Tier</span>
        <span style={{fontSize:'11px', color:'#7c3aed', display:'flex', alignItems:'center', gap:'6px'}}>
          <span style={{background:'#f3f0ff', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', color:'#7c3aed'}}>Premium</span> 10.000€+
        </span>
        <span style={{fontSize:'11px', color:'#059669', display:'flex', alignItems:'center', gap:'6px'}}>
          <span style={{background:'#f0fdf4', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', color:'#059669'}}>A+</span> 5.000–9.999€
        </span>
        <span style={{fontSize:'11px', color:'#44403c', display:'flex', alignItems:'center', gap:'6px'}}>
          <span style={{background:'#f5f5f4', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', color:'#44403c'}}>A</span> sub 5.000€
        </span>
      </div>

      <div style={{display:'flex', gap:'10px'}}>
        <button onClick={onBack} style={{padding:'13px 24px', borderRadius:'14px', border:'1.5px solid #e7e5e4', background:'white', color:'#78716c', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif'}}>Înapoi</button>
        <button onClick={() => { if(selectedArtist) onNext() }} disabled={!selectedArtist}
          style={{flex:1, background:'#1c1917', color:'white', padding:'13px', borderRadius:'14px', border:'none', cursor: selectedArtist ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif', opacity: selectedArtist ? 1 : 0.35, transition:'opacity 0.2s'}}>
          Continuă — Alege locația
        </button>
      </div>
    </div>
  )
}
