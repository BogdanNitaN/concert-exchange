'use client'

import { useState } from 'react'
import Link from 'next/link'

const MOCK_ARTISTS = [
  { id:1, name:"DJ Armin V.", agency:"SoundWave Agency", genres:["EDM","Dance"], regions:["Transilvania","Muntenia"], cities:["Cluj-Napoca","București"], events:["Club","Festival"], tier:"Premium", fee:"12.000€", avatar:"AV", nearby:true, dist:87, available:true },
  { id:2, name:"Maria Cânt", agency:null, genres:["Pop","Folk"], regions:["Moldova","Muntenia"], cities:["Iași","București"], events:["Wedding","Corporate"], tier:"A+", fee:"8.500€", avatar:"MC", nearby:false, dist:142, available:true },
  { id:3, name:"Florentin & Band", agency:"Live Events RO", genres:["Cover Band","Lăutărească"], regions:["Oltenia","Muntenia"], cities:["Craiova","București"], events:["Wedding","City Days"], tier:"A", fee:"5.000€", avatar:"FB", nearby:false, dist:210, available:true },
  { id:4, name:"KORE", agency:"Apex Music", genres:["Hip-Hop","Urban"], regions:["Muntenia","Transilvania"], cities:["București","Brașov"], events:["Club","Festival"], tier:"A+", fee:"9.000€", avatar:"KR", nearby:true, dist:65, available:false },
  { id:5, name:"Electra Duo", agency:null, genres:["Dance","Pop"], regions:["Banat","Oltenia"], cities:["Timișoara","Craiova"], events:["Club","Corporate"], tier:"A", fee:"4.500€", avatar:"ED", nearby:false, dist:320, available:true },
]

const REQUESTS = [
  { artist:"DJ Armin V.", event:"Festival", date:"15 Aug 2025", city:"Cluj-Napoca", budget:"10.000€", status:"confirmed" },
  { artist:"KORE", event:"Club", date:"20 Aug 2025", city:"București", budget:"9.000€", status:"negotiating" },
  { artist:"Maria Cânt", event:"Wedding", date:"25 Aug 2025", city:"Iași", budget:"8.000€", status:"pending" },
]

const GENRES = ["Pop","Dance","EDM","Urban","Hip-Hop","Cover Band","Folk","Lăutărească"]
const EVENT_TYPES = ["Club","Festival","Corporate","Wedding","Private","City Days","Mall","Casino"]
const TIERS = ["Premium","A+","A"]

