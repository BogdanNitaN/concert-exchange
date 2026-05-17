'use client'

import Link from 'next/link'
import TransportBreakdown from '@/components/modules/shared/TransportBreakdown'

const SETURI_OPTIONS = [
  { id: '1x45', label: '1 set × 45 min' },
  { id: '2x45', label: '2 seturi × 45 min' },
  { id: '3x45', label: '3 seturi × 45 min' },
  { id: 'allnight', label: 'All Night' },
]

const EVENT_TYPES = [
  { id: 'nunta', icon: '💍', label: 'Nuntă' },
  { id: 'botez', icon: '👶', label: 'Botez' },
  { id: 'corporate', icon: '🏢', label: 'Corporate' },
  { id: 'private', icon: '🎉', label: 'Petrecere privată' },
  { id: 'gala', icon: '🥂', label: 'Gală / Revelion' },
  { id: 'festival', icon: '🎪', label: 'Festival' },
  { id: 'citydays', icon: '🎆', label: 'City Days' },
  { id: 'corporate2', icon: '🚀', label: 'Lansare / Team Building' },
]

interface Props {
  eventType: string
  eventDate: string
  guestCount: number
  selectedArtist: any
  selectedVenues: any[]
  selectedCity: string
  selectedSeturi: string
  setSelectedSeturi: (v: string) => void
  totalMin: number
  totalMax: number
  requestSent: boolean
  onTrimite: () => void
  onBack: () => void
  onPretExact: () => void
}

