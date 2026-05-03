'use client'

import { useState } from 'react'
import Link from 'next/link'

const GENRES = ["Pop","Dance","EDM","Urban","Hip-Hop","Trap","Live Band","Cover Band","Lăutărească","Folk","Rock","Jazz"]
const REGIONS = ["Dobrogea","Muntenia","Moldova","Transilvania","Banat","Oltenia"]
const CITIES: Record<string, string[]> = {
  Dobrogea:["Constanța","Tulcea","Mangalia"],
  Muntenia:["București","Ploiești","Pitești","Buzău","Brăila"],
  Moldova:["Iași","Bacău","Suceava","Galați","Piatra-Neamț"],
  Transilvania:["Cluj-Napoca","Brașov","Sibiu","Târgu-Mureș","Oradea"],
  Banat:["Timișoara","Arad","Reșița","Deva"],
  Oltenia:["Craiova","Râmnicu Vâlcea","Drobeta-Turnu Severin"],
}
const EVENT_TYPES = ["Club","Festival","Corporate","Wedding","Private","City Days","Mall","Casino"]
const TIERS = ["Premium (10.000€+)","A+ (7.000–9.999€)","A (<7.000€)"]
const DURATIONS = ["40 min","60 min","90 min","120 min","180 min","All night"]

const MONTHS = ["Ian","Feb","Mar","Apr","Mai","Iun","Iul","Aug","Sep","Oct","Nov","Dec"]
const STATUS_COLORS: Record<string, string> = {
  liber: "bg-green-100 text-green-800 border-green-200",
  partial: "bg-amber-100 text-amber-800 border-amber-200",
  ocupat: "bg-red-100 text-red-800 border-red-200",
}

