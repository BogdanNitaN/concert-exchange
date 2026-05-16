'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import TransportCalculator from '@/components/widgets/TransportCalculator'
import PriceExactModal from '@/components/PriceExactModal'
import TransportBreakdown from '@/components/TransportBreakdown'
import VenueSearch from '@/components/widgets/VenueSearch'

const MapVenues = dynamic(() => import('@/components/map/MapVenues'), { ssr: false })

const EVENT_TYPES = [
  { id: 'nunta', icon: '💍', label: 'Nuntă', desc: 'Petrecere de nuntă' },
  { id: 'botez', icon: '👶', label: 'Botez', desc: 'Petrecere de botez' },
  { id: 'corporate', icon: '🏢', label: 'Corporate', desc: 'Eveniment de companie' },
  { id: 'private', icon: '🎉', label: 'Petrecere privată', desc: 'Majorat, aniversare, surpriză' },
  { id: 'gala', icon: '🥂', label: 'Gală / Revelion', desc: 'Gală elegantă sau revelion' },
  { id: 'festival', icon: '🎪', label: 'Festival', desc: 'Festival de muzică' },
  { id: 'citydays', icon: '🎆', label: 'City Days', desc: 'Zilele orașului' },
  { id: 'corporate2', icon: '🚀', label: 'Lansare / Team Building', desc: 'Eveniment corporate' },
]

const ATMOSFERA = [
  { id: 'hype', icon: '🔥', label: 'Hype & Energie', desc: 'Dans, distracție, toată lumea pe ring' },
  { id: 'elegant', icon: '💎', label: 'Elegant & Luxury', desc: 'Rafinat, clasă, atmosferă premium' },
  { id: 'petrecere', icon: '🎊', label: 'Petrecere & Mainstream', desc: 'Hituri cunoscute, toată lumea cântă' },
  { id: 'balcanic', icon: '⚡', label: 'Balcanic & Românesc', desc: 'Manele, populară, lăutari, energie pură' },
  { id: 'chill', icon: '🌅', label: 'Chill & Lounge', desc: 'Relaxat, ambient, fundal muzical plăcut' },
  { id: 'live', icon: '🎺', label: 'Live & Formație', desc: 'Muzică live, trupe, instrumente' },
  { id: 'surprise', icon: '🎤', label: 'Surprinde-mă', desc: 'Lăsăm noi să alegem ce se potrivește' },
]

const TIP_ARTIST = [
  { id: 'dj', icon: '🎧', label: 'DJ' },
  { id: 'mc', icon: '🎤', label: 'MC / Prezentator' },
  { id: 'trupa_cover', icon: '🎸', label: 'Trupă Cover / Formație' },
  { id: 'vocal', icon: '🎤', label: 'Artist Vocal / Solist' },
  { id: 'instrumental', icon: '🎺', label: 'Instrumentiști Live' },
  { id: 'dansatori', icon: '💃', label: 'Dansatori / Show Acts' },
  { id: 'animatori', icon: '🎭', label: 'Animatori / Spectacol' },
  { id: 'formatie_completa', icon: '🎶', label: 'Formație completă nuntă' },
]

const CAPACITY_OPTIONS = [100, 150, 200, 250, 350, 400, 600, 1000, 5000, 10000, 50000]

const VENUE_TYPES_CLIENT = ["Toate", "Ballroom", "Restaurant cu scenă", "Hotel conference", "Sală Evenimente", "Casă de cultură", "Parc evenimente", "Amfiteatru", "Piață centrală", "Stadion", "Pool/Piscină", "Terasă", "Castel", "Cramă/Vie", "Altele"]

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

interface GeoSuggestion { name: string; fullName: string; lat: number; lng: number }

