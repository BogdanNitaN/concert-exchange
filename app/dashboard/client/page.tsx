'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const MapVenues = dynamic(() => import('@/components/map/MapVenues'), { ssr: false })

const EVENT_TYPES = [
  { id: 'nunta', icon: '💍', label: 'Nuntă', desc: 'Petrecere de nuntă cu muzică live' },
  { id: 'botez', icon: '👶', label: 'Botez', desc: 'Petrecere de botez' },
  { id: 'corporate', icon: '🏢', label: 'Corporate', desc: 'Eveniment de companie' },
  { id: 'petrecere', icon: '🎉', label: 'Petrecere privată', desc: 'Aniversare sau petrecere privată' },
  { id: 'craciun', icon: '🎄', label: 'Crăciun / Revelion', desc: 'Petrecere de sărbători' },
  { id: 'citydays', icon: '🏙️', label: 'City Days', desc: 'Eveniment municipal / Zilele orașului' },
  { id: 'festival', icon: '🎪', label: 'Festival', desc: 'Festival de muzică sau cultură' },
]

const CAPACITY_OPTIONS = [100, 150, 200, 250, 350, 400, 600, 1000, 5000, 10000, 50000]

const VENUE_TYPES_CLIENT = ["Toate", "Ballroom", "Restaurant cu scenă", "Hotel conference", "Conac/Vilă", "Sală Evenimente", "Casă de cultură", "Parc evenimente", "Amfiteatru", "Piață centrală", "Stadion"]

const MUSIC_STYLES = ["Internațional", "Manele", "Populară românească", "Mix", "Jazz", "Rock", "Clasică", "EDM/Dance"]

const VENUES = [
  { id:1, name:"Ballroom Grand", lat:44.43, lng:26.10, type:"Ballroom", city:"București", capacity:500, priceEstimate:"3.000-5.000€" },
  { id:2, name:"Restaurant Silva", lat:46.77, lng:23.59, type:"Restaurant cu scenă", city:"Cluj-Napoca", capacity:200, priceEstimate:"1.500-2.500€" },
  { id:3, name:"Hotel Radisson", lat:44.44, lng:26.10, type:"Hotel conference", city:"București", capacity:1000, priceEstimate:"5.000-8.000€" },
  { id:4, name:"Conac Brătășanu", lat:45.80, lng:24.15, type:"Conac/Vilă", city:"Sibiu", capacity:150, priceEstimate:"2.000-4.000€" },
  { id:5, name:"Sala Regal", lat:45.75, lng:21.23, type:"Sală Evenimente", city:"Timișoara", capacity:400, priceEstimate:"2.500-4.000€" },
  { id:6, name:"Vila Florica", lat:44.33, lng:23.79, type:"Conac/Vilă", city:"Craiova", capacity:250, priceEstimate:"2.000-3.500€" },
  { id:7, name:"Grand Hotel Italia", lat:46.77, lng:23.61, type:"Hotel conference", city:"Cluj-Napoca", capacity:350, priceEstimate:"3.000-5.000€" },
  { id:8, name:"Ballroom Intercontinental", lat:44.44, lng:26.11, type:"Ballroom", city:"București", capacity:600, priceEstimate:"4.000-7.000€" },
  { id:9, name:"Casa Vernescu", lat:44.45, lng:26.09, type:"Ballroom", city:"București", capacity:300, priceEstimate:"2.500-4.500€" },
  { id:10, name:"Conac Heldsdorf", lat:45.64, lng:25.59, type:"Conac/Vilă", city:"Brașov", capacity:100, priceEstimate:"1.500-3.000€" },
  { id:11, name:"Parcul Herăstrău", lat:44.47, lng:26.08, type:"Parc evenimente", city:"București", capacity:50000, priceEstimate:"10.000-50.000€" },
  { id:12, name:"Piața Unirii Cluj", lat:46.77, lng:23.59, type:"Piață centrală", city:"Cluj-Napoca", capacity:30000, priceEstimate:"5.000-30.000€" },
  { id:13, name:"Amfiteatru Constanța", lat:44.18, lng:28.65, type:"Amfiteatru", city:"Constanța", capacity:3000, priceEstimate:"2.000-8.000€" },
]

