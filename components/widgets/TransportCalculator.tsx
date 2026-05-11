'use client'

import { useState, useEffect, useRef } from 'react'

interface GeoSuggestion {
  name: string
  fullName: string
  lat: number
  lng: number
}

interface Result {
  distantaInterna: number
  distantaAfisata: number
  costTotal: number
  necesitaCazare: boolean
  necesitaZbor: boolean
}

interface Props {
  costPerKm?: number
  currency?: string
  onResult?: (result: Result) => void
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

const ROAD_FACTOR = 1.35

export default function TransportCalculator({ costPerKm = 2, currency = 'RON', onResult }: Props) {
  const [fromSearch, setFromSearch] = useState('')
  const [toSearch, setToSearch] = useState('')
  const [fromCity, setFromCity] = useState<GeoSuggestion | null>(null)
  const [toCity, setToCity] = useState<GeoSuggestion | null>(null)
  const [fromSuggestions, setFromSuggestions] = useState<GeoSuggestion[]>([])
  const [toSuggestions, setToSuggestions] = useState<GeoSuggestion[]>([])
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const fromTimer = useRef<any>(null)
  const toTimer = useRef<any>(null)

  const searchCity = async (query: string): Promise<GeoSuggestion[]> => {
    if (query.length < 2) return []
    try {
      const res = await fetch(
        'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(query) +
        '&countrycodes=ro,md&format=json&limit=5&accept-language=ro&addressdetails=1'
      )
      const data = await res.json()
      return data.map((d: any) => ({
        name: d.address?.city || d.address?.town || d.address?.village || d.address?.hamlet || d.name,
        fullName: [
          d.address?.city || d.address?.town || d.address?.village || d.address?.hamlet || d.name,
          d.address?.county
        ].filter(Boolean).join(', '),
        lat: parseFloat(d.lat),
        lng: parseFloat(d.lon)
      }))
    } catch { return [] }
  }

  useEffect(() => {
    if (fromSearch.length < 2) { setFromSuggestions([]); return }
    if (fromTimer.current) clearTimeout(fromTimer.current)
    fromTimer.current = setTimeout(async () => {
      const results = await searchCity(fromSearch)
      setFromSuggestions(results)
    }, 400)
  }, [fromSearch])

  useEffect(() => {
    if (toSearch.length < 2) { setToSuggestions([]); return }
    if (toTimer.current) clearTimeout(toTimer.current)
    toTimer.current = setTimeout(async () => {
      const results = await searchCity(toSearch)
      setToSuggestions(results)
    }, 400)
  }, [toSearch])

  const calculate = () => {
    if (!fromCity || !toCity) return
    setLoading(true)

    const distantaInterna = Math.round(haversineKm(fromCity.lat, fromCity.lng, toCity.lat, toCity.lng) * ROAD_FACTOR)
    const distantaAfisata = Math.round(distantaInterna * 1.1)
    const costTotal = Math.round(distantaAfisata * costPerKm / 10) * 10
    const necesitaCazare = distantaInterna > 150
    const necesitaZbor = distantaInterna > 250

    const res = { distantaInterna, distantaAfisata, costTotal, necesitaCazare, necesitaZbor }
    setResult(res)
    onResult?.(res)
    setLoading(false)
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #e7e5e4',
    fontSize: '13px',
    fontFamily: 'Montserrat,sans-serif',
    color: '#1c1917',
    outline: 'none',
    boxSizing: 'border-box' as const
  }

  const suggestionBoxStyle = {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    background: 'white',
    border: '1px solid #e7e5e4',
    borderRadius: '10px',
    marginTop: '4px',
    zIndex: 300,
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    overflow: 'hidden'
  }

  return (
    <div style={{fontFamily:'Montserrat,sans-serif'}}>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px'}}>

        {/* FROM */}
        <div>
          <label style={{display:'block', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>
            📍 Plecare
          </label>
          <div style={{position:'relative'}}>
            <input type="text" value={fromSearch}
              onChange={e => { setFromSearch(e.target.value); setFromCity(null); setResult(null) }}
              placeholder="Caută orașul..."
              style={inputStyle} />
            {fromCity && (
              <div style={{position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', fontSize:'14px'}}>✓</div>
            )}
            {fromSuggestions.length > 0 && !fromCity && (
              <div style={suggestionBoxStyle}>
                {fromSuggestions.map((s, i) => (
                  <button key={i} onClick={() => { setFromCity(s); setFromSearch(s.fullName); setFromSuggestions([]) }}
                    style={{width:'100%', textAlign:'left', padding:'10px 14px', border:'none', background:'white', cursor:'pointer', borderBottom:'1px solid #f5f5f4', fontFamily:'Montserrat,sans-serif', display:'block'}}>
                    <div style={{fontSize:'13px', fontWeight:600, color:'#1c1917'}}>{s.name}</div>
                    <div style={{fontSize:'11px', color:'#a8a29e'}}>{s.fullName}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* TO */}
        <div>
          <label style={{display:'block', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>
            🎯 Destinație
          </label>
          <div style={{position:'relative'}}>
            <input type="text" value={toSearch}
              onChange={e => { setToSearch(e.target.value); setToCity(null); setResult(null) }}
              placeholder="Caută orașul..."
              style={inputStyle} />
            {toCity && (
              <div style={{position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', fontSize:'14px'}}>✓</div>
            )}
            {toSuggestions.length > 0 && !toCity && (
              <div style={suggestionBoxStyle}>
                {toSuggestions.map((s, i) => (
                  <button key={i} onClick={() => { setToCity(s); setToSearch(s.fullName); setToSuggestions([]) }}
                    style={{width:'100%', textAlign:'left', padding:'10px 14px', border:'none', background:'white', cursor:'pointer', borderBottom:'1px solid #f5f5f4', fontFamily:'Montserrat,sans-serif', display:'block'}}>
                    <div style={{fontSize:'13px', fontWeight:600, color:'#1c1917'}}>{s.name}</div>
                    <div style={{fontSize:'11px', color:'#a8a29e'}}>{s.fullName}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <button onClick={calculate} disabled={!fromCity || !toCity || loading}
        style={{width:'100%', background:'#1c1917', color:'white', padding:'11px', borderRadius:'10px', border:'none', cursor: fromCity && toCity ? 'pointer' : 'not-allowed', fontSize:'13px', fontWeight:700, fontFamily:'Montserrat,sans-serif', opacity: fromCity && toCity ? 1 : 0.4, marginBottom:'16px'}}>
        {loading ? 'Se calculează...' : 'Calculează transport →'}
      </button>

      {result && (
        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
            <div style={{background:'#f5f5f4', borderRadius:'12px', padding:'14px'}}>
              <div style={{fontSize:'10px', color:'#a8a29e', fontWeight:600, marginBottom:'4px'}}>TRANSPORT ESTIMAT</div>
              <div style={{fontSize:'22px', fontWeight:800, color:'#1c1917'}}>{result.costTotal.toLocaleString()} {currency}</div>
            </div>
            <div style={{background: result.necesitaCazare ? '#fef3c7' : '#f0fdf4', borderRadius:'12px', padding:'14px', border:'1px solid ' + (result.necesitaCazare ? '#fde68a' : '#bbf7d0')}}>
              <div style={{fontSize:'10px', color: result.necesitaCazare ? '#92400e' : '#166534', fontWeight:600, marginBottom:'4px'}}>CAZARE</div>
              <div style={{fontSize:'14px', fontWeight:700, color: result.necesitaCazare ? '#92400e' : '#166534'}}>
                {result.necesitaCazare ? '🏨 Necesară' : '✓ Nu e necesară'}
              </div>
            </div>
          </div>

          {result.necesitaZbor && (
            <div style={{background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'12px', padding:'16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px'}}>
              <div>
                <div style={{fontSize:'13px', fontWeight:700, color:'#1e40af', marginBottom:'2px'}}>✈️ Distanță mare — zbor recomandat</div>
                <div style={{fontSize:'11px', color:'#3b82f6'}}>Masiro Travel găsește cele mai bune variante de zbor</div>
              </div>
              <a href="https://masirotravel.ro" target="_blank" rel="noopener noreferrer"
                style={{background:'#1e40af', color:'white', padding:'8px 16px', borderRadius:'8px', fontSize:'12px', fontWeight:700, textDecoration:'none', whiteSpace:'nowrap'}}>
                Vezi zboruri →
              </a>
            </div>
          )}

          {result.necesitaCazare && (
            <div style={{fontSize:'11px', color:'#78716c', padding:'8px 12px', background:'#f5f5f4', borderRadius:'8px'}}>
              🏨 Adaugă estimat 150–300 {currency}/noapte pentru cazare în deviz
            </div>
          )}
        </div>
      )}
    </div>
  )
}