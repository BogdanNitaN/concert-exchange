'use client'

import { ARTISTS_DATA } from '@/lib/artists-data'
import { Star, TrendingUp, X } from 'lucide-react'

interface Props {
  budget: number
  setBudget: (v: number) => void
  eventTypeLabel: string
  atmosfera?: string[]
  tipEntertainment?: string[]
  selectedArtists: any[]
  setSelectedArtists: (a: any[]) => void
  onBack: () => void
  onNext: () => void
}

const tierInfo = (tier: string) => {
  if (tier === 'Premium') return { bg: '#1c1917', color: 'white', label: 'A++ · Icon' }
  if (tier === 'A+') return { bg: '#7c3aed', color: 'white', label: 'A+ · Premium' }
  return { bg: '#f5f5f4', color: '#44403c', label: 'A · Select' }
}

const ENTERTAINMENT_GENRE_MAP: Record<string, string[]> = {
  dj: ['DJ', 'Dance', 'EDM', 'Lounge'],
  formatie: ['Cover Band', 'Rock', 'Pop', 'Folk', 'Lautareasca', 'Jazz', 'Populara', 'Balcanic', 'Latino'],
  vocal: ['Pop', 'Folk', 'Jazz', 'R&B', 'Rap', 'Hip-Hop', 'Trap', 'Manele'],
  instrumental: ['Jazz', 'Piano', 'Clasica'],
  dansatori: ['Dance', 'Pop', 'EDM'],
}

const matchesEntertainment = (artistGenres: string[], tipEntertainment: string[]) => {
  if (!tipEntertainment || tipEntertainment.length === 0) return true
  return tipEntertainment.some(tip => {
    const allowedGenres = ENTERTAINMENT_GENRE_MAP[tip] || []
    return artistGenres.some(g => 
      allowedGenres.some(ag => g.toLowerCase().includes(ag.toLowerCase()) || ag.toLowerCase().includes(g.toLowerCase()))
    )
  })
}

const VIBE_GENRE_MAP: Record<string, string[]> = {
  hype: ['Dance', 'Pop', 'Hip-Hop', 'EDM', 'Trap'],
  elegant: ['Jazz', 'Pop', 'Folk', 'Clasica', 'Piano'],
  petrecere: ['Pop', 'Dance', 'Cover Band', 'Trap'],
  balcanic: ['Manele', 'Lautareasca', 'Balcanic', 'Populara', 'Folk'],
  chill: ['Jazz', 'Lounge', 'Acoustic', 'Neo-Soul', 'Pop'],
  dayparty: ['Dance', 'Pop', 'EDM', 'Latino'],
  festival: ['Rock', 'Pop', 'EDM', 'Hip-Hop', 'Dance'],
  rooftop: ['Jazz', 'Lounge', 'Pop', 'Dance'],
  nostalgic: ['Pop', 'Rock', 'Folk', 'Slagare'],
}

const getMatchScore = (artistGenres: string[], atmosfera: string[]) => {
  if (!atmosfera || atmosfera.length === 0) return 100
  let matches = 0
  atmosfera.forEach(vibe => {
    const vibeGenres = VIBE_GENRE_MAP[vibe] || []
    artistGenres.forEach(g => {
      if (vibeGenres.some(vg => g.toLowerCase().includes(vg.toLowerCase()) || vg.toLowerCase().includes(g.toLowerCase()))) {
        matches++
      }
    })
  })
  return matches > 0 ? 100 : 0
}