const ARTISTS = [
  { id:1, name:"Maria Cânt", genres:["Pop","Folk"], events:["Nuntă","Botez","City Days"], feeMin:3000, feeMax:5000, tier:"A+", available:true, transport:200, cazare:150 },
  { id:2, name:"Florentin & Band", genres:["Cover Band","Lăutărească"], events:["Nuntă","Botez","Petrecere","City Days"], feeMin:2000, feeMax:3500, tier:"A", available:true, transport:150, cazare:120 },
  { id:3, name:"DJ Cristian", genres:["Dance","Pop"], events:["Nuntă","Corporate","Petrecere","Festival"], feeMin:1500, feeMax:2500, tier:"A", available:true, transport:100, cazare:100 },
  { id:4, name:"Formația Bucuria", genres:["Populară","Lăutărească"], events:["Nuntă","Botez","City Days","Festival"], feeMin:2500, feeMax:4000, tier:"A+", available:true, transport:180, cazare:130 },
  { id:5, name:"Jazz Quartet", genres:["Jazz"], events:["Corporate","Petrecere","Festival"], feeMin:1800, feeMax:3000, tier:"A", available:true, transport:120, cazare:110 },
  { id:6, name:"DJ Armin V.", genres:["EDM","Dance"], events:["Festival","City Days","Corporate"], feeMin:8000, feeMax:15000, tier:"Premium", available:true, transport:500, cazare:300 },
  { id:7, name:"Taraful Regal", genres:["Populară","Lăutărească"], events:["Nuntă","Botez","City Days"], feeMin:1500, feeMax:2500, tier:"A", available:true, transport:120, cazare:100 },
]

interface GeoSuggestion {
  name: string
  fullName: string
  lat: number
  lng: number
}