export default function ArtistDashboard() {
  const [tab, setTab] = useState<'profil'|'calendar'|'cereri'|'setari'>('profil')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [selectedDurations, setSelectedDurations] = useState<string[]>([])
  const [tier, setTier] = useState('')
  const [calendarMonth] = useState({ y: 2025, m: 7 })
  const [availability, setAvailability] = useState<Record<string, string>>({
    '2025-08-01': 'liber', '2025-08-02': 'liber', '2025-08-05': 'ocupat',
    '2025-08-06': 'ocupat', '2025-08-10': 'partial', '2025-08-15': 'liber',
    '2025-08-16': 'liber', '2025-08-20': 'ocupat', '2025-08-25': 'liber',
  })
  const [calMode, setCalMode] = useState<'liber'|'partial'|'ocupat'>('liber')
  const [saved, setSaved] = useState(false)

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  const availCities = selectedRegions.flatMap(r => CITIES[r] || [])

  const daysInMonth = new Date(calendarMonth.y, calendarMonth.m + 1, 0).getDate()
  const firstDay = new Date(calendarMonth.y, calendarMonth.m, 1).getDay()
  const offset = firstDay === 0 ? 6 : firstDay - 1

  const dateKey = (d: number) =>
    `${calendarMonth.y}-${String(calendarMonth.m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

  const toggleDay = (d: number) => {
    const key = dateKey(d)
    setAvailability(prev => ({
      ...prev,
      [key]: prev[key] === calMode ? 'none' : calMode
    }))
  }

  const stats = {
    liber: Object.values(availability).filter(v => v === 'liber').length,
    partial: Object.values(availability).filter(v => v === 'partial').length,
    ocupat: Object.values(availability).filter(v => v === 'ocupat').length,
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* NAV */}
      <nav className="border-b border-stone-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-stone-900 tracking-tight">
            Concert <span className="text-amber-500">●</span> Exchange
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">Dashboard Artist</span>
            <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center text-white text-xs font-bold">A</div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900 mb-1">Dashboard Artist</h1>
          <p className="text-stone-500 text-sm">Gestionează profilul, disponibilitatea și cererile de booking</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Zile libere', value: stats.liber, color: 'text-green-600' },
            { label: 'Parțial libere', value: stats.partial, color: 'text-amber-600' },
            { label: 'Zile ocupate', value: stats.ocupat, color: 'text-red-600' },
            { label: 'Cereri primite', value: 3, color: 'text-blue-600' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-stone-200 rounded-2xl p-5">
              <div className={`text-2xl font-bold ${s.color} mb-1`}>{s.value}</div>
              <div className="text-stone-500 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex gap-0 border-b border-stone-200 mb-6">
          {([['profil','Profil'],['calendar','Calendar'],['cereri','Cereri'],['setari','Setări']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === id ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* TAB: PROFIL */}
        {tab === 'profil' && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-6">Informații profil</h2>

            {saved && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm mb-4">
                ✓ Profil salvat cu succes!
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Nume artist</label>
                <input type="text" placeholder="ex: DJ Armin V." className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Agenție (opțional)</label>
                <input type="text" placeholder="ex: SoundWave Agency" className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-400" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Bio</label>
              <textarea rows={3} placeholder="Câteva cuvinte despre tine..." className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-400 resize-none" />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Genuri muzicale</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(g => (
                  <button key={g} onClick={() => toggle(selectedGenres, g, setSelectedGenres)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedGenres.includes(g) ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                    }`}>{g}</button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Regiuni</label>
              <div className="flex flex-wrap gap-2">
                {REGIONS.map(r => (
                  <button key={r} onClick={() => toggle(selectedRegions, r, setSelectedRegions)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedRegions.includes(r) ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                    }`}>{r}</button>
                ))}
              </div>
            </div>

            {availCities.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Orașe</label>
                <div className="flex flex-wrap gap-2">
                  {availCities.map(c => (
                    <button key={c} onClick={() => toggle(selectedCities, c, setSelectedCities)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        selectedCities.includes(c) ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                      }`}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Tipuri eveniment</label>
              <div className="flex flex-wrap gap-2">
                {EVENT_TYPES.map(e => (
                  <button key={e} onClick={() => toggle(selectedEvents, e, setSelectedEvents)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedEvents.includes(e) ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                    }`}>{e}</button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Durate show</label>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map(d => (
                  <button key={d} onClick={() => toggle(selectedDurations, d, setSelectedDurations)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedDurations.includes(d) ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                    }`}>{d}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Tier</label>
                <select value={tier} onChange={e => setTier(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-400">
                  <option value="">Selectează...</option>
                  {TIERS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Fee (€)</label>
                <input type="text" placeholder="ex: 8.000€" className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-400" />
              </div>
            </div>

            <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000) }}
              className="bg-stone-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-stone-800 transition-colors">
              Salvează profilul
            </button>
          </div>
        )}

        {/* TAB: CALENDAR */}
        {tab === 'calendar' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white border border-stone-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-stone-900 mb-4">Calendar disponibilitate</h2>
              <p className="text-stone-500 text-xs mb-4">Selectează statusul și apasă pe zile. Publicul nu vede statusul — doar tu.</p>

              <div className="flex gap-2 mb-4">
                {(['liber','partial','ocupat'] as const).map(s => (
                  <button key={s} onClick={() => setCalMode(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                      calMode === s
                        ? s === 'liber' ? 'bg-green-100 border-green-500 text-green-800'
                          : s === 'partial' ? 'bg-amber-100 border-amber-500 text-amber-800'
                          : 'bg-red-100 border-red-500 text-red-800'
                        : 'bg-white border-stone-200 text-stone-500'
                    }`}>
                    {s === 'liber' ? '✓ Liber' : s === 'partial' ? '~ Parțial' : '✗ Ocupat'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Lu','Ma','Mi','Jo','Vi','Sâ','Du'].map(d => (
                  <div key={d} className="text-center text-xs font-medium text-stone-400 py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array(offset).fill(null).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({length: daysInMonth}, (_, i) => i + 1).map(d => {
                  const key = dateKey(d)
                  const status = availability[key] || 'none'
                  return (
                    <button key={d} onClick={() => toggleDay(d)}
                      className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all border ${
                        status === 'none' ? 'bg-stone-50 text-stone-400 border-transparent hover:border-stone-200'
                        : STATUS_COLORS[status] + ' border'
                      }`}>
                      {d}
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-4 mt-4">
                {[['liber','bg-green-100 border-green-200','Liber'],['partial','bg-amber-100 border-amber-200','Parțial'],['ocupat','bg-red-100 border-red-200','Ocupat']].map(([k,c,l]) => (
                  <div key={k} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded ${c} border`} />
                    <span className="text-xs text-stone-500">{l}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-stone-900 mb-4">Sumar august 2025</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <span className="text-sm font-medium text-green-800">Zile libere</span>
                  <span className="text-xl font-bold text-green-600">{stats.liber}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                  <span className="text-sm font-medium text-amber-800">Parțial libere</span>
                  <span className="text-xl font-bold text-amber-600">{stats.partial}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <span className="text-sm font-medium text-red-800">Ocupate</span>
                  <span className="text-xl font-bold text-red-600">{stats.ocupat}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="text-sm font-semibold text-blue-800 mb-1">🔒 Privacitate garantată</div>
                <div className="text-xs text-blue-600">Publicul nu vede statusul zilelor. Poate doar verifica dacă ești disponibil pe o dată specifică — fără să vadă câte zile libere ai.</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CERERI */}
        {tab === 'cereri' && (
          <div className="space-y-4">
            {[
              { from: 'EventCo Romania', event: 'Festival', date: '15 Aug 2025', city: 'Cluj-Napoca', budget: '10.000€', status: 'new' },
              { from: 'Club Vintage', event: 'Club', date: '20 Aug 2025', city: 'București', budget: '6.000€', status: 'pending' },
              { from: 'Nunta Ionescu', event: 'Wedding', date: '25 Aug 2025', city: 'Iași', budget: '8.000€', status: 'pending' },
            ].map((r, i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-stone-900">{r.from}</div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    r.status === 'new' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {r.status === 'new' ? '🔔 Nou' : '⏳ În așteptare'}
                  </span>
                </div>
                <div className="flex gap-4 text-sm text-stone-500 mb-4">
                  <span>📅 {r.date}</span>
                  <span>📍 {r.city}</span>
                  <span>🎪 {r.event}</span>
                  <span>💰 {r.budget}</span>
                </div>
                <div className="flex gap-2">
                  <button className="bg-stone-900 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors">
                    ✓ Acceptă
                  </button>
                  <button className="border border-stone-200 text-stone-700 px-4 py-2 rounded-xl text-xs font-semibold hover:border-stone-400 transition-colors">
                    💬 Răspunde
                  </button>
                  <button className="border border-red-200 text-red-600 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-red-50 transition-colors">
                    ✗ Refuză
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: SETĂRI */}
        {tab === 'setari' && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-6">Setări notificări & radius</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Radius alertă cereri</label>
                <div className="flex gap-2">
                  {['100 km','200 km','350 km'].map(r => (
                    <button key={r} className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:border-stone-900 hover:text-stone-900 transition-colors">
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-stone-100">
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Notificări email</label>
                <div className="space-y-2">
                  {['Cereri noi de booking','Smart routing — oportunități în zonă','Confirmare booking'].map(n => (
                    <div key={n} className="flex items-center justify-between py-2">
                      <span className="text-sm text-stone-700">{n}</span>
                      <div className="w-10 h-5 bg-stone-900 rounded-full relative cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}