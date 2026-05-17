'use client'

import { useState, useEffect, useRef } from 'react'

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
}

export default function VenueSearch({ onSelectVenue, placeholder = 'Caută sala, hotelul, locația...' }: Props) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Venue[]>([])
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [loading, setLoading] = useState(false)
  const timer = useRef<any>(null)

  const searchPlaces = async (input: string) => {
    if (!input || input.length < 3) { setSuggestions([]); return }
    setLoading(true)
    try {
      const res = await fetch(
        'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(input) +
        '&countrycodes=ro,md&format=json&limit=6&accept-language=ro&addressdetails=1&extratags=1'
      )
      const data = await res.json()
      setSuggestions(data.map((d: any) => ({
        place_id: d.place_id?.toString() || Math.random().toString(),
        name: d.address?.amenity || d.address?.building || d.address?.hotel || d.name,
        address: [
          d.address?.city || d.address?.town || d.address?.village,
          d.address?.county
        ].filter(Boolean).join(', '),
        lat: parseFloat(d.lat),
        lng: parseFloat(d.lon),
        types: [d.type],
        phone: d.extratags?.phone,
        website: d.extratags?.website
      })).filter((s: Venue) => s.name))
    } catch (e) {
      console.log('Search error:', e)
    }
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
    } catch (e) {
      console.log('Save venue error:', e)
    }
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
        <div style={{position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', fontSize:'18px', zIndex:1}}>🏛️</div>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setSelectedVenue(null) }}
          placeholder={placeholder}
          style={{width:'100%', paddingLeft:'42px', paddingRight:'10px', paddingTop:'13px', paddingBottom:'13px', borderRadius:'14px', border:'2px solid ' + (selectedVenue ? '#22c55e' : '#1c1917'), fontSize:'14px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', fontWeight:600, boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}
        />
        {loading && (
          <div style={{position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', fontSize:'12px', color:'#a8a29e'}}>⏳</div>
        )}
        {selectedVenue && (
          <div style={{position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', fontSize:'16px', color:'#22c55e'}}>✓</div>
        )}

        {suggestions.length > 0 && !selectedVenue && (
          <div style={{position:'absolute', top:'100%', left:0, right:0, background:'white', border:'1px solid #e7e5e4', borderRadius:'12px', marginTop:'4px', zIndex:300, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', overflow:'hidden'}}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => selectVenue(s)}
                style={{width:'100%', textAlign:'left', padding:'12px 16px', border:'none', background:'white', cursor:'pointer', borderBottom: i < suggestions.length - 1 ? '1px solid #f5f5f4' : 'none', fontFamily:'Montserrat,sans-serif', display:'block'}}>
                <div style={{fontSize:'13px', fontWeight:700, color:'#1c1917', marginBottom:'2px'}}>{s.name}</div>
                <div style={{fontSize:'11px', color:'#a8a29e'}}>{s.address}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedVenue && (
        <div style={{marginTop:'10px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'12px', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <div style={{fontWeight:700, fontSize:'13px', color:'#1c1917'}}>{selectedVenue.name}</div>
            <div style={{fontSize:'11px', color:'#78716c'}}>{selectedVenue.address}</div>
            {selectedVenue.phone && <div style={{fontSize:'11px', color:'#1e40af', marginTop:'2px'}}>📞 {selectedVenue.phone}</div>}
          </div>
          <button onClick={() => { setSelectedVenue(null); setQuery(''); onSelectVenue?.({} as Venue) }}
            style={{background:'none', border:'none', cursor:'pointer', fontSize:'16px', color:'#a8a29e'}}>✕</button>
        </div>
      )}
    </div>
  )
}
