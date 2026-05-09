'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const MapVenues = dynamic(() => import('@/components/map/MapVenues'), { ssr: false })

const VENUES = [
  { id:1, name:"Ballroom Grand", lat:44.43, lng:26.10, type:"Ballroom", city:"București", capacity:500, contact:"manager@ballroomgrand.ro", phone:"0721 000 001" },
  { id:2, name:"Club Vintage", lat:46.77, lng:23.59, type:"Club", city:"Cluj-Napoca", capacity:300, contact:"booking@clubvintage.ro", phone:"0721 000 002" },
  { id:3, name:"Sala Palatului", lat:44.44, lng:26.09, type:"Sala Evenimente", city:"București", capacity:4000, contact:"events@salapalatului.ro", phone:"0721 000 003" },
  { id:4, name:"Filarmonica Iasi", lat:47.16, lng:27.58, type:"Filarmonica", city:"Iasi", capacity:800, contact:"filarmonica@iasi.ro", phone:"0721 000 004" },
  { id:5, name:"Club Quantic", lat:44.43, lng:26.08, type:"Club", city:"București", capacity:400, contact:"booking@quantic.ro", phone:"0721 000 005" },
  { id:6, name:"Casa Culturii Sibiu", lat:45.80, lng:24.15, type:"Casa de cultura", city:"Sibiu", capacity:600, contact:"cultura@sibiu.ro", phone:"0721 000 006" },
  { id:7, name:"Arena Timisoara", lat:45.75, lng:21.23, type:"Arena", city:"Timisoara", capacity:5000, contact:"arena@timisoara.ro", phone:"0721 000 007" },
  { id:8, name:"Hotel Radisson", lat:44.44, lng:26.10, type:"Hotel conference", city:"București", capacity:1000, contact:"events@radisson.ro", phone:"0721 000 008" },
  { id:9, name:"Club Fratelli", lat:44.45, lng:26.11, type:"Club", city:"București", capacity:250, contact:"booking@fratelli.ro", phone:"0721 000 009" },
  { id:10, name:"Teatrul National", lat:44.44, lng:26.10, type:"Teatru", city:"București", capacity:1200, contact:"teatru@national.ro", phone:"0721 000 010" },
  { id:11, name:"Sala Sporturilor", lat:46.77, lng:23.60, type:"Arena", city:"Cluj-Napoca", capacity:7000, contact:"sala@cluj.ro", phone:"0721 000 011" },
  { id:12, name:"Club Doors", lat:45.75, lng:21.24, type:"Club", city:"Timisoara", capacity:350, contact:"doors@timisoara.ro", phone:"0721 000 012" },
  { id:13, name:"Filarmonica Ilfov", lat:44.47, lng:26.08, type:"Filarmonica", city:"Ilfov", capacity:450, contact:"fil@ilfov.ro", phone:"0721 000 013" },
  { id:14, name:"Casa Culturii Bacau", lat:46.57, lng:26.91, type:"Casa de cultura", city:"Bacau", capacity:700, contact:"cultura@bacau.ro", phone:"0721 000 014" },
  { id:15, name:"Club Euphoria", lat:47.00, lng:28.86, type:"Club", city:"Chisinau", capacity:500, contact:"euphoria@md.ro", phone:"0721 000 015" },
  { id:16, name:"Palatul National MD", lat:47.01, lng:28.85, type:"Sala Evenimente", city:"Chisinau", capacity:1800, contact:"palat@md.ro", phone:"0721 000 016" },
  { id:17, name:"Amfiteatru Constanta", lat:44.18, lng:28.65, type:"Amfiteatru", city:"Constanta", capacity:3000, contact:"amfi@constanta.ro", phone:"0721 000 017" },
  { id:18, name:"Club Vibe Brasov", lat:45.64, lng:25.59, type:"Club", city:"Brasov", capacity:280, contact:"vibe@brasov.ro", phone:"0721 000 018" },
  { id:19, name:"Sala Polivalenta", lat:44.43, lng:26.12, type:"Sala polivalenta", city:"București", capacity:9000, contact:"sala@poly.ro", phone:"0721 000 019" },
  { id:20, name:"Casa Culturii Craiova", lat:44.33, lng:23.79, type:"Casa de cultura", city:"Craiova", capacity:550, contact:"cultura@craiova.ro", phone:"0721 000 020" },
]

