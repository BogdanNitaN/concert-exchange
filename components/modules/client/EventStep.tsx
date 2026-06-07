'use client'

import { useRef, useEffect, useState } from 'react'
import { Heart, Baby, Building2, PartyPopper, Wine, Music, Flame, Rocket, MapPin, Users, Wallet, Disc3, Star, Sunset, Sun, Globe, HelpCircle , Trophy } from 'lucide-react'
import DatePicker from '@/components/modules/shared/DatePicker'

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
  onCitySelect?: (lat: number, lng: number) => void
  onExpert?: () => void
  onNext: () => void
}

const EVENT_TYPES = [
  { id: 'festival', icon: Music, label: 'Festival' },
  { id: 'popup', icon: Globe, label: 'Pop-Up Event' },
  { id: 'citydays', icon: Flame, label: 'City Days / Open Air' },
  { id: 'club', icon: Disc3, label: 'Club Night' },
  { id: 'corporate', icon: Building2, label: 'Corporate' },
  { id: 'lansare', icon: Rocket, label: 'Team Building' },
  { id: 'pool', icon: Sunset, label: 'Pool Party' },
  { id: 'dayparty', icon: Sun, label: 'Day Party' },
  { id: 'dinner', icon: Wine, label: 'Dinner & Show' },
  { id: 'nunta', icon: Heart, label: 'Nuntă' },
  { id: 'botez', icon: Baby, label: 'Botez' },
  { id: 'private', icon: PartyPopper, label: 'Petrecere privată' },
  { id: 'revelion', icon: Star, label: 'Revelion / Crăciun' },
  { id: 'altele', icon: HelpCircle, label: 'Nu știu / Altele' },
]

const CAPACITY_OPTIONS = [50, 100, 150, 200, 250, 350, 400, 600, 1000, 5000, 10000, 50000]

const NEEDS_GUESTS = ['nunta', 'botez', 'private', 'gala']

