'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Car, ArrowRight, Calculator, Plane } from 'lucide-react'
import RouteMap from '@/components/modules/transport/RouteMap'
import ExpertModal from '@/components/modules/shared/ExpertModal'

const F = 'Montserrat,sans-serif'

// aeroporturi active (fara Tulcea, Sibiu, Arad, Bacau, Ghimbav)
const AIRPORTS: { name: string; lat: number; lng: number }[] = [
  { name: 'Otopeni (Bucuresti)', lat: 44.5711, lng: 26.0850 },
  { name: 'Cluj-Napoca', lat: 46.7852, lng: 23.6862 },
  { name: 'Timisoara', lat: 45.8099, lng: 21.3379 },
  { name: 'Iasi', lat: 47.1785, lng: 27.6206 },
  { name: 'Craiova', lat: 44.3181, lng: 23.8886 },
  { name: 'Constanta', lat: 44.3622, lng: 28.4883 },
  { name: 'Oradea', lat: 47.0253, lng: 21.9025 },
  { name: 'Suceava', lat: 47.6875, lng: 26.3540 },
  { name: 'Baia Mare', lat: 47.6584, lng: 23.4700 },
  { name: 'Satu Mare', lat: 47.7033, lng: 22.8857 },
  { name: 'Targu Mures', lat: 46.4677, lng: 24.4125 },
]