const Legenda = () => (
  <div style={{display:'flex', alignItems:'center', gap:'16px', padding:'10px 18px', background:'white', borderBottom:'1px solid #f0f0ef', flexWrap:'wrap', position:'sticky', top:'56px', zIndex:50}}>
    <span style={{fontSize:'10px', color:'#a8a29e', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em'}}>Tier</span>
    <span style={{fontSize:'11px', display:'flex', alignItems:'center', gap:'6px'}}>
      <span style={{background:'#1c1917', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', color:'white'}}>A++ · Icon</span> 10.000€+
    </span>
    <span style={{fontSize:'11px', display:'flex', alignItems:'center', gap:'6px'}}>
      <span style={{background:'#7c3aed', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', color:'white'}}>A+ · Premium</span> 5.000–10.000€
    </span>
    <span style={{fontSize:'11px', display:'flex', alignItems:'center', gap:'6px'}}>
      <span style={{background:'#f5f5f4', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', color:'#44403c'}}>A · Select</span> până la 5.000€
    </span>
    
  </div>
)

export default function ArtistStep({ budget, setBudget, eventTypeLabel, atmosfera = [], tipEntertainment = [], selectedArtists, setSelectedArtists, onBack, onNext }: Props) {
  const ARTISTS = ARTISTS_DATA as unknown as any[]
  const filteredByType = ARTISTS.filter(a => matchesEntertainment(a.genres, tipEntertainment))
  const inBudgetArtists = budget > 0 ? filteredByType.filter(a => a.feeMax <= budget) : filteredByType
  const overBudgetArtists = budget > 0 ? filteredByType.filter(a => a.feeMax > budget && a.feeMin <= budget * 1.5) : []

  const toggleArtist = (a: any) => {
    const isSelected = selectedArtists.some(s => s.id === a.id)
    if (isSelected) {
      setSelectedArtists(selectedArtists.filter(s => s.id !== a.id))
    } else if (selectedArtists.length < 3) {
      setSelectedArtists([...selectedArtists, a])
    }
  }

  const ArtistCard = ({ a, isOverBudget }: { a: any, isOverBudget?: boolean }) => {
    const isSelected = selectedArtists.some(s => s.id === a.id)
    const selIndex = selectedArtists.findIndex(s => s.id === a.id)
    const ts = tierInfo(a.tier)
    const cannotSelect = !isSelected && selectedArtists.length >= 3

    return (
      <div onClick={() => !cannotSelect && toggleArtist(a)}
        style={{
          background: isSelected ? '#f0fdf4' : 'white',
          border: '1.5px solid ' + (isSelected ? '#059669' : '#e7e5e4'),
          borderRadius:'16px', padding:'16px 20px',
          cursor: cannotSelect ? 'not-allowed' : 'pointer',
          transition:'all 0.15s', position:'relative',
          opacity: cannotSelect ? 0.4 : 1,
          boxShadow: isSelected ? '0 4px 16px rgba(5,150,105,0.12)' : '0 1px 3px rgba(0,0,0,0.04)'
        }}>
        {isSelected && (
          <div style={{position:'absolute', top:'14px', right:'16px', width:'22px', height:'22px', borderRadius:'50%', background:'#059669', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'11px', fontWeight:800}}>
            {selIndex + 1}
          </div>
        )}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
            <div style={{width:'46px', height:'46px', borderRadius:'14px', background: isSelected ? '#059669' : '#1c1917', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:'14px'}}>
              {a.name.split(' ').map((n: string) => n[0]).join('').slice(0,2)}
            </div>
            <div>
              <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px'}}>
                <span style={{fontWeight:700, fontSize:'14px', color:'#1c1917'}}>{a.name}</span>
                <span style={{fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', background: ts.bg, color: ts.color}}>{ts.label}</span>
              </div>
              <div style={{fontSize:'12px', color:'#78716c'}}>{a.genres.join(' · ')}</div>
              {atmosfera.length > 0 && getMatchScore(a.genres, atmosfera) === 0 && (
                <div style={{fontSize:'11px', color:'#d97706', fontWeight:600, marginTop:'4px'}}>
                  ⚠️ Potrivire parțială cu atmosfera aleasă
                </div>
              )}
              {isOverBudget && (
                <div style={{display:'flex', alignItems:'center', gap:'4px', marginTop:'4px'}}>
                  <TrendingUp size={11} color='#059669' strokeWidth={2} />
                  <span style={{fontSize:'11px', color:'#059669', fontWeight:600}}>puțin peste buget, dar merită</span>
                </div>
              )}
            </div>
          </div>
          <div style={{fontSize:'11px', color:'#a8a29e'}}>fee la cerere</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{margin:'0 -24px'}}>
      <Legenda />
      <div style={{padding:'24px'}}>
        <div style={{textAlign:'center', marginBottom:'24px'}}>
          <h1 style={{fontSize:'28px', fontWeight:800, color:'#1c1917', marginBottom:'8px', letterSpacing:'-0.5px'}}>Alege artistul</h1>
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

        {selectedArtists.length > 0 && (
          <div style={{background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'14px', padding:'14px 16px', marginBottom:'20px'}}>
            <div style={{fontSize:'11px', fontWeight:700, color:'#059669', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'10px'}}>
              Artiști selectați ({selectedArtists.length}/3)
            </div>
            <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
              {selectedArtists.map((a, i) => (
                <div key={a.id} style={{display:'flex', alignItems:'center', gap:'8px', background:'white', border:'1px solid #bbf7d0', borderRadius:'20px', padding:'6px 12px'}}>
                  <span style={{width:'18px', height:'18px', borderRadius:'50%', background:'#059669', color:'white', fontSize:'10px', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center'}}>{i+1}</span>
                  <span style={{fontSize:'13px', fontWeight:600, color:'#1c1917'}}>{a.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); toggleArtist(a) }} style={{background:'none', border:'none', cursor:'pointer', color:'#a8a29e', padding:'0', display:'flex'}}>
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {inBudgetArtists.length > 0 && (
          <div style={{marginBottom:'28px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px', padding:'8px 14px', background:'#f5f5f4', borderRadius:'10px'}}>
              <div style={{width:'8px', height:'8px', borderRadius:'50%', background:'#059669'}} />
              <span style={{fontSize:'11px', fontWeight:700, color:'#1c1917', textTransform:'uppercase', letterSpacing:'0.08em'}}>În bugetul tău</span>
              <span style={{fontSize:'11px', color:'#78716c'}}>— {inBudgetArtists.length} artiști disponibili</span>
              <span style={{fontSize:'11px', color:'#7c3aed', fontWeight:600, marginLeft:'auto'}}>Poți verifica max 3 simultan</span>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              {inBudgetArtists.map(a => <ArtistCard key={a.id} a={a} />)}
            </div>
          </div>
        )}

        {overBudgetArtists.length > 0 && (
          <div style={{marginBottom:'24px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px', padding:'8px 14px', background:'#f0fdf4', borderRadius:'10px', border:'1px solid #bbf7d0'}}>
              <Star size={12} color='#059669' strokeWidth={2} fill='#059669' />
              <span style={{fontSize:'11px', fontWeight:700, color:'#059669', textTransform:'uppercase', letterSpacing:'0.08em'}}>Recomandăm</span>
              <span style={{fontSize:'11px', color:'#78716c'}}>— puțin peste buget, dar merită</span>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              {overBudgetArtists.map(a => <ArtistCard key={a.id} a={a} isOverBudget />)}
            </div>
          </div>
        )}

        <div style={{display:'flex', gap:'10px', marginTop:'8px'}}>
          <button onClick={onBack} style={{padding:'13px 24px', borderRadius:'14px', border:'1.5px solid #e7e5e4', background:'white', color:'#78716c', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif'}}>Înapoi</button>
          <button onClick={() => { if(selectedArtists.length > 0) onNext() }} disabled={selectedArtists.length === 0}
            style={{flex:1, background:'#1c1917', color:'white', padding:'13px', borderRadius:'14px', border:'none', cursor: selectedArtists.length > 0 ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif', opacity: selectedArtists.length > 0 ? 1 : 0.35}}>
            {selectedArtists.length === 0 ? 'Alege cel puțin un artist' : selectedArtists.length === 1 ? 'Continuă cu ' + selectedArtists[0].name : 'Continuă cu ' + selectedArtists.length + ' artiști selectați'}
          </button>
        </div>
      </div>
    </div>
  )
}
