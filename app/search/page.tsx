'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const MapComponent = dynamic(() => import('@/components/map/MapComponent'), { ssr: false })

const ARTISTS = [
  { id:1, name:"DJ Armin V.", lat:46.77, lng:23.59, tier:"Premium", fee:"12.000€", genres:["EDM","Dance"], events:["Club","Festival"], nearby:true, available:true, dist:87 },
  { id:2, name:"Maria Cânt", lat:47.16, lng:27.58, tier:"A+", fee:"8.500€", genres:["Pop","Folk"], events:["Wedding","Corporate"], nearby:false, available:true, dist:142 },
  { id:3, name:"Florentin", lat:44.33, lng:23.79, tier:"A", fee:"5.000€", genres:["Cover Band","Lăutărească"], events:["Wedding","City Days"], nearby:false, available:true, dist:210 },
  { id:4, name:"KORE", lat:44.43, lng:26.10, tier:"A+", fee:"9.000€", genres:["Hip-Hop","Urban"], events:["Club","Festival"], nearby:true, available:false, dist:65 },
  { id:5, name:"Electra Duo", lat:45.75, lng:21.23, tier:"A", fee:"4.500€", genres:["Dance","Pop"], events:["Club","Corporate"], nearby:false, available:true, dist:320 },
  { id:6, name:"DJ Suna", lat:45.65, lng:25.61, tier:"A", fee:"3.000€", genres:["Urban","Trap"], events:["Club"], nearby:false, available:true, dist:180 },
  { id:7, name:"Costel Folk", lat:46.54, lng:24.56, tier:"A", fee:"3.500€", genres:["Folk","Populară"], events:["Wedding","City Days"], nearby:false, available:true, dist:95 },
  { id:8, name:"DJ Chisinau", lat:47.00, lng:28.86, tier:"A+", fee:"6.000€", genres:["EDM","Dance"], events:["Club","Festival"], nearby:false, available:true, dist:280 },
  { id:9, name:"Lăutarii MD", lat:47.41, lng:28.37, tier:"A", fee:"4.000€", genres:["Lăutărească","Folk"], events:["Wedding"], nearby:false, available:true, dist:310 },
]

const VENUES = [
  { id:1, name:"Ballroom Grand", lat:44.43, lng:26.10, type:"Ballroom", city:"București", capacity:500 },
  { id:2, name:"Club Vintage", lat:46.77, lng:23.59, type:"Club", city:"Cluj-Napoca", capacity:300 },
  { id:3, name:"Sala Palatului", lat:44.44, lng:26.09, type:"Sala Evenimente", city:"București", capacity:4000 },
]

const GENRES = ["Pop","Dance","EDM","Urban","Hip-Hop","Cover Band","Folk","Lăutărească","Trap"]
const EVENT_TYPES = ["Club","Festival","Corporate","Wedding","Private","City Days","Mall","Casino"]
const TIERS = ["Premium","A+","A"]
const DEFAULT_CENTER: [number, number] = [45.7489, 24.9668]

interface GeoSuggestion {
  name: string
  fullName: string
  lat: number
  lng: number
}

