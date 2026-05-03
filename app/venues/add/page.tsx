'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const MapPicker = dynamic(() => import('@/components/map/MapPicker'), { ssr: false })

const WHAT_ARE_YOU = [
  { id: 'artist', icon: '🎤', label: 'Artist / DJ / Formație' },
  { id: 'club', icon: '🎵', label: 'Club / Pub / Casino' },
  { id: 'sala', icon: '🏛️', label: 'Sală evenimente / Ballroom' },
  { id: 'restaurant', icon: '🍽️', label: 'Restaurant / Hotel' },
  { id: 'cultura', icon: '🎭', label: 'Filarmonică / Teatru / Casă de cultură' },
  { id: 'sport', icon: '🏟️', label: 'Sală de sport / Stadion / Arenă' },
  { id: 'festival', icon: '🎪', label: 'Festival / Parc evenimente' },
  { id: 'agentie', icon: '📋', label: 'Agenție / Organizator events' },
  { id: 'altele', icon: '📍', label: 'Altele' },
]

interface GeoSuggestion {
  name: string
  fullName: string
  lat: number
  lng: number
}

export default function AddVenuePage() {
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [addressSearch, setAddressSearch] = useState('')
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([])
  const [selected, setSelected] = useState<{ lat: number; lng: number; label: string } | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const timer = useRef<any>(null)

  useEffect(() => {
    if (addressSearch.length < 3) { setSuggestions([]); return }
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressSearch)}&countrycodes=ro,md&format=json&limit=6&accept-language=ro&addressdetails=1`
        )
        const data = await res.json()
        setSuggestions(data.map((d: any) => ({
          name: d.display_name.split(',')[0],
          fullName: d.display_name.split(',').slice(0, 3).join(',').trim(),
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lon)
        })))
      } catch {}
    }, 400)
  }, [addressSearch])

  const selectAddress = (s: GeoSuggestion) => {
    setSelected({ lat: s.lat, lng: s.lng, label: s.fullName })
    setAddressSearch(s.fullName)
    setSuggestions([])
    setShowMap(true)
  }

  const handleMapClick = async (lat: number, lng: number) => {
    setSelected({ lat, lng, label: 'Locație selectată pe hartă' })
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ro`
      )
      const data = await res.json()
      if (data.display_name) {
        const label = data.display_name.split(',').slice(0, 3).join(',').trim()
        setSelected({ lat, lng, label })
        setAddressSearch(label)
      }
    } catch {}
  }

  const canSubmit = name.length > 1 && type && selected

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-10 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Trimis spre aprobare!</h2>
          <p className="text-stone-500 text-sm mb-2">
            <strong>{name}</strong> va apărea pe hartă după verificare — maxim 24h.
          </p>
          <p className="text-stone-400 text-xs mb-6">Vei primi o notificare când e aprobat.</p>
          <div className="flex gap-3">
            <button
              onClick={() => { setSubmitted(false); setName(''); setType(''); setAddressSearch(''); setSelected(null); setShowMap(false) }}
              className="flex-1 border border-stone-200 text-stone-700 py-2.5 rounded-xl text-sm font-semibold hover:border-stone-400 transition-colors">
              + Adaugă altul
            </button>
            <Link href="/search"
              className="flex-1 bg-stone-900 text-white py-2.5 rounded-xl text-sm font-semibold text-center hover:bg-stone-800 transition-colors">
              Vezi harta
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="border-b border-stone-200 bg-white sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-stone-900 tracking-tight">
            Concert <span className="text-amber-500">●</span> Exchange
          </Link>
          <Link href="/search" className="text-sm text-stone-500 hover:text-stone-900">← Hartă</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">

        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 text-amber-700 text-xs font-semibold mb-4">
            ⭐ Contribuție comunitate
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Adaugă pe hartă</h1>
          <p className="text-stone-500 text-sm">Caută adresa sau pune pin direct pe hartă.</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-5">

          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Cum te numești?</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="ex: Club Vintage, Filarmonica Iași, DJ Armin..."
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-400 transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Ce ești?</label>
            <select value={type} onChange={e => setType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-400 transition-colors bg-white">
              <option value="">Selectează...</option>
              {WHAT_ARE_YOU.map(w => (
                <option key={w.id} value={w.id}>{w.icon} {w.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Unde ești?</label>

            <div className="relative mb-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">🔍</span>
              <input type="text" value={addressSearch}
                onChange={e => { setAddressSearch(e.target.value); setSelected(null) }}
                placeholder="Caută adresa sau numele locului..."
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-400 transition-colors" />
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-stone-200 rounded-xl mt-1 z-50 shadow-xl overflow-hidden">
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => selectAddress(s)}
                      className="w-full text-left px-4 py-3 hover:bg-stone-50 border-b border-stone-100 last:border-0 transition-colors">
                      <div className="text-sm font-medium text-stone-900">{s.name}</div>
                      <div className="text-xs text-stone-400 truncate">{s.fullName}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-xs text-stone-400">sau</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            <button
              onClick={() => setShowMap(!showMap)}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                showMap ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
              }`}>
              {showMap ? '🗺️ Harta deschisă — click pentru pin' : '🗺️ Pune pin direct pe hartă'}
            </button>

            {showMap && (
              <div className="mt-3 rounded-xl overflow-hidden border border-stone-200" style={{height: '320px'}}>
                <MapPicker
                  center={selected ? [selected.lat, selected.lng] : [45.9432, 24.9668]}
                  pin={selected ? [selected.lat, selected.lng] : null}
                  onMapClick={handleMapClick}
                />
              </div>
            )}

            {selected && (
              <div className="mt-3 flex items-start gap-2 text-xs text-green-600 font-medium bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                <span className="flex-shrink-0 mt-0.5">✓</span>
                <span>{selected.label}</span>
              </div>
            )}

            {showMap && !selected && (
              <p className="mt-2 text-xs text-stone-400 text-center">Click oriunde pe hartă pentru a plasa pinul</p>
            )}
          </div>

          <button onClick={handleSubmit} disabled={!canSubmit || loading}
            className="w-full bg-stone-900 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-stone-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? 'Se trimite...' : 'Adaugă pe hartă →'}
          </button>

          <p className="text-center text-xs text-stone-400">
            Apare pe hartă după verificare în 24h.
          </p>
        </div>
      </div>
    </div>
  )
}