'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import EventStep from '@/components/modules/client/EventStep'
import AtmosferaStep from '@/components/modules/client/AtmosferaStep'
import ArtistStep from '@/components/modules/client/ArtistStep'
import SummaryStep from '@/components/modules/client/SummaryStep'
import PriceExactModal from '@/components/modules/shared/PriceExactModal'
import ExpertModal from '@/components/modules/shared/ExpertModal'
import VenueSearch from '@/components/widgets/VenueSearch'

const MapVenues = dynamic(() => import('@/components/map/MapVenues'), { ssr: false })

const EVENT_TYPES = [
  { id: 'nunta', icon: '\u{1F48D}', label: 'Nunt\u0103' },
  { id: 'botez', icon: '\u{1F476}', label: 'Botez' },
  { id: 'corporate', icon: '\u{1F3E2}', label: 'Corporate' },
  { id: 'private', icon: '\u{1F389}', label: 'Petrecere privat\u0103' },
  { id: 'gala', icon: '\u{1F942}', label: 'Gal\u0103 / Revelion' },
  { id: 'festival', icon: '\u{1F3AA}', label: 'Festival' },
  { id: 'citydays', icon: '\u{1F386}', label: 'City Days' },
  { id: 'corporate2', icon: '\u{1F680}', label: 'Lansare / Team Building' },
]

const VENUE_TYPES_CLIENT = ["Toate", "Ballroom", "Restaurant cu scen\u0103", "Hotel conference", "Sal\u0103 Evenimente", "Cas\u0103 de cultur\u0103", "Parc evenimente", "Amfiteatru", "Pia\u021B\u0103 central\u0103", "Stadion", "Pool/Piscin\u0103", "Teras\u0103", "Castel", "Cram\u0103/Vie", "Altele"]

const VENUES = [
  { id:1, name:"Ballroom Grand", lat:44.43, lng:26.10, type:"Ballroom", city:"Bucure\u0219ti", capacity:500, priceEstimate:"3.000-5.000\u20ac" },
  { id:2, name:"Restaurant Silva", lat:46.77, lng:23.59, type:"Restaurant cu scen\u0103", city:"Cluj-Napoca", capacity:200, priceEstimate:"1.500-2.500\u20ac" },
  { id:3, name:"Hotel Radisson", lat:44.44, lng:26.10, type:"Hotel conference", city:"Bucure\u0219ti", capacity:1000, priceEstimate:"5.000-8.000\u20ac" },
  { id:4, name:"Conac Br\u0103t\u0103\u0219anu", lat:45.80, lng:24.15, type:"Castel", city:"Sibiu", capacity:150, priceEstimate:"2.000-4.000\u20ac" },
  { id:5, name:"Sala Regal", lat:45.75, lng:21.23, type:"Sal\u0103 Evenimente", city:"Timi\u0219oara", capacity:400, priceEstimate:"2.500-4.000\u20ac" },
  { id:6, name:"Vila Florica", lat:44.33, lng:23.79, type:"Cram\u0103/Vie", city:"Craiova", capacity:250, priceEstimate:"2.000-3.500\u20ac" },
  { id:7, name:"Grand Hotel Italia", lat:46.77, lng:23.61, type:"Hotel conference", city:"Cluj-Napoca", capacity:350, priceEstimate:"3.000-5.000\u20ac" },
  { id:8, name:"Ballroom Intercontinental", lat:44.44, lng:26.11, type:"Ballroom", city:"Bucure\u0219ti", capacity:600, priceEstimate:"4.000-7.000\u20ac" },
  { id:9, name:"Casa Vernescu", lat:44.45, lng:26.09, type:"Ballroom", city:"Bucure\u0219ti", capacity:300, priceEstimate:"2.500-4.500\u20ac" },
  { id:10, name:"Amfiteatru Constan\u021Ba", lat:44.18, lng:28.65, type:"Amfiteatru", city:"Constan\u021Ba", capacity:3000, priceEstimate:"2.000-8.000\u20ac" },
]

