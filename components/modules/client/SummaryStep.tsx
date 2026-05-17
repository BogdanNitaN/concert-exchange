'use client'

import Link from 'next/link'
import { MapPin, User, Calendar, Users, ArrowRight, CheckCircle2 } from 'lucide-react'
import TransportBreakdown from '@/components/modules/shared/TransportBreakdown'

const SETURI_OPTIONS = [
  { id: '1x45', label: '1 set · 45 min' },
  { id: '2x45', label: '2 seturi · 45 min' },
  { id: '3x45', label: '3 seturi · 45 min' },
  { id: 'allnight', label: 'All Night' },
]

const EVENT_TYPES = [
  { id: 'nunta', label: 'Nuntă' },
  { id: 'botez', label: 'Botez' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'private', label: 'Petrecere privată' },
  { id: 'gala', label: 'Gală / Revelion' },
  { id: 'festival', label: 'Festival' },
  { id: 'citydays', label: 'City Days' },
  { id: 'corporate2', label: 'Lansare / Team Building' },
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

  const tierStyle = (tier: string) => {
    if (tier === 'Premium') return { bg: '#f3f0ff', color: '#7c3aed' }
    if (tier === 'A+') return { bg: '#f0fdf4', color: '#059669' }
    return { bg: '#f5f5f4', color: '#44403c' }
  }

  if (requestSent) {
    return (
      <div style={{textAlign:'center', padding:'80px 0'}}>
        <div style={{display:'flex', justifyContent:'center', marginBottom:'20px'}}>
          <CheckCircle2 size={64} color='#059669' strokeWidth={1.5} />
        </div>
        <h2 style={{fontSize:'28px', fontWeight:800, color:'#1c1917', marginBottom:'8px', letterSpacing:'-0.5px'}}>Cerere trimisă!</h2>
        <p style={{fontSize:'15px', color:'#78716c', marginBottom:'32px'}}>Te contactăm în mai puțin de 30 min.</p>
        <Link href="/" style={{display:'inline-flex', alignItems:'center', gap:'8px', background:'#1c1917', color:'white', padding:'13px 28px', borderRadius:'14px', fontSize:'14px', fontWeight:700, textDecoration:'none'}}>
          Înapoi acasă <ArrowRight size={16} strokeWidth={2} />
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div style={{textAlign:'center', marginBottom:'32px'}}>
        <h1 style={{fontSize:'32px', fontWeight:800, color:'#1c1917', marginBottom:'8px', letterSpacing:'-0.5px'}}>Rezumat eveniment</h1>
        <p style={{fontSize:'15px', color:'#78716c'}}>Verifică detaliile înainte de a trimite cererea</p>
      </div>

      <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'24px', marginBottom:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', marginBottom:'20px'}}>
          <div>
            <div style={{display:'flex', alignItems:'center', gap:'5px', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>
              <Calendar size={10} strokeWidth={2} /> Eveniment
            </div>
            <div style={{fontSize:'14px', fontWeight:700, color:'#1c1917'}}>{eventInfo?.label}</div>
          </div>
          <div>
            <div style={{display:'flex', alignItems:'center', gap:'5px', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>
              <Calendar size={10} strokeWidth={2} /> Data
            </div>
            <div style={{fontSize:'14px', fontWeight:700, color:'#1c1917'}}>{eventDate}</div>
          </div>
          <div>
            <div style={{display:'flex', alignItems:'center', gap:'5px', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>
              <Users size={10} strokeWidth={2} /> Invitați
            </div>
            <div style={{fontSize:'14px', fontWeight:700, color:'#1c1917'}}>{guestCount >= 1000 ? (guestCount/1000).toFixed(0) + 'k' : guestCount} pers.</div>
          </div>
        </div>

        <div style={{borderTop:'1px solid #f5f5f4', paddingTop:'20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px'}}>
          <div>
            <div style={{display:'flex', alignItems:'center', gap:'5px', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px'}}>
              <User size={10} strokeWidth={2} /> Artist
            </div>
            <div style={{background:'#fafaf9', borderRadius:'12px', padding:'14px 16px', border:'1px solid #f0f0ef'}}>
              <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px'}}>
                <span style={{fontWeight:700, fontSize:'14px', color:'#1c1917'}}>{selectedArtist?.name}</span>
                {selectedArtist?.tier && (
                  <span style={{fontSize:'10px', fontWeight:700, padding:'2px 7px', borderRadius:'6px', background: tierStyle(selectedArtist.tier).bg, color: tierStyle(selectedArtist.tier).color}}>{selectedArtist.tier}</span>
                )}
              </div>
              <div style={{fontSize:'12px', color:'#78716c', marginBottom:'6px'}}>{selectedArtist?.genres?.join(' · ')}</div>
              <div style={{fontSize:'14px', fontWeight:800, color:'#1c1917'}}>{selectedArtist?.feeMin?.toLocaleString()}–{selectedArtist?.feeMax?.toLocaleString()}€</div>
            </div>
          </div>
          <div>
            <div style={{display:'flex', alignItems:'center', gap:'5px', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px'}}>
              <MapPin size={10} strokeWidth={2} /> Locație
            </div>
            <div style={{background:'#fafaf9', borderRadius:'12px', padding:'14px 16px', border:'1px solid #f0f0ef'}}>
              <div style={{fontWeight:700, fontSize:'14px', color:'#1c1917', marginBottom:'4px'}}>{selectedVenues[0]?.name}</div>
              <div style={{fontSize:'12px', color:'#78716c'}}>{selectedVenues[0]?.city || selectedCity}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'16px', padding:'20px', marginBottom:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
        <div style={{fontSize:'11px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'12px'}}>Seturi artist</div>
        <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
          {SETURI_OPTIONS.map(s => (
            <button key={s.id} onClick={() => setSelectedSeturi(s.id)}
              style={{padding:'8px 18px', borderRadius:'20px', border:'1.5px solid', cursor:'pointer', fontSize:'12px', fontWeight:600, fontFamily:'Montserrat,sans-serif', transition:'all 0.15s',
                background: selectedSeturi === s.id ? '#1c1917' : 'white',
                color: selectedSeturi === s.id ? 'white' : '#44403c',
                borderColor: selectedSeturi === s.id ? '#1c1917' : '#e7e5e4'}}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'16px', padding:'20px', marginBottom:'14px'}}>
        <div style={{fontSize:'11px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'16px'}}>Deviz estimativ</div>
        <div style={{marginBottom:'16px'}}>
          <TransportBreakdown
            distantaKm={200}
            artist={{ costPerKm: selectedArtist?.costPerKm || 2, nrBileteAvion: selectedArtist?.nrBileteAvion || 0, cazareTip: selectedArtist?.cazare, cazareNrCamere: 1 }}
            currency="EUR"
          />
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:'8px', borderTop:'1px solid #bbf7d0', paddingTop:'14px'}}>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#166534'}}>
            <span>Fee artist (minim)</span><span style={{fontWeight:700}}>{selectedArtist?.feeMin?.toLocaleString()}€</span>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#166534'}}>
            <span>Fee artist (maxim)</span><span style={{fontWeight:700}}>{selectedArtist?.feeMax?.toLocaleString()}€</span>
          </div>
          <div style={{borderTop:'1px solid #bbf7d0', paddingTop:'10px', display:'flex', justifyContent:'space-between', fontSize:'16px', color:'#1c1917', fontWeight:800}}>
            <span>Total estimat</span><span>{totalMin.toLocaleString()}–{totalMax.toLocaleString()}€</span>
          </div>
          <div style={{fontSize:'10px', color:'#a8a29e', textAlign:'right'}}>* include toate taxele și comisioanele platformei</div>
        </div>

        <div style={{marginTop:'16px', background:'#1c1917', borderRadius:'14px', padding:'18px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', boxShadow:'0 4px 20px rgba(0,0,0,0.15)'}}
          onClick={onPretExact}>
          <div>
            <div style={{fontWeight:800, fontSize:'14px', color:'white', marginBottom:'3px'}}>Prețul exact, confirmat în 30 min.</div>
            <div style={{fontSize:'12px', color:'rgba(255,255,255,0.6)'}}>Fără surprize. Fără estimări. Garantat.</div>
          </div>
          <div style={{background:'#059669', color:'white', fontWeight:700, fontSize:'13px', padding:'9px 18px', borderRadius:'10px', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:'6px'}}>
            Vreau prețul <ArrowRight size={14} strokeWidth={2} />
          </div>
        </div>
      </div>

      <div style={{display:'flex', gap:'10px'}}>
        <button onClick={onBack} style={{padding:'13px 24px', borderRadius:'14px', border:'1.5px solid #e7e5e4', background:'white', color:'#78716c', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif'}}>Înapoi</button>
        <button onClick={onTrimite} style={{flex:1, background:'#1c1917', color:'white', padding:'14px', borderRadius:'14px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
          Trimite cererea <ArrowRight size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
