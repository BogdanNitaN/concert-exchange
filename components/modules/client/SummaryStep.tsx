'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Calendar, Users, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Plane, Car, Hotel } from 'lucide-react'

const SETURI_VOCAL = [
  { id: '1x45', label: '1 set · 45 min' },
]

const SETURI_COVER = [
  { id: '1x45', label: '1 set · 45 min' },
  { id: '2x45', label: '2 seturi · 45 min' },
  { id: '3x45', label: '3 seturi · 45 min' },
  { id: 'allnight', label: 'All Night' },
]

const SETURI_DJ = [
  { id: '1x90', label: '1 set · 90 min' },
  { id: '1x120', label: 'Extended Set · 2h' },
  { id: '1x180', label: 'Long Set · 3h' },
  { id: 'allnight', label: 'All Night' },
]

const getSeturi = (artist: any) => {
  const type = artist?.setType || 'vocal'
  if (type === 'dj') return SETURI_DJ
  if (type === 'cover') return SETURI_COVER
  return SETURI_VOCAL
}

const EVENT_TYPES = [
  { id: 'nunta', label: 'Nuntă' }, { id: 'botez', label: 'Botez' },
  { id: 'corporate', label: 'Corporate' }, { id: 'private', label: 'Petrecere privată' },
  { id: 'revelion', label: 'Revelion / Crăciun' }, { id: 'festival', label: 'Festival' },
  { id: 'concert', label: 'Concert' }, { id: 'citydays', label: 'City Days / Open Air' },
  { id: 'club', label: 'Club Night' }, { id: 'popup', label: 'Pop-Up Event' },
  { id: 'pool', label: 'Pool Party' }, { id: 'dayparty', label: 'Day Party' },
  { id: 'dinner', label: 'Dinner & Show' }, { id: 'lansare', label: 'Team Building' },
  { id: 'altele', label: 'Altele' },
]

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

const CITIES_COORDS: Record<string, {lat: number, lng: number}> = {
  'Bucuresti': { lat: 44.4268, lng: 26.1025 },
  'Cluj-Napoca': { lat: 46.7712, lng: 23.6236 },
  'Timisoara': { lat: 45.7489, lng: 21.2087 },
  'Iasi': { lat: 47.1585, lng: 27.6014 },
  'Constanta': { lat: 44.1598, lng: 28.6348 },
  'Brasov': { lat: 45.6427, lng: 25.5887 },
  'Oradea': { lat: 47.0458, lng: 21.9189 },
  'Bacau': { lat: 46.5670, lng: 26.9146 },
  'Botosani': { lat: 47.7487, lng: 26.6697 },
}

const BUCURESTI = { lat: 44.4268, lng: 26.1025 }

interface Props {
  eventType: string
  eventDate: string
  guestCount: number
  selectedArtists: any[]
  selectedVenues: any[]
  selectedCity: string
  selectedCityLat?: number
  selectedCityLng?: number
  budget: number
  selectedSeturi: Record<number, string>
  setSelectedSeturi: (artistId: number, val: string) => void
  requestSent: boolean
  onTrimite: () => void
  onBack: () => void
  onPretExact: () => void
}