export default function PromoterDashboard() {
  const [tab, setTab] = useState<'search'|'cereri'|'analytics'>('search')
  const [radius, setRadius] = useState(200)
  const [genre, setGenre] = useState('')
  const [eventType, setEventType] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [date, setDate] = useState('')
  const [selectedArtist, setSelectedArtist] = useState<typeof MOCK_ARTISTS[0] | null>(null)
  const [bookingModal, setBookingModal] = useState(false)
  const [bookingSent, setBookingSent] = useState(false)
  const [message, setMessage] = useState('')
  const [isPremium] = useState(true)

  const filtered = MOCK_ARTISTS.filter(a => {
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
    setTimeout(() => { setBookingModal(false); setBookingSent(false); setMessage('') }, 2000)
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* NAV */}
      <nav className="border-b border-stone-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-stone-900 tracking-tight">
            GIG<span className="text-emerald-600">x</span>
          </Link>
          <div className="flex items-center gap-3">
            {isPremium && <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">⭐ Premium</span>}
            <span className="text-sm text-stone-500">Dashboard Promoter</span>
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">P</div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900 mb-1">Dashboard Promoter</h1>
          <p className="text-stone-500 text-sm">Caută artiști, trimite cereri și gestionează booking-urile</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label:'Cereri trimise', value:'12', color:'text-blue-600' },
            { label:'Confirmate', value:'5', color:'text-green-600' },
            { label:'În negociere', value:'3', color:'text-amber-600' },
            { label:'Artiști în zonă', value:filtered.filter(a=>a.nearby).length.toString(), color:'text-purple-600' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-stone-200 rounded-2xl p-5">
              <div className={`text-2xl font-bold ${s.color} mb-1`}>{s.value}</div>
              <div className="text-stone-500 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex gap-0 border-b border-stone-200 mb-6">
          {([['search','Caută Artiști'],['cereri','Cererile Mele'],['analytics','Analytics']] as const).map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === id ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}>{label}</button>
          ))}
        </div>

        {/* SEARCH TAB */}
        {tab === 'search' && (
          <div>
            {/* FILTERS */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-6">
              <div className="grid grid-cols-5 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Dată</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Gen muzical</label>
                  <select value={genre} onChange={e => setGenre(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-400">
                    <option value="">Toate</option>
                    {GENRES.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Tip eveniment</label>
                  <select value={eventType} onChange={e => setEventType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-400">
                    <option value="">Toate</option>
                    {EVENT_TYPES.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Tier</label>
                  <select value={tierFilter} onChange={e => setTierFilter(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-400">
                    <option value="">Toate</option>
                    {TIERS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Radius: {radius} km</label>
                  <input type="range" min={100} max={600} step={50} value={radius} onChange={e => setRadius(Number(e.target.value))}
                    className="w-full mt-2" />
                  <div className="flex justify-between text-xs text-stone-400 mt-1">
                    <span>100</span><span>350</span><span>600</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SMART ROUTING ALERT */}
            {filtered.some(a => a.nearby) && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-green-800">
                  <strong>{filtered.filter(a=>a.nearby).length} artiști</strong> sunt deja în zona ta — poți economisi costuri de transport prin smart routing
                </span>
              </div>
            )}

            {/* RESULTS */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-stone-500">{filtered.length} artiști găsiți în {radius}km</span>
            </div>

            <div className="space-y-3">
              {filtered.map(a => (
                <div key={a.id} onClick={() => setSelectedArtist(a)}
                  className={`bg-white border rounded-2xl p-5 cursor-pointer transition-all hover:border-stone-400 ${
                    selectedArtist?.id === a.id ? 'border-amber-400 shadow-sm' : 'border-stone-200'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-stone-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {a.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-stone-900">{a.name}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            a.tier === 'Premium' ? 'bg-amber-100 text-amber-700' :
                            a.tier === 'A+' ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-600'
                          }`}>{a.tier}</span>
                          {a.nearby && <span className="bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">📍 În zonă</span>}
                          {!a.available && <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">Indisponibil</span>}
                        </div>
                        <div className="text-xs text-stone-400 mb-2">{a.agency || 'Artist independent'}</div>
                        <div className="flex flex-wrap gap-1">
                          {a.genres.map(g => <span key={g} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">{g}</span>)}
                          {a.events.slice(0,2).map(e => <span key={e} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">{e}</span>)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {isPremium ? (
                        <div className="text-lg font-bold text-green-600 mb-1">{a.fee}</div>
                      ) : (
                        <div className="text-lg font-bold text-stone-300 mb-1 blur-sm select-none">X.XXX€</div>
                      )}
                      <div className="text-xs text-stone-400 mb-2">{a.dist} km distanță</div>
                      <button
                        onClick={e => { e.stopPropagation(); if(a.available){ setSelectedArtist(a); setBookingModal(true) } }}
                        disabled={!a.available}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          a.available ? 'bg-stone-900 text-white hover:bg-stone-800' : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                        }`}>
                        {a.available ? 'Trimite cerere' : 'Indisponibil'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl">
                  <div className="text-4xl mb-4">🎵</div>
                  <div className="text-stone-900 font-semibold mb-2">Niciun artist găsit</div>
                  <div className="text-stone-500 text-sm">Încearcă să mărești radius-ul sau să schimbi filtrele</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CERERI TAB */}
        {tab === 'cereri' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label:'Confirmate', count:5, color:'bg-green-50 border-green-200 text-green-700' },
                { label:'În negociere', count:3, color:'bg-amber-50 border-amber-200 text-amber-700' },
                { label:'În așteptare', count:4, color:'bg-blue-50 border-blue-200 text-blue-700' },
              ].map(s => (
                <div key={s.label} className={`border rounded-xl p-4 text-center ${s.color}`}>
                  <div className="text-2xl font-bold">{s.count}</div>
                  <div className="text-sm">{s.label}</div>
                </div>
              ))}
            </div>

            {REQUESTS.map((r, i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-stone-900">{r.artist}</span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    r.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    r.status === 'negotiating' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {r.status === 'confirmed' ? '✓ Confirmat' : r.status === 'negotiating' ? '💬 Negociere' : '⏳ Pending'}
                  </span>
                </div>
                <div className="flex gap-4 text-sm text-stone-500">
                  <span>📅 {r.date}</span>
                  <span>📍 {r.city}</span>
                  <span>🎪 {r.event}</span>
                  <span>💰 {r.budget}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab === 'analytics' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white border border-stone-200 rounded-2xl p-6">
              <h3 className="font-semibold text-stone-900 mb-4">Cerere pe genuri</h3>
              {[['EDM',85],['Pop',72],['Hip-Hop',61],['Cover Band',54],['Dance',48]].map(([g,v]) => (
                <div key={g} className="flex items-center gap-3 mb-3">
                  <div className="text-sm text-stone-600 w-24">{g}</div>
                  <div className="flex-1 bg-stone-100 rounded-full h-2">
                    <div className="bg-stone-900 h-2 rounded-full" style={{width:`${v}%`}} />
                  </div>
                  <div className="text-sm font-medium text-stone-700 w-8">{v}</div>
                </div>
              ))}
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-6">
              <h3 className="font-semibold text-stone-900 mb-4">Top orașe căutate</h3>
              {[['București',92],['Cluj-Napoca',78],['Timișoara',65],['Iași',54],['Brașov',41]].map(([c,v]) => (
                <div key={c} className="flex items-center gap-3 mb-3">
                  <div className="text-sm text-stone-600 w-24">{c}</div>
                  <div className="flex-1 bg-stone-100 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{width:`${v}%`}} />
                  </div>
                  <div className="text-sm font-medium text-stone-700 w-8">{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BOOKING MODAL */}
      {bookingModal && selectedArtist && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setBookingModal(false)}>
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
                  <h3 className="font-semibold text-stone-900">Cerere booking — {selectedArtist.name}</h3>
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
                    <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)}
                      placeholder="Descrie evenimentul, locația, cerințele tehnice..."
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