export default function ClientDashboard() {
  const [step, setStep] = useState('event')
  const [eventType, setEventType] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [guestCount, setGuestCount] = useState(0)
  const [budget, setBudget] = useState(0)
  const [atmosfera, setAtmosfera] = useState<string[]>([])
  const [tipEntertainment, setTipEntertainment] = useState<string[]>([])
  const [venueType, setVenueType] = useState('Toate')
  const [selectedVenues, setSelectedVenues] = useState<any[]>([])
  const [venueSearchResult, setVenueSearchResult] = useState<any>(null)
  const [googleVenues, setGoogleVenues] = useState<any[]>([])
  const [loadingVenues, setLoadingVenues] = useState(false)
  const [showVenueGrid, setShowVenueGrid] = useState(true)
  const [selectedArtists, setSelectedArtists] = useState<any[]>([])
  const [citySearch, setCitySearch] = useState('')
  const [center, setCenter] = useState<[number, number]>([45.7489, 24.9668])
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedCityLat, setSelectedCityLat] = useState<number | undefined>(undefined)
  const [selectedCityLng, setSelectedCityLng] = useState<number | undefined>(undefined)
  const [requestSent, setRequestSent] = useState(false)
  const [showPretExactModal, setShowPretExactModal] = useState(false)
  const [showExpertModal, setShowExpertModal] = useState(false)
  const [selectedSeturi, setSelectedSeturi] = useState<Record<number,string>>({})

  const steps = ['event', 'atmosfera', 'artist', 'venue', 'summary']
  const stepIndex = steps.indexOf(step)

  const totalMin = Math.round(((selectedArtists[0]?.feeMin || 0) + (selectedArtists[0]?.transport || 0)) * 1.05)
  const totalMax = Math.round(((selectedArtists[0]?.feeMax || 0) + (selectedArtists[0]?.transport || 0)) * 1.05)

  const toggleAtmosfera = (id: string) => {
    setAtmosfera(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev)
  }

  const toggleEntertainment = (id: string) => {
    if (id === 'expert') { setShowExpertModal(true); return }
    setTipEntertainment(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleVenueSelect = (venue: any) => {
    setSelectedVenues(prev => {
      const exists = prev.find(v => v.id === venue.id)
      return exists ? prev.filter(v => v.id !== venue.id) : prev.length >= 3 ? prev : [...prev, venue]
    })
  }

  useEffect(() => {
    if (step === 'venue' && selectedCity && googleVenues.length === 0) {
      setLoadingVenues(true)
      const city = selectedCity.split(',')[0]
      const searches = ['sala evenimente ' + city, 'ballroom ' + city, 'restaurant evenimente ' + city, 'club ' + city, 'hotel conferinte ' + city]
      Promise.all(searches.map(q => 
        fetch('/api/places?input=' + encodeURIComponent(q))
          .then(r => r.json())
          .then(d => d.predictions || [])
          .catch(() => [])
      )).then(results => {
        const all = results.flat()
        const unique = all.filter((p: any, i: number, arr: any[]) => 
          arr.findIndex((x: any) => x.place_id === p.place_id) === i
        ).map((p: any) => ({
          id: p.place_id,
          name: p.structured_formatting?.main_text || p.description,
          city: city,
          address: p.structured_formatting?.secondary_text || '',
          lat: 0, lng: 0,
          type: 'Sală Evenimente',
          capacity: 500,
          priceEstimate: 'La cerere'
        }))
        setGoogleVenues(unique)
        setLoadingVenues(false)
      })
    }
  }, [step, selectedCity])

  const cityName = selectedCity.split(',')[0].toLowerCase().trim()
  const filteredVenues = VENUES.filter(v => {
    if (venueType !== 'Toate' && v.type !== venueType) return false
    if (guestCount > 0 && v.capacity < guestCount) return false
    if (cityName && v.city) {
      const vCity = v.city.toLowerCase()
      if (!vCity.includes(cityName) && !cityName.includes(vCity)) return false
    }
    return true
  })

  const handleTrimite = () => {
    const parts = ['Cerere Concert Exchange', 'Artisti: ' + selectedArtists.map((a) => a.name).join(', '), 'Data: ' + eventDate, 'Oras: ' + selectedCity, 'Locatie: ' + (selectedVenues[0]?.name || 'nespecificata'), 'Participanti: ' + guestCount, 'Seturi: ' + (Object.values(selectedSeturi).length > 0 ? Object.values(selectedSeturi).join(', ') : 'la cerere'), 'Buget eveniment: ' + budget + ' EUR']
    const msg = encodeURIComponent(parts.join('\n'))
    const subject = encodeURIComponent('Cerere Concert Exchange')
    window.open('mailto:me@bogdannita.ro?subject=' + subject + '&body=' + msg, '_blank')
    setRequestSent(true)
  }

  const eventTypeLabel = EVENT_TYPES.find(e => e.id === eventType)?.label || ''

  return (
    <div style={{minHeight:'100vh', background:'#fafaf9', fontFamily:'Montserrat,sans-serif'}}>
      <nav style={{borderBottom:'1px solid #e7e5e4', background:'white', height:'56px', display:'flex', alignItems:'center', padding:'0 24px', justifyContent:'space-between', position:'sticky', top:0, zIndex:100}}>
        <Link href="/" style={{fontWeight:800, fontSize:'18px', color:'#1c1917', textDecoration:'none'}}>
          Concert <span style={{color:'#f59e0b'}}>&#9679;</span> Exchange
        </Link>
        <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
          {steps.map((s, i) => (
            <div key={s} style={{display:'flex', alignItems:'center', gap:'6px'}}>
              <div onClick={() => i < stepIndex && setStep(s)}
                style={{width:'26px', height:'26px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, cursor: i < stepIndex ? 'pointer' : 'default', background: step === s ? '#1c1917' : i < stepIndex ? '#22c55e' : '#e7e5e4', color: step === s || i < stepIndex ? 'white' : '#78716c'}}>
                {i < stepIndex ? '\u2713' : i + 1}
              </div>
              {i < 4 && <div style={{width:'20px', height:'2px', background: i < stepIndex ? '#22c55e' : '#e7e5e4'}} />}
            </div>
          ))}
        </div>
        <Link href="/" style={{fontSize:'12px', color:'#78716c', textDecoration:'none'}}> Inapoi</Link>
      </nav>

      <div style={{maxWidth:'900px', margin:'0 auto', padding:'40px 24px'}}>

        {step === 'event' && (
          <EventStep
            eventType={eventType} setEventType={setEventType}
            eventDate={eventDate} setEventDate={setEventDate}
            budget={budget} setBudget={setBudget}
            guestCount={guestCount} setGuestCount={setGuestCount}
            selectedCity={selectedCity} setSelectedCity={setSelectedCity}
            citySearch={citySearch} setCitySearch={setCitySearch}
            setCenter={setCenter}
            onCitySelect={(lat: number, lng: number) => { setSelectedCityLat(lat); setSelectedCityLng(lng) }}
            onNext={() => setStep('atmosfera')}
          />
        )}

        {step === 'atmosfera' && (
          <AtmosferaStep
            atmosfera={atmosfera} toggleAtmosfera={toggleAtmosfera}
            tipEntertainment={tipEntertainment} toggleEntertainment={toggleEntertainment}
            onBack={() => setStep('event')}
            onNext={() => setStep('artist')}
            onExpert={() => setShowExpertModal(true)}
          />
        )}

        {step === 'artist' && (
          <ArtistStep
            budget={budget} setBudget={setBudget}
            eventTypeLabel={eventTypeLabel}
            atmosfera={atmosfera}
            tipEntertainment={tipEntertainment}
            selectedArtists={selectedArtists} setSelectedArtists={setSelectedArtists}
            onBack={() => setStep('atmosfera')}
            onNext={() => { if(selectedArtists.length > 0) setStep('venue') }}
          />
        )}

        {step === 'venue' && (
          <div>
            {selectedArtists.length > 0 && (
              <div style={{background:'#1c1917', borderRadius:'12px', padding:'12px 16px', marginBottom:'20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'8px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap'}}>
                  {selectedArtists.map((a, i) => {
                    const tier = a.tier === 'Premium' ? 'A++ · Icon' : a.tier === 'A+' ? 'A+ · Premium' : 'A · Select'
                    const tierBg = a.tier === 'Premium' ? '#44403c' : a.tier === 'A+' ? '#7c3aed' : '#44403c'
                    return (
                      <div key={a.id} style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        {i > 0 && <span style={{color:'#44403c', fontSize:'12px'}}>·</span>}
                        <span style={{fontSize:'13px', fontWeight:700, color:'white'}}>{a.name}</span>
                        <span style={{fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', background: tierBg, color:'white'}}>{tier}</span>
                      </div>
                    )
                  })}
                </div>
                <span style={{fontSize:'11px', color:'#78716c'}}>fee la cerere</span>
              </div>
            )}
            <div style={{textAlign:'center', marginBottom:'24px'}}>
              <h1 style={{fontSize:'28px', fontWeight:800, color:'#1c1917', marginBottom:'8px'}}>Alege locatia</h1>
              <p style={{fontSize:'14px', color:'#78716c'}}>{guestCount} invitati - {selectedCity || 'Romania'}</p>
            </div>
            <div style={{marginBottom:'20px'}}>
              <VenueSearch
                onSelectVenue={(v: any) => {
                  if (!v.name) { setVenueSearchResult(null); setSelectedVenues([]); setShowVenueGrid(true); return }
                  const venue = {id: v.place_id, name: v.name, lat: v.lat, lng: v.lng, type: 'Locatie', city: v.address || selectedCity, capacity: 0, priceEstimate: 'Pret la cerere'}
                  setVenueSearchResult(venue); setSelectedVenues([venue]); setShowVenueGrid(false)
                }}
                cityFilter={selectedCity.split(',')[0]}
              />
            </div>

            {showVenueGrid && (
              <>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px'}}>
                  <div style={{fontSize:'13px', fontWeight:700, color:'#1c1917'}}>
                    Locatii recomandate {selectedCity ? 'in ' + selectedCity.split(',')[0] : 'in Romania'}
                  </div>

                </div>
                <div style={{display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'14px'}}>
                  {VENUE_TYPES_CLIENT.map(t => (
                    <button key={t} onClick={() => {
                      setVenueType(t)
                      if (t !== 'Toate' && selectedCity) {
                        const searchTerm = t + ' ' + selectedCity.split(',')[0]
                        fetch('/api/places?input=' + encodeURIComponent(searchTerm))
                          .then(r => r.json())
                          .then(data => {
                            if (data.predictions && data.predictions.length > 0) {
                              const venues = data.predictions.map((p: any) => ({
                                id: p.place_id,
                                name: p.structured_formatting?.main_text || p.description,
                                city: selectedCity.split(',')[0],
                                address: p.structured_formatting?.secondary_text || '',
                                lat: 0, lng: 0,
                                type: t,
                                capacity: 500,
                                priceEstimate: 'La cerere'
                              }))
                              setVenueSearchResult(venues[0])
                              setSelectedVenues([venues[0]])
                              setShowVenueGrid(false)
                            }
                          })
                          .catch(() => {})
                      }
                    }}
                      style={{padding:'5px 12px', borderRadius:'20px', border:'1px solid', cursor:'pointer', fontSize:'11px', fontWeight:600, fontFamily:'Montserrat,sans-serif', background: venueType === t ? '#1c1917' : 'white', color: venueType === t ? 'white' : '#78716c', borderColor: venueType === t ? '#1c1917' : '#e7e5e4'}}>{t}</button>
                  ))}
                </div>
                <div style={{height:'240px', borderRadius:'16px', overflow:'hidden', marginBottom:'14px', border:'1px solid #e7e5e4'}}>
                  <MapVenues venues={filteredVenues} center={center} radius={200} onSelectVenue={(v: any) => toggleVenueSelect(v)} />
                </div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px'}}>
                  {loadingVenues && <div style={{gridColumn:'1/-1', textAlign:'center', padding:'20px', fontSize:'13px', color:'#a8a29e'}}>Se caută locații în {selectedCity.split(',')[0]}...</div>}
                  {(googleVenues.length > 0 ? googleVenues : filteredVenues).slice(0,8).map(v => {
                    const isSelected = selectedVenues.find(sv => sv.id === v.id)
                    return (
                      <div key={v.id} onClick={() => toggleVenueSelect(v)}
                        style={{background:'white', border:'2px solid ' + (isSelected ? '#1c1917' : '#e7e5e4'), borderRadius:'14px', padding:'16px', cursor:'pointer', transition:'all 0.2s'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px'}}>
                          <div style={{fontWeight:700, fontSize:'13px', color:'#1c1917'}}>{v.name}</div>
                          <span style={{fontSize:'10px', fontWeight:600, color:'#78716c', background:'#f5f5f4', padding:'2px 8px', borderRadius:'6px'}}>{v.type}</span>
                        </div>
                        <div style={{fontSize:'12px', color:'#a8a29e', marginBottom:'6px'}}>{v.city} - {v.priceEstimate}</div>
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
              <button onClick={() => setStep('artist')} style={{padding:'12px 24px', borderRadius:'12px', border:'1px solid #e7e5e4', background:'white', color:'#78716c', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif'}}>Inapoi</button>
              <button onClick={() => setStep('summary')}
                style={{flex:1, background:'#1c1917', color:'white', padding:'12px', borderRadius:'12px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif'}}>
                {selectedVenues.length > 0 ? 'Continuă — Rezumat' : 'Continuă fără locație'}
              </button>
            </div>
          </div>
        )}

        {step === 'summary' && (
          <SummaryStep
            eventType={eventType}
            eventDate={eventDate}
            guestCount={guestCount}
            selectedArtists={selectedArtists}
            selectedVenues={selectedVenues}
            selectedCity={selectedCity}
            selectedCityLat={selectedCityLat}
            selectedCityLng={selectedCityLng}
            budget={budget}
            selectedSeturi={selectedSeturi}
            setSelectedSeturi={(artistId: number, val: string) => setSelectedSeturi(prev => ({...prev, [artistId]: val}))}
            requestSent={requestSent}
            onTrimite={handleTrimite}
            onBack={() => setStep('venue')}
            onPretExact={() => setShowPretExactModal(true)}
          />
        )}
      </div>

      <PriceExactModal
        isOpen={showPretExactModal}
        onClose={() => setShowPretExactModal(false)}
        artists={selectedArtists}
        eventDate={eventDate}
        location={selectedVenues[0]?.name}
        locationCity={selectedVenues[0]?.city || selectedCity}
        budget={budget}
        guestCount={guestCount}
      />

      <ExpertModal
        isOpen={showExpertModal}
        onClose={() => setShowExpertModal(false)}
        eventDate={eventDate}
        selectedCity={selectedCity}
        guestCount={guestCount}
      />
    </div>
  )
}