export default function SearchPage() {
  const [radius, setRadius] = useState(200)
  const [genre, setGenre] = useState('')
  const [eventType, setEventType] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [date, setDate] = useState('')
  const [selectedArtist, setSelectedArtist] = useState<typeof ARTISTS[0] | null>(null)
  const [bookingModal, setBookingModal] = useState(false)
  const [bookingSent, setBookingSent] = useState(false)
  const [isPremium] = useState(true)
  const [citySearch, setCitySearch] = useState('')
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER)
  const [citySuggestions, setCitySuggestions] = useState<GeoSuggestion[]>([])
  const [selectedCity, setSelectedCity] = useState('')
  const [mapLayer, setMapLayer] = useState<'artisti'|'venues'|'toate'>('toate')
  const searchTimer = useRef<any>(null)

  useEffect(() => {
    if (citySearch.length < 3) { setCitySuggestions([]); return }
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(citySearch)}&countrycodes=ro,md&format=json&limit=8&accept-language=ro&addressdetails=1`
        )
        const data = await res.json()
        const suggestions: GeoSuggestion[] = data.map((d: any) => ({
          name: d.address?.city || d.address?.town || d.address?.village || d.name,
          fullName: [d.address?.city || d.address?.town || d.address?.village || d.name, d.address?.county, d.address?.country].filter(Boolean).join(', '),
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lon)
        }))
        setCitySuggestions(suggestions)
      } catch {}
    }, 400)
  }, [citySearch])

  const selectCity = (s: GeoSuggestion) => {
    setSelectedCity(s.fullName)
    setCitySearch(s.name)
    setCenter([s.lat, s.lng])
    setCitySuggestions([])
  }

  const filtered = ARTISTS.filter(a => {
    if (genre && !a.genres.includes(genre)) return false
    if (tierFilter && a.tier !== tierFilter) return false
    if (eventType && !a.events.includes(eventType)) return false
    if (a.dist > radius) return false
    return true
  }).sort((a, b) => {
    if (a.nearby && !b.nearby) return -1
    if (!a.nearby && b.nearby) return 1
    return a.dist - b.dist
  })

  const sendBooking = () => {
    setBookingSent(true)
    setTimeout(() => { setBookingModal(false); setBookingSent(false) }, 2000)
  }

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', fontFamily:'Montserrat,sans-serif'}}>

      {/* NAV */}
      <nav style={{borderBottom:'1px solid #e7e5e4', background:'white', flexShrink:0, height:'56px', display:'flex', alignItems:'center', padding:'0 24px', justifyContent:'space-between', zIndex:100}}>
        <Link href="/" style={{fontWeight:800, fontSize:'18px', color:'#1c1917', textDecoration:'none', letterSpacing:'-0.02em'}}>
          Concert <span style={{color:'#f59e0b'}}>●</span> Exchange
        </Link>
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <div style={{display:'flex', gap:'4px', background:'#f5f5f4', borderRadius:'10px', padding:'4px'}}>
            {(['toate','artisti','venues'] as const).map(l => (
              <button key={l} onClick={() => setMapLayer(l)}
                style={{padding:'5px 12px', borderRadius:'7px', border:'none', cursor:'pointer', fontSize:'12px', fontWeight:600, fontFamily:'Montserrat,sans-serif',
                  background: mapLayer === l ? 'white' : 'transparent',
                  color: mapLayer === l ? '#1c1917' : '#78716c',
                  boxShadow: mapLayer === l ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}>
                {l === 'toate' ? 'Toate' : l === 'artisti' ? '🎤 Artiști' : '🏛️ Venue-uri'}
              </button>
            ))}
          </div>
          <Link href="/dashboard/promoter" style={{fontSize:'13px', color:'#78716c', textDecoration:'none'}}>Dashboard</Link>
          {isPremium && <span style={{background:'#fef3c7', color:'#92400e', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'20px'}}>⭐ Premium</span>}
        </div>
      </nav>

      <div style={{display:'flex', flex:1, overflow:'hidden'}}>

        {/* SIDEBAR */}
        <div style={{width:'280px', flexShrink:0, background:'white', borderRight:'1px solid #e7e5e4', display:'flex', flexDirection:'column', overflow:'hidden'}}>

          <div style={{padding:'12px 16px', borderBottom:'1px solid #f5f5f4'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
              <span style={{fontWeight:700, fontSize:'13px', color:'#1c1917'}}>Filtre căutare</span>
              <span style={{fontSize:'11px', color:'#a8a29e'}}>{filtered.length} găsiți</span>
            </div>

            <div style={{position:'relative'}}>
              <span style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', fontSize:'14px'}}>📍</span>
              <input type="text" value={citySearch}
                onChange={e => { setCitySearch(e.target.value); setSelectedCity('') }}
                placeholder="Caută orice localitate RO / MD..."
                style={{width:'100%', paddingLeft:'32px', paddingRight:'10px', paddingTop:'8px', paddingBottom:'8px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'12px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}}
              />
              {citySuggestions.length > 0 && (
                <div style={{position:'absolute', top:'100%', left:0, right:0, background:'white', border:'1px solid #e7e5e4', borderRadius:'10px', marginTop:'4px', zIndex:200, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', overflow:'hidden'}}>
                  {citySuggestions.map((s, i) => (
                    <button key={i} onClick={() => selectCity(s)}
                      style={{width:'100%', textAlign:'left', padding:'10px 14px', border:'none', background:'white', cursor:'pointer', borderBottom:'1px solid #f5f5f4', fontFamily:'Montserrat,sans-serif'}}>
                      <div style={{fontSize:'12px', fontWeight:600, color:'#1c1917'}}>{s.name}</div>
                      <div style={{fontSize:'10px', color:'#a8a29e', marginTop:'1px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{s.fullName}</div>
                    </button>
                  ))}
                </div>
              )}
              {selectedCity && <div style={{fontSize:'10px', color:'#22c55e', marginTop:'4px', fontWeight:600}}>✓ {selectedCity}</div>}
            </div>
          </div>

          <div style={{padding:'12px 16px', overflowY:'auto', flex:1, display:'flex', flexDirection:'column', gap:'14px'}}>

            <div>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>Radius: <span style={{color:'#1c1917'}}>{radius} km</span></div>
              <div style={{display:'flex', gap:'4px', marginBottom:'6px'}}>
                {[100,200,350,600].map(r => (
                  <button key={r} onClick={() => setRadius(r)}
                    style={{flex:1, padding:'6px 0', borderRadius:'8px', border:'1px solid', cursor:'pointer', fontSize:'11px', fontWeight:700, fontFamily:'Montserrat,sans-serif',
                      background: radius === r ? '#1c1917' : 'white',
                      color: radius === r ? 'white' : '#78716c',
                      borderColor: radius === r ? '#1c1917' : '#e7e5e4'
                    }}>{r}</button>
                ))}
              </div>
              <input type="range" min={50} max={600} step={50} value={radius} onChange={e => setRadius(Number(e.target.value))} style={{width:'100%'}} />
            </div>

            <div>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Dată eveniment</div>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{width:'100%', padding:'8px 10px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'12px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
            </div>

            <div>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Gen muzical</div>
              <div style={{display:'flex', flexWrap:'wrap', gap:'4px'}}>
                {GENRES.map(g => (
                  <button key={g} onClick={() => setGenre(genre === g ? '' : g)}
                    style={{padding:'4px 10px', borderRadius:'20px', border:'1px solid', cursor:'pointer', fontSize:'11px', fontWeight:600, fontFamily:'Montserrat,sans-serif',
                      background: genre === g ? '#1c1917' : 'white',
                      color: genre === g ? 'white' : '#78716c',
                      borderColor: genre === g ? '#1c1917' : '#e7e5e4'
                    }}>{g}</button>
                ))}
              </div>
            </div>

            <div>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Tip eveniment</div>
              <div style={{display:'flex', flexWrap:'wrap', gap:'4px'}}>
                {EVENT_TYPES.map(e => (
                  <button key={e} onClick={() => setEventType(eventType === e ? '' : e)}
                    style={{padding:'4px 10px', borderRadius:'20px', border:'1px solid', cursor:'pointer', fontSize:'11px', fontWeight:600, fontFamily:'Montserrat,sans-serif',
                      background: eventType === e ? '#1c1917' : 'white',
                      color: eventType === e ? 'white' : '#78716c',
                      borderColor: eventType === e ? '#1c1917' : '#e7e5e4'
                    }}>{e}</button>
                ))}
              </div>
            </div>

            <div>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Tier</div>
              <div style={{display:'flex', gap:'4px'}}>
                {TIERS.map(t => (
                  <button key={t} onClick={() => setTierFilter(tierFilter === t ? '' : t)}
                    style={{flex:1, padding:'7px 0', borderRadius:'8px', border:'1px solid', cursor:'pointer', fontSize:'11px', fontWeight:700, fontFamily:'Montserrat,sans-serif',
                      background: tierFilter === t ? '#1c1917' : 'white',
                      color: tierFilter === t ? 'white' : '#78716c',
                      borderColor: tierFilter === t ? '#1c1917' : '#e7e5e4'
                    }}>{t}</button>
                ))}
              </div>
            </div>

            {filtered.some(a => a.nearby) && (
              <div style={{background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'10px', padding:'10px 12px'}}>
                <div style={{fontSize:'11px', fontWeight:700, color:'#166534', marginBottom:'3px'}}>🔗 Smart routing activ</div>
                <div style={{fontSize:'11px', color:'#16a34a'}}>{filtered.filter(a=>a.nearby).length} artiști deja în zonă</div>
              </div>
            )}
          </div>

          <div style={{borderTop:'1px solid #f5f5f4', flexShrink:0}}>
            <div style={{padding:'8px 16px', background:'#fafaf9'}}>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em'}}>{filtered.length} artiști în {radius}km</div>
            </div>
            <div style={{overflowY:'auto', maxHeight:'240px'}}>
              {filtered.map(a => (
                <div key={a.id} onClick={() => setSelectedArtist(a)}
                  style={{padding:'10px 16px', borderBottom:'1px solid #f5f5f4', cursor:'pointer',
                    background: selectedArtist?.id === a.id ? '#fffbeb' : 'white',
                    borderLeft: selectedArtist?.id === a.id ? '3px solid #f59e0b' : '3px solid transparent'
                  }}>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'3px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                      <span style={{fontWeight:700, fontSize:'12px', color:'#1c1917'}}>{a.name}</span>
                      {a.nearby && <span style={{background:'#22c55e', color:'white', fontSize:'9px', fontWeight:700, padding:'1px 6px', borderRadius:'10px'}}>📍</span>}
                    </div>
                    <span style={{fontSize:'10px', fontWeight:700, padding:'2px 6px', borderRadius:'6px',
                      background: a.tier === 'Premium' ? '#fef3c7' : a.tier === 'A+' ? '#eff6ff' : '#f5f5f4',
                      color: a.tier === 'Premium' ? '#92400e' : a.tier === 'A+' ? '#1e40af' : '#78716c'
                    }}>{a.tier}</span>
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span style={{fontSize:'11px', color:'#a8a29e'}}>{a.genres[0]} • {a.dist}km</span>
                    {isPremium
                      ? <span style={{fontSize:'11px', fontWeight:700, color:'#16a34a'}}>{a.fee}</span>
                      : <span style={{fontSize:'11px', color:'#d4d4d4', filter:'blur(4px)', userSelect:'none'}}>X.XXX€</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HARTA */}
        <div style={{flex:1, position:'relative', overflow:'hidden'}}>
          <MapComponent
            artists={mapLayer !== 'venues' ? filtered : []}
            venues={mapLayer !== 'artisti' ? VENUES : []}
            center={center}
            radius={radius}
            onSelectArtist={(a) => setSelectedArtist(a)}
          />

          {selectedArtist && (
            <div style={{position:'absolute', bottom:'20px', left:'50%', transform:'translateX(-50%)', width:'360px', background:'white', borderRadius:'16px', border:'1px solid #e7e5e4', boxShadow:'0 8px 32px rgba(0,0,0,0.12)', padding:'16px 20px', zIndex:50}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px'}}>
                <div>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px'}}>
                    <span style={{fontWeight:800, fontSize:'14px', color:'#1c1917'}}>{selectedArtist.name}</span>
                    <span style={{fontSize:'10px', fontWeight:700, padding:'2px 7px', borderRadius:'6px',
                      background: selectedArtist.tier === 'Premium' ? '#fef3c7' : selectedArtist.tier === 'A+' ? '#eff6ff' : '#f5f5f4',
                      color: selectedArtist.tier === 'Premium' ? '#92400e' : selectedArtist.tier === 'A+' ? '#1e40af' : '#78716c'
                    }}>{selectedArtist.tier}</span>
                    {selectedArtist.nearby && <span style={{background:'#22c55e', color:'white', fontSize:'9px', fontWeight:700, padding:'2px 8px', borderRadius:'10px'}}>📍 În zonă</span>}
                  </div>
                  <div style={{fontSize:'11px', color:'#a8a29e'}}>{selectedArtist.genres.join(', ')} • {selectedArtist.dist}km distanță</div>
                </div>
                <button onClick={() => setSelectedArtist(null)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'18px', color:'#a8a29e', padding:'0'}}>✕</button>
              </div>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                {isPremium
                  ? <span style={{fontSize:'18px', fontWeight:800, color:'#16a34a'}}>{selectedArtist.fee}</span>
                  : <span style={{fontSize:'18px', fontWeight:800, color:'#d4d4d4', filter:'blur(5px)', userSelect:'none'}}>X.XXX€</span>
                }
                <button onClick={() => selectedArtist.available && setBookingModal(true)}
                  disabled={!selectedArtist.available}
                  style={{padding:'10px 20px', borderRadius:'10px', border:'none', cursor: selectedArtist.available ? 'pointer' : 'not-allowed', fontSize:'13px', fontWeight:700, fontFamily:'Montserrat,sans-serif',
                    background: selectedArtist.available ? '#1c1917' : '#f5f5f4',
                    color: selectedArtist.available ? 'white' : '#a8a29e'
                  }}>
                  {selectedArtist.available ? 'Trimite cerere' : 'Indisponibil'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {bookingModal && selectedArtist && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'}}
          onClick={() => setBookingModal(false)}>
          <div style={{background:'white', borderRadius:'20px', padding:'24px', width:'100%', maxWidth:'420px', fontFamily:'Montserrat,sans-serif'}}
            onClick={e => e.stopPropagation()}>
            {bookingSent ? (
              <div style={{textAlign:'center', padding:'32px 0'}}>
                <div style={{fontSize:'48px', marginBottom:'16px'}}>✅</div>
                <div style={{fontWeight:800, fontSize:'16px', color:'#1c1917', marginBottom:'4px'}}>Cerere trimisă!</div>
                <div style={{fontSize:'13px', color:'#78716c'}}>Artistul va răspunde în 24h</div>
              </div>
            ) : (
              <>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
                  <span style={{fontWeight:800, fontSize:'15px', color:'#1c1917'}}>Booking — {selectedArtist.name}</span>
                  <button onClick={() => setBookingModal(false)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'18px', color:'#a8a29e'}}>✕</button>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                  <div>
                    <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Data</div>
                    <input type="date" style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
                  </div>
                  <div>
                    <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Tip eveniment</div>
                    <select style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}}>
                      {EVENT_TYPES.map(e => <option key={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Buget propus</div>
                    <input type="text" placeholder="ex: 8.000€" style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
                  </div>
                  <div>
                    <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Mesaj</div>
                    <textarea rows={3} placeholder="Descrie evenimentul..."
                      style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', resize:'none', boxSizing:'border-box'}} />
                  </div>
                  <button onClick={sendBooking}
                    style={{width:'100%', background:'#1c1917', color:'white', padding:'13px', borderRadius:'10px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif'}}>
                    Trimite cererea
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}