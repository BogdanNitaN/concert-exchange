'use client'

import { useState } from 'react'
import Link from 'next/link'

const CITIES = [
  { name: 'București', lat: 44.4268, lng: 26.1025 },
  { name: 'Cluj-Napoca', lat: 46.7712, lng: 23.6236 },
  { name: 'Timișoara', lat: 45.7489, lng: 21.2087 },
  { name: 'Iași', lat: 47.1585, lng: 27.6014 },
  { name: 'Constanța', lat: 44.1598, lng: 28.6348 },
  { name: 'Craiova', lat: 44.3302, lng: 23.7949 },
  { name: 'Brașov', lat: 45.6427, lng: 25.5887 },
  { name: 'Galați', lat: 45.4353, lng: 28.0080 },
  { name: 'Oradea', lat: 47.0722, lng: 21.9211 },
  { name: 'Sibiu', lat: 45.7983, lng: 24.1256 },
  { name: 'Târgu Mureș', lat: 46.5386, lng: 24.5575 },
  { name: 'Bacău', lat: 46.5670, lng: 26.9146 },
  { name: 'Arad', lat: 46.1866, lng: 21.3123 },
  { name: 'Pitești', lat: 44.8565, lng: 24.8692 },
  { name: 'Baia Mare', lat: 47.6567, lng: 23.5850 },
  { name: 'Buzău', lat: 45.1500, lng: 26.8167 },
  { name: 'Suceava', lat: 47.6500, lng: 26.2500 },
  { name: 'Chișinău', lat: 47.0105, lng: 28.8638 },
]

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

// Factorul rutier mediu România — drumurile sunt cu ~35% mai lungi decât linia dreaptă
const ROAD_FACTOR = 1.35