const VENUE_TYPES = ["Toate","Club","Ballroom","Filarmonica","Casa de cultura","Sala Evenimente","Arena","Hotel conference","Teatru","Amfiteatru","Sala polivalenta"]

const CAPACITY_RANGES = [
  { label:"100-200", min:100, max:200 },
  { label:"200-400", min:200, max:400 },
  { label:"400-700", min:400, max:700 },
  { label:"700-1000", min:700, max:1000 },
  { label:"1000-1500", min:1000, max:1500 },
  { label:"1500-2000", min:1500, max:2000 },
  { label:"2000+", min:2000, max:4000 },
  { label:"4000+", min:4000, max:7000 },
  { label:"7000+", min:7000, max:9000 },
  { label:"9000+", min:9000, max:999999 },
]

const CAPACITY_MAX = 10000

interface GeoSuggestion {
  name: string
  fullName: string
  lat: number
  lng: number
}

export default function ArtistVenueSearch() {
  const [radius, setRadius] = useState(200)
  const [typeFilter, setTypeFilter] = useState('Toate')
  const [capacityMin, setCapacityMin] = useState(0)
  const [capacityMax, setCapacityMax] = useState(CAPACITY_MAX)
  const [selectedRange, setSelectedRange] = useState<number | null>(null)
  const [selectedVenue, setSelectedVenue] = useState<typeof VENUES[0] | null>(null)
  const [isPremium] = useState(true)
  const [citySearch, setCitySearch] = useState('')
  const [center, setCenter] = useState<[number, number]>([45.7489, 24.9668])
  const [citySuggestions, setCitySuggestions] = useState<GeoSuggestion[]>([])
  const [selectedCity, setSelectedCity] = useState('')
  const [contactModal, setContactModal] = useState(false)
  const [proposalSent, setProposalSent] = useState(false)
  const searchTimer = useRef<any>(null)

  useEffect(() => {
    if (citySearch.length < 3) { setCitySuggestions([]); return }
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(citySearch) + '&countrycodes=ro,md&format=json&limit=6&accept-language=ro&addressdetails=1'
        )
        const data = await res.json()
        setCitySuggestions(data.map((d: any) => ({
          name: d.address?.city || d.address?.town || d.address?.village || d.name,
          fullName: [d.address?.city || d.address?.town || d.address?.village || d.name, d.address?.county].filter(Boolean).join(', '),
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lon)
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

  const selectRange = (i: number) => {
    if (selectedRange === i) {
      setSelectedRange(null)
      setCapacityMin(0)
      setCapacityMax(CAPACITY_MAX)
    } else {
      setSelectedRange(i)
      setCapacityMin(CAPACITY_RANGES[i].min)
      setCapacityMax(CAPACITY_RANGES[i].max)
    }
  }

  const filtered = VENUES.filter(v => {
    if (typeFilter !== 'Toate' && v.type !== typeFilter) return false
    if (v.capacity < capacityMin) return false
    if (v.capacity > capacityMax) return false
    return true
  })

  const getCountForRange = (i: number) => {
    return VENUES.filter(v => {
      if (typeFilter !== 'Toate' && v.type !== typeFilter) return false
      return v.capacity >= CAPACITY_RANGES[i].min && v.capacity <= CAPACITY_RANGES[i].max
    }).length
  }

  const sendProposal = () => {
    setProposalSent(true)
    setTimeout(() => { setContactModal(false); setProposalSent(false) }, 2000)
  }

  const sliderPct = Math.round((capacityMax / CAPACITY_MAX) * 100)
  const sliderMinPct = Math.round((capacityMin / CAPACITY_MAX) * 100)

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', fontFamily:'Montserrat,sans-serif'}}>
      <nav style={{borderBottom:'1px solid #e7e5e4', background:'white', flexShrink:0, height:'56px', display:'flex', alignItems:'center', padding:'0 24px', justifyContent:'space-between', zIndex:100}}>
        <Link href="/" style={{fontWeight:800, fontSize:'18px', color:'#1c1917', textDecoration:'none'}}>
          Concert <span style={{color:'#f59e0b'}}>●</span> Exchange
        </Link>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <Link href="/dashboard/artist" style={{fontSize:'12px', color:'#78716c', textDecoration:'none'}}>← Dashboard artist</Link>
          <span style={{background:'#fef3c7', color:'#92400e', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'20px'}}>Artist</span>
        </div>
      </nav>

      <div style={{display:'flex', flex:1, overflow:'hidden'}}>
        <div style={{width:'290px', flexShrink:0, background:'white', borderRight:'1px solid #e7e5e4', display:'flex', flexDirection:'column', overflow:'hidden'}}>
          <div style={{padding:'12px 16px', borderBottom:'1px solid #f5f5f4'}}>
            <div style={{fontWeight:700, fontSize:'13px', color:'#1c1917', marginBottom:'4px'}}>Cauta venue-uri</div>
            <div style={{fontSize:'11px', color:'#a8a29e', marginBottom:'10px'}}>Gaseste locatii unde te poti propune</div>
            <div style={{position:'relative'}}>
              <span style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', fontSize:'14px'}}>📍</span>
              <input type="text" value={citySearch}
                onChange={e => { setCitySearch(e.target.value); setSelectedCity('') }}
                placeholder="Orasul tau sau destinatia..."
                style={{width:'100%', paddingLeft:'32px', paddingRight:'10px', paddingTop:'8px', paddingBottom:'8px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'12px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}}
              />
              {citySuggestions.length > 0 && (
                <div style={{position:'absolute', top:'100%', left:0, right:0, background:'white', border:'1px solid #e7e5e4', borderRadius:'10px', marginTop:'4px', zIndex:200, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', overflow:'hidden'}}>
                  {citySuggestions.map((s, i) => (
                    <button key={i} onClick={() => selectCity(s)}
                      style={{width:'100%', textAlign:'left', padding:'10px 14px', border:'none', background:'white', cursor:'pointer', borderBottom:'1px solid #f5f5f4', fontFamily:'Montserrat,sans-serif'}}>
                      <div style={{fontSize:'12px', fontWeight:600, color:'#1c1917'}}>{s.name}</div>
                      <div style={{fontSize:'10px', color:'#a8a29e'}}>{s.fullName}</div>
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
              <input type="range" min={50} max={600} step={50} value={radius} onChange={e => setRadius(Number(e.target.value))} style={{width:'100%', accentColor:'#1c1917'}} />
            </div>

            <div>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Tip venue</div>
              <div style={{display:'flex', flexWrap:'wrap', gap:'4px'}}>
                {VENUE_TYPES.map(t => (
                  <button key={t} onClick={() => setTypeFilter(t)}
                    style={{padding:'4px 10px', borderRadius:'20px', border:'1px solid', cursor:'pointer', fontSize:'11px', fontWeight:600, fontFamily:'Montserrat,sans-serif',
                      background: typeFilter === t ? '#7c3aed' : 'white',
                      color: typeFilter === t ? 'white' : '#78716c',
                      borderColor: typeFilter === t ? '#7c3aed' : '#e7e5e4'
                    }}>{t}</button>
                ))}
              </div>
            </div>

            <div>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>
                Capacitate: <span style={{color:'#7c3aed'}}>
                  {capacityMin === 0 && capacityMax === CAPACITY_MAX ? 'Toate' : capacityMin.toLocaleString() + ' - ' + (capacityMax >= CAPACITY_MAX ? '10.000+' : capacityMax.toLocaleString()) + ' pers.'}
                </span>
              </div>

              <div style={{display:'flex', flexWrap:'wrap', gap:'4px', marginBottom:'12px'}}>
                <button onClick={() => { setSelectedRange(null); setCapacityMin(0); setCapacityMax(CAPACITY_MAX) }}
                  style={{padding:'4px 10px', borderRadius:'20px', border:'1px solid', cursor:'pointer', fontSize:'10px', fontWeight:700, fontFamily:'Montserrat,sans-serif',
                    background: selectedRange === null ? '#1c1917' : 'white',
                    color: selectedRange === null ? 'white' : '#78716c',
                    borderColor: selectedRange === null ? '#1c1917' : '#e7e5e4'
                  }}>Toate ({VENUES.length})</button>
                {CAPACITY_RANGES.map((c, i) => {
                  const count = getCountForRange(i)
                  return (
                    <button key={c.label} onClick={() => selectRange(i)}
                      style={{padding:'4px 10px', borderRadius:'20px', border:'1px solid', cursor:'pointer', fontSize:'10px', fontWeight:600, fontFamily:'Montserrat,sans-serif',
                        background: selectedRange === i ? '#7c3aed' : 'white',
                        color: selectedRange === i ? 'white' : count === 0 ? '#d4d4d4' : '#78716c',
                        borderColor: selectedRange === i ? '#7c3aed' : count === 0 ? '#f5f5f4' : '#e7e5e4'
                      }}>{c.label} ({count})</button>
                  )
                })}
              </div>

              <div style={{marginBottom:'6px'}}>
                <div style={{background:'#ede9fe', borderRadius:'10px', height:'16px', overflow:'hidden', position:'relative'}}>
                  <div style={{
                    position:'absolute',
                    left: sliderMinPct + '%',
                    width: Math.max(sliderPct - sliderMinPct, 2) + '%',
                    height:'100%',
                    background:'linear-gradient(90deg, #7c3aed, #a78bfa)',
                    borderRadius:'10px',
                    transition:'all 0.3s',
                    boxShadow:'0 2px 6px rgba(124,58,237,0.4)'
                  }} />
                </div>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'9px', color:'#a8a29e', marginTop:'3px'}}>
                  <span>0</span><span>2.500</span><span>5.000</span><span>7.500</span><span>10.000+</span>
                </div>
              </div>
            </div>

            <div style={{background:'#f5f3ff', border:'1px solid #ddd6fe', borderRadius:'10px', padding:'10px 12px'}}>
              <div style={{fontSize:'11px', fontWeight:700, color:'#6d28d9', marginBottom:'3px'}}>💡 Cum functioneaza</div>
              <div style={{fontSize:'11px', color:'#7c3aed', lineHeight:'1.5'}}>Gasesti venue-uri → trimiti propunere → venue-ul te programeaza</div>
            </div>
          </div>

          <div style={{borderTop:'1px solid #f5f5f4', flexShrink:0}}>
            <div style={{padding:'8px 16px', background:'#fafaf9', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em'}}>{filtered.length} venue-uri gasite</div>
              <Link href="/venues/add" style={{fontSize:'10px', fontWeight:700, color:'#7c3aed', textDecoration:'none'}}>+ Adauga venue</Link>
            </div>
            <div style={{overflowY:'auto', maxHeight:'280px'}}>
              {filtered.map(v => (
                <div key={v.id} onClick={() => setSelectedVenue(v)}
                  style={{padding:'10px 16px', borderBottom:'1px solid #f5f5f4', cursor:'pointer',
                    background: selectedVenue?.id === v.id ? '#f5f3ff' : 'white',
                    borderLeft: selectedVenue?.id === v.id ? '3px solid #7c3aed' : '3px solid transparent'
                  }}>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'4px'}}>
                    <span style={{fontWeight:700, fontSize:'12px', color:'#1c1917'}}>{v.name}</span>
                    <span style={{fontSize:'10px', fontWeight:600, color:'#7c3aed', background:'#f5f3ff', padding:'2px 6px', borderRadius:'6px'}}>{v.type}</span>
                  </div>
                  <div style={{fontSize:'11px', color:'#a8a29e', marginBottom:'5px'}}>{v.city}</div>
                  <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                    <div style={{flex:1, background:'#ede9fe', borderRadius:'6px', height:'8px', overflow:'hidden'}}>
                      <div style={{height:'100%', background:'linear-gradient(90deg,#7c3aed,#a78bfa)', borderRadius:'6px', width: Math.min((v.capacity/CAPACITY_MAX)*100, 100) + '%', boxShadow:'0 1px 3px rgba(124,58,237,0.3)'}} />
                    </div>
                    <span style={{fontSize:'10px', color:'#7c3aed', fontWeight:700, whiteSpace:'nowrap'}}>{v.capacity.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{flex:1, position:'relative', overflow:'hidden'}}>
          <MapVenues venues={filtered} center={center} radius={radius} onSelectVenue={(v) => setSelectedVenue(v)} />

          {selectedVenue && (
            <div style={{position:'absolute', bottom:'20px', left:'50%', transform:'translateX(-50%)', width:'380px', background:'white', borderRadius:'16px', border:'1px solid #e7e5e4', boxShadow:'0 8px 32px rgba(0,0,0,0.12)', padding:'16px 20px', zIndex:50}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px'}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800, fontSize:'14px', color:'#1c1917', marginBottom:'3px'}}>🏛️ {selectedVenue.name}</div>
                  <div style={{fontSize:'11px', color:'#a8a29e', marginBottom:'8px'}}>{selectedVenue.type} • {selectedVenue.city}</div>
                  <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                    <div style={{flex:1, background:'#ede9fe', borderRadius:'6px', height:'10px', overflow:'hidden'}}>
                      <div style={{height:'100%', background:'linear-gradient(90deg,#7c3aed,#a78bfa)', borderRadius:'6px', width: Math.min((selectedVenue.capacity/CAPACITY_MAX)*100,100) + '%', boxShadow:'0 2px 4px rgba(124,58,237,0.4)'}} />
                    </div>
                    <span style={{fontSize:'13px', fontWeight:800, color:'#7c3aed', whiteSpace:'nowrap'}}>{selectedVenue.capacity.toLocaleString()} pers.</span>
                  </div>
                </div>
                <button onClick={() => setSelectedVenue(null)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'18px', color:'#a8a29e', marginLeft:'12px'}}>✕</button>
              </div>

              {isPremium ? (
                <div style={{background:'#f5f3ff', border:'1px solid #ddd6fe', borderRadius:'10px', padding:'10px 12px', marginBottom:'10px'}}>
                  <div style={{fontSize:'11px', fontWeight:700, color:'#6d28d9', marginBottom:'4px'}}>🔒 Contact (Pro)</div>
                  <div style={{fontSize:'12px', color:'#7c3aed'}}>{selectedVenue.contact}</div>
                  <div style={{fontSize:'12px', color:'#7c3aed'}}>{selectedVenue.phone}</div>
                </div>
              ) : (
                <div style={{background:'#fef3c7', border:'1px solid #fde68a', borderRadius:'10px', padding:'10px 12px', marginBottom:'10px'}}>
                  <div style={{fontSize:'11px', color:'#92400e'}}>🔒 Contactul e vizibil doar Pro</div>
                </div>
              )}

              <button onClick={() => setContactModal(true)}
                style={{width:'100%', background:'#7c3aed', color:'white', padding:'11px', borderRadius:'10px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:700, fontFamily:'Montserrat,sans-serif'}}>
                Trimite propunere →
              </button>
            </div>
          )}
        </div>
      </div>

      {contactModal && selectedVenue && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'}} onClick={() => setContactModal(false)}>
          <div style={{background:'white', borderRadius:'20px', padding:'24px', width:'100%', maxWidth:'420px', fontFamily:'Montserrat,sans-serif'}} onClick={e => e.stopPropagation()}>
            {proposalSent ? (
              <div style={{textAlign:'center', padding:'32px 0'}}>
                <div style={{fontSize:'48px', marginBottom:'16px'}}>✅</div>
                <div style={{fontWeight:800, fontSize:'16px', color:'#1c1917', marginBottom:'4px'}}>Propunere trimisa!</div>
                <div style={{fontSize:'13px', color:'#78716c'}}>Venue-ul va raspunde in 48h</div>
              </div>
            ) : (
              <>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
                  <span style={{fontWeight:800, fontSize:'15px', color:'#1c1917'}}>Propunere — {selectedVenue.name}</span>
                  <button onClick={() => setContactModal(false)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'18px', color:'#a8a29e'}}>✕</button>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                  <div>
                    <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Data propusa</div>
                    <input type="date" style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
                  </div>
                  <div>
                    <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Tip show</div>
                    <select style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}}>
                      <option>Concert solo</option>
                      <option>DJ Set</option>
                      <option>Formatie completa</option>
                      <option>Showcase</option>
                      <option>Rezidenta</option>
                    </select>
                  </div>
                  <div>
                    <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Mesaj</div>
                    <textarea rows={3} placeholder="Prezinta-te, descrie show-ul..."
                      style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', resize:'none', boxSizing:'border-box'}} />
                  </div>
                  <button onClick={sendProposal}
                    style={{width:'100%', background:'#7c3aed', color:'white', padding:'13px', borderRadius:'10px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif'}}>
                    Trimite propunerea
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
