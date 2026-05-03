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
const DEFAULT_CENTER: [number, number] = [45.9432, 24.9668]

interface GeoSuggestion {
  name: string
  lat: number
  lng: number
  fullName: string
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
  const [showVenues, setShowVenues] = useState(true)
  const [mapLayer, setMapLayer] = useState<'artisti'|'venues'|'toate'>('toate')
  const searchTimer = useRef<any>(null)

  useEffect(() => {
    if (citySearch.length < 3) { setCitySuggestions([]); return }
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(citySearch)}&countrycodes=ro,md&format=json&limit=8&accept-language=ro&addressdetails=1`,
          { headers: { 'Accept-Language': 'ro' } }
        )
        const data = await res.json()
        const suggestions: GeoSuggestion[] = data.map((d: any) => ({
          name: d.address?.city || d.address?.town || d.address?.village || d.address?.municipality || d.name,
          fullName: [d.address?.city || d.address?.town || d.address?.village || d.name, d.address?.county, d.address?.country].filter(Boolean).join(', '),
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lon)
        }))
        setCitySuggestions(suggestions)
      } catch (e) {
        console.error(e)
      }
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
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <nav className="border-b border-stone-200 bg-white sticky top-0 z-50">
        <div className="max-w-full px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-stone-900 tracking-tight">
            Concert <span className="text-amber-500">●</span> Exchange
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
              {(['toate','artisti','venues'] as const).map(l => (
                <button key={l} onClick={() => setMapLayer(l)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    mapLayer === l ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                  }`}>
                  {l === 'toate' ? 'Toate' : l === 'artisti' ? '🎤 Artiști' : '🏛️ Venue-uri'}
                </button>
              ))}
            </div>
            <Link href="/dashboard/promoter" className="text-sm text-stone-500 hover:text-stone-900">Dashboard</Link>
            {isPremium && <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">⭐ Premium</span>}
          </div>
        </div>
      </nav>

      <div className="flex flex-1" style={{height:'calc(100vh - 64px)'}}>

        <div className="w-80 flex-shrink-0 bg-white border-r border-stone-200 overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-stone-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-stone-900">Filtre căutare</h2>
              <span className="text-xs text-stone-400">{filtered.length} găsiți</span>
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                Orașul evenimentului
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">📍</span>
                <input
                  type="text"
                  value={citySearch}
                  onChange={e => { setCitySearch(e.target.value); setSelectedCity('') }}
                  placeholder="Caută orice localitate RO / MD..."
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              {citySuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-stone-200 rounded-xl mt-1 z-[200] shadow-xl overflow-hidden">
                  {citySuggestions.map((s, i) => (
                    <button key={i} onClick={() => selectCity(s)}
                      className="w-full text-left px-4 py-3 hover:bg-stone-50 border-b border-stone-100 last:border-0">
                      <div className="text-sm font-medium text-stone-900">{s.name}</div>
                      <div className="text-xs text-stone-400">{s.fullName}</div>
                    </button>
                  ))}
                </div>
              )}
              {selectedCity && (
                <div className="mt-2 flex items-center gap-1 text-xs text-green-600 font-medium">
                  <span>✓</span>
                  <span className="truncate">{selectedCity}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 space-y-5 flex-1">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
                Radius: <span className="text-stone-900">{radius} km</span>
              </label>
              <div className="flex gap-1.5 mb-2">
                {[100,200,350,600].map(r => (
                  <button key={r} onClick={() => setRadius(r)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      radius === r ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                    }`}>{r}</button>
                ))}
              </div>
              <input type="range" min={50} max={600} step={50} value={radius}
                onChange={e => setRadius(Number(e.target.value))} className="w-full" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Dată eveniment</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-400" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Gen muzical</label>
              <div className="flex flex-wrap gap-1.5">
                {GENRES.map(g => (
                  <button key={g} onClick={() => setGenre(genre === g ? '' : g)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      genre === g ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                    }`}>{g}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Tip eveniment</label>
              <div className="flex flex-wrap gap-1.5">
                {EVENT_TYPES.map(e => (
                  <button key={e} onClick={() => setEventType(eventType === e ? '' : e)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      eventType === e ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                    }`}>{e}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Tier</label>
              <div className="flex gap-2">
                {TIERS.map(t => (
                  <button key={t} onClick={() => setTierFilter(tierFilter === t ? '' : t)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      tierFilter === t ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                    }`}>{t}</button>
                ))}
              </div>
            </div>

            {filtered.some(a => a.nearby) && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <div className="text-xs font-semibold text-green-800 mb-1">🔗 Smart routing activ</div>
                <div className="text-xs text-green-600">{filtered.filter(a=>a.nearby).length} artiști deja în zonă</div>
              </div>
            )}

            {mapLayer !== 'artisti' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <div className="text-xs font-semibold text-blue-800 mb-2">🏛️ Venue-uri în zonă</div>
                {VENUES.map(v => (
                  <div key={v.id} className="text-xs text-blue-700 mb-1">
                    <span className="font-medium">{v.name}</span> — {v.type}, {v.city}
                  </div>
                ))}
                <div className="text-xs text-blue-400 mt-2">Contactele vizibile doar pentru tine (Pro)</div>
              </div>
            )}
          </div>

          <div className="border-t border-stone-100">
            <div className="p-3 bg-stone-50">
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{filtered.length} artiști în {radius}km</div>
            </div>
            <div style={{maxHeight:'280px', overflowY:'auto'}}>
              {filtered.map(a => (
                <div key={a.id} onClick={() => setSelectedArtist(a)}
                  className={`p-3 border-b border-stone-100 cursor-pointer transition-all hover:bg-stone-50 ${selectedArtist?.id === a.id ? 'bg-amber-50 border-l-2 border-l-amber-400' : ''}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-stone-900">{a.name}</span>
                      {a.nearby && <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">📍</span>}
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      a.tier === 'Premium' ? 'bg-amber-100 text-amber-700' :
                      a.tier === 'A+' ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-600'
                    }`}>{a.tier}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-400">{a.genres[0]} • {a.dist}km</span>
                    {isPremium ? <span className="text-xs font-semibold text-green-600">{a.fee}</span>
                      : <span className="text-xs text-stone-300 blur-sm select-none">X.XXX€</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 relative">
          <MapComponent
            artists={mapLayer !== 'venues' ? filtered : []}
            venues={mapLayer !== 'artisti' ? VENUES : []}
            center={center}
            radius={radius}
            onSelectArtist={(a) => setSelectedArtist(a)}
          />

          {selectedArtist && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-96 bg-white rounded-2xl border border-stone-200 shadow-lg p-5 z-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-stone-900">{selectedArtist.name}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      selectedArtist.tier === 'Premium' ? 'bg-amber-100 text-amber-700' :
                      selectedArtist.tier === 'A+' ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-600'
                    }`}>{selectedArtist.tier}</span>
                    {selectedArtist.nearby && <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">📍 În zonă</span>}
                  </div>
                  <div className="text-xs text-stone-400">{selectedArtist.genres.join(', ')} • {selectedArtist.dist}km</div>
                </div>
                <button onClick={() => setSelectedArtist(null)} className="text-stone-400 hover:text-stone-600 text-lg">✕</button>
              </div>
              <div className="flex items-center justify-between">
                {isPremium ? <span className="text-lg font-bold text-green-600">{selectedArtist.fee}</span>
                  : <span className="text-lg font-bold text-stone-300 blur-sm select-none">X.XXX€</span>}
                <button onClick={() => selectedArtist.available && setBookingModal(true)}
                  disabled={!selectedArtist.available}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    selectedArtist.available ? 'bg-stone-900 text-white hover:bg-stone-800' : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  }`}>
                  {selectedArtist.available ? 'Trimite cerere' : 'Indisponibil'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {bookingModal && selectedArtist && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={() => setBookingModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            {bookingSent ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <div className="font-semibold text-stone-900">Cerere trimisă!</div>
                <div className="text-stone-500 text-sm mt-1">Artistul va răspunde în 24h</div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-stone-900">Booking — {selectedArtist.name}</h3>
                  <button onClick={() => setBookingModal(false)} className="text-stone-400 hover:text-stone-600">✕</button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Data</label>
                    <input type="date" className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Tip eveniment</label>
                    <select className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-400">
                      {EVENT_TYPES.map(e => <option key={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Buget propus</label>
                    <input type="text" placeholder="ex: 8.000€" className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Mesaj</label>
                    <textarea rows={3} placeholder="Descrie evenimentul..."
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-400 resize-none" />
                  </div>
                  <button onClick={sendBooking}
                    className="w-full bg-stone-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-stone-800 transition-colors">
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