// coordonate orase (pt gasit aeroportul apropiat)
const BUCURESTI_COORD = { lat: 44.4268, lng: 26.1025 }
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'cluj-napoca': { lat: 46.7712, lng: 23.6236 }, 'cluj': { lat: 46.7712, lng: 23.6236 },
  'timisoara': { lat: 45.7489, lng: 21.2087 }, 'iasi': { lat: 47.1585, lng: 27.6014 },
  'constanta': { lat: 44.1598, lng: 28.6348 }, 'craiova': { lat: 44.3302, lng: 23.7949 },
  'oradea': { lat: 47.0465, lng: 21.9189 }, 'suceava': { lat: 47.6635, lng: 26.2732 },
  'baia mare': { lat: 47.6573, lng: 23.5681 }, 'satu mare': { lat: 47.7921, lng: 22.8850 },
  'targu mures': { lat: 46.5425, lng: 24.5579 }, 'arad': { lat: 46.1866, lng: 21.3123 },
  'sibiu': { lat: 45.7983, lng: 24.1256 }, 'brasov': { lat: 45.6427, lng: 25.5887 },
  'bacau': { lat: 46.5670, lng: 26.9146 }, 'botosani': { lat: 47.7486, lng: 26.6694 },
  'piatra neamt': { lat: 46.9275, lng: 26.3708 }, 'deva': { lat: 45.8778, lng: 22.9105 },
  'baia': { lat: 47.6573, lng: 23.5681 }, 'galati': { lat: 45.4353, lng: 28.008 },
  'braila': { lat: 45.2692, lng: 27.9575 }, 'buzau': { lat: 45.1500, lng: 26.8203 },
  'ploiesti': { lat: 44.9469, lng: 26.0349 }, 'pitesti': { lat: 44.8565, lng: 24.8692 },
  'targu jiu': { lat: 45.0357, lng: 23.2745 }, 'alba iulia': { lat: 46.0733, lng: 23.5805 },
  'resita': { lat: 45.3008, lng: 21.8890 }, 'zalau': { lat: 47.1911, lng: 23.0572 },
  'bistrita': { lat: 47.1349, lng: 24.4914 }, 'focsani': { lat: 45.6966, lng: 27.1863 },
  'ramnicu valcea': { lat: 45.1000, lng: 24.3667 }, 'slatina': { lat: 44.4300, lng: 24.3700 },
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function nearestAirports(city: string, count = 3): { name: string; dist: number }[] {
  const c = CITY_COORDS[city.trim().toLowerCase()]
  if (!c) return []
  return AIRPORTS
    .map(ap => ({ name: ap.name, dist: Math.round(haversine(c.lat, c.lng, ap.lat, ap.lng)) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, count)
}

function useIsMobile() {
  const [m, setM] = useState(false)
  useEffect(() => {
    const c = () => setM(window.innerWidth < 640)
    c(); window.addEventListener('resize', c)
    return () => window.removeEventListener('resize', c)
  }, [])
  return m
}

export default function TransportPage() {
  const isMobile = useIsMobile()
  const [fromCity, setFromCity] = useState('Bucuresti')
  const [city, setCity] = useState('')
  const [pricePerKm, setPricePerKm] = useState('')
  const [km, setKm] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [eurRate, setEurRate] = useState<number | null>(null)
  const [rateDate, setRateDate] = useState('')
  const [error, setError] = useState('')
  const [expertOpen, setExpertOpen] = useState(false)
  const [displayCurrency, setDisplayCurrency] = useState<'eur' | 'lei'>('eur')
  const [priceCurrency, setPriceCurrency] = useState<'lei' | 'eur'>('lei')

  // convertor TVA + curs
  const [tvaSuma, setTvaSuma] = useState('')
  const [tvaMoneda, setTvaMoneda] = useState<'lei' | 'eur'>('lei')
  const [tvaMod, setTvaMod] = useState<'adauga' | 'scoate' | 'extrage'>('scoate')

  useEffect(() => {
    fetch('/api/bnr-rate').then(r => r.json())
      .then(d => { if (d?.rate) { setEurRate(d.rate); setRateDate(d.date || '') } })
      .catch(() => setEurRate(5.2))
  }, [])

  async function calcul() {
    if (!city.trim()) { setError('Scrie orasul destinatie.'); return }
    setError('')
    setLoading(true)
    setKm(null)
    try {
      const r = await fetch('/api/distance?to=' + encodeURIComponent(city.trim()) + '&from=' + encodeURIComponent(fromCity.trim() || 'Bucuresti'))
      const d = await r.json()
      if (d?.km) setKm(d.km)
      else setError('Nu am gasit ruta pentru acest oras.')
    } catch {
      setError('Eroare la calcul. Incearca din nou.')
    }
    setLoading(false)
  }

  const price = parseFloat(pricePerKm.replace(',', '.')) || 0
  const marjaProcent = km !== null && km > 300 ? 0.065 : 0.115
  const kmCuMarja = km !== null ? km + Math.round(km * marjaProcent) : 0
  const kmTotal = kmCuMarja * 2
  const priceLei = priceCurrency === 'eur' && eurRate ? price * eurRate : price
  const costLei = km !== null && priceLei > 0 ? Math.round(kmTotal * priceLei / 10) * 10 : 0
  const costEuro = costLei > 0 && eurRate ? Math.round(costLei / eurRate) : 0

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px', borderRadius: '12px',
    border: '1.5px solid #e7e5e4', background: 'white', fontSize: '15px',
    color: '#1c1917', outline: 'none', boxSizing: 'border-box', fontFamily: F, fontWeight: 500,
  }
  const labelStyle: React.CSSProperties = {
    fontSize: '11px', color: '#a8a29e', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px',
  }

  return (
    <div style={{minHeight:'100vh', background:'#f5f5f7', fontFamily:F, position:'relative'}}>
      <div style={{position:'fixed', inset:0, background:'radial-gradient(circle at 20% 20%, rgba(5,150,105,0.08) 0%, transparent 50%),radial-gradient(circle at 80% 30%, rgba(124,58,237,0.06) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(234,205,163,0.08) 0%, transparent 50%)', pointerEvents:'none', zIndex:0}}></div>
      <div style={{position:'relative', zIndex:1}}>

        <nav style={{borderBottom:'1px solid #e7e5e4', background:'white', height:'56px', display:'flex', alignItems:'center', padding:'0 24px', justifyContent:'space-between', position:'sticky', top:0, zIndex:100}}>
          <Link href="/prom" style={{display:'inline-flex', alignItems:'center', gap:'8px', fontSize:'20px', fontWeight:800, color:'#1c1917', textDecoration:'none', letterSpacing:'-0.5px'}}>
            <img src="/gigx-mark.png" width={24} height={24} alt="" style={{display:'block'}} />
            <span>GIG<span style={{color:'#059669'}}>x</span></span>
          </Link>

          <button onClick={() => setExpertOpen(true)}
            style={{background:'none', border:'none', fontSize:'13px', fontWeight:600, color:'#78716c', cursor:'pointer', fontFamily:F}}>
            Cere oferta
          </button>
        </nav>

        <div style={{maxWidth:'560px', margin:'0 auto', padding: isMobile ? '32px 18px' : '56px 24px'}}>
          <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px'}}>
            <div style={{width:'42px', height:'42px', borderRadius:'12px', background:'#1c1917', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <Calculator size={22} color='white' strokeWidth={2} />
            </div>
            <div style={{fontSize:'11px', fontWeight:700, color:'#059669', textTransform:'uppercase', letterSpacing:'0.15em'}}>
              Calculator transport
            </div>
          </div>
          <h1 style={{fontSize:'clamp(26px, 5vw, 36px)', fontWeight:800, letterSpacing:'-0.02em', lineHeight:1.15, margin:'0 0 12px', color:'#1c1917'}}>
            Cat costa transportul unui artist?
          </h1>
          <p style={{fontSize:'15px', color:'#78716c', lineHeight:1.6, margin:'0 0 32px', fontWeight:500}}>
            Distanta rutiera reala, dus-intors, cu rezultat in lei si euro la cursul BNR.
          </p>

          <div style={{background:'white', border:'2px solid #e7e5e4', borderRadius:'16px', padding:'28px', marginBottom:'20px'}}>
            <div style={{marginBottom:'16px'}}>
              <div style={labelStyle}>Oras plecare</div>
              <input style={{...inputStyle, borderColor: fromCity ? '#059669' : '#e7e5e4'}}
                placeholder="Bucuresti" value={fromCity}
                onChange={e => setFromCity(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') calcul() }} />
            </div>
            <div style={{marginBottom:'20px'}}>
              <div style={labelStyle}>Oras destinatie</div>
              <input style={{...inputStyle, borderColor: city ? '#059669' : '#e7e5e4'}}
                placeholder="ex: Cluj-Napoca" value={city}
                onChange={e => setCity(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') calcul() }} />
            </div>

            <div style={{marginBottom:'24px'}}>
              <div style={labelStyle}>Pret per km</div>
              <div style={{display:'flex', gap:'8px'}}>
                <input type="text" inputMode="decimal" style={{...inputStyle, flex:1, borderColor: pricePerKm ? '#059669' : '#e7e5e4'}}
                  placeholder="ex: 5" value={pricePerKm}
                  onChange={e => setPricePerKm(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') calcul() }} />
                <div style={{display:'flex', gap:'4px'}}>
                  {(['lei','eur'] as const).map(c => (
                    <button key={c} onClick={() => setPriceCurrency(c)}
                      style={{padding:'0 16px', borderRadius:'12px', border:'1.5px solid ' + (priceCurrency===c?'#1c1917':'#e7e5e4'), background: priceCurrency===c?'#1c1917':'white', color: priceCurrency===c?'white':'#78716c', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F, textTransform:'uppercase'}}>
                      {c === 'lei' ? 'Lei' : 'EUR'}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{fontSize:'11px', color:'#a8a29e', marginTop:'6px'}}>
                Tariful pe kilometru al artistului, din rider. Alege moneda.
              </div>
            </div>

            <button onClick={calcul} disabled={loading}
              style={{width:'100%', background:'#1c1917', color:'white', padding:'15px', borderRadius:'12px', border:'none', cursor: loading ? 'wait' : 'pointer', fontSize:'15px', fontWeight:700, fontFamily:F, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
              <Car size={18} strokeWidth={2} />
              {loading ? 'Se calculeaza...' : 'Calculeaza transportul'}
            </button>

            {error && (
              <div style={{marginTop:'14px', padding:'12px 14px', borderRadius:'12px', background:'#fef2f2', border:'1px solid #fecaca', color:'#b91c1c', fontSize:'13px', fontWeight:600}}>
                {error}
              </div>
            )}
          </div>

          {km !== null && (
            <div style={{background:'#1c1917', borderRadius:'16px', padding:'28px', color:'white'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'16px', paddingBottom:'16px', borderBottom:'1px solid #292524'}}>
                <div>
                  <div style={{fontSize:'11px', color:'#78716c', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'4px'}}>Distanta dus-intors</div>
                  <div style={{fontSize:'20px', fontWeight:800}}>{kmCuMarja} km x 2 = {kmTotal} km</div>
                  <div style={{fontSize:'11px', color:'#78716c', marginTop:'2px'}}>dus-intors din {fromCity || 'Bucuresti'}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:'11px', color:'#78716c', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'4px'}}>{city}</div>
                </div>
              </div>

              {price > 0 ? (
                <div>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px'}}>
                    <div style={{fontSize:'11px', color:'#78716c', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em'}}>Cost transport</div>
                    <div style={{display:'flex', gap:'4px'}}>
                      {(['eur','lei'] as const).map(c => (
                        <button key={c} onClick={() => setDisplayCurrency(c)}
                          style={{padding:'4px 10px', borderRadius:'8px', border:'none', background: displayCurrency===c?'#059669':'rgba(255,255,255,0.1)', color:'white', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:F, textTransform:'uppercase'}}>
                          {c === 'eur' ? 'EUR' : 'Lei'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{fontSize:'40px', fontWeight:800, lineHeight:1, marginBottom:'4px'}}>
                    {displayCurrency === 'eur' ? costEuro.toLocaleString() + ' EUR' : costLei.toLocaleString() + ' lei'}
                  </div>
                  <div style={{fontSize:'15px', color:'#a8a29e', fontWeight:600}}>
                    {displayCurrency === 'eur' ? 'aprox ' + costLei.toLocaleString() + ' lei' : 'aprox ' + costEuro.toLocaleString() + ' EUR'}
                  </div>
                  {eurRate && (
                    <div style={{fontSize:'11px', color:'#57534e', marginTop:'12px'}}>
                      Curs BNR: 1 EUR = {eurRate.toFixed(4)} lei{rateDate ? ' (' + rateDate + ')' : ''}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{fontSize:'14px', color:'#a8a29e'}}>
                  Adauga pretul pe km ca sa vezi costul total.
                </div>
              )}

              {km !== null && km > 300 && (() => {
                const esteRomania = !!CITY_COORDS[city.trim().toLowerCase()] || !!CITY_COORDS[city.trim().toLowerCase().replace(/\s+/g, '-')]
                const aps = esteRomania ? nearestAirports(city, 3) : []
                return (
                  <div style={{marginTop:'20px', padding:'18px', background:'rgba(59,130,246,0.18)', borderRadius:'12px', border:'1px solid rgba(147,197,253,0.45)'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px'}}>
                      <Plane size={20} color='#ffffff' strokeWidth={2} />
                      <span style={{fontSize:'15px', fontWeight:700, color:'#ffffff', lineHeight:1.35}}>Distanță peste 300 km — necesită bilet de avion</span>
                    </div>
                    <div style={{fontSize:'14px', color:'#e0edff', marginBottom: aps.length > 0 ? '10px' : 0, lineHeight:1.5}}>
                      De la aeroport este necesar transfer auto până la locație.
                    </div>
                    {esteRomania && aps.length > 0 ? (
                      <div>
                        <div style={{fontSize:'12px', color:'#bfdbfe', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Aeroporturi apropiate</div>
                        {aps.map((ap, i) => (
                          <div key={ap.name} style={{fontSize:'14px', color:'#ffffff', fontWeight: i === 0 ? 700 : 500, lineHeight:1.6}}>
                            {ap.name} <span style={{color:'#bfdbfe', fontWeight:500}}>(~{ap.dist} km)</span>{i === 0 ? <span style={{color:'#93c5fd', fontSize:'12px'}}> · recomandat</span> : ''}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{fontSize:'14px', color:'#ffffff', fontWeight:600, lineHeight:1.5}}>
                        Zbor internațional — aeroportul de la destinație.
                      </div>
                    )}
                  </div>
                )
              })()}


            </div>
          )}

          {km !== null && city.trim() && (
            <RouteMap fromCity={fromCity || 'Bucuresti'} toCity={city} />
          )}

          <div style={{textAlign:'center', fontSize:'12px', color:'#a8a29e', marginTop:'24px', lineHeight:1.6}}>
            Estimare orientativa. Costul final depinde de ruta, opriri si conditii specifice.
          </div>


          <ExpertModal isOpen={expertOpen} onClose={() => setExpertOpen(false)} selectedCity={city} title="Vorbeste cu un expert" descPlaceholder="ex: artist dorit, data evenimentului, oras, buget..." />

          {/* ===== CONVERTOR CURS BNR + TVA ===== */}
          <div style={{marginTop:'48px', paddingTop:'40px', borderTop:'1px solid #e7e5e4'}}>
            <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px'}}>
              <div style={{width:'42px', height:'42px', borderRadius:'12px', background:'#7c3aed', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px'}}>%</div>
              <div style={{fontSize:'11px', fontWeight:700, color:'#7c3aed', textTransform:'uppercase', letterSpacing:'0.15em'}}>
                Convertor curs BNR & TVA
              </div>
            </div>
            <h2 style={{fontSize:'24px', fontWeight:800, letterSpacing:'-0.02em', margin:'0 0 8px', color:'#1c1917'}}>
              Calculator TVA 21% si curs valutar
            </h2>
            <p style={{fontSize:'14px', color:'#78716c', lineHeight:1.6, margin:'0 0 28px', fontWeight:500}}>
              Converteste intre lei si euro la cursul BNR si calculeaza TVA-ul de 21%.
            </p>

            <div style={{background:'white', border:'2px solid #e7e5e4', borderRadius:'16px', padding:'28px'}}>
              <div style={{marginBottom:'18px'}}>
                <div style={labelStyle}>Suma</div>
                <input type="text" inputMode="decimal" style={inputStyle}
                  placeholder="ex: 1000" value={tvaSuma}
                  onChange={e => setTvaSuma(e.target.value)} />
              </div>

              <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'12px', marginBottom:'24px'}}>
                <div>
                  <div style={labelStyle}>Moneda</div>
                  <div style={{display:'flex', gap:'6px'}}>
                    {(['lei','eur'] as const).map(m => (
                      <button key={m} onClick={() => setTvaMoneda(m)}
                        style={{flex:1, padding:'10px', borderRadius:'10px', border:'1.5px solid ' + (tvaMoneda===m?'#1c1917':'#e7e5e4'), background: tvaMoneda===m?'#1c1917':'white', color: tvaMoneda===m?'white':'#78716c', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F, textTransform:'uppercase'}}>
                        {m === 'lei' ? 'Lei' : 'Euro'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={labelStyle}>Operatie TVA</div>
                  <div style={{display:'flex', gap:'6px', flexWrap:'wrap'}}>
                    <button onClick={() => setTvaMod('adauga')}
                      style={{flex:'1 1 30%', padding:'10px 6px', borderRadius:'10px', border:'1.5px solid ' + (tvaMod==='adauga'?'#1c1917':'#e7e5e4'), background: tvaMod==='adauga'?'#1c1917':'white', color: tvaMod==='adauga'?'white':'#78716c', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:F}}>
                      Adauga TVA
                    </button>
                    <button onClick={() => setTvaMod('scoate')}
                      style={{flex:'1 1 30%', padding:'10px 6px', borderRadius:'10px', border:'1.5px solid ' + (tvaMod==='scoate'?'#1c1917':'#e7e5e4'), background: tvaMod==='scoate'?'#1c1917':'white', color: tvaMod==='scoate'?'white':'#78716c', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:F}}>
                      Scoate TVA
                    </button>
                    <button onClick={() => setTvaMod('extrage')}
                      style={{flex:'1 1 30%', padding:'10px 6px', borderRadius:'10px', border:'1.5px solid ' + (tvaMod==='extrage'?'#1c1917':'#e7e5e4'), background: tvaMod==='extrage'?'#1c1917':'white', color: tvaMod==='extrage'?'white':'#78716c', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:F}}>
                      Extrage TVA
                    </button>
                  </div>
                </div>
              </div>

              {(() => {
                const suma = parseFloat(tvaSuma.replace(',', '.')) || 0
                if (suma <= 0 || !eurRate) return (
                  <div style={{fontSize:'13px', color:'#a8a29e', textAlign:'center', padding:'12px'}}>
                    Introdu o suma ca sa vezi calculul.
                  </div>
                )
                // baza, tva, total in moneda introdusa
                let baza: number, tva: number, total: number
                if (tvaMod === 'adauga') {
                  // suma e neta, adaug TVA
                  baza = suma
                  tva = suma * 0.21
                  total = baza + tva
                } else {
                  // scoate sau extrage: suma include TVA
                  total = suma
                  baza = suma / 1.21
                  tva = total - baza
                }
                const evidentiaza = tvaMod === 'extrage' ? 'tva' : tvaMod === 'adauga' ? 'total' : 'baza'
                const rate = eurRate
                const conv = (v: number) => tvaMoneda === 'lei'
                  ? { lei: v, eur: v / rate }
                  : { lei: v * rate, eur: v }
                const fmt = (v: number) => v.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                const b = conv(baza), t = conv(tva), tot = conv(total)
                return (
                  <div style={{background:'#1c1917', borderRadius:'14px', padding:'20px', color:'white'}}>
                    <div style={{display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:'14px'}}>
                      <span style={{color:'#a8a29e'}}>Baza (fara TVA)</span>
                      <span style={{fontWeight:700}}>{fmt(b.lei)} lei</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:'14px', borderBottom:'1px solid #292524'}}>
                      <span style={{color:'#a8a29e'}}>TVA 21%</span>
                      <span style={{fontWeight:700, color:'#eacda3'}}>{fmt(t.lei)} lei</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', padding:'12px 0 4px', fontSize:'16px'}}>
                      <span style={{fontWeight:700}}>Total cu TVA</span>
                      <span style={{fontWeight:800}}>{fmt(tot.lei)} lei</span>
                    </div>
                    <div style={{textAlign:'right', fontSize:'13px', color:'#a8a29e', marginBottom:'12px'}}>
                      = {fmt(tot.eur)} EUR
                    </div>
                    <div style={{borderTop:'1px solid #292524', paddingTop:'12px', fontSize:'11px', color:'#57534e'}}>
                      Curs BNR: 1 EUR = {rate.toFixed(4)} lei{rateDate ? ' (' + rateDate + ')' : ''}
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>

          <div style={{marginTop:'48px', paddingTop:'24px', borderTop:'1px solid #e7e5e4', display:'flex', gap:'20px', flexWrap:'wrap', justifyContent:'center'}}>
            <Link href="/termeni" style={{fontSize:'12px', color:'#a8a29e', textDecoration:'none'}}>Termeni și Condiții</Link>
            <Link href="/confidentialitate" style={{fontSize:'12px', color:'#a8a29e', textDecoration:'none'}}>Confidențialitate</Link>
            <Link href="/cookies" style={{fontSize:'12px', color:'#a8a29e', textDecoration:'none'}}>Cookies</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