export default function SummaryStep({ eventType, eventDate, guestCount, selectedArtist, selectedVenues, selectedCity, selectedSeturi, setSelectedSeturi, totalMin, totalMax, requestSent, onTrimite, onBack, onPretExact }: Props) {
  const eventInfo = EVENT_TYPES.find(e => e.id === eventType)

  if (requestSent) {
    return (
      <div style={{textAlign:'center', padding:'60px 0'}}>
        <div style={{fontSize:'64px', marginBottom:'20px'}}>🎉</div>
        <h2 style={{fontSize:'24px', fontWeight:800, color:'#1c1917', marginBottom:'8px'}}>Cerere trimisă!</h2>
        <p style={{fontSize:'14px', color:'#78716c', marginBottom:'24px'}}>Te contactăm în mai puțin de 30 min.</p>
        <Link href="/" style={{display:'inline-block', background:'#1c1917', color:'white', padding:'12px 32px', borderRadius:'12px', fontSize:'14px', fontWeight:700, textDecoration:'none'}}>Înapoi acasă</Link>
      </div>
    )
  }

  return (
    <div>
      <div style={{textAlign:'center', marginBottom:'28px'}}>
        <h1 style={{fontSize:'28px', fontWeight:800, color:'#1c1917', marginBottom:'8px'}}>Rezumat eveniment</h1>
        <p style={{fontSize:'14px', color:'#78716c'}}>Verifică detaliile înainte de a trimite cererea</p>
      </div>

      <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'24px', marginBottom:'16px'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', marginBottom:'20px'}}>
          <div>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'4px'}}>Eveniment</div>
            <div style={{fontSize:'15px', fontWeight:700, color:'#1c1917'}}>{eventInfo?.icon} {eventInfo?.label}</div>
          </div>
          <div>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'4px'}}>Data</div>
            <div style={{fontSize:'15px', fontWeight:700, color:'#1c1917'}}>{eventDate}</div>
          </div>
          <div>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'4px'}}>Invitați</div>
            <div style={{fontSize:'15px', fontWeight:700, color:'#1c1917'}}>{guestCount >= 1000 ? (guestCount/1000).toFixed(0) + 'k' : guestCount} pers.</div>
          </div>
        </div>
        <div style={{borderTop:'1px solid #f5f5f4', paddingTop:'20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
          <div>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>Artist</div>
            <div style={{background:'#f5f5f4', borderRadius:'12px', padding:'12px 16px'}}>
              <div style={{fontWeight:700, fontSize:'14px', color:'#1c1917', marginBottom:'2px'}}>{selectedArtist?.name}</div>
              <div style={{fontSize:'12px', color:'#78716c'}}>{selectedArtist?.genres?.join(' • ')}</div>
              <div style={{fontSize:'13px', fontWeight:800, color:'#1c1917', marginTop:'4px'}}>{selectedArtist?.feeMin?.toLocaleString()}–{selectedArtist?.feeMax?.toLocaleString()}€</div>
            </div>
          </div>
          <div>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>Locație</div>
            <div style={{background:'#f5f5f4', borderRadius:'12px', padding:'12px 16px'}}>
              <div style={{fontWeight:700, fontSize:'14px', color:'#1c1917', marginBottom:'2px'}}>{selectedVenues[0]?.name}</div>
              <div style={{fontSize:'12px', color:'#78716c'}}>{selectedVenues[0]?.city || selectedCity}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'16px', padding:'20px', marginBottom:'16px'}}>
        <div style={{fontSize:'12px', fontWeight:700, color:'#1c1917', marginBottom:'12px'}}>🎵 Seturi artist</div>
        <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
          {SETURI_OPTIONS.map(s => (
            <button key={s.id} onClick={() => setSelectedSeturi(s.id)}
              style={{padding:'8px 16px', borderRadius:'20px', border:'2px solid', cursor:'pointer', fontSize:'12px', fontWeight:600, fontFamily:'Montserrat,sans-serif', background: selectedSeturi === s.id ? '#1c1917' : 'white', color: selectedSeturi === s.id ? 'white' : '#78716c', borderColor: selectedSeturi === s.id ? '#1c1917' : '#e7e5e4'}}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'16px', padding:'20px', marginBottom:'16px'}}>
        <div style={{fontSize:'12px', fontWeight:700, color:'#166534', marginBottom:'16px'}}>💰 Deviz estimativ</div>
        <div style={{marginBottom:'16px'}}>
          <TransportBreakdown
            distantaKm={200}
            artist={{ costPerKm: selectedArtist?.costPerKm || 2, nrBileteAvion: selectedArtist?.nrBileteAvion || 0, cazareTip: selectedArtist?.cazare, cazareNrCamere: 1 }}
            currency="EUR"
          />
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:'8px', borderTop:'1px solid #bbf7d0', paddingTop:'12px'}}>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#166534'}}>
            <span>Fee artist (minim)</span><span style={{fontWeight:700}}>{selectedArtist?.feeMin?.toLocaleString()}€</span>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#166534'}}>
            <span>Fee artist (maxim)</span><span style={{fontWeight:700}}>{selectedArtist?.feeMax?.toLocaleString()}€</span>
          </div>
          <div style={{borderTop:'1px solid #bbf7d0', paddingTop:'8px', display:'flex', justifyContent:'space-between', fontSize:'15px', color:'#166534', fontWeight:800}}>
            <span>Total estimat</span><span>{totalMin.toLocaleString()}–{totalMax.toLocaleString()}€</span>
          </div>
          <div style={{fontSize:'10px', color:'#a8a29e', textAlign:'right'}}>* include toate taxele și comisioanele platformei</div>
        </div>

        <div style={{marginTop:'16px', background:'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius:'14px', padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', boxShadow:'0 4px 16px rgba(245,158,11,0.3)'}}
          onClick={onPretExact}>
          <div>
            <div style={{fontWeight:800, fontSize:'14px', color:'white', marginBottom:'2px'}}>🎯 Prețul exact, confirmat în 30 min.</div>
            <div style={{fontSize:'12px', color:'rgba(255,255,255,0.85)'}}>Fără surprize. Fără estimări. Garantat.</div>
          </div>
          <div style={{background:'white', color:'#d97706', fontWeight:800, fontSize:'13px', padding:'8px 16px', borderRadius:'10px', whiteSpace:'nowrap'}}>Vreau prețul →</div>
        </div>
      </div>

      <div style={{display:'flex', gap:'12px'}}>
        <button onClick={onBack} style={{padding:'12px 24px', borderRadius:'12px', border:'1px solid #e7e5e4', background:'white', color:'#78716c', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif'}}>← Înapoi</button>
        <button onClick={onTrimite} style={{flex:1, background:'#1c1917', color:'white', padding:'14px', borderRadius:'12px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif'}}>
          Trimite cererea 🎉
        </button>
      </div>
    </div>
  )
}