export default function CalculatorPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [costPerKm, setCostPerKm] = useState(2)
  const [currency, setCurrency] = useState('RON')
  const [persons, setPersons] = useState(2)
  const [result, setResult] = useState<{
    distantaReala: number
    distantaAfisata: number
    costTotal: number
    costPerPersoane: number
    necesitaCazare: boolean
  } | null>(null)

  const calculate = () => {
    const cityFrom = CITIES.find(c => c.name === from)
    const cityTo = CITIES.find(c => c.name === to)
    if (!cityFrom || !cityTo) return

    const distantaReala = Math.round(haversineKm(cityFrom.lat, cityFrom.lng, cityTo.lat, cityTo.lng) * ROAD_FACTOR)
    const distantaAfisata = Math.round(distantaReala * 1.1) // +10% marjă afișată
    const costTotal = Math.round(distantaAfisata * costPerKm * persons / 10) * 10 // rotunjit la 10
    const costPerPersoane = Math.round(costTotal / persons)
    const necesitaCazare = distantaReala > 150

    setResult({ distantaReala, distantaAfisata, costTotal, costPerPersoane, necesitaCazare })
  }

  return (
    <div style={{minHeight:'100vh', background:'#fafaf9', fontFamily:'Montserrat,sans-serif'}}>

      <nav style={{borderBottom:'1px solid #e7e5e4', background:'white', height:'56px', display:'flex', alignItems:'center', padding:'0 24px', justifyContent:'space-between', position:'sticky', top:0, zIndex:100}}>
        <Link href="/" style={{fontWeight:800, fontSize:'18px', color:'#1c1917', textDecoration:'none'}}>
          GIG<span style={{color:'#059669'}}>x</span>
        </Link>
        <Link href="/dashboard/artist" style={{fontSize:'12px', color:'#78716c', textDecoration:'none'}}>← Dashboard artist</Link>
      </nav>

      <div style={{maxWidth:'600px', margin:'0 auto', padding:'48px 24px'}}>
        <div style={{textAlign:'center', marginBottom:'40px'}}>
          <h1 style={{fontSize:'28px', fontWeight:800, color:'#1c1917', marginBottom:'8px', letterSpacing:'-0.02em'}}>
            Calculator transport
          </h1>
          <p style={{fontSize:'14px', color:'#78716c'}}>Estimează costul deplasării la un concert</p>
        </div>

        <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'28px', marginBottom:'20px'}}>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'20px'}}>
            <div>
              <label style={{display:'block', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>Oraș plecare</label>
              <select value={from} onChange={e => setFrom(e.target.value)}
                style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', background:'white'}}>
                <option value="">Selectează...</option>
                {CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:'block', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>Oraș destinație</label>
              <select value={to} onChange={e => setTo(e.target.value)}
                style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', background:'white'}}>
                <option value="">Selectează...</option>
                {CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', marginBottom:'24px'}}>
            <div>
              <label style={{display:'block', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>Cost per km</label>
              <input type="number" value={costPerKm} onChange={e => setCostPerKm(Number(e.target.value))} min={0.5} step={0.5}
                style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
            </div>
            <div>
              <label style={{display:'block', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>Monedă</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}
                style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', background:'white'}}>
                <option>RON</option>
                <option>EUR</option>
                <option>USD</option>
              </select>
            </div>
            <div>
              <label style={{display:'block', fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>Persoane echipă</label>
              <input type="number" value={persons} onChange={e => setPersons(Number(e.target.value))} min={1} max={10}
                style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
            </div>
          </div>

          <button onClick={calculate} disabled={!from || !to || from === to}
            style={{width:'100%', background:'#1c1917', color:'white', padding:'14px', borderRadius:'12px', border:'none', cursor: from && to && from !== to ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif', opacity: from && to && from !== to ? 1 : 0.4}}>
            Calculează distanța →
          </button>
        </div>

        {result && (
          <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'28px', marginBottom:'20px'}}>
            <div style={{fontSize:'12px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'20px'}}>
              Rezultat: {from} → {to}
            </div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'20px'}}>
              <div style={{background:'#f5f5f4', borderRadius:'14px', padding:'16px'}}>
                <div style={{fontSize:'11px', color:'#a8a29e', fontWeight:600, marginBottom:'4px'}}>Distanță afișată clientului</div>
                <div style={{fontSize:'28px', fontWeight:800, color:'#1c1917'}}>{result.distantaAfisata} km</div>
                <div style={{fontSize:'11px', color:'#78716c', marginTop:'4px'}}>include marjă 10%</div>
              </div>
              <div style={{background:'#f0fdf4', borderRadius:'14px', padding:'16px', border:'1px solid #bbf7d0'}}>
                <div style={{fontSize:'11px', color:'#166534', fontWeight:600, marginBottom:'4px'}}>Cost transport total</div>
                <div style={{fontSize:'28px', fontWeight:800, color:'#166534'}}>{result.costTotal.toLocaleString()} {currency}</div>
                <div style={{fontSize:'11px', color:'#166534', marginTop:'4px'}}>{persons} persoane × {result.distantaAfisata} km</div>
              </div>
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px'}}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#78716c', padding:'10px 0', borderBottom:'1px solid #f5f5f4'}}>
                <span>Distanță rutieră estimată (internă)</span>
                <span style={{fontWeight:700, color:'#1c1917'}}>{result.distantaReala} km</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#78716c', padding:'10px 0', borderBottom:'1px solid #f5f5f4'}}>
                <span>Distanță afișată cu marjă 10%</span>
                <span style={{fontWeight:700, color:'#1c1917'}}>{result.distantaAfisata} km</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#78716c', padding:'10px 0', borderBottom:'1px solid #f5f5f4'}}>
                <span>Cost per persoană</span>
                <span style={{fontWeight:700, color:'#1c1917'}}>{result.costPerPersoane.toLocaleString()} {currency}</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#78716c', padding:'10px 0'}}>
                <span>Necesită cazare?</span>
                <span style={{fontWeight:700, color: result.necesitaCazare ? '#ef4444' : '#22c55e'}}>
                  {result.necesitaCazare ? '✓ Da (peste 150 km)' : '✗ Nu (sub 150 km)'}
                </span>
              </div>
            </div>

            {result.necesitaCazare && (
              <div style={{background:'#fef3c7', border:'1px solid #fde68a', borderRadius:'12px', padding:'14px 16px', fontSize:'12px', color:'#92400e', fontWeight:600}}>
                🏨 Evenimentul necesită cazare. Adaugă estimat 150–300 {currency}/noapte per cameră în deviz.
              </div>
            )}
          </div>
        )}

        <div style={{background:'#f5f5f4', borderRadius:'14px', padding:'16px', fontSize:'12px', color:'#78716c', lineHeight:1.6}}>
          <strong style={{color:'#1c1917'}}>Cum funcționează:</strong> Calculăm distanța în linie dreaptă între orașe și aplicăm un factor rutier de 1.35 (drumurile românești sunt în medie cu 35% mai lungi). Adăugăm o marjă de 10% pentru siguranță. Clientul vede distanța cu marjă inclusă — tu știi distanța reală.
        </div>
      </div>
    </div>
  )
}