export default function EventStep({ eventType, setEventType, eventDate, setEventDate, budget, setBudget, guestCount, setGuestCount, selectedCity, setSelectedCity, citySearch, setCitySearch, setCenter, onCitySelect, onExpert, onNext }: Props) {
  const [citySuggestions, setCitySuggestions] = useState<GeoSuggestion[]>([])
  const searchTimer = useRef<any>(null)

  const isGuests = NEEDS_GUESTS.includes(eventType)
  const capacityLabel = isGuests ? 'Număr invitați' : 'Participanți estimați'

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
    onCitySelect?.(s.lat, s.lng)
    setCitySuggestions([])
  }

  return (
    <div>
      <div style={{textAlign:'center', marginBottom:'40px'}}>
        <h1 style={{fontSize:'32px', fontWeight:800, color:'#1c1917', marginBottom:'8px', letterSpacing:'-0.5px'}}>Ce eveniment planifici?</h1>
        <p style={{fontSize:'15px', color:'#78716c'}}>Vom găsi artiștii și locațiile potrivite pentru tine</p>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'8px', marginBottom:'28px'}}>
        {EVENT_TYPES.map(e => {
          const Icon = e.icon
          const isSelected = eventType === e.id
          return (
            <div key={e.id} onClick={() => { if(e.id === 'altele' && onExpert) { onExpert(); return } setEventType(e.id) }}
              style={{background: isSelected ? '#1c1917' : 'white', border:'1.5px solid ' + (isSelected ? '#1c1917' : '#e7e5e4'), borderRadius:'14px', padding:'16px 8px', cursor:'pointer', textAlign:'center', transform: isSelected ? 'scale(1.03)' : 'scale(1)', transition:'all 0.15s', boxShadow: isSelected ? '0 4px 20px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.04)'}}>
              <div style={{display:'flex', justifyContent:'center', marginBottom:'8px'}}>
                <Icon size={20} color={isSelected ? 'white' : '#44403c'} strokeWidth={1.5} />
              </div>
              <div style={{fontWeight:600, fontSize:'10px', color: isSelected ? 'white' : '#1c1917', letterSpacing:'0.01em', lineHeight:1.3}}>{e.label}</div>
            </div>
          )
        })}
      </div>

      <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'28px', marginBottom:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'24px'}}>
          <div>
            <label style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px'}}>
              Data evenimentului
            </label>
            <DatePicker value={eventDate} onChange={setEventDate} placeholder="Selectează data evenimentului" />
            {daysUntil !== null && daysUntil > 0 && (
              <div style={{fontSize:'11px', color: daysUntil < 30 ? '#dc2626' : '#059669', marginTop:'6px', fontWeight:600}}>
                {daysUntil < 30 ? 'Urgent — ' : ''} Peste {daysUntil} zile
              </div>
            )}
          </div>
          <div>
            <label style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px'}}>
              <Wallet size={11} strokeWidth={2} /> Buget total (€)
            </label>
            <input type="number" value={budget || ''} onChange={e => setBudget(Number(e.target.value))} placeholder="ex: 5000"
              style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', background:'#fafaf9'}} />
          </div>
        </div>

        <div style={{marginBottom:'24px'}}>
          <label style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'10px'}}>
            <Users size={11} strokeWidth={2} /> {capacityLabel}
          </label>
          <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
            {CAPACITY_OPTIONS.map(c => (
              <button key={c} onClick={() => setGuestCount(c)}
                style={{padding:'7px 14px', borderRadius:'20px', border:'1.5px solid', cursor:'pointer', fontSize:'12px', fontWeight:600, fontFamily:'Montserrat,sans-serif', transition:'all 0.15s',
                  background: guestCount === c ? '#1c1917' : 'white',
                  color: guestCount === c ? 'white' : '#78716c',
                  borderColor: guestCount === c ? '#1c1917' : '#e7e5e4'}}>
                {c >= 1000 ? (c/1000) + 'k' : c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px'}}>
            <MapPin size={11} strokeWidth={2} /> Orașul evenimentului
          </label>
          <div style={{position:'relative'}}>
            <input type="text" value={citySearch} onChange={e => { setCitySearch(e.target.value); setSelectedCity('') }} placeholder="Caută orașul..."
              style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid ' + (selectedCity ? '#059669' : '#e7e5e4'), fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', background:'#fafaf9'}} />
            {citySuggestions.length > 0 && !selectedCity && (
              <div style={{position:'absolute', top:'100%', left:0, right:0, background:'white', border:'1px solid #e7e5e4', borderRadius:'12px', marginTop:'4px', zIndex:200, boxShadow:'0 8px 32px rgba(0,0,0,0.10)', overflow:'hidden'}}>
                {citySuggestions.map((s, i) => (
                  <button key={i} onClick={() => selectCity(s)}
                    style={{width:'100%', textAlign:'left', padding:'11px 16px', border:'none', background:'white', cursor:'pointer', borderBottom: i < citySuggestions.length-1 ? '1px solid #f5f5f4' : 'none', fontFamily:'Montserrat,sans-serif'}}>
                    <div style={{fontSize:'13px', fontWeight:600, color:'#1c1917'}}>{s.name}</div>
                    <div style={{fontSize:'11px', color:'#a8a29e', marginTop:'1px'}}>{s.fullName}</div>
                  </button>
                ))}
              </div>
            )}
            {selectedCity && (
              <div style={{fontSize:'11px', color:'#059669', marginTop:'6px', fontWeight:600, display:'flex', alignItems:'center', gap:'6px'}}>
                <span style={{width:'6px', height:'6px', borderRadius:'50%', background:'#059669', display:'inline-block'}} />
                {selectedCity}
                <button onClick={() => { setSelectedCity(''); setCitySearch('') }} style={{background:'none', border:'none', cursor:'pointer', color:'#a8a29e', fontSize:'12px', marginLeft:'2px'}}>✕</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <button onClick={() => { if(eventType && guestCount && eventDate) onNext() }}
        disabled={!eventType || !guestCount || !eventDate}
        style={{width:'100%', background:'#1c1917', color:'white', padding:'15px', borderRadius:'14px', border:'none', cursor: eventType && guestCount && eventDate ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif', opacity: eventType && guestCount && eventDate ? 1 : 0.35, letterSpacing:'0.01em', transition:'opacity 0.2s'}}>
        Continuă
      </button>
    </div>
  )
}
