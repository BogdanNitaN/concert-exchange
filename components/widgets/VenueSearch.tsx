'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Star, Globe, Phone, CheckCircle2 } from 'lucide-react'

interface Venue {
  place_id: string
  name: string
  address: string
  lat: number
  lng: number
  rating?: number
  types?: string[]
  phone?: string
  website?: string
}

interface Props {
  onSelectVenue?: (venue: Venue) => void
  placeholder?: string
  cityFilter?: string
}

export default function VenueSearch({ onSelectVenue, placeholder = 'Caută sala, restaurantul, clubul...', cityFilter }: Props) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Venue[]>([])
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [loading, setLoading] = useState(false)
  const timer = useRef<any>(null)
  const searchPlaces = async (input: string) => {
    if (!input || input.length < 2) { setSuggestions([]); return }
    setLoading(true)
    
    const searchQuery = cityFilter ? `${input} ${cityFilter}` : input
    
    try {
      const res = await fetch(`/api/places?input=${encodeURIComponent(searchQuery)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.predictions && data.predictions.length > 0) {
          setSuggestions(data.predictions.map((p: any) => ({
            place_id: p.place_id,
            name: p.structured_formatting?.main_text || p.description,
            address: p.structured_formatting?.secondary_text || '',
            lat: 0, lng: 0
          })))
          setLoading(false)
          return
        }
      }
    } catch {}

    // Fallback Nominatim
    try {
      const res = await fetch(
        'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(searchQuery) +
        '&countrycodes=ro,md&format=json&limit=6&accept-language=ro&addressdetails=1&extratags=1'
      )
      const data = await res.json()
      const results = data.map((d: any) => ({
        place_id: d.place_id?.toString() || Math.random().toString(),
        name: d.address?.amenity || d.address?.building || d.address?.hotel || d.address?.restaurant || d.name,
        address: [d.address?.city || d.address?.town || d.address?.village, d.address?.county].filter(Boolean).join(', '),
        lat: parseFloat(d.lat),
        lng: parseFloat(d.lon),
        types: [d.type],
        phone: d.extratags?.phone,
        website: d.extratags?.website
      })).filter((s: Venue) => s.name && s.name.length > 1)
      setSuggestions(results)
    } catch {}
    
    setLoading(false)
  }

  const saveToDatabase = async (venue: Venue) => {
    try {
      const { supabase } = await import('@/lib/supabase')
      await (supabase as any).from('venues_cache').upsert({
        place_id: venue.place_id,
        name: venue.name,
        address: venue.address,
        lat: venue.lat,
        lng: venue.lng,
        rating: venue.rating,
        phone: venue.phone,
        website: venue.website,
        search_count: 1,
        last_searched: new Date().toISOString()
      }, { onConflict: 'place_id' })
    } catch {}
  }

  const selectVenue = async (venue: Venue) => {
    setSuggestions([])
    setQuery(venue.name + (venue.address ? ', ' + venue.address : ''))
    setSelectedVenue(venue)
    await saveToDatabase(venue)
    onSelectVenue?.(venue)
  }

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => searchPlaces(query), 400)
  }, [query])

  return (
    <div style={{fontFamily:'Montserrat,sans-serif'}}>
      <div style={{position:'relative'}}>
        <Search size={16} color='#1c1917' strokeWidth={2} style={{position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none'}} />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setSelectedVenue(null) }}
          placeholder={cityFilter ? `Caută în ${cityFilter}...` : placeholder}
          style={{width:'100%', paddingLeft:'44px', paddingRight:'16px', paddingTop:'14px', paddingBottom:'14px', borderRadius:'14px', border:'2px solid ' + (selectedVenue ? '#059669' : '#1c1917'), fontSize:'14px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', fontWeight:500, boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}
        />
        {loading && (
          <div style={{position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'12px', color:'#a8a29e'}}>...</div>
        )}
        {selectedVenue && (
          <CheckCircle2 size={18} color='#059669' strokeWidth={2} style={{position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)'}} />
        )}

        {suggestions.length > 0 && !selectedVenue && (
          <div style={{position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:'white', border:'1.5px solid #e7e5e4', borderRadius:'14px', zIndex:300, boxShadow:'0 8px 32px rgba(0,0,0,0.12)', overflow:'hidden'}}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => selectVenue(s)}
                style={{width:'100%', textAlign:'left', padding:'13px 16px', border:'none', background:'white', cursor:'pointer', borderBottom: i < suggestions.length - 1 ? '1px solid #f5f5f4' : 'none', fontFamily:'Montserrat,sans-serif', display:'flex', alignItems:'center', gap:'12px'}}>
                <MapPin size={14} color='#a8a29e' strokeWidth={1.5} style={{flexShrink:0}} />
                <div>
                  <div style={{fontSize:'13px', fontWeight:700, color:'#1c1917', marginBottom:'2px'}}>{s.name}</div>
                  <div style={{fontSize:'11px', color:'#a8a29e'}}>{s.address}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedVenue && (
        <div style={{marginTop:'10px', background:'#f0fdf4', border:'1.5px solid #bbf7d0', borderRadius:'14px', padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
            <CheckCircle2 size={20} color='#059669' strokeWidth={2} />
            <div>
              <div style={{fontWeight:700, fontSize:'14px', color:'#1c1917', marginBottom:'2px'}}>{selectedVenue.name}</div>
              <div style={{fontSize:'12px', color:'#78716c'}}>{selectedVenue.address}</div>
              <div style={{display:'flex', gap:'12px', marginTop:'4px'}}>
                {selectedVenue.rating && (
                  <div style={{display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'#78716c'}}>
                    <Star size={11} color='#f59e0b' strokeWidth={2} fill='#f59e0b' /> {selectedVenue.rating}
                  </div>
                )}
                {selectedVenue.phone && (
                  <a href={'tel:' + selectedVenue.phone} style={{display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'#7c3aed', textDecoration:'none', fontWeight:600}}>
                    <Phone size={11} strokeWidth={2} /> {selectedVenue.phone}
                  </a>
                )}
                {selectedVenue.website && (
                  <a href={selectedVenue.website} target="_blank" rel="noopener noreferrer" style={{display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'#7c3aed', textDecoration:'none', fontWeight:600}}>
                    <Globe size={11} strokeWidth={2} /> Website
                  </a>
                )}
              </div>
            </div>
          </div>
          <button onClick={() => { setSelectedVenue(null); setQuery(''); onSelectVenue?.({} as Venue) }}
            style={{background:'none', border:'none', cursor:'pointer', fontSize:'12px', color:'#78716c', fontFamily:'Montserrat,sans-serif', fontWeight:600, whiteSpace:'nowrap'}}>
            Schimbă
          </button>
        </div>
      )}
    </div>
  )
}
