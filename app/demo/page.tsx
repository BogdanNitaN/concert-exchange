'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { EVENT_TYPES, VIBES, GENRES, GENRE_CATEGORIES, FORMATS, FORMAT_CATEGORIES, GENRE_FORMAT_MAP, GENRE_FORMAT_TAB, VIBE_FORMAT_TAB, FORMAT_COMPATIBILITY } from '@/lib/constants'

export default function DemoPage() {
  const [step, setStep] = useState(1)
  const [selectedEvent, setSelectedEvent] = useState('')
  const [selectedVibes, setSelectedVibes] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedFormats, setSelectedFormats] = useState<string[]>([])
  const [activeGenreCategory, setActiveGenreCategory] = useState('Electronic')
  const [activeFormatCategory, setActiveFormatCategory] = useState('DJ & Mixing')
  const [showExpertModal, setShowExpertModal] = useState(false)
  const [expertForm, setExpertForm] = useState({ date: '', guests: '', desc: '' })
  const [expertSent, setExpertSent] = useState(false)
  const [showAlteleModal, setShowAlteleModal] = useState(false)
  const [alteleForm, setAlteleForm] = useState({ desc: "", date: "", guests: "", phone: "" })
  const [alteleSent, setAlteleSent] = useState(false)

  // Auto-switch format tab based on genre/vibe selection
  useEffect(() => {
    if (selectedGenres.length > 0) {
      const lastGenre = selectedGenres[selectedGenres.length - 1]
      const suggestedTab = GENRE_FORMAT_TAB[lastGenre]
      if (suggestedTab) setActiveFormatCategory(suggestedTab)
    } else if (selectedVibes.length > 0) {
      const lastVibe = selectedVibes[selectedVibes.length - 1]
      const suggestedTab = VIBE_FORMAT_TAB[lastVibe]
      if (suggestedTab) setActiveFormatCategory(suggestedTab)
    }
  }, [selectedGenres, selectedVibes])

  const toggleVibe = (id: string) => {
    setSelectedVibes(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : prev.length < 3 ? [...prev, id] : prev
    )
  }

  const toggleGenre = (id: string) => {
    setSelectedGenres(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    )
  }

  const toggleFormat = (id: string) => {
    setSelectedFormats(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const getCompatibleFormats = (): Set<string> | null => {
    if (selectedGenres.length === 0 && selectedVibes.length === 0) return null
    const ids = new Set<string>()
    selectedGenres.forEach(g => (GENRE_FORMAT_MAP[g] || []).forEach(f => ids.add(f)))
    selectedVibes.forEach(v => (FORMAT_COMPATIBILITY[v] || []).forEach(f => ids.add(f)))
    return ids
  }

  const compatibleFormats = getCompatibleFormats()
  const isCompatible = (id: string) => !compatibleFormats || compatibleFormats.has(id)

  return (
    <div style={{minHeight:'100vh', background:'#fafaf9', fontFamily:'Montserrat,sans-serif'}}>

      <nav style={{borderBottom:'1px solid #e7e5e4', background:'white', height:'56px', display:'flex', alignItems:'center', padding:'0 24px', justifyContent:'space-between', position:'sticky', top:0, zIndex:100}}>
        <Link href="/" style={{fontWeight:800, fontSize:'18px', color:'#1c1917', textDecoration:'none'}}>
          Concert <span style={{color:'#f59e0b'}}>●</span> Exchange
        </Link>
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          {[1,2,3].map(s => (
            <div key={s} style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <div style={{width:'32px', height:'32px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:700, cursor: s < step ? 'pointer' : 'default', background: step === s ? '#1c1917' : s < step ? '#22c55e' : '#e7e5e4', color: step === s || s < step ? 'white' : '#78716c', transition:'all 0.3s'}}
                onClick={() => s < step && setStep(s)}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && <div style={{width:'40px', height:'2px', background: s < step ? '#22c55e' : '#e7e5e4', transition:'all 0.3s'}} />}
            </div>
          ))}
        </div>
        <div style={{fontSize:'12px', color:'#a8a29e', fontWeight:600}}>
          {step === 1 ? '🎪 Tip eveniment' : step === 2 ? '✨ Vibe' : '🎵 Gen muzical'}
        </div>
      </nav>

      <div style={{maxWidth:'960px', margin:'0 auto', padding:'48px 24px'}}>

        {step === 1 && (
          <div>
            <div style={{textAlign:'center', marginBottom:'40px'}}>
              <div style={{fontSize:'11px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'12px'}}>Pasul 1 din 3</div>
              <h1 style={{fontSize:'36px', fontWeight:800, color:'#1c1917', marginBottom:'10px', letterSpacing:'-0.02em'}}>Ce eveniment organizezi?</h1>
              <p style={{fontSize:'15px', color:'#78716c'}}>Selectează tipul și îți arătăm artiștii potriviți</p>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:'12px', marginBottom:'16px'}}>
              {EVENT_TYPES.filter(e => e.id !== 'expert' && e.id !== 'altele').map(e => (
                <div key={e.id} onClick={() => setSelectedEvent(e.id)}
                  style={{background: selectedEvent === e.id ? '#1c1917' : 'white', border:'2px solid ' + (selectedEvent === e.id ? '#1c1917' : '#e7e5e4'), borderRadius:'16px', padding:'20px 12px', cursor:'pointer', textAlign:'center', transform: selectedEvent === e.id ? 'scale(1.04)' : 'scale(1)', boxShadow: selectedEvent === e.id ? '0 8px 24px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.04)', transition:'all 0.2s'}}>
                  <div style={{fontSize:'26px', marginBottom:'8px'}}>{e.icon}</div>
                  <div style={{fontWeight:700, fontSize:'11px', color: selectedEvent === e.id ? 'white' : '#1c1917', lineHeight:1.3}}>{e.label}</div>
                </div>
              ))}
            </div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'24px'}}>
              <div onClick={() => { setSelectedEvent('altele'); setShowAlteleModal(true) }}
                style={{background: selectedEvent === 'altele' ? '#f5f5f4' : 'white', border:'2px dashed ' + (selectedEvent === 'altele' ? '#1c1917' : '#e7e5e4'), borderRadius:'14px', padding:'16px 20px', cursor:'pointer', display:'flex', alignItems:'center', gap:'12px', transition:'all 0.2s'}}>
                <span style={{fontSize:'24px'}}>✨</span>
                <div>
                  <div style={{fontWeight:700, fontSize:'13px', color:'#1c1917'}}>Altele</div>
                  <div style={{fontSize:'11px', color:'#78716c'}}>Descrie tu ce ai în minte</div>
                </div>
              </div>
              <div onClick={() => setShowExpertModal(true)}
                style={{background:'#1c1917', border:'2px solid #1c1917', borderRadius:'14px', padding:'16px 20px', cursor:'pointer', display:'flex', alignItems:'center', gap:'12px'}}>
                <span style={{fontSize:'24px'}}>🎯</span>
                <div>
                  <div style={{fontWeight:700, fontSize:'13px', color:'white'}}>Vorbește cu un expert</div>
                  <div style={{fontSize:'11px', color:'#a8a29e'}}>Nu știi exact ce vrei? Te ajutăm noi</div>
                </div>
              </div>
            </div>

            <button onClick={() => { if(selectedEvent) setStep(2) }} disabled={!selectedEvent}
              style={{width:'100%', background:'#1c1917', color:'white', padding:'16px', borderRadius:'14px', border:'none', cursor: selectedEvent ? 'pointer' : 'not-allowed', fontSize:'15px', fontWeight:700, fontFamily:'Montserrat,sans-serif', opacity: selectedEvent ? 1 : 0.4}}>
              Continuă — Alege vibe-ul →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{textAlign:'center', marginBottom:'32px'}}>
              <div style={{fontSize:'11px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'12px'}}>Pasul 2 din 3</div>
              <h1 style={{fontSize:'36px', fontWeight:800, color:'#1c1917', marginBottom:'10px', letterSpacing:'-0.02em'}}>Ce vibe vrei?</h1>
              <p style={{fontSize:'15px', color:'#78716c'}}>Alege până la 3 vibe-uri care descriu atmosfera dorită</p>
            </div>

            <div style={{display:'flex', justifyContent:'center', marginBottom:'24px'}}>
              <div style={{background: selectedVibes.length === 3 ? '#fef3c7' : '#f5f5f4', border:'1px solid ' + (selectedVibes.length === 3 ? '#fde68a' : '#e7e5e4'), borderRadius:'20px', padding:'6px 16px', fontSize:'12px', fontWeight:700, color: selectedVibes.length === 3 ? '#92400e' : '#a8a29e', transition:'all 0.3s'}}>
                {selectedVibes.length === 3 ? '✓ 3/3 vibe-uri — maxim atins' : selectedVibes.length + '/3 vibe-uri selectate'}
              </div>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'12px', marginBottom:'28px'}}>
              {VIBES.map(v => {
                const isSelected = selectedVibes.includes(v.id)
                const isDisabled = !isSelected && selectedVibes.length >= 3
                return (
                  <div key={v.id} onClick={() => !isDisabled && toggleVibe(v.id)}
                    style={{background: isSelected ? '#1c1917' : isDisabled ? '#fafaf9' : 'white', border:'2px solid ' + (isSelected ? '#1c1917' : isDisabled ? '#f5f5f4' : '#e7e5e4'), borderRadius:'16px', padding:'18px 14px', cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.35 : 1, transform: isSelected ? 'scale(1.03)' : 'scale(1)', boxShadow: isSelected ? '0 8px 24px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.04)', transition:'all 0.2s', position:'relative'}}>
                    {isSelected && <div style={{position:'absolute', top:'8px', right:'10px', fontSize:'10px', fontWeight:800, color:'#22c55e'}}>✓</div>}
                    <div style={{fontSize:'22px', marginBottom:'7px'}}>{v.icon}</div>
                    <div style={{fontWeight:700, fontSize:'12px', color: isSelected ? 'white' : '#1c1917', marginBottom:'4px', lineHeight:1.2}}>{v.label}</div>
                    <div style={{fontSize:'10px', color: isSelected ? '#a8a29e' : '#78716c', lineHeight:1.4}}>{v.desc}</div>
                  </div>
                )
              })}
            </div>

            {selectedVibes.length > 0 && (
              <div style={{background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'12px', padding:'12px 16px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap'}}>
                <span style={{fontSize:'13px', color:'#166534', fontWeight:700}}>Vibe ales:</span>
                {selectedVibes.map(id => (
                  <span key={id} onClick={() => toggleVibe(id)}
                    style={{background:'#1c1917', color:'white', fontSize:'11px', fontWeight:700, padding:'4px 12px', borderRadius:'20px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px'}}>
                    {VIBES.find(v => v.id === id)?.icon} {VIBES.find(v => v.id === id)?.label}
                    <span style={{opacity:0.6}}>✕</span>
                  </span>
                ))}
                {selectedVibes.length < 3 && (
                  <span style={{background:'#f5f5f4', color:'#78716c', fontSize:'11px', fontWeight:600, padding:'4px 12px', borderRadius:'20px', cursor:'pointer', border:'1px dashed #e7e5e4'}}>
                    + Adaugă vibe
                  </span>
                )}
              </div>
            )}

            <div style={{display:'flex', gap:'12px'}}>
              <button onClick={() => setStep(1)} style={{padding:'14px 24px', borderRadius:'14px', border:'1px solid #e7e5e4', background:'white', color:'#78716c', fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif'}}>← Înapoi</button>
              <button onClick={() => { if(selectedVibes.length > 0) setStep(3) }} disabled={selectedVibes.length === 0}
                style={{flex:1, background:'#1c1917', color:'white', padding:'14px', borderRadius:'14px', border:'none', cursor: selectedVibes.length > 0 ? 'pointer' : 'not-allowed', fontSize:'15px', fontWeight:700, fontFamily:'Montserrat,sans-serif', opacity: selectedVibes.length > 0 ? 1 : 0.4}}>
                Continuă — Gen muzical (opțional) →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{textAlign:'center', marginBottom:'28px'}}>
              <div style={{fontSize:'11px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'12px'}}>Pasul 3 din 3</div>
              <h1 style={{fontSize:'36px', fontWeight:800, color:'#1c1917', marginBottom:'10px', letterSpacing:'-0.02em'}}>Gen muzical & Format</h1>
              <p style={{fontSize:'15px', color:'#78716c'}}>Opțional — dacă știi exact ce vrei</p>
            </div>

            <div style={{background:'#fef3c7', border:'1px solid #fde68a', borderRadius:'14px', padding:'14px 20px', marginBottom:'24px'}}>
              <div style={{fontSize:'13px', fontWeight:700, color:'#92400e', marginBottom:'3px'}}>💡 Nu știi exact ce gen vrei?</div>
              <div style={{fontSize:'12px', color:'#92400e'}}>
                Poți sări direct — facem matching după: <strong>{selectedVibes.map(id => VIBES.find(v => v.id === id)?.label).join(' + ')}</strong>
              </div>
            </div>

            <div style={{marginBottom:'28px'}}>
              <div style={{fontSize:'12px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'12px'}}>Gen muzical</div>
              <div style={{display:'flex', gap:'6px', marginBottom:'14px', flexWrap:'wrap'}}>
                {GENRE_CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setActiveGenreCategory(cat)}
                    style={{padding:'7px 14px', borderRadius:'20px', border:'1px solid', cursor:'pointer', fontSize:'12px', fontWeight:600, fontFamily:'Montserrat,sans-serif', background: activeGenreCategory === cat ? '#1c1917' : 'white', color: activeGenreCategory === cat ? 'white' : '#78716c', borderColor: activeGenreCategory === cat ? '#1c1917' : '#e7e5e4'}}>{cat}</button>
                ))}
              </div>
              <div style={{display:'flex', flexWrap:'wrap', gap:'7px', minHeight:'80px'}}>
                {GENRES.filter(g => g.category === activeGenreCategory).map(g => (
                  <button key={g.id} onClick={() => toggleGenre(g.id)}
                    style={{padding:'8px 16px', borderRadius:'20px', border:'2px solid', cursor:'pointer', fontSize:'13px', fontWeight:600, fontFamily:'Montserrat,sans-serif', transition:'all 0.15s', background: selectedGenres.includes(g.id) ? '#1c1917' : 'white', color: selectedGenres.includes(g.id) ? 'white' : '#78716c', borderColor: selectedGenres.includes(g.id) ? '#1c1917' : '#e7e5e4', transform: selectedGenres.includes(g.id) ? 'scale(1.05)' : 'scale(1)'}}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{marginBottom:'28px'}}>
              <div style={{fontSize:'12px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px'}}>
                Format artist
                {compatibleFormats && <span style={{marginLeft:'8px', fontSize:'11px', color:'#22c55e', fontWeight:600}}>— filtrat după selecția ta</span>}
              </div>
              <div style={{display:'flex', gap:'6px', marginBottom:'14px', flexWrap:'wrap'}}>
                {FORMAT_CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setActiveFormatCategory(cat)}
                    style={{padding:'7px 14px', borderRadius:'20px', border:'1px solid', cursor:'pointer', fontSize:'12px', fontWeight:600, fontFamily:'Montserrat,sans-serif', background: activeFormatCategory === cat ? '#7c3aed' : 'white', color: activeFormatCategory === cat ? 'white' : '#78716c', borderColor: activeFormatCategory === cat ? '#7c3aed' : '#e7e5e4', position:'relative' as const}}>
                    {cat}
                    {cat === 'DJ & Mixing' && selectedGenres.some(g => GENRE_FORMAT_TAB[g] === 'DJ & Mixing') && (
                      <span style={{position:'absolute', top:'-4px', right:'-4px', width:'8px', height:'8px', background:'#22c55e', borderRadius:'50%'}} />
                    )}
                  </button>
                ))}
              </div>
              <div style={{display:'flex', flexWrap:'wrap', gap:'7px', minHeight:'60px'}}>
                {FORMATS.filter(f => f.category === activeFormatCategory).map(f => {
                  const compatible = isCompatible(f.id)
                  const isSelected = selectedFormats.includes(f.id)
                  return (
                    <button key={f.id} onClick={() => toggleFormat(f.id)}
                      style={{padding:'8px 16px', borderRadius:'20px', border:'2px solid', cursor: compatible || isSelected ? 'pointer' : 'default', fontSize:'13px', fontWeight:600, fontFamily:'Montserrat,sans-serif', transition:'all 0.15s',
                        background: isSelected ? '#7c3aed' : compatible ? 'white' : '#fafaf9',
                        color: isSelected ? 'white' : compatible ? '#78716c' : '#c4c4c4',
                        borderColor: isSelected ? '#7c3aed' : compatible ? '#e7e5e4' : '#f0f0f0',
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                      }}>
                      {f.label}
                      {!compatible && !isSelected && (
                        <span style={{display:'block', fontSize:'9px', color:'#c4c4c4', fontWeight:500, marginTop:'1px'}}>incompatibil</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'24px', marginBottom:'24px'}}>
              <div style={{fontSize:'11px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'16px'}}>📋 Profilul căutării tale</div>
              <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                  <span style={{fontSize:'22px'}}>{EVENT_TYPES.find(e => e.id === selectedEvent)?.icon}</span>
                  <div>
                    <div style={{fontSize:'11px', color:'#a8a29e', fontWeight:600}}>EVENIMENT</div>
                    <div style={{fontSize:'14px', fontWeight:700, color:'#1c1917'}}>{EVENT_TYPES.find(e => e.id === selectedEvent)?.label}</div>
                  </div>
                </div>
                <div>
                  <div style={{fontSize:'11px', color:'#a8a29e', fontWeight:600, marginBottom:'6px'}}>
                    VIBE <span style={{fontWeight:400, fontSize:'10px'}}>(click ✕ pentru a scoate)</span>
                  </div>
                  <div style={{display:'flex', gap:'6px', flexWrap:'wrap'}}>
                    {selectedVibes.map(id => (
                      <span key={id} onClick={() => toggleVibe(id)}
                        style={{background:'#1c1917', color:'white', fontSize:'11px', fontWeight:700, padding:'4px 12px', borderRadius:'20px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px'}}>
                        {VIBES.find(v => v.id === id)?.icon} {VIBES.find(v => v.id === id)?.label}
                        <span style={{opacity:0.6}}>✕</span>
                      </span>
                    ))}
                    {selectedVibes.length < 3 && (
                      <span onClick={() => setStep(2)}
                        style={{background:'#f5f5f4', color:'#78716c', fontSize:'11px', fontWeight:600, padding:'4px 12px', borderRadius:'20px', cursor:'pointer', border:'1px dashed #e7e5e4', display:'flex', alignItems:'center', gap:'4px'}}>
                        + Adaugă vibe
                      </span>
                    )}
                  </div>
                </div>
                {selectedGenres.length > 0 && (
                  <div>
                    <div style={{fontSize:'11px', color:'#a8a29e', fontWeight:600, marginBottom:'6px'}}>GENURI</div>
                    <div style={{display:'flex', gap:'6px', flexWrap:'wrap'}}>
                      {selectedGenres.map(id => (
                        <span key={id} onClick={() => toggleGenre(id)}
                          style={{background:'#f5f5f4', color:'#1c1917', fontSize:'11px', fontWeight:600, padding:'4px 12px', borderRadius:'20px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px'}}>
                          {GENRES.find(g => g.id === id)?.label} <span style={{opacity:0.4}}>✕</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedFormats.length > 0 && (
                  <div>
                    <div style={{fontSize:'11px', color:'#a8a29e', fontWeight:600, marginBottom:'6px'}}>FORMAT</div>
                    <div style={{display:'flex', gap:'6px', flexWrap:'wrap'}}>
                      {selectedFormats.map(id => (
                        <span key={id} onClick={() => toggleFormat(id)}
                          style={{background:'#f5f3ff', color:'#7c3aed', fontSize:'11px', fontWeight:600, padding:'4px 12px', borderRadius:'20px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px'}}>
                          {FORMATS.find(f => f.id === id)?.label} <span style={{opacity:0.4}}>✕</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{display:'flex', gap:'12px'}}>
              <button onClick={() => setStep(2)} style={{padding:'14px 24px', borderRadius:'14px', border:'1px solid #e7e5e4', background:'white', color:'#78716c', fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif'}}>← Înapoi</button>
              <Link href="/search" style={{flex:1, background:'#f59e0b', color:'#1c1917', padding:'14px', borderRadius:'14px', border:'none', fontSize:'15px', fontWeight:800, fontFamily:'Montserrat,sans-serif', textAlign:'center', textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center'}}>
                🎵 Caută artiști potriviți →
              </Link>
            </div>
          </div>
        )}
      </div>

      
      {showAlteleModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px'}}
          onClick={() => setShowAlteleModal(false)}>
          <div style={{background:'white', borderRadius:'24px', padding:'32px', width:'100%', maxWidth:'440px', fontFamily:'Montserrat,sans-serif'}}
            onClick={e => e.stopPropagation()}>
            {alteleSent ? (
              <div style={{textAlign:'center', padding:'20px 0'}}>
                <div style={{fontSize:'48px', marginBottom:'16px'}}>✨</div>
                <div style={{fontWeight:800, fontSize:'20px', color:'#1c1917', marginBottom:'8px'}}>Mesaj trimis!</div>
                <div style={{fontSize:'14px', color:'#78716c', marginBottom:'4px', fontWeight:600}}>Răspuns rapid garantat ⚡</div>
                <div style={{fontSize:'12px', color:'#a8a29e', marginBottom:'24px'}}>Verifică WhatsApp și email-ul.</div>
                <button onClick={() => { setShowAlteleModal(false); setAlteleSent(false) }}
                  style={{background:'#1c1917', color:'white', padding:'12px 32px', borderRadius:'12px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif'}}>
                  Închide
                </button>
              </div>
            ) : (
              <>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px'}}>
                  <div>
                    <div style={{fontWeight:800, fontSize:'18px', color:'#1c1917', marginBottom:'4px'}}>✨ Descrie evenimentul tău</div>
                    <div style={{display:'inline-flex', alignItems:'center', gap:'6px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'20px', padding:'4px 12px', marginTop:'4px'}}>
                      <div style={{width:'6px', height:'6px', borderRadius:'50%', background:'#22c55e'}} />
                      <span style={{fontSize:'11px', fontWeight:700, color:'#166534'}}>Răspuns rapid garantat ⚡</span>
                    </div>
                  </div>
                  <button onClick={() => setShowAlteleModal(false)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'20px', color:'#a8a29e'}}>✕</button>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                  <div>
                    <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Telefon / WhatsApp</div>
                    <input type="tel" placeholder="ex: 07xx xxx xxx" value={alteleForm.phone} onChange={e => setAlteleForm(p => ({...p, phone: e.target.value}))}
                      style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
                  </div>
                  <div>
                    <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Data evenimentului</div>
                    <input type="date" value={alteleForm.date} onChange={e => setAlteleForm(p => ({...p, date: e.target.value}))}
                      style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
                  </div>
                  <div>
                    <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Număr aproximativ persoane</div>
                    <input type="number" placeholder="ex: 200" value={alteleForm.guests} onChange={e => setAlteleForm(p => ({...p, guests: e.target.value}))}
                      style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
                  </div>
                  <div>
                    <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Descrie evenimentul tău</div>
                    <textarea rows={4} placeholder="ex: petrecere pe vapor, 50 persoane, vibe luxury sunset, DJ + sax live..." value={alteleForm.desc} onChange={e => setAlteleForm(p => ({...p, desc: e.target.value}))}
                      style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', resize:'none', boxSizing:'border-box'}} />
                  </div>
                  <button onClick={() => setAlteleSent(true)}
                    style={{width:'100%', background:'#1c1917', color:'white', padding:'13px', borderRadius:'12px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif'}}>
                    ⚡ Trimite — răspuns în mai puțin de 30 min
                  </button>
                  <div style={{textAlign:'center', fontSize:'11px', color:'#a8a29e'}}>
                    📧 Email + 💬 WhatsApp — alegem cel mai rapid canal
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showExpertModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px'}}
          onClick={() => setShowExpertModal(false)}>
          <div style={{background:'white', borderRadius:'24px', padding:'32px', width:'100%', maxWidth:'440px', fontFamily:'Montserrat,sans-serif'}}
            onClick={e => e.stopPropagation()}>
            {expertSent ? (
              <div style={{textAlign:'center', padding:'20px 0'}}>
                <div style={{fontSize:'48px', marginBottom:'16px'}}>🎯</div>
                <div style={{fontWeight:800, fontSize:'18px', color:'#1c1917', marginBottom:'8px'}}>Mesaj trimis!</div>
                <div style={{fontSize:'13px', color:'#78716c', marginBottom:'24px'}}>Un expert te contactează în maxim 24h.</div>
                <button onClick={() => { setShowExpertModal(false); setExpertSent(false) }}
                  style={{background:'#1c1917', color:'white', padding:'12px 32px', borderRadius:'12px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif'}}>
                  Închide
                </button>
              </div>
            ) : (
              <>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                  <div>
                    <div style={{fontWeight:800, fontSize:'18px', color:'#1c1917', marginBottom:'4px'}}>🎯 Vorbește cu un expert</div>
                    <div style={{fontSize:'12px', color:'#78716c'}}>Răspuns rapid garantat ⚡</div>
                  </div>
                  <button onClick={() => setShowExpertModal(false)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'20px', color:'#a8a29e'}}>✕</button>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                  <div>
                    <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Data evenimentului</div>
                    <input type="date" value={expertForm.date} onChange={e => setExpertForm(p => ({...p, date: e.target.value}))}
                      style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
                  </div>
                  <div>
                    <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Număr aproximativ de persoane</div>
                    <input type="number" placeholder="ex: 200" value={expertForm.guests} onChange={e => setExpertForm(p => ({...p, guests: e.target.value}))}
                      style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
                  </div>
                  <div>
                    <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Descrie în câteva cuvinte ce îți dorești</div>
                    <textarea rows={3} placeholder="ex: vreau ceva luxury sunset, DJ bun, locație cu vedere..." value={expertForm.desc} onChange={e => setExpertForm(p => ({...p, desc: e.target.value}))}
                      style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', resize:'none', boxSizing:'border-box'}} />
                  </div>
                  <button onClick={() => setExpertSent(true)}
                    style={{width:'100%', background:'#1c1917', color:'white', padding:'13px', borderRadius:'12px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif'}}>
                    ⚡ Trimite — răspuns în mai puțin de 30 min
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