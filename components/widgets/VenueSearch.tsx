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
  photos?: string[]
  saved?: boolean
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
  const [saved, setSaved] = useState(false)
  const timer = useRef<any>(null)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY

  const searchPlaces = async (input: string) => {
    if (!input || input.length < 3) { setSuggestions([]); return }
    setLoading(true)
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&components=country:ro|country:md&types=establishment&key=${apiKey}&language=ro`
      )
      const data = await res.json()
      if (data.predictions) {
        setSuggestions(data.predictions.map((p: any) => ({
          place_id: p.place_id,
          name: p.structured_formatting?.main_text || p.description,
          address: p.structured_formatting?.secondary_text || '',
          lat: 0, lng: 0
        })))
      }
    } catch (e) {
      // fallback la Nominatim dacă Google nu merge
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&countrycodes=ro,md&format=json&limit=5&accept-language=ro&addressdetails=1`
      )
      const data = await res.json()
      setSuggestions(data.map((d: any) => ({
        place_id: d.place_id,
        name: d.address?.amenity || d.address?.building || d.name,
        address: [d.address?.city || d.address?.town, d.address?.county].filter(Boolean).join(', '),
        lat: parseFloat(d.lat),
        lng: parseFloat(d.lon)
      })))
    }
    setLoading(false)
  }

  const getPlaceDetails = async (placeId: string, basicVenue: Venue) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,rating,formatted_phone_number,website,photos,types&key=${apiKey}&language=ro`
      )
      const data = await res.json()
      if (data.result) {
        const r = data.result
        const venue: Venue = {
          place_id: placeId,
          name: r.name || basicVenue.name,
          address: r.formatted_address || basicVenue.address,
          lat: r.geometry?.location?.lat || 0,
          lng: r.geometry?.location?.lng || 0,
          rating: r.rating,
          types: r.types,
          phone: r.formatted_phone_number,
          website: r.website,
          photos: r.photos?.slice(0, 3).map((p: any) =>
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photo_reference}&key=${apiKey}`
          )
        }
        return venue
      }
    } catch {}
    return basicVenue
  }

  const saveToDatabase = async (venue: Venue) => {
    // Salvează în Supabase venues_cache
    try {
      const { supabase } = await import('@/lib/supabase')
      await supabase.from('venues_cache').upsert({
        place_id: venue.place_id,
        name: venue.name,
        address: venue.address,
        lat: venue.lat,
        lng: venue.lng,
        rating: venue.rating,
        phone: venue.phone,
        website: venue.website,
        types: venue.types,
        search_count: 1,
        last_searched: new Date().toISOString()
      }, {
        onConflict: 'place_id',
        ignoreDuplicates: false
      })
      setSaved(true)
    } catch (e) {
      console.log('Save venue error:', e)
    }
  }

  const selectVenue = async (basic: Venue) => {
    setSuggestions([])
    setQuery(basic.name)
    setLoading(true)
    const venue = await getPlaceDetails(basic.place_id.toString(), basic)
    setSelectedVenue(venue)
    await saveToDatabase(venue)
    onSelectVenue?.(venue)
    setLoading(false)
  }

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => searchPlaces(query), 400)
  }, [query])

  return (
    <div style={{fontFamily:'Montserrat,sans-serif'}}>
      <div style={{position:'relative'}}>
        <div style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', fontSize:'16px', zIndex:1}}>🏛️</div>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setSelectedVenue(null); setSaved(false) }}
          placeholder={placeholder}
          style={{width:'100%', paddingLeft:'36px', paddingRight:'10px', paddingTop:'11px', paddingBottom:'11px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}}
        />
        {loading && (
          <div style={{position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', fontSize:'12px', color:'#a8a29e'}}>⏳</div>
        )}
        {saved && (
          <div style={{position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', fontSize:'12px', color:'#22c55e', fontWeight:700}}>✓ Salvat</div>
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
        <div style={{marginTop:'12px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'14px', padding:'16px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px'}}>
            <div>
              <div style={{fontWeight:700, fontSize:'14px', color:'#1c1917', marginBottom:'3px'}}>{selectedVenue.name}</div>
              <div style={{fontSize:'12px', color:'#78716c', marginBottom:'4px'}}>{selectedVenue.address}</div>
              {selectedVenue.rating && (
                <div style={{fontSize:'12px', color:'#f59e0b', fontWeight:600}}>⭐ {selectedVenue.rating}/5</div>
              )}
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'4px', alignItems:'flex-end'}}>
              {selectedVenue.phone && (
                <a href={'tel:' + selectedVenue.phone} style={{fontSize:'11px', color:'#1e40af', textDecoration:'none', fontWeight:600}}>📞 {selectedVenue.phone}</a>
              )}
              {selectedVenue.website && (
                <a href={selectedVenue.website} target="_blank" rel="noopener noreferrer" style={{fontSize:'11px', color:'#1e40af', textDecoration:'none', fontWeight:600}}>🌐 Website</a>
              )}
            </div>
          </div>

          {selectedVenue.photos && selectedVenue.photos.length > 0 && (
            <div style={{display:'flex', gap:'8px', overflowX:'auto'}}>
              {selectedVenue.photos.map((photo, i) => (
                <img key={i} src={photo} alt={selectedVenue.name}
                  style={{width:'80px', height:'60px', objectFit:'cover', borderRadius:'8px', flexShrink:0}} />
              ))}
            </div>
          )}

          <div style={{marginTop:'10px', fontSize:'11px', color:'#16a34a', fontWeight:600}}>
            ✓ Locație salvată în baza de date
          </div>
        </div>
      )}
    </div>
  )
}