export default function ClientDashboard() {
  const [step, setStep] = useState('event')
  const [eventType, setEventType] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [guestCount, setGuestCount] = useState(0)
  const [budget, setBudget] = useState(0)
  const [atmosfera, setAtmosfera] = useState<string[]>([])
  const [tipArtist, setTipArtist] = useState<string[]>([])
  const [venueType, setVenueType] = useState('Toate')
  const [selectedVenues, setSelectedVenues] = useState<any[]>([])
  const [selectedArtist, setSelectedArtist] = useState<any>(null)
  const [citySearch, setCitySearch] = useState('')
  const [center, setCenter] = useState<[number, number]>([45.7489, 24.9668])
  const [citySuggestions, setCitySuggestions] = useState<GeoSuggestion[]>([])
  const [selectedCity, setSelectedCity] = useState('')
  const [requestSent, setRequestSent] = useState(false)
  const [transportResult, setTransportResult] = useState<any>(null)
  const [showPretExactModal, setShowPretExactModal] = useState(false)
  const [selectedSeturi, setSelectedSeturi] = useState('1x45')
  const totalMin = Math.round(((selectedArtist?.feeMin || 0) + (selectedArtist?.transport || 0) + (selectedArtist?.cazare || 0)) * 1.05)
  const totalMax = Math.round(((selectedArtist?.feeMax || 0) + (selectedArtist?.transport || 0) + (selectedArtist?.cazare || 0)) * 1.05)
  const [venueSearchResult, setVenueSearchResult] = useState<any>(null)
  const [showVenueGrid, setShowVenueGrid] = useState(true)
  const searchTimer = useRef<any>(null)

  const steps = ['event', 'atmosfera', 'artist', 'venue', 'summary']
  const stepIndex = steps.indexOf(step)

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
    setSelectedCity(s.fullName); setCitySearch(s.name)
    setCenter([s.lat, s.lng]); setCitySuggestions([])
  }

  const toggleAtmosfera = (id: string) => {
    setAtmosfera(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev
    )
  }
  const toggleTipArtist = (id: string) => {
    setTipArtist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleVenueSelect = (venue: any) => {
    setSelectedVenues(prev => {
      const exists = prev.find(v => v.id === venue.id)
      return exists ? prev.filter(v => v.id !== venue.id) : prev.length >= 3 ? prev : [...prev, venue]
    })
  }

  const filteredVenues = VENUES.filter(v => {
    if (venueType !== 'Toate' && v.type !== venueType) return false
    if (guestCount > 0 && v.capacity < guestCount) return false
    return true
  })

  const allArtists = ARTISTS
  const inBudgetArtists = budget > 0 ? allArtists.filter(a => a.feeMax <= budget) : allArtists
  const overBudgetArtists = budget > 0 ? allArtists.filter(a => a.feeMax > budget && a.feeMin <= budget * 1.5) : []

  const daysUntil = eventDate ? Math.floor((new Date(eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null

  return (
    <div style={{minHeight:'100vh', background:'#fafaf9', fontFamily:'Montserrat,sans-serif'}}>
      <nav style={{borderBottom:'1px solid #e7e5e4', background:'white', height:'56px', display:'flex', alignItems:'center', padding:'0 24px', justifyContent:'space-between', position:'sticky', top:0, zIndex:100}}>
        <Link href="/" style={{fontWeight:800, fontSize:'18px', color:'#1c1917', textDecoration:'none'}}>
          Concert <span style={{color:'#f59e0b'}}>●</span> Exchange
        </Link>
        <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
          {steps.map((s, i) => (
            <div key={s} style={{display:'flex', alignItems:'center', gap:'6px'}}>
              <div onClick={() => i < stepIndex && setStep(s)}
                style={{width:'26px', height:'26px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700,
                  cursor: i < stepIndex ? 'pointer' : 'default',
                  background: step === s ? '#1c1917' : i < stepIndex ? '#22c55e' : '#e7e5e4',
                  color: step === s || i < stepIndex ? 'white' : '#78716c'}}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              {i < 4 && <div style={{width:'20px', height:'2px', background: i < stepIndex ? '#22c55e' : '#e7e5e4'}} />}
            </div>
          ))}
        </div>
        <Link href="/" style={{fontSize:'12px', color:'#78716c', textDecoration:'none'}}>← Înapoi</Link>
      </nav>

      <div style={{maxWidth:'900px', margin:'0 auto', padding:'40px 24px'}}>

        {step === 'event' && (
          <div>
            <div style={{textAlign:'center', marginBottom:'36px'}}>
              <h1 style={{fontSize:'28px', fontWeight:800, color:'#1c1917', marginBottom:'8px'}}>Ce eveniment planifici?</h1>
              <p style={{fontSize:'14px', color:'#78716c'}}>Vom găsi artiștii și locațiile potrivite pentru tine</p>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'12px', marginBottom:'28px'}}>
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
                      style={{padding:'6px 12px', borderRadius:'20px', border:'1px solid', cursor:'pointer', fontSize:'12px', fontWeight:600, fontFamily:'Montserrat,sans-serif',
                        background: guestCount === c ? '#1c1917' : 'white', color: guestCount === c ? 'white' : '#78716c', borderColor: guestCount === c ? '#1c1917' : '#e7e5e4'}}>
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
                    style={{width:'100%', paddingLeft:'32px', paddingRight:'10px', paddingTop:'10px', paddingBottom:'10px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
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
                      <button onClick={() => { setSelectedCity(''); setCitySearch('') }}
                        style={{background:'none', border:'none', cursor:'pointer', color:'#a8a29e', fontSize:'12px', marginLeft:'4px'}}>✕</button>
                    </div>
                  )}
                  
                </div>
              </div>
            </div>
            <button onClick={() => { if(eventType && guestCount && eventDate) setStep('atmosfera') }}
              disabled={!eventType || !guestCount || !eventDate}
              style={{width:'100%', background:'#1c1917', color:'white', padding:'14px', borderRadius:'12px', border:'none', cursor: eventType && guestCount && eventDate ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif', opacity: eventType && guestCount && eventDate ? 1 : 0.4}}>
              Continuă →
            </button>
          </div>
        )}

        {step === 'atmosfera' && (
          <div>
            <div style={{textAlign:'center', marginBottom:'32px'}}>
              <h1 style={{fontSize:'28px', fontWeight:800, color:'#1c1917', marginBottom:'8px'}}>Ce atmosferă vrei?</h1>
              <p style={{fontSize:'14px', color:'#78716c'}}>Alege starea pe care o vrei la eveniment</p>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'12px', marginBottom:'32px'}}>
              {ATMOSFERA.map(a => (
                <div key={a.id} onClick={() => toggleAtmosfera(a.id)}
                  style={{background: atmosfera.includes(a.id) ? '#1c1917' : 'white', border:'2px solid ' + (atmosfera.includes(a.id) ? '#1c1917' : '#e7e5e4'), borderRadius:'16px', padding:'20px 14px', cursor:'pointer', textAlign:'center', transform: atmosfera.includes(a.id) ? 'scale(1.03)' : 'scale(1)', boxShadow: atmosfera.includes(a.id) ? '0 8px 24px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.04)', transition:'all 0.2s', position:'relative'}}>
                  {atmosfera === a.id && <div style={{position:'absolute', top:'8px', right:'10px', fontSize:'10px', color:'#22c55e', fontWeight:800}}>✓</div>}
                  <div style={{fontSize:'28px', marginBottom:'8px'}}>{a.icon}</div>
                  <div style={{fontWeight:700, fontSize:'12px', color: atmosfera.includes(a.id) ? 'white' : '#1c1917', marginBottom:'4px'}}>{a.label}</div>
                  <div style={{fontSize:'10px', color: atmosfera.includes(a.id) ? '#a8a29e' : '#78716c', lineHeight:1.4}}>{a.desc}</div>
                </div>
              ))}
            </div>
            <div style={{marginBottom:'28px'}}>
              <div style={{fontSize:'12px', fontWeight:700, color:'#1c1917', marginBottom:'12px'}}>Ce tip de artist vrei? <span style={{color:'#a8a29e', fontWeight:400}}>(opțional)</span></div>
              <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
                {TIP_ARTIST.map(t => (
                  <button key={t.id} onClick={() => toggleTipArtist(t.id)}
                    style={{padding:'8px 16px', borderRadius:'20px', border:'2px solid', cursor:'pointer', fontSize:'13px', fontWeight:600, fontFamily:'Montserrat,sans-serif', display:'flex', alignItems:'center', gap:'6px',
                      background: tipArtist.includes(t.id) ? '#1c1917' : 'white',
                      color: tipArtist.includes(t.id) ? 'white' : '#78716c',
                      borderColor: tipArtist.includes(t.id) ? '#1c1917' : '#e7e5e4'}}>
                    <span>{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:'flex', gap:'12px'}}>
              <button onClick={() => setStep('event')} style={{padding:'12px 24px', borderRadius:'12px', border:'1px solid #e7e5e4', background:'white', color:'#78716c', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif'}}>← Înapoi</button>
              <button onClick={() => { if(atmosfera.length > 0) setStep('artist') }} disabled={atmosfera.length === 0}
                style={{flex:1, background:'#1c1917', color:'white', padding:'12px', borderRadius:'12px', border:'none', cursor: atmosfera.length > 0 ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif', opacity: atmosfera.length > 0 ? 1 : 0.4}}>
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
                {EVENT_TYPES.find(e => e.id === eventType)?.label}
                {budget > 0 && ' • Buget: ' + budget.toLocaleString() + '€'}
              </p>
            </div>

            {inBudgetArtists.length === 0 && overBudgetArtists.length === 0 && (
              <div style={{background:'#fef3c7', border:'1px solid #fde68a', borderRadius:'14px', padding:'16px 20px', marginBottom:'20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px'}}>
                <div style={{fontSize:'13px', color:'#92400e', fontWeight:600}}>
                  💡 Niciun artist în bugetul de {budget.toLocaleString()}€ — mărește bugetul:
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                  <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))}
                    style={{width:'110px', padding:'8px 10px', borderRadius:'8px', border:'1px solid #fde68a', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', background:'white'}} />
                  <span style={{fontSize:'13px', color:'#92400e', fontWeight:700}}>€</span>
                </div>
              </div>
            )}

            {inBudgetArtists.length > 0 && (
              <div style={{marginBottom:'24px'}}>
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
                              <span style={{fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px',
                                background: a.tier === 'Premium' ? '#fef3c7' : '#eff6ff',
                                color: a.tier === 'Premium' ? '#92400e' : '#1e40af'}}>{a.tier}</span>
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
              <div style={{marginBottom:'24px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px'}}>
                  <div style={{fontSize:'11px', fontWeight:700, color:'#16a34a', textTransform:'uppercase', letterSpacing:'0.06em'}}>✨ Recomandăm — artiști premium</div>
                  <div style={{fontSize:'11px', color:'#78716c'}}>puțin peste buget, dar merită</div>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                  {overBudgetArtists.map(a => (
                    <div key={a.id} onClick={() => setSelectedArtist(selectedArtist?.id === a.id ? null : a)}
                      style={{background:'#f0fdf4', border:'2px solid ' + (selectedArtist?.id === a.id ? '#16a34a' : '#86efac'), borderRadius:'14px', padding:'16px 20px', cursor:'pointer', transition:'all 0.2s', position:'relative'}}>
                      <div style={{position:'absolute', top:'12px', right:'16px', background:'#16a34a', color:'white', fontSize:'10px', fontWeight:700, padding:'3px 10px', borderRadius:'20px'}}>
                        ✨ Recomandat
                      </div>
                      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
                          <div style={{width:'44px', height:'44px', borderRadius:'12px', background:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:'14px'}}>
                            {a.name.split(' ').map((n: string) => n[0]).join('').slice(0,2)}
                          </div>
                          <div>
                            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px'}}>
                              <span style={{fontWeight:700, fontSize:'14px', color:'#1c1917'}}>{a.name}</span>
                              <span style={{fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px',
                                background: a.tier === 'Premium' ? '#fef3c7' : '#eff6ff',
                                color: a.tier === 'Premium' ? '#92400e' : '#1e40af'}}>{a.tier}</span>
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
              <span style={{fontSize:'11px', color:'#78716c', display:'flex', alignItems:'center', gap:'6px'}}>
                <span style={{background:'#fef3c7', color:'#92400e', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px'}}>Premium</span>
                Artisti de top, 10.000€+
              </span>
              <span style={{fontSize:'11px', color:'#78716c', display:'flex', alignItems:'center', gap:'6px'}}>
                <span style={{background:'#eff6ff', color:'#1e40af', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px'}}>A+</span>
                Foarte cautati, 5.000-9.999€
              </span>
              <span style={{fontSize:'11px', color:'#78716c', display:'flex', alignItems:'center', gap:'6px'}}>
                <span style={{background:'#f5f5f4', color:'#78716c', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px'}}>A</span>
                Profesionisti verificati, sub 5.000€
              </span>
            </div>
            <div style={{display:'flex', gap:'12px'}}>
              <button onClick={() => setStep('atmosfera')} style={{padding:'12px 24px', borderRadius:'12px', border:'1px solid #e7e5e4', background:'white', color:'#78716c', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif'}}>← Înapoi</button>
              <button onClick={() => { if(selectedArtist) setStep('venue') }} disabled={!selectedArtist}
                style={{flex:1, background:'#1c1917', color:'white', padding:'12px', borderRadius:'12px', border:'none', cursor: selectedArtist ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif', opacity: selectedArtist ? 1 : 0.4}}>
                Continuă — Alege locația →
              </button>
            </div>
          </div>
        )}

        {step === 'venue' && (
          <div>
            <div style={{textAlign:'center', marginBottom:'24px'}}>
              <h1 style={{fontSize:'28px', fontWeight:800, color:'#1c1917', marginBottom:'8px'}}>Alege locația</h1>
              <p style={{fontSize:'14px', color:'#78716c'}}>{guestCount} invitați • {selectedCity || 'România'}</p>
            </div>

            <div style={{marginBottom:'20px'}}>
              <VenueSearch
                onSelectVenue={(v) => {
                  const venue = {id: v.place_id, name: v.name, lat: v.lat, lng: v.lng, type: v.types?.[0] || 'Locație', city: v.address, capacity: 0, priceEstimate: 'Preț la cerere'}
                  setVenueSearchResult(venue)
                  setSelectedVenues([venue])
                  setShowVenueGrid(false)
                }}
                placeholder='Caută sala, hotelul, restaurantul...'
              />
            </div>

            {venueSearchResult && (
              <div style={{background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'14px', padding:'14px 16px', marginBottom:'16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <div style={{fontWeight:700, fontSize:'14px', color:'#1c1917'}}>{venueSearchResult.name}</div>
                  <div style={{fontSize:'12px', color:'#78716c'}}>{venueSearchResult.city}</div>
                </div>
                <button onClick={() => { setVenueSearchResult(null); setSelectedVenues([]); setShowVenueGrid(true) }}
                  style={{background:'none', border:'none', cursor:'pointer', fontSize:'13px', color:'#78716c', fontFamily:'Montserrat,sans-serif'}}>
                  ✕ Schimbă
                </button>
              </div>
            )}

            {showVenueGrid && (
              <>
                <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px'}}>
                  <div style={{fontSize:'13px', fontWeight:700, color:'#1c1917'}}>
                    📍 Locații recomandate {selectedCity ? 'în ' + selectedCity.split(',')[0] : 'în România'}
                  </div>
                  <div style={{fontSize:'11px', color:'#a8a29e'}}>— cele mai căutate</div>
                </div>
              <div style={{display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'16px'}}>
              {VENUE_TYPES_CLIENT.map(t => (
                <button key={t} onClick={() => setVenueType(t)}
                  style={{padding:'5px 12px', borderRadius:'20px', border:'1px solid', cursor:'pointer', fontSize:'11px', fontWeight:600, fontFamily:'Montserrat,sans-serif',
                    background: venueType === t ? '#1c1917' : 'white', color: venueType === t ? 'white' : '#78716c', borderColor: venueType === t ? '#1c1917' : '#e7e5e4'}}>{t}</button>
              ))}
            </div>
            <div style={{height:'240px', borderRadius:'16px', overflow:'hidden', marginBottom:'16px', border:'1px solid #e7e5e4'}}>
              <MapVenues venues={filteredVenues} center={center} radius={200} onSelectVenue={(v: any) => toggleVenueSelect(v)} />
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'24px'}}>
              {filteredVenues.map(v => {
                const isSelected = selectedVenues.find(sv => sv.id === v.id)
                return (
                  <div key={v.id} onClick={() => toggleVenueSelect(v)}
                    style={{background:'white', border:'2px solid ' + (isSelected ? '#1c1917' : '#e7e5e4'), borderRadius:'14px', padding:'16px', cursor:'pointer', transition:'all 0.2s'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px'}}>
                      <div style={{fontWeight:700, fontSize:'13px', color:'#1c1917'}}>{v.name}</div>
                      <span style={{fontSize:'10px', fontWeight:600, color:'#78716c', background:'#f5f5f4', padding:'2px 8px', borderRadius:'6px'}}>{v.type}</span>
                    </div>
                    <div style={{fontSize:'12px', color:'#a8a29e', marginBottom:'6px'}}>{v.city} • {v.priceEstimate}</div>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                      <div style={{flex:1, background:'#f5f5f4', borderRadius:'4px', height:'6px', overflow:'hidden'}}>
                        <div style={{height:'100%', background: v.capacity >= guestCount ? '#22c55e' : '#f59e0b', borderRadius:'4px', width: Math.min((v.capacity/50000)*100, 100) + '%'}} />
                      </div>
                      <span style={{fontSize:'11px', fontWeight:700, color: v.capacity >= guestCount ? '#16a34a' : '#d97706'}}>{v.capacity >= 1000 ? (v.capacity/1000).toFixed(0) + 'k' : v.capacity} pers.</span>
                    </div>
                  </div>
                )
              })}
            </div>
              </>
            )}

            <div style={{display:'flex', gap:'12px'}}>
              <button onClick={() => setStep('artist')} style={{padding:'12px 24px', borderRadius:'12px', border:'1px solid #e7e5e4', background:'white', color:'#78716c', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif'}}>← Înapoi</button>
              <button onClick={() => { if(selectedVenues.length > 0) setStep('summary') }} disabled={selectedVenues.length === 0}
                style={{flex:1, background:'#1c1917', color:'white', padding:'12px', borderRadius:'12px', border:'none', cursor: selectedVenues.length > 0 ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif', opacity: selectedVenues.length > 0 ? 1 : 0.4}}>
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
                <p style={{fontSize:'14px', color:'#78716c', marginBottom:'24px'}}>Vei fi contactat în maxim 24h pentru confirmare.</p>
                <Link href="/" style={{display:'inline-block', background:'#1c1917', color:'white', padding:'12px 32px', borderRadius:'12px', fontSize:'14px', fontWeight:700, textDecoration:'none'}}>
                  Înapoi acasă
                </Link>
              </div>
            ) : (
              <>
                <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'28px', marginBottom:'16px'}}>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', marginBottom:'20px'}}>
                    <div>
                      <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'4px'}}>Eveniment</div>
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
                      <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>Artist</div>
                      <div style={{background:'#f5f5f4', borderRadius:'12px', padding:'12px 16px'}}>
                        <div style={{fontWeight:700, fontSize:'14px', color:'#1c1917', marginBottom:'2px'}}>{selectedArtist?.name}</div>
                        <div style={{fontSize:'12px', color:'#78716c'}}>{selectedArtist?.genres.join(' • ')}</div>
                        <div style={{fontSize:'13px', fontWeight:800, color:'#1c1917', marginTop:'4px'}}>{selectedArtist?.feeMin.toLocaleString()}–{selectedArtist?.feeMax.toLocaleString()}€</div>
                      </div>
                    </div>
                    <div>
                      <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>Locație</div>
                      <div style={{background:'#f5f5f4', borderRadius:'12px', padding:'12px 16px'}}>
                        <div style={{fontWeight:700, fontSize:'14px', color:'#1c1917', marginBottom:'2px'}}>{selectedVenues[0]?.name}</div>
                        <div style={{fontSize:'12px', color:'#78716c'}}>{selectedVenues[0]?.type} • {selectedVenues[0]?.city}</div>
                        <div style={{fontSize:'12px', color:'#78716c'}}>{selectedVenues[0]?.priceEstimate}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'16px', padding:'20px', marginBottom:'16px'}}>
                  <div style={{fontSize:'12px', fontWeight:700, color:'#1c1917', marginBottom:'12px'}}>🎵 Seturi artist</div>
                  <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                    {[
                      { id: '1x45', label: '1 set × 45 min' },
                      { id: '2x45', label: '2 seturi × 45 min' },
                      { id: '3x45', label: '3 seturi × 45 min' },
                      { id: 'allnight', label: 'All Night' },
                    ].map(s => (
                      <button key={s.id} onClick={() => setSelectedSeturi(s.id)}
                        style={{padding:'8px 16px', borderRadius:'20px', border:'2px solid', cursor:'pointer', fontSize:'12px', fontWeight:600, fontFamily:'Montserrat,sans-serif',
                          background: selectedSeturi === s.id ? '#1c1917' : 'white',
                          color: selectedSeturi === s.id ? 'white' : '#78716c',
                          borderColor: selectedSeturi === s.id ? '#1c1917' : '#e7e5e4'
                        }}>{s.label}</button>
                    ))}
                  </div>
                </div>

                <div style={{background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'16px', padding:'20px', marginBottom:'16px'}}>
                  <div style={{fontSize:'12px', fontWeight:700, color:'#166534', marginBottom:'16px'}}>💰 Deviz estimativ</div>
                  <div style={{marginBottom:'16px'}}>
                    <div style={{fontSize:'11px', fontWeight:700, color:'#166534', marginBottom:'8px'}}>🚗 Transport</div>
                    <TransportBreakdown
                      distantaKm={transportResult?.distantaInterna || 200}
                      artist={{ costPerKm: 2, nrBileteAvion: 1, cazareTip: 'Camera dubla', cazareNrCamere: 1 }}
                      currency="EUR"
                    />
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:'8px', borderTop:'1px solid #bbf7d0', paddingTop:'16px'}}>
                    {[
                      { label:'Fee artist (minim)', value: selectedArtist?.feeMin.toLocaleString() + '€' },
                      { label:'Fee artist (maxim)', value: selectedArtist?.feeMax.toLocaleString() + '€' },
                      { label:'Transport estimat', value: transportResult ? transportResult.costTotal.toLocaleString() + '€' : selectedArtist?.transport + '€' },
                      { label:'Cazare necesara', value: '1x Camera dubla' },

                    ].map(row => (
                      <div key={row.label} style={{display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#166534'}}>
                        <span>{row.label}</span>
                        <span style={{fontWeight:700}}>{row.value}</span>
                      </div>
                    ))}
                    <div style={{borderTop:'1px solid #bbf7d0', paddingTop:'8px', display:'flex', justifyContent:'space-between', fontSize:'15px', color:'#166534', fontWeight:800}}>
                      <span>Total estimat</span>
                      <span>{Math.round(((selectedArtist?.feeMin || 0) + (transportResult?.costTotal || selectedArtist?.transport || 0) + (selectedArtist?.cazare || 0)) * 1.05).toLocaleString()}–{Math.round(((selectedArtist?.feeMax || 0) + (transportResult?.costTotal || selectedArtist?.transport || 0) + (selectedArtist?.cazare || 0)) * 1.05).toLocaleString()}€</span>
                    </div>
                    <div style={{fontSize:'10px', color:'#a8a29e', marginTop:'4px', textAlign:'right'}}>* include toate taxele și comisioanele platformei</div>
                  </div>
                </div>

                <div style={{display:'flex', gap:'12px'}}>
                  <button onClick={() => setStep('venue')} style={{padding:'12px 24px', borderRadius:'12px', border:'1px solid #e7e5e4', background:'white', color:'#78716c', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif'}}>← Înapoi</button>
                  <button onClick={() => {
                    const msg = encodeURIComponent(
                      'Cerere noua Concert Exchange\n' +
                      'Artist: ' + (selectedArtist?.name || '') + '\n' +
                      'Data: ' + eventDate + '\n' +
                      'Oras: ' + selectedCity + '\n' +
                      'Locatie: ' + (selectedVenues[0]?.name || 'nespecificata') + '\n' +
                      'Invitati: ' + guestCount + '\n' +
                      'Buget: ' + budget + 'EUR\n' +
                      'Seturi: ' + selectedSeturi
                    )
                    window.open('https://wa.me/40751144109?text=' + msg, '_blank')
                    window.open('mailto:me@bogdannita.ro?subject=Cerere Concert Exchange&body=' + msg, '_blank')
                    setRequestSent(true)
                  }}
                    style={{flex:1, background:'#1c1917', color:'white', padding:'14px', borderRadius:'12px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif'}}>
                    Trimite cererea 🎉
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    <PriceExactModal
      isOpen={showPretExactModal}
      onClose={() => setShowPretExactModal(false)}
      artist={selectedArtist?.name}
      eventDate={eventDate}
      location={selectedVenues[0]?.name || selectedCity}
      budgetMin={totalMin}
      budgetMax={totalMax}
    />
    </div>
  )
}