export default function SummaryStep({ eventType, eventDate, guestCount, selectedArtists, selectedVenues, selectedCity, selectedCityLat, selectedCityLng, budget, selectedSeturi, setSelectedSeturi, requestSent, onTrimite, onBack, onPretExact }: Props) {
  const [openArtistId, setOpenArtistId] = useState<number | null>(selectedArtists[0]?.id || null)
  const eventInfo = EVENT_TYPES.find(e => e.id === eventType)

  const getArtistCoords = (artist: any) => {
    const cityFrom = artist?.cityFrom || 'Bucuresti'
    return CITIES_COORDS[cityFrom] || BUCURESTI
  }

  const getDistanta = (artist: any) => {
    if (!selectedCityLat || !selectedCityLng) return 200
    const from = getArtistCoords(artist)
    return Math.round(haversineKm(from.lat, from.lng, selectedCityLat, selectedCityLng) * 1.35)
  }

  const tierInfo = (tier: string) => {
    if (tier === 'Premium') return { bg: '#eacda3', color: '#1c1917', label: 'A++ · Icon', range: '10.000€+' }
    if (tier === 'A+') return { bg: '#7c3aed', color: 'white', label: 'A+ · Premium', range: '5.000–10.000€' }
    return { bg: 'white', color: '#1c1917', label: 'A · Select', range: 'până la 5.000€' }
  }

  if (requestSent) {
    return (
      <div style={{textAlign:'center', padding:'80px 0'}}>
        <div style={{display:'flex', justifyContent:'center', marginBottom:'20px'}}>
          <CheckCircle2 size={64} color='#059669' strokeWidth={1.5} />
        </div>
        <h2 style={{fontSize:'28px', fontWeight:800, color:'#1c1917', marginBottom:'8px', letterSpacing:'-0.5px'}}>Cerere trimisă!</h2>
        <p style={{fontSize:'15px', color:'#78716c', marginBottom:'32px'}}>Te contactăm în mai puțin de 30 min.</p>
        <div style={{display:'flex', gap:'12px', justifyContent:'center'}}>
          <Link href="/" style={{display:'inline-flex', alignItems:'center', gap:'8px', background:'#1c1917', color:'white', padding:'13px 28px', borderRadius:'14px', fontSize:'14px', fontWeight:700, textDecoration:'none'}}>
            Acasă <ArrowRight size={16} strokeWidth={2} />
          </Link>
          <Link href="/dashboard/client" style={{display:'inline-flex', alignItems:'center', gap:'8px', background:'white', color:'#1c1917', padding:'13px 28px', borderRadius:'14px', fontSize:'14px', fontWeight:700, textDecoration:'none', border:'1.5px solid #e7e5e4'}}>
            Cerere nouă
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{textAlign:'center', marginBottom:'28px'}}>
        <h1 style={{fontSize:'28px', fontWeight:800, color:'#1c1917', marginBottom:'8px', letterSpacing:'-0.5px'}}>Rezumat eveniment</h1>
        <p style={{fontSize:'15px', color:'#78716c'}}>Verifică detaliile înainte de a trimite cererea</p>
      </div>

      <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'24px', marginBottom:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', marginBottom:'20px'}}>
          <div>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px', display:'flex', alignItems:'center', gap:'4px'}}>
              <Calendar size={10} strokeWidth={2} /> Eveniment
            </div>
            <div style={{fontSize:'14px', fontWeight:700, color:'#1c1917'}}>{eventInfo?.label}</div>
          </div>
          <div>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px', display:'flex', alignItems:'center', gap:'4px'}}>
              <Calendar size={10} strokeWidth={2} /> Data
            </div>
            <div style={{fontSize:'14px', fontWeight:700, color:'#1c1917'}}>{eventDate}</div>
          </div>
          <div>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px', display:'flex', alignItems:'center', gap:'4px'}}>
              <Users size={10} strokeWidth={2} /> Participanți
            </div>
            <div style={{fontSize:'14px', fontWeight:700, color:'#1c1917'}}>{guestCount >= 1000 ? (guestCount/1000).toFixed(0) + 'k' : guestCount} pers.</div>
          </div>
        </div>

        <div style={{borderTop:'1px solid #f5f5f4', paddingTop:'20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px'}}>
          <div>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px', display:'flex', alignItems:'center', gap:'4px'}}>
              <MapPin size={10} strokeWidth={2} /> Locație
            </div>
            <div style={{background:'#fafaf9', borderRadius:'12px', padding:'12px 14px', border:'1px solid #f0f0ef'}}>
              <div style={{fontWeight:700, fontSize:'14px', color:'#1c1917', marginBottom:'2px'}}>{selectedVenues[0]?.name || 'Nespecificată'}</div>
              <div style={{fontSize:'12px', color:'#78716c'}}>{selectedVenues[0]?.city || selectedCity}</div>
            </div>
          </div>
          <div>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px'}}>
              Bugetul tău
            </div>
            <div style={{background:'#fafaf9', borderRadius:'12px', padding:'12px 14px', border:'1px solid #f0f0ef'}}>
              <div style={{fontWeight:800, fontSize:'18px', color:'#1c1917', marginBottom:'2px'}}>{budget > 0 ? budget.toLocaleString() + ' €' : 'Nespecificat'}</div>
              <div style={{fontSize:'11px', color:'#78716c'}}>buget total eveniment</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:'10px', marginBottom:'14px'}}>
        {selectedArtists.map((a) => {
          const isOpen = openArtistId === a.id
          const ts = tierInfo(a.tier)
          const distantaArtist = getDistanta(a)
          const costRutier = Math.round(distantaArtist * (a.costPerKm || 2) / 10) * 10
          const nrBilete = a.nrBileteAvion || 0
          const necesitaZborArtist = distantaArtist > 300
          const seturiArtist = getSeturi(a)

          return (
            <div key={a.id} style={{background:'white', border:'1.5px solid ' + (isOpen ? '#1c1917' : '#e7e5e4'), borderRadius:'16px', overflow:'hidden', transition:'all 0.2s'}}>
              <div onClick={() => setOpenArtistId(isOpen ? null : a.id)}
                style={{padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', background: isOpen ? '#1c1917' : 'white'}}>
                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                  <div style={{width:'36px', height:'36px', borderRadius:'10px', background: isOpen ? 'rgba(255,255,255,0.15)' : '#f5f5f4', display:'flex', alignItems:'center', justifyContent:'center', color: isOpen ? 'white' : '#1c1917', fontWeight:800, fontSize:'12px'}}>
                    {a.name.split(' ').map((n: string) => n[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <div style={{fontWeight:700, fontSize:'14px', color: isOpen ? 'white' : '#1c1917', marginBottom:'4px'}}>{a.name}</div>
                    <span style={{fontSize:'10px', fontWeight:700, padding:'2px 7px', borderRadius:'6px', background: isOpen ? 'rgba(255,255,255,0.15)' : ts.bg, color: isOpen ? 'white' : ts.color}}>{ts.label}</span>
                  </div>
                </div>
                {isOpen ? <ChevronUp size={18} color='white' strokeWidth={2} /> : <ChevronDown size={18} color='#78716c' strokeWidth={2} />}
              </div>

              {isOpen && (
                <div style={{padding:'20px', borderTop:'1px solid #f0f0ef'}}>
                  <div style={{display:'flex', flexDirection:'column', gap:'10px', marginBottom:'16px'}}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fafaf9', borderRadius:'12px', padding:'12px 14px'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        <Car size={16} color='#44403c' strokeWidth={1.5} />
                        <div>
                          <div style={{fontSize:'13px', fontWeight:600, color:'#1c1917'}}>Transport rutier</div>
                          <div style={{fontSize:'11px', color:'#a8a29e'}}>{distantaArtist} km · din {a.cityFrom || 'București'}</div>
                        </div>
                      </div>
                      <div style={{fontSize:'14px', fontWeight:800, color:'#1c1917'}}>{costRutier.toLocaleString()} €</div>
                    </div>

                    {necesitaZborArtist && nrBilete > 0 && (
                      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', background:'#eff6ff', borderRadius:'12px', padding:'12px 14px', border:'1px solid #bfdbfe'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                          <Plane size={16} color='#1e40af' strokeWidth={1.5} />
                          <div>
                            <div style={{fontSize:'13px', fontWeight:600, color:'#1e40af'}}>Zbor artist</div>
                            <div style={{fontSize:'11px', color:'#3b82f6'}}>{nrBilete} {nrBilete === 1 ? 'bilet' : 'bilete'} · {distantaArtist} km</div>
                          </div>
                        </div>
                        <a href="https://masirotravel.ro" target="_blank" rel="noopener noreferrer"
                          style={{fontSize:'11px', color:'#1e40af', textDecoration:'none', fontWeight:700, background:'white', padding:'4px 10px', borderRadius:'8px', border:'1px solid #bfdbfe'}}>
                          Vezi zboruri →
                        </a>
                      </div>
                    )}

                    {a.cazare && (
                      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', background:'#f5f3ff', borderRadius:'12px', padding:'12px 14px', border:'1px solid #ddd6fe'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                          <Hotel size={16} color='#7c3aed' strokeWidth={1.5} />
                          <div>
                            <div style={{fontSize:'13px', fontWeight:600, color:'#7c3aed'}}>Cazare necesară</div>
                            <div style={{fontSize:'11px', color:'#8b5cf6'}}>{a.cazare}</div>
                          </div>
                        </div>
                        <a href="https://masirotravel.ro" target="_blank" rel="noopener noreferrer"
                          style={{fontSize:'11px', color:'#7c3aed', textDecoration:'none', fontWeight:700, background:'white', padding:'4px 10px', borderRadius:'8px', border:'1px solid #ddd6fe'}}>
                          Vezi hoteluri →
                        </a>
                      </div>
                    )}

                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderTop:'1px solid #f0f0ef'}}>
                      <div>
                        <div style={{fontSize:'13px', fontWeight:600, color:'#1c1917'}}>Fee artist</div>
                        <div style={{fontSize:'11px', color:'#a8a29e'}}>Tier {ts.label} · {ts.range}</div>
                      </div>
                      <div style={{fontSize:'13px', fontWeight:700, color:'#78716c'}}>La cerere</div>
                    </div>

                    <div style={{borderTop:'1px solid #f0f0ef', padding:'12px 14px'}}>
                      <div style={{fontSize:'11px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'10px'}}>Seturi</div>
                      <div style={{display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'8px'}}>
                        {seturiArtist.map(s => (
                          <button key={s.id} onClick={() => setSelectedSeturi(a.id, s.id)}
                            style={{padding:'6px 14px', borderRadius:'20px', border:'1.5px solid', cursor:'pointer', fontSize:'11px', fontWeight:600, fontFamily:'Montserrat,sans-serif', transition:'all 0.15s',
                              background: (selectedSeturi[a.id] || seturiArtist[0]?.id) === s.id ? '#1c1917' : 'white',
                              color: (selectedSeturi[a.id] || seturiArtist[0]?.id) === s.id ? 'white' : '#44403c',
                              borderColor: (selectedSeturi[a.id] || seturiArtist[0]?.id) === s.id ? '#1c1917' : '#e7e5e4'}}>
                            {s.label}
                          </button>
                        ))}
                      </div>

                    </div>
                  </div>

                  <div style={{background:'#1c1917', borderRadius:'14px', padding:'16px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer'}}
                    onClick={onPretExact}>
                    <div>
                      <div style={{fontWeight:800, fontSize:'13px', color:'white', marginBottom:'2px'}}>Prețul exact, confirmat în 30 min.</div>
                      <div style={{fontSize:'11px', color:'rgba(255,255,255,0.6)'}}>Fără surprize. Garantat.</div>
                    </div>
                    <div style={{background:'#059669', color:'white', fontWeight:700, fontSize:'12px', padding:'8px 14px', borderRadius:'10px', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:'6px'}}>
                      Vreau prețul <ArrowRight size={13} strokeWidth={2} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
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