export default function ClientDashboard() {
  const [step, setStep] = useState('event')
  const [eventType, setEventType] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [guestCount, setGuestCount] = useState(0)
  const [budget, setBudget] = useState(0)
  const [musicStyle, setMusicStyle] = useState('')
  const [needInvoice, setNeedInvoice] = useState(false)
  const [needEquipment, setNeedEquipment] = useState(false)
  const [venueType, setVenueType] = useState('Toate')
  const [selectedVenues, setSelectedVenues] = useState([])
  const [compareMode, setCompareMode] = useState(false)
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [citySearch, setCitySearch] = useState('')
  const [center, setCenter] = useState([45.7489, 24.9668])
  const [citySuggestions, setCitySuggestions] = useState([])
  const [selectedCity, setSelectedCity] = useState('')
  const [requestSent, setRequestSent] = useState(false)
  const [wishlist, setWishlist] = useState([])
  const [activeVenueCard, setActiveVenueCard] = useState(null)
  const searchTimer = useRef(null)

  const isCityDaysOrFestival = eventType === 'citydays' || eventType === 'festival'

  useEffect(() => {
    if (citySearch.length < 3) { setCitySuggestions([]); return }
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(citySearch) + '&countrycodes=ro,md&format=json&limit=6&accept-language=ro&addressdetails=1'
        )
        const data = await res.json()
        setCitySuggestions(data.map((d) => ({
          name: d.address?.city || d.address?.town || d.address?.village || d.name,
          fullName: [d.address?.city || d.address?.town || d.address?.village || d.name, d.address?.county].filter(Boolean).join(', '),
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lon)
        })))
      } catch {}
    }, 400)
  }, [citySearch])

  const selectCity = (s) => {
    setSelectedCity(s.fullName)
    setCitySearch(s.name)
    setCenter([s.lat, s.lng])
    setCitySuggestions([])
  }

  const toggleVenueSelect = (venue) => {
    if (compareMode) {
      setSelectedVenues(prev => {
        const exists = prev.find(v => v.id === venue.id)
        if (exists) return prev.filter(v => v.id !== venue.id)
        if (prev.length >= 3) return prev
        return [...prev, venue]
      })
    } else {
      setSelectedVenues([venue])
    }
  }

  const filteredVenues = VENUES.filter(v => {
    if (venueType !== 'Toate' && v.type !== venueType) return false
    if (guestCount > 0 && v.capacity < guestCount) return false
    return true
  })

  const filteredArtists = ARTISTS.filter(a => {
    const eventLabel = EVENT_TYPES.find(e => e.id === eventType)?.label || ''
    const matchesEvent = a.events.some(e => 
      e.toLowerCase().includes(eventLabel.toLowerCase()) || 
      eventLabel.toLowerCase().includes(e.toLowerCase()) ||
      (eventType === 'citydays' && e === 'City Days') ||
      (eventType === 'festival' && e === 'Festival')
    )
    if (budget > 0 && a.feeMax > budget) return false
    return matchesEvent
  })

  const calcDaysUntil = () => {
    if (!eventDate) return null
    const diff = Math.floor((new Date(eventDate) - new Date()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const daysUntil = calcDaysUntil()

  const totalEstimate = selectedArtist ? {
    fee: selectedArtist.feeMin + '-' + selectedArtist.feeMax + '€',
    transport: selectedArtist.transport,
    cazare: selectedArtist.cazare,
    comision: Math.round(selectedArtist.feeMin * 0.03),
    total: selectedArtist.feeMax + selectedArtist.transport + selectedArtist.cazare
  } : null

  const toggleWishlist = (item, type) => {
    setWishlist(prev => {
      const exists = prev.find(w => w.id === item.id && w.type === type)
      if (exists) return prev.filter(w => !(w.id === item.id && w.type === type))
      return [...prev, { ...item, type }]
    })
  }

  const isInWishlist = (item, type) => wishlist.some(w => w.id === item.id && w.type === type)

  const steps = ['event', 'venue', 'artist', 'summary']
  const stepIndex = steps.indexOf(step)

  return (
    <div style={{minHeight:'100vh', background:'#fafaf9', fontFamily:'Montserrat,sans-serif'}}>

      <nav style={{borderBottom:'1px solid #e7e5e4', background:'white', height:'56px', display:'flex', alignItems:'center', padding:'0 24px', justifyContent:'space-between', position:'sticky', top:0, zIndex:100}}>
        <Link href="/" style={{fontWeight:800, fontSize:'18px', color:'#1c1917', textDecoration:'none'}}>
          Concert <span style={{color:'#f59e0b'}}>●</span> Exchange
        </Link>
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          {steps.map((s, i) => (
            <div key={s} style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <div onClick={() => { if (i < stepIndex) setStep(s) }}
                style={{width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700,
                  cursor: i < stepIndex ? 'pointer' : 'default',
                  background: step === s ? '#1c1917' : i < stepIndex ? '#22c55e' : '#e7e5e4',
                  color: step === s || i < stepIndex ? 'white' : '#78716c'
                }}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              {i < 3 && <div style={{width:'24px', height:'2px', background: i < stepIndex ? '#22c55e' : '#e7e5e4'}} />}
            </div>
          ))}
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          {wishlist.length > 0 && (
            <div style={{background:'#fef3c7', border:'1px solid #fde68a', borderRadius:'20px', padding:'4px 12px', fontSize:'12px', fontWeight:700, color:'#92400e'}}>
              ❤️ {wishlist.length} favorite
            </div>
          )}
          <Link href="/" style={{fontSize:'12px', color:'#78716c', textDecoration:'none'}}>← Înapoi</Link>
        </div>
      </nav>

      <div style={{maxWidth:'960px', margin:'0 auto', padding:'40px 24px'}}>

        {step === 'event' && (
          <div>
            <div style={{textAlign:'center', marginBottom:'36px'}}>
              <h1 style={{fontSize:'28px', fontWeight:800, color:'#1c1917', marginBottom:'8px'}}>Ce eveniment planifici?</h1>
              <p style={{fontSize:'14px', color:'#78716c'}}>Vom găsi artiștii și locațiile potrivite pentru tine</p>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'12px', marginBottom:'28px'}}>
              {EVENT_TYPES.map(e => (
                <div key={e.id} onClick={() => setEventType(e.id)}
                  style={{background:'white', border:'2px solid ' + (eventType === e.id ? '#1c1917' : '#e7e5e4'), borderRadius:'14px', padding:'18px', cursor:'pointer', textAlign:'center',
                    boxShadow: eventType === e.id ? '0 4px 16px rgba(0,0,0,0.1)' : 'none', transition:'all 0.2s'
                  }}>
                  <div style={{fontSize:'28px', marginBottom:'8px'}}>{e.icon}</div>
                  <div style={{fontWeight:700, fontSize:'13px', color:'#1c1917', marginBottom:'3px'}}>{e.label}</div>
                  <div style={{fontSize:'11px', color:'#a8a29e'}}>{e.desc}</div>
                </div>
              ))}
            </div>

            {isCityDaysOrFestival && (
              <div style={{background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'14px', padding:'16px', marginBottom:'20px'}}>
                <div style={{fontSize:'13px', fontWeight:700, color:'#1e40af', marginBottom:'8px'}}>🏛️ Eveniment public / instituțional</div>
                <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
                  {['Primărie', 'Centru cultural', 'Organizator privat pentru primărie'].map(org => (
                    <div key={org} style={{background:'white', border:'1px solid #bfdbfe', borderRadius:'20px', padding:'4px 12px', fontSize:'12px', fontWeight:600, color:'#1e40af', cursor:'pointer'}}>
                      {org}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'16px', padding:'24px', marginBottom:'24px'}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px'}}>
                <div>
                  <label style={{display:'block', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>Data evenimentului</label>
                  <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)}
                    style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
                  {daysUntil !== null && daysUntil > 0 && (
                    <div style={{fontSize:'11px', color: daysUntil < 30 ? '#ef4444' : daysUntil < 90 ? '#f59e0b' : '#22c55e', marginTop:'4px', fontWeight:600}}>
                      {daysUntil < 30 ? '⚠️' : '📅'} Peste {daysUntil} zile
                    </div>
                  )}
                </div>
                <div>
                  <label style={{display:'block', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>Buget total disponibil (€)</label>
                  <input type="number" value={budget || ''} onChange={e => setBudget(Number(e.target.value))}
                    placeholder="ex: 5000"
                    style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
                  {budget > 0 && (
                    <div style={{fontSize:'11px', color:'#78716c', marginTop:'4px'}}>
                      Artist: ~{Math.round(budget * 0.6).toLocaleString()}€ • Locație: ~{Math.round(budget * 0.3).toLocaleString()}€ • Altele: ~{Math.round(budget * 0.1).toLocaleString()}€
                    </div>
                  )}
                </div>
              </div>

              <div style={{marginBottom:'20px'}}>
                <label style={{display:'block', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>
                  Număr {isCityDaysOrFestival ? 'participanți estimați' : 'invitați'}
                </label>
                <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
                  {CAPACITY_OPTIONS.map(c => (
                    <button key={c} onClick={() => setGuestCount(c)}
                      style={{padding:'6px 12px', borderRadius:'20px', border:'1px solid', cursor:'pointer', fontSize:'12px', fontWeight:600, fontFamily:'Montserrat,sans-serif',
                        background: guestCount === c ? '#1c1917' : 'white',
                        color: guestCount === c ? 'white' : '#78716c',
                        borderColor: guestCount === c ? '#1c1917' : '#e7e5e4'
                      }}>{c >= 1000 ? (c/1000) + 'k' : c}</button>
                  ))}
                </div>
              </div>

              <div style={{marginBottom:'20px'}}>
                <label style={{display:'block', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>Stil muzical preferat</label>
                <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
                  {MUSIC_STYLES.map(m => (
                    <button key={m} onClick={() => setMusicStyle(musicStyle === m ? '' : m)}
                      style={{padding:'6px 12px', borderRadius:'20px', border:'1px solid', cursor:'pointer', fontSize:'12px', fontWeight:600, fontFamily:'Montserrat,sans-serif',
                        background: musicStyle === m ? '#f59e0b' : 'white',
                        color: musicStyle === m ? 'white' : '#78716c',
                        borderColor: musicStyle === m ? '#f59e0b' : '#e7e5e4'
                      }}>{m}</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{display:'block', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>Orașul evenimentului</label>
                <div style={{position:'relative'}}>
                  <span style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', fontSize:'14px'}}>📍</span>
                  <input type="text" value={citySearch} onChange={e => { setCitySearch(e.target.value); setSelectedCity('') }}
                    placeholder="Caută orașul..."
                    style={{width:'100%', paddingLeft:'32px', paddingRight:'10px', paddingTop:'10px', paddingBottom:'10px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
                  {citySuggestions.length > 0 && (
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
                  {selectedCity && <div style={{fontSize:'11px', color:'#22c55e', marginTop:'4px', fontWeight:600}}>✓ {selectedCity}</div>}
                </div>
              </div>

              <div style={{display:'flex', gap:'16px', marginTop:'20px'}}>
                <label style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'13px', color:'#78716c'}}>
                  <input type="checkbox" checked={needInvoice} onChange={e => setNeedInvoice(e.target.checked)} />
                  Factură necesară (PFA/SRL)
                </label>
                <label style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'13px', color:'#78716c'}}>
                  <input type="checkbox" checked={needEquipment} onChange={e => setNeedEquipment(e.target.checked)} />
                  Echipament tehnic inclus (sunet, lumini)
                </label>
              </div>
            </div>

            {daysUntil !== null && daysUntil > 0 && (
              <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'14px', padding:'16px', marginBottom:'20px'}}>
                <div style={{fontSize:'12px', fontWeight:700, color:'#1c1917', marginBottom:'10px'}}>📋 Timeline planificare</div>
                <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
                  {[
                    { days: 90, text: 'Rezervă artistul și locația' },
                    { days: 60, text: 'Confirmă detaliile tehnice și riderul' },
                    { days: 30, text: 'Finalizează contractul și avansul' },
                    { days: 14, text: 'Confirmă programul serii' },
                    { days: 1, text: 'Verifică logistica și echipamentul' },
                  ].map(t => (
                    <div key={t.days} style={{display:'flex', alignItems:'center', gap:'10px', opacity: daysUntil > t.days ? 1 : 0.4}}>
                      <div style={{width:'8px', height:'8px', borderRadius:'50%', background: daysUntil > t.days ? '#22c55e' : '#e7e5e4', flexShrink:0}} />
                      <span style={{fontSize:'12px', color: daysUntil > t.days ? '#1c1917' : '#a8a29e'}}>
                        Cu {t.days} zile înainte: {t.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => { if(eventType && guestCount && eventDate) setStep('venue') }}
              disabled={!eventType || !guestCount || !eventDate}
              style={{width:'100%', background:'#1c1917', color:'white', padding:'14px', borderRadius:'12px', border:'none', cursor: eventType && guestCount && eventDate ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif', opacity: eventType && guestCount && eventDate ? 1 : 0.4}}>
              Continuă — Alege locația →
            </button>
          </div>
        )}

        {step === 'venue' && (
          <div>
            <div style={{textAlign:'center', marginBottom:'24px'}}>
              <h1 style={{fontSize:'28px', fontWeight:800, color:'#1c1917', marginBottom:'8px'}}>Alege locația</h1>
              <p style={{fontSize:'14px', color:'#78716c'}}>{guestCount} {isCityDaysOrFestival ? 'participanți' : 'invitați'} • {eventDate} • {selectedCity || 'România'}</p>
            </div>

            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
              <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
                {VENUE_TYPES_CLIENT.map(t => (
                  <button key={t} onClick={() => setVenueType(t)}
                    style={{padding:'5px 12px', borderRadius:'20px', border:'1px solid', cursor:'pointer', fontSize:'11px', fontWeight:600, fontFamily:'Montserrat,sans-serif',
                      background: venueType === t ? '#1c1917' : 'white',
                      color: venueType === t ? 'white' : '#78716c',
                      borderColor: venueType === t ? '#1c1917' : '#e7e5e4'
                    }}>{t}</button>
                ))}
              </div>
              <button onClick={() => setCompareMode(!compareMode)}
                style={{padding:'6px 14px', borderRadius:'10px', border:'1px solid', cursor:'pointer', fontSize:'12px', fontWeight:700, fontFamily:'Montserrat,sans-serif',
                  background: compareMode ? '#7c3aed' : 'white',
                  color: compareMode ? 'white' : '#78716c',
                  borderColor: compareMode ? '#7c3aed' : '#e7e5e4'
                }}>
                {compareMode ? '✓ Mod comparare (max 3)' : '⚖️ Compară locații'}
              </button>
            </div>

            <div style={{height:'280px', borderRadius:'16px', overflow:'hidden', marginBottom:'16px', border:'1px solid #e7e5e4'}}>
              <MapVenues venues={filteredVenues} center={center} radius={200} onSelectVenue={(v) => toggleVenueSelect(v)} />
            </div>

            {compareMode && selectedVenues.length > 1 && (
              <div style={{background:'white', border:'1px solid #7c3aed', borderRadius:'16px', padding:'20px', marginBottom:'16px', overflowX:'auto'}}>
                <div style={{fontSize:'13px', fontWeight:700, color:'#7c3aed', marginBottom:'16px'}}>⚖️ Comparare locații</div>
                <table style={{width:'100%', borderCollapse:'collapse'}}>
                  <thead>
                    <tr>
                      <th style={{textAlign:'left', fontSize:'11px', color:'#a8a29e', fontWeight:700, padding:'8px', textTransform:'uppercase'}}>Criteriu</th>
                      {selectedVenues.map(v => (
                        <th key={v.id} style={{textAlign:'center', fontSize:'12px', color:'#1c1917', fontWeight:700, padding:'8px'}}>{v.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label:'Tip', key:'type' },
                      { label:'Oraș', key:'city' },
                      { label:'Capacitate', key:'capacity', suffix:' pers.' },
                      { label:'Preț estimat', key:'priceEstimate' },
                    ].map(row => (
                      <tr key={row.label} style={{borderTop:'1px solid #f5f5f4'}}>
                        <td style={{fontSize:'12px', color:'#78716c', padding:'10px 8px', fontWeight:600}}>{row.label}</td>
                        {selectedVenues.map(v => (
                          <td key={v.id} style={{textAlign:'center', fontSize:'12px', color:'#1c1917', padding:'10px 8px', fontWeight: row.key === 'capacity' ? 700 : 400,
                            color: row.key === 'capacity' ? (v.capacity >= guestCount ? '#16a34a' : '#ef4444') : '#1c1917'
                          }}>
                            {v[row.key]}{row.suffix || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'24px'}}>
              {filteredVenues.map(v => {
                const isSelected = selectedVenues.find(sv => sv.id === v.id)
                return (
                  <div key={v.id}
                    style={{background:'white', border:'2px solid ' + (isSelected ? '#1c1917' : '#e7e5e4'), borderRadius:'14px', padding:'16px', cursor:'pointer', transition:'all 0.2s', position:'relative'}}>
                    <div onClick={() => toggleVenueSelect(v)}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px'}}>
                        <div style={{fontWeight:700, fontSize:'13px', color:'#1c1917'}}>{v.name}</div>
                        <span style={{fontSize:'10px', fontWeight:600, color:'#78716c', background:'#f5f5f4', padding:'2px 8px', borderRadius:'6px'}}>{v.type}</span>
                      </div>
                      <div style={{fontSize:'12px', color:'#a8a29e', marginBottom:'6px'}}>{v.city} • {v.priceEstimate}</div>
                      <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        <div style={{flex:1, background:'#f5f5f4', borderRadius:'4px', height:'6px', overflow:'hidden'}}>
                          <div style={{height:'100%', background: v.capacity >= guestCount ? '#22c55e' : '#f59e0b', borderRadius:'4px', width: Math.min((v.capacity/Math.max(...VENUES.map(x=>x.capacity)))*100, 100) + '%'}} />
                        </div>
                        <span style={{fontSize:'11px', fontWeight:700, color: v.capacity >= guestCount ? '#16a34a' : '#d97706'}}>{v.capacity >= 1000 ? (v.capacity/1000).toFixed(0) + 'k' : v.capacity} pers.</span>
                      </div>
                      {v.capacity < guestCount && <div style={{fontSize:'10px', color:'#f59e0b', marginTop:'4px'}}>⚠️ Sub numărul de invitați</div>}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); toggleWishlist(v, 'venue') }}
                      style={{position:'absolute', top:'12px', right:'40px', background:'none', border:'none', cursor:'pointer', fontSize:'16px'}}>
                      {isInWishlist(v, 'venue') ? '❤️' : '🤍'}
                    </button>
                  </div>
                )
              })}
            </div>

            <div style={{display:'flex', gap:'12px'}}>
              <button onClick={() => setStep('event')}
                style={{padding:'12px 24px', borderRadius:'12px', border:'1px solid #e7e5e4', background:'white', color:'#78716c', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif'}}>
                ← Înapoi
              </button>
              <button onClick={() => { if(selectedVenues.length > 0) setStep('artist') }}
                disabled={selectedVenues.length === 0}
                style={{flex:1, background:'#1c1917', color:'white', padding:'12px', borderRadius:'12px', border:'none', cursor: selectedVenues.length > 0 ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif', opacity: selectedVenues.length > 0 ? 1 : 0.4}}>
                Continuă — Alege artistul →
              </button>
            </div>
          </div>
        )}

        {step === 'artist' && (
          <div>
            <div style={{textAlign:'center', marginBottom:'24px'}}>
              <h1 style={{fontSize:'28px', fontWeight:800, color:'#1c1917', marginBottom:'8px'}}>Alege artistul</h1>
              <p style={{fontSize:'14px', color:'#78716c'}}>
                {EVENT_TYPES.find(e => e.id === eventType)?.label} • {selectedVenues[0]?.name}
                {budget > 0 && ' • Buget: ' + budget.toLocaleString() + '€'}
              </p>
            </div>

            {budget > 0 && filteredArtists.length < ARTISTS.length && (
              <div style={{background:'#fef3c7', border:'1px solid #fde68a', borderRadius:'12px', padding:'12px 16px', marginBottom:'16px', fontSize:'12px', color:'#92400e', fontWeight:600}}>
                💡 Afișăm doar artiștii în bugetul tău de {budget.toLocaleString()}€. Mărește bugetul pentru mai multe opțiuni.
              </div>
            )}

            <div style={{display:'flex', flexDirection:'column', gap:'12px', marginBottom:'24px'}}>
              {filteredArtists.map(a => (
                <div key={a.id}
                  style={{background:'white', border:'2px solid ' + (selectedArtist?.id === a.id ? '#1c1917' : '#e7e5e4'), borderRadius:'14px', padding:'16px 20px', transition:'all 0.2s', position:'relative'}}>
                  <div onClick={() => a.available && setSelectedArtist(selectedArtist?.id === a.id ? null : a)} style={{cursor: a.available ? 'pointer' : 'default', opacity: a.available ? 1 : 0.6}}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
                        <div style={{width:'44px', height:'44px', borderRadius:'12px', background:'#1c1917', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:'14px'}}>
                          {a.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px'}}>
                            <span style={{fontWeight:700, fontSize:'14px', color:'#1c1917'}}>{a.name}</span>
                            <span style={{fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px',
                              background: a.tier === 'Premium' ? '#fef3c7' : a.tier === 'A+' ? '#eff6ff' : '#f5f5f4',
                              color: a.tier === 'Premium' ? '#92400e' : a.tier === 'A+' ? '#1e40af' : '#78716c'
                            }}>{a.tier}</span>
                            {!a.available && <span style={{fontSize:'10px', color:'#ef4444', fontWeight:600}}>Indisponibil</span>}
                          </div>
                          <div style={{fontSize:'12px', color:'#a8a29e'}}>{a.genres.join(' • ')}</div>
                        </div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:'16px', fontWeight:800, color:'#1c1917'}}>{a.feeMin.toLocaleString()}–{a.feeMax.toLocaleString()}€</div>
                        <div style={{fontSize:'11px', color:'#a8a29e'}}>fee artist</div>
                        <div style={{fontSize:'11px', color:'#78716c', marginTop:'2px'}}>
                          +{a.transport}€ transport • +{a.cazare}€ cazare
                        </div>
                      </div>
                    </div>
                    <div style={{background:'#f5f5f4', borderRadius:'8px', padding:'8px 12px', fontSize:'12px', color:'#78716c'}}>
                      Total estimat: <strong style={{color:'#1c1917'}}>{(a.feeMin + a.transport + a.cazare).toLocaleString()}–{(a.feeMax + a.transport + a.cazare).toLocaleString()}€</strong>
                      {needEquipment && ' + echipament tehnic'}
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toggleWishlist(a, 'artist') }}
                    style={{position:'absolute', top:'16px', right:'16px', background:'none', border:'none', cursor:'pointer', fontSize:'16px'}}>
                    {isInWishlist(a, 'artist') ? '❤️' : '🤍'}
                  </button>
                </div>
              ))}
              {filteredArtists.length === 0 && (
                <div style={{textAlign:'center', padding:'40px', background:'white', border:'1px solid #e7e5e4', borderRadius:'16px'}}>
                  <div style={{fontSize:'32px', marginBottom:'12px'}}>🎵</div>
                  <div style={{fontWeight:700, color:'#1c1917', marginBottom:'4px'}}>Niciun artist în buget</div>
                  <div style={{fontSize:'13px', color:'#78716c'}}>Mărește bugetul sau schimbă tipul evenimentului</div>
                </div>
              )}
            </div>

            <div style={{display:'flex', gap:'12px'}}>
              <button onClick={() => setStep('venue')}
                style={{padding:'12px 24px', borderRadius:'12px', border:'1px solid #e7e5e4', background:'white', color:'#78716c', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif'}}>
                ← Înapoi
              </button>
              <button onClick={() => { if(selectedArtist) setStep('summary') }}
                disabled={!selectedArtist}
                style={{flex:1, background:'#1c1917', color:'white', padding:'12px', borderRadius:'12px', border:'none', cursor: selectedArtist ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif', opacity: selectedArtist ? 1 : 0.4}}>
                Continuă — Rezumat →
              </button>
            </div>
          </div>
        )}

        {step === 'summary' && (
          <div>
            <div style={{textAlign:'center', marginBottom:'32px'}}>
              <h1 style={{fontSize:'28px', fontWeight:800, color:'#1c1917', marginBottom:'8px'}}>Rezumat eveniment</h1>
              <p style={{fontSize:'14px', color:'#78716c'}}>Verifică detaliile înainte de a trimite cererea</p>
            </div>

            {requestSent ? (
              <div style={{textAlign:'center', padding:'60px 0'}}>
                <div style={{fontSize:'64px', marginBottom:'20px'}}>🎉</div>
                <h2 style={{fontSize:'24px', fontWeight:800, color:'#1c1917', marginBottom:'8px'}}>Cerere trimisă!</h2>
                <p style={{fontSize:'14px', color:'#78716c', marginBottom:'8px'}}>Vei fi contactat în maxim 24h pentru confirmare.</p>
                {daysUntil !== null && daysUntil < 30 && (
                  <p style={{fontSize:'13px', color:'#ef4444', fontWeight:600, marginBottom:'24px'}}>⚠️ Evenimentul e în mai puțin de 30 zile — te contactăm urgent!</p>
                )}
                <Link href="/" style={{display:'inline-block', background:'#1c1917', color:'white', padding:'12px 32px', borderRadius:'12px', fontSize:'14px', fontWeight:700, textDecoration:'none'}}>
                  Înapoi acasă
                </Link>
              </div>
            ) : (
              <>
                <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'28px', marginBottom:'16px'}}>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', marginBottom:'20px'}}>
                    <div>
                      <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'4px'}}>Tip eveniment</div>
                      <div style={{fontSize:'15px', fontWeight:700, color:'#1c1917'}}>{EVENT_TYPES.find(e => e.id === eventType)?.icon} {EVENT_TYPES.find(e => e.id === eventType)?.label}</div>
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
                      <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>Locație</div>
                      <div style={{background:'#f5f5f4', borderRadius:'12px', padding:'12px 16px'}}>
                        <div style={{fontWeight:700, fontSize:'14px', color:'#1c1917', marginBottom:'2px'}}>{selectedVenues[0]?.name}</div>
                        <div style={{fontSize:'12px', color:'#78716c'}}>{selectedVenues[0]?.type} • {selectedVenues[0]?.city}</div>
                        <div style={{fontSize:'12px', color:'#78716c'}}>{selectedVenues[0]?.priceEstimate}</div>
                      </div>
                    </div>
                    <div>
                      <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>Artist</div>
                      <div style={{background:'#f5f5f4', borderRadius:'12px', padding:'12px 16px'}}>
                        <div style={{fontWeight:700, fontSize:'14px', color:'#1c1917', marginBottom:'2px'}}>{selectedArtist?.name}</div>
                        <div style={{fontSize:'12px', color:'#78716c'}}>{selectedArtist?.genres.join(' • ')}</div>
                        <div style={{fontSize:'13px', fontWeight:800, color:'#1c1917', marginTop:'4px'}}>{selectedArtist?.feeMin.toLocaleString()}–{selectedArtist?.feeMax.toLocaleString()}€</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'16px', padding:'20px', marginBottom:'16px'}}>
                  <div style={{fontSize:'12px', fontWeight:700, color:'#166534', marginBottom:'12px'}}>💰 Deviz estimativ complet</div>
                  <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                    {[
                      { label:'Fee artist (minim)', value: selectedArtist?.feeMin.toLocaleString() + '€' },
                      { label:'Fee artist (maxim)', value: selectedArtist?.feeMax.toLocaleString() + '€' },
                      { label:'Transport artist', value: selectedArtist?.transport + '€' },
                      { label:'Cazare artist', value: selectedArtist?.cazare + '€' },
                      { label:'Comision platformă (3%)', value: Math.round((selectedArtist?.feeMin || 0) * 0.03) + '€' },
                    ].map(row => (
                      <div key={row.label} style={{display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#166534'}}>
                        <span>{row.label}</span>
                        <span style={{fontWeight:700}}>{row.value}</span>
                      </div>
                    ))}
                    <div style={{borderTop:'1px solid #bbf7d0', paddingTop:'8px', display:'flex', justifyContent:'space-between', fontSize:'15px', color:'#166534', fontWeight:800}}>
                      <span>Total estimat</span>
                      <span>{((selectedArtist?.feeMin || 0) + (selectedArtist?.transport || 0) + (selectedArtist?.cazare || 0)).toLocaleString()}–{((selectedArtist?.feeMax || 0) + (selectedArtist?.transport || 0) + (selectedArtist?.cazare || 0)).toLocaleString()}€</span>
                    </div>
                  </div>
                </div>

                {(needInvoice || needEquipment || musicStyle) && (
                  <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'14px', padding:'16px', marginBottom:'16px'}}>
                    <div style={{fontSize:'12px', fontWeight:700, color:'#1c1917', marginBottom:'8px'}}>📋 Cerințe speciale</div>
                    <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                      {needInvoice && <span style={{background:'#eff6ff', color:'#1e40af', fontSize:'11px', fontWeight:600, padding:'3px 10px', borderRadius:'20px'}}>Factură PFA/SRL</span>}
                      {needEquipment && <span style={{background:'#f0fdf4', color:'#166534', fontSize:'11px', fontWeight:600, padding:'3px 10px', borderRadius:'20px'}}>Echipament tehnic inclus</span>}
                      {musicStyle && <span style={{background:'#fef3c7', color:'#92400e', fontSize:'11px', fontWeight:600, padding:'3px 10px', borderRadius:'20px'}}>Stil: {musicStyle}</span>}
                    </div>
                  </div>
                )}

                <div style={{display:'flex', gap:'12px'}}>
                  <button onClick={() => setStep('artist')}
                    style={{padding:'12px 24px', borderRadius:'12px', border:'1px solid #e7e5e4', background:'white', color:'#78716c', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif'}}>
                    ← Înapoi
                  </button>
                  <button onClick={() => setRequestSent(true)}
                    style={{flex:1, background:'#1c1917', color:'white', padding:'14px', borderRadius:'12px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif'}}>
                    Trimite cererea 🎉
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
