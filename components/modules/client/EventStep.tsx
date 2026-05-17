'use client'

import { useRef, useEffect, useState } from 'react'

interface GeoSuggestion { name: string; fullName: string; lat: number; lng: number }

interface Props {
  eventType: string
  setEventType: (v: string) => void
  eventDate: string
  setEventDate: (v: string) => void
  budget: number
  setBudget: (v: number) => void
  guestCount: number
  setGuestCount: (v: number) => void
  selectedCity: string
  setSelectedCity: (v: string) => void
  citySearch: string
  setCitySearch: (v: string) => void
  setCenter: (v: [number, number]) => void
  onNext: () => void
}

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

const CAPACITY_OPTIONS = [100, 150, 200, 250, 350, 400, 600, 1000, 5000, 10000, 50000]

export default function EventStep({ eventType, setEventType, eventDate, setEventDate, budget, setBudget, guestCount, setGuestCount, selectedCity, setSelectedCity, citySearch, setCitySearch, setCenter, onNext }: Props) {
  const [citySuggestions, setCitySuggestions] = useState<GeoSuggestion[]>([])
  const searchTimer = useRef<any>(null)

  const daysUntil = eventDate ? Math.floor((new Date(eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null

  useEffect(() => {
    if (citySearch.length < 3) { setCitySuggestions([]); return }
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(citySearch) + '&countrycodes=ro,md&format=json&limit=6&accept-language=ro&addressdetails=1')
        const data = await res.json()
        setCitySuggestions(data.map((d: any) => ({
          name: d.address?.city || d.address?.town || d.address?.village || d.name,
          fullName: [d.address?.city || d.address?.town || d.address?.village || d.name, d.address?.county].filter(Boolean).join(', '),
          lat: parseFloat(d.lat), lng: parseFloat(d.lon)
        })))
      } catch {}
    }, 400)
  }, [citySearch])

  const selectCity = (s: GeoSuggestion) => {
    setSelectedCity(s.fullName)
    setCitySearch(s.name)
    setCenter([s.lat, s.lng])
    setCitySuggestions([])
  }

  return (
    <div>
      <div style={{textAlign:'center', marginBottom:'32px'}}>
        <h1 style={{fontSize:'28px', fontWeight:800, color:'#1c1917', marginBottom:'8px'}}>Ce eveniment planifici?</h1>
        <p style={{fontSize:'14px', color:'#78716c'}}>Vom găsi artiștii și locațiile potrivite pentru tine</p>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'12px', marginBottom:'24px'}}>
        {EVENT_TYPES.map(e => (
          <div key={e.id} onClick={() => setEventType(e.id)}
            style={{background: eventType === e.id ? '#1c1917' : 'white', border:'2px solid ' + (eventType === e.id ? '#1c1917' : '#e7e5e4'), borderRadius:'14px', padding:'20px 12px', cursor:'pointer', textAlign:'center', transform: eventType === e.id ? 'scale(1.03)' : 'scale(1)', transition:'all 0.2s'}}>
            <div style={{fontSize:'28px', marginBottom:'8px'}}>{e.icon}</div>
            <div style={{fontWeight:700, fontSize:'12px', color: eventType === e.id ? 'white' : '#1c1917'}}>{e.label}</div>
          </div>
        ))}
      </div>
      <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'16px', padding:'24px', marginBottom:'24px'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px'}}>
          <div>
            <label style={{display:'block', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>Data evenimentului</label>
            <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)}
              style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
            {daysUntil !== null && daysUntil > 0 && (
              <div style={{fontSize:'11px', color: daysUntil < 30 ? '#ef4444' : '#22c55e', marginTop:'4px', fontWeight:600}}>
                {daysUntil < 30 ? '⚠️' : '📅'} Peste {daysUntil} zile
              </div>
            )}
          </div>
          <div>
            <label style={{display:'block', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>Buget total (€)</label>
            <input type="number" value={budget || ''} onChange={e => setBudget(Number(e.target.value))} placeholder="ex: 5000"
              style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
          </div>
        </div>
        <div style={{marginBottom:'20px'}}>
          <label style={{display:'block', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>Număr invitați</label>
          <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
            {CAPACITY_OPTIONS.map(c => (
              <button key={c} onClick={() => setGuestCount(c)}
                style={{padding:'6px 12px', borderRadius:'20px', border:'1px solid', cursor:'pointer', fontSize:'12px', fontWeight:600, fontFamily:'Montserrat,sans-serif', background: guestCount === c ? '#1c1917' : 'white', color: guestCount === c ? 'white' : '#78716c', borderColor: guestCount === c ? '#1c1917' : '#e7e5e4'}}>
                {c >= 1000 ? (c/1000) + 'k' : c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={{display:'block', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>Orașul evenimentului</label>
          <div style={{position:'relative'}}>
            <span style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', fontSize:'14px'}}>📍</span>
            <input type="text" value={citySearch} onChange={e => { setCitySearch(e.target.value); setSelectedCity('') }} placeholder="Caută orașul..."
              style={{width:'100%', paddingLeft:'32px', paddingRight:'10px', paddingTop:'10px', paddingBottom:'10px', borderRadius:'10px', border:'1px solid ' + (selectedCity ? '#22c55e' : '#e7e5e4'), fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
            {citySuggestions.length > 0 && !selectedCity && (
              <div style={{position:'absolute', top:'100%', left:0, right:0, background:'white', border:'1px solid #e7e5e4', borderRadius:'10px', marginTop:'4px', zIndex:200, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', overflow:'hidden'}}>
                {citySuggestions.map((s, i) => (
                  <button key={i} onClick={() => selectCity(s)}
                    style={{width:'100%', textAlign:'left', padding:'10px 14px', border:'none', background:'white', cursor:'pointer', borderBottom:'1px solid #f5f5f4', fontFamily:'Montserrat,sans-serif'}}>
                    <div style={{fontSize:'13px', fontWeight:600, color:'#1c1917'}}>{s.name}</div>
                    <div style={{fontSize:'11px', color:'#a8a29e'}}>{s.fullName}</div>
                  </button>
                ))}
              </div>
            )}
            {selectedCity && (
              <div style={{fontSize:'11px', color:'#22c55e', marginTop:'6px', fontWeight:700, display:'flex', alignItems:'center', gap:'4px'}}>
                ✓ {selectedCity}
                <button onClick={() => { setSelectedCity(''); setCitySearch('') }} style={{background:'none', border:'none', cursor:'pointer', color:'#a8a29e', fontSize:'12px'}}>✕</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <button onClick={() => { if(eventType && guestCount && eventDate) onNext() }}
        disabled={!eventType || !guestCount || !eventDate}
        style={{width:'100%', background:'#1c1917', color:'white', padding:'14px', borderRadius:'12px', border:'none', cursor: eventType && guestCount && eventDate ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif', opacity: eventType && guestCount && eventDate ? 1 : 0.4}}>
        Continuă →
      </button>
    </div>
  )
}
