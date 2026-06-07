'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function BookArtistPage() {
  const params = useParams()
  const slug = params.slug as string

  const [artist, setArtist] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState(1)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [citySuggestions, setCitySuggestions] = useState<any[]>([])
  const [venueSuggestions, setVenueSuggestions] = useState<any[]>([])
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [showVenueDropdown, setShowVenueDropdown] = useState(false)
  const [form, setForm] = useState({
    eventDate: '', eventType: '', eventTypeCustom: '', city: '', venueName: '',
    duration: '', durationCustom: '',
    budget: '', clientName: '', clientEmail: '', clientPhone: '', message: '',
  })

  useEffect(() => {
    const fetchArtist = async () => {
      const { data } = await (supabase as any).from('artists').select('*').eq('slug', slug).single()
      setArtist(data)
      setLoading(false)
    }
    fetchArtist()
  }, [slug])

  // Autocomplete oras
  useEffect(() => {
    if (form.city.length < 2) { setCitySuggestions([]); return }
    const timer = setTimeout(() => {
      fetch('/api/places?input=' + encodeURIComponent(form.city) + '&type=cities')
        .then(r => r.json())
        .then(d => setCitySuggestions(d.predictions || []))
        .catch(() => setCitySuggestions([]))
    }, 300)
    return () => clearTimeout(timer)
  }, [form.city])

  // Autocomplete locatie
  useEffect(() => {
    if (form.venueName.length < 2) { setVenueSuggestions([]); return }
    const timer = setTimeout(() => {
      fetch('/api/places?input=' + encodeURIComponent(form.venueName + ' ' + form.city))
        .then(r => r.json())
        .then(d => setVenueSuggestions(d.predictions || []))
        .catch(() => setVenueSuggestions([]))
    }, 300)
    return () => clearTimeout(timer)
  }, [form.venueName, form.city])

  // Optiuni durata in functie de setType
  const getDurationOptions = () => {
    if (!artist) return []
    if (artist.setType === 'dj') return ['60 min', '90 min', '120 min', '180 min']
    if (artist.setType === 'vocal') return ['45 min', '60 min', '90 min']
    if (artist.setType === 'band' || artist.setType === 'cover') return ['45 min', '60 min', '90 min', '2x45 min', '2x60 min']
    if (artist.setType === 'show') return ['15 min', '20 min', '30 min', '45 min']
    if (artist.setType === 'instrument') return ['30 min', '45 min', '60 min', '90 min', '120 min']
    return []
  }

  const durationOptions = getDurationOptions()
  const showCustomDuration = !durationOptions.length || form.duration === 'manual'
  const isCustomEventType = form.eventType === 'altul'

  const handleSubmit = async () => {
    if (!artist) return
    setSubmitting(true)
    const finalEventType = isCustomEventType ? form.eventTypeCustom : form.eventType
    const finalDuration = (form.duration === 'manual' || !durationOptions.length) ? form.durationCustom : form.duration
    const { error } = await (supabase as any).from('requests').insert({
      artist_id: artist.id,
      event_date: form.eventDate || null,
      event_type: finalEventType,
      city: form.city,
      venue_name: form.venueName,
      duration: finalDuration,
      budget: form.budget ? parseInt(form.budget) : null,
      client_name: form.clientName,
      client_email: form.clientEmail,
      client_phone: form.clientPhone,
      message: form.message,
      status: 'pending',
    })
    setSubmitting(false)
    if (!error) setSuccess(true)
    else alert('Eroare: ' + error.message)
  }

  if (loading) return <div style={{minHeight:'100vh',background:'#f5f5f7',display:'flex',alignItems:'center',justifyContent:'center'}}>Se incarca...</div>
  if (!artist) return <div style={{minHeight:'100vh',background:'#f5f5f7',display:'flex',alignItems:'center',justifyContent:'center'}}>Artist negasit</div>

  if (success) {
    return (
      <div style={{minHeight:'100vh',background:'#f5f5f7',fontFamily:'Montserrat,sans-serif'}}>
        <nav style={{background:'white',borderBottom:'1px solid #e7e5e4',position:'sticky',top:0,zIndex:100}}>
          <div style={{maxWidth:'600px',margin:'0 auto',padding:'0 24px',height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <Link href="/" style={{fontWeight:800,fontSize:'16px',color:'#1c1917',textDecoration:'none',letterSpacing:'-0.5px'}}>GIG<span style={{color:'#059669'}}>x</span></Link>
          </div>
        </nav>
        <div style={{maxWidth:'600px',margin:'0 auto',padding:'48px 24px'}}>
          <div style={{background:'white',border:'1px solid #e7e5e4',borderRadius:'18px',padding:'40px 24px',textAlign:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
            <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'64px',height:'64px',borderRadius:'50%',background:'#dcfce7',marginBottom:'20px'}}>
              <CheckCircle2 size={36} color='#059669' strokeWidth={2.5} />
            </div>
            <h1 style={{fontSize:'22px',fontWeight:800,color:'#1c1917',margin:'0 0 8px 0',letterSpacing:'-0.5px'}}>Cerere trimisa!</h1>
            <p style={{fontSize:'14px',color:'#78716c',margin:'0 0 24px 0',lineHeight:1.5}}>{artist.artistName || 'Artistul'} va raspunde in 30 de minute.<br/>Vei primi confirmare pe email.</p>
            <Link href={'/artist/' + slug} style={{display:'inline-flex',alignItems:'center',gap:'6px',background:'#1c1917',color:'white',padding:'12px 24px',borderRadius:'12px',fontSize:'13px',fontWeight:700,textDecoration:'none'}}>
              <ArrowLeft size={14} /> Inapoi la profil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const canProceedStep1 = form.eventDate && form.eventType && (!isCustomEventType || form.eventTypeCustom) && form.city && (durationOptions.length === 0 ? form.durationCustom : (form.duration && (form.duration !== 'manual' || form.durationCustom)))
  const canProceedStep2 = form.clientName && form.clientEmail

  const inputStyle = {width:'100%',padding:'11px 14px',borderRadius:'12px',border:'1px solid #e7e5e4',fontSize:'13px',fontFamily:'Montserrat,sans-serif',color:'#1c1917',outline:'none',boxSizing:'border-box' as const,background:'#fafaf9'}
  const labelStyle = {display:'block',fontSize:'12px',fontWeight:600,color:'#44403c',marginBottom:'6px'}

  return (
    <div style={{minHeight:'100vh',background:'#f5f5f7',fontFamily:'Montserrat,sans-serif'}}>
      <nav style={{background:'white',borderBottom:'1px solid #e7e5e4',position:'sticky',top:0,zIndex:100}}>
        <div style={{maxWidth:'600px',margin:'0 auto',padding:'0 24px',height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <Link href={'/artist/' + slug} style={{display:'flex',alignItems:'center',gap:'6px',color:'#78716c',textDecoration:'none',fontSize:'13px',fontWeight:600}}><ArrowLeft size={14} /> Inapoi</Link>
          <Link href="/" style={{fontWeight:800,fontSize:'16px',color:'#1c1917',textDecoration:'none',letterSpacing:'-0.5px'}}>GIG<span style={{color:'#059669'}}>x</span></Link>
          <div style={{width:'60px'}}></div>
        </div>
      </nav>
      <div style={{maxWidth:'600px',margin:'0 auto',padding:'24px'}}>
        <div style={{background:'white',border:'1px solid #e7e5e4',borderRadius:'18px',padding:'20px',marginBottom:'14px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
          <div style={{fontSize:'10px',fontWeight:700,color:'#a8a29e',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'6px'}}>Solicita booking pentru</div>
          <h1 style={{fontSize:'20px',fontWeight:800,color:'#1c1917',margin:0,letterSpacing:'-0.5px'}}>{artist.artistName || 'Artist'}</h1>
          <div style={{fontSize:'12px',color:'#78716c',marginTop:'6px'}}>Raspuns in 30 minute</div>
        </div>
        <div style={{display:'flex',gap:'6px',marginBottom:'14px'}}>
          {[1,2,3].map(s => (<div key={s} style={{flex:1,height:'3px',background: step >= s ? '#059669' : '#e7e5e4',borderRadius:'2px'}}></div>))}
        </div>

        {step === 1 && (
          <div style={{background:'white',border:'1px solid #e7e5e4',borderRadius:'18px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
            <div style={{fontSize:'10px',fontWeight:700,color:'#a8a29e',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'14px'}}>Pasul 1 / 3 · Detalii eveniment</div>
            <div style={{marginBottom:'14px'}}>
              <label style={labelStyle}>Data evenimentului *</label>
              <div style={{background:'#fafaf9', border:'1px solid #e7e5e4', borderRadius:'12px', padding:'12px'}}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px'}}>
                  <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                    style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'8px', padding:'4px 6px', cursor:'pointer', display:'flex', alignItems:'center'}}>
                    <ChevronLeft size={14} color='#44403c' />
                  </button>
                  <div style={{fontSize:'13px', fontWeight:700, color:'#1c1917'}}>
                    {calendarMonth.toLocaleString('ro-RO', {month: 'long', year: 'numeric'}).toUpperCase()}
                  </div>
                  <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                    style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'8px', padding:'4px 6px', cursor:'pointer', display:'flex', alignItems:'center'}}>
                    <ChevronRight size={14} color='#44403c' />
                  </button>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'2px', marginBottom:'4px'}}>
                  {['L','M','M','J','V','S','D'].map((d, i) => (
                    <div key={i} style={{textAlign:'center', fontSize:'10px', fontWeight:700, color:'#a8a29e', padding:'4px'}}>{d}</div>
                  ))}
                </div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'2px'}}>
                  {(() => {
                    const year = calendarMonth.getFullYear()
                    const month = calendarMonth.getMonth()
                    const firstDay = new Date(year, month, 1)
                    const lastDay = new Date(year, month + 1, 0)
                    const startWeekday = (firstDay.getDay() + 6) % 7 // luni = 0
                    const days = []
                    for (let i = 0; i < startWeekday; i++) days.push(null)
                    for (let i = 1; i <= lastDay.getDate(); i++) days.push(i)
                    const today = new Date()
                    today.setHours(0,0,0,0)
                    return days.map((day, i) => {
                      if (!day) return <div key={'e'+i}></div>
                      const dateObj = new Date(year, month, day)
                      const dateStr = year + '-' + String(month+1).padStart(2,'0') + '-' + String(day).padStart(2,'0')
                      const isPast = dateObj < today
                      const isSelected = form.eventDate === dateStr
                      const isToday = dateObj.getTime() === today.getTime()
                      const dayOfWeek = dateObj.getDay() // 0=duminica, 5=vineri, 6=sambata
                      const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6
                      return (
                        <button key={day} type="button" disabled={isPast} onClick={() => setForm({...form, eventDate: dateStr})}
                          style={{
                            padding:'8px 0', borderRadius:'8px', border:'none', cursor: isPast ? 'not-allowed' : 'pointer',
                            background: isSelected ? '#059669' : (isToday ? '#fafaf9' : 'white'),
                            color: isSelected ? 'white' : (isPast ? '#d6d3d1' : (isWeekend ? '#1c1917' : '#78716c')),
                            fontSize:'12px', fontWeight: isSelected ? 700 : 500, fontFamily:'Montserrat,sans-serif',
                            border: isToday && !isSelected ? '1px solid #059669' : '1px solid transparent'
                          }}>{day}</button>
                      )
                    })
                  })()}
                </div>
              </div>
            </div>
            <div style={{marginBottom:'14px'}}>
              <label style={labelStyle}>Tip eveniment *</label>
              <select value={form.eventType} onChange={e => setForm({...form, eventType: e.target.value})} style={inputStyle}>
                <option value="">Selecteaza...</option>
                <option value="festival">Festival</option>
                <option value="popup">Pop-Up Event</option>
                <option value="citydays">City Days / Open Air</option>
                <option value="club">Club Night</option>
                <option value="corporate">Corporate</option>
                <option value="teambuilding">Team Building</option>
                <option value="poolparty">Pool Party</option>
                <option value="dayparty">Day Party</option>
                <option value="dinnershow">Dinner & Show</option>
                <option value="mall">Mall / Brand activation</option>
                <option value="nunta">Nunta</option>
                <option value="botez">Botez</option>
                <option value="private">Petrecere privata</option>
                <option value="revelion">Revelion / Craciun</option>
                <option value="altul">Nu stiu / Altele</option>
              </select>
              {isCustomEventType && (
                <input type="text" value={form.eventTypeCustom} onChange={e => setForm({...form, eventTypeCustom: e.target.value})} placeholder="Descrie tipul evenimentului" style={{...inputStyle, marginTop:'8px'}} />
              )}
            </div>
            <div style={{marginBottom:'14px', position:'relative'}}>
              <label style={labelStyle}>Oras *</label>
              <input type="text" value={form.city} onChange={e => { setForm({...form, city: e.target.value}); setShowCityDropdown(true) }} onFocus={() => setShowCityDropdown(true)} onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)} placeholder="Bucuresti" style={inputStyle} autoComplete="off" />
              {showCityDropdown && citySuggestions.length > 0 && (
                <div style={{position:'absolute', top:'100%', left:0, right:0, background:'white', border:'1px solid #e7e5e4', borderRadius:'12px', marginTop:'4px', boxShadow:'0 4px 12px rgba(0,0,0,0.08)', zIndex:50, maxHeight:'200px', overflowY:'auto'}}>
                  {citySuggestions.slice(0, 5).map((s: any) => (
                    <div key={s.place_id} onClick={() => { setForm({...form, city: s.structured_formatting?.main_text || s.description}); setShowCityDropdown(false) }}
                      style={{padding:'10px 14px', cursor:'pointer', fontSize:'13px', color:'#1c1917', borderBottom:'1px solid #f5f5f4'}}>
                      <div style={{fontWeight:600}}>{s.structured_formatting?.main_text || s.description}</div>
                      {s.structured_formatting?.secondary_text && <div style={{fontSize:'11px', color:'#78716c', marginTop:'2px'}}>{s.structured_formatting.secondary_text}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{marginBottom:'14px', position:'relative'}}>
              <label style={labelStyle}>Locatia evenimentului</label>
              <input type="text" value={form.venueName} onChange={e => { setForm({...form, venueName: e.target.value}); setShowVenueDropdown(true) }} onFocus={() => setShowVenueDropdown(true)} onBlur={() => setTimeout(() => setShowVenueDropdown(false), 200)} placeholder="Crown Plaza, Beraria H..." style={inputStyle} autoComplete="off" />
              {showVenueDropdown && venueSuggestions.length > 0 && (
                <div style={{position:'absolute', top:'100%', left:0, right:0, background:'white', border:'1px solid #e7e5e4', borderRadius:'12px', marginTop:'4px', boxShadow:'0 4px 12px rgba(0,0,0,0.08)', zIndex:50, maxHeight:'200px', overflowY:'auto'}}>
                  {venueSuggestions.slice(0, 5).map((s: any) => (
                    <div key={s.place_id} onClick={() => { setForm({...form, venueName: s.structured_formatting?.main_text || s.description}); setShowVenueDropdown(false) }}
                      style={{padding:'10px 14px', cursor:'pointer', fontSize:'13px', color:'#1c1917', borderBottom:'1px solid #f5f5f4'}}>
                      <div style={{fontWeight:600}}>{s.structured_formatting?.main_text || s.description}</div>
                      {s.structured_formatting?.secondary_text && <div style={{fontSize:'11px', color:'#78716c', marginTop:'2px'}}>{s.structured_formatting.secondary_text}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{marginBottom:'14px'}}>
              <label style={labelStyle}>Durata *</label>
              {durationOptions.length > 0 ? (
                <>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                    {durationOptions.map(opt => (
                      <button key={opt} type="button" onClick={() => setForm({...form, duration: opt})}
                        style={{padding:'8px 14px',borderRadius:'10px',border:form.duration === opt ? '1.5px solid #059669' : '1px solid #e7e5e4',background: form.duration === opt ? '#dcfce7' : 'white',fontSize:'12px',fontWeight:600,color: form.duration === opt ? '#059669' : '#44403c',cursor:'pointer',fontFamily:'Montserrat,sans-serif'}}>
                        {opt}
                      </button>
                    ))}
                    <button type="button" onClick={() => setForm({...form, duration: 'manual'})}
                      style={{padding:'8px 14px',borderRadius:'10px',border:form.duration === 'manual' ? '1.5px solid #059669' : '1px solid #e7e5e4',background: form.duration === 'manual' ? '#dcfce7' : 'white',fontSize:'12px',fontWeight:600,color: form.duration === 'manual' ? '#059669' : '#44403c',cursor:'pointer',fontFamily:'Montserrat,sans-serif'}}>
                      Manual
                    </button>
                  </div>
                  {form.duration === 'manual' && (
                    <input type="text" value={form.durationCustom} onChange={e => setForm({...form, durationCustom: e.target.value})} placeholder="Ex: 30 min, 2x60 min..." style={{...inputStyle, marginTop:'8px'}} />
                  )}
                </>
              ) : (
                <input type="text" value={form.durationCustom} onChange={e => setForm({...form, durationCustom: e.target.value})} placeholder="Ex: 30 min, 45 min, 2 show-uri..." style={inputStyle} />
              )}
            </div>
            <button onClick={() => setStep(2)} disabled={!canProceedStep1} style={{width:'100%',padding:'14px',borderRadius:'12px',border:'none',background: canProceedStep1 ? '#1c1917' : '#d6d3d1',color:'white',fontSize:'14px',fontWeight:700,fontFamily:'Montserrat,sans-serif',cursor: canProceedStep1 ? 'pointer' : 'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>Continua <ArrowRight size={14} /></button>
          </div>
        )}

        {step === 2 && (
          <div style={{background:'white',border:'1px solid #e7e5e4',borderRadius:'18px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
            <div style={{fontSize:'10px',fontWeight:700,color:'#a8a29e',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'14px'}}>Pasul 2 / 3 · Datele tale</div>
            <div style={{marginBottom:'14px'}}>
              <label style={labelStyle}>Nume *</label>
              <input type="text" value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} placeholder="Nume si prenume" style={inputStyle} />
            </div>
            <div style={{marginBottom:'14px'}}>
              <label style={labelStyle}>Email *</label>
              <input type="email" value={form.clientEmail} onChange={e => setForm({...form, clientEmail: e.target.value})} placeholder="email@exemplu.ro" style={inputStyle} />
            </div>
            <div style={{marginBottom:'14px'}}>
              <label style={labelStyle}>Telefon</label>
              <input type="tel" value={form.clientPhone} onChange={e => setForm({...form, clientPhone: e.target.value})} placeholder="07XX XXX XXX" style={inputStyle} />
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={() => setStep(1)} style={{flex:'0 0 80px',padding:'14px',borderRadius:'12px',border:'1px solid #e7e5e4',background:'white',color:'#44403c',fontSize:'13px',fontWeight:600,fontFamily:'Montserrat,sans-serif',cursor:'pointer'}}>Inapoi</button>
              <button onClick={() => setStep(3)} disabled={!canProceedStep2} style={{flex:1,padding:'14px',borderRadius:'12px',border:'none',background: canProceedStep2 ? '#1c1917' : '#d6d3d1',color:'white',fontSize:'14px',fontWeight:700,fontFamily:'Montserrat,sans-serif',cursor: canProceedStep2 ? 'pointer' : 'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>Continua <ArrowRight size={14} /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{background:'white',border:'1px solid #e7e5e4',borderRadius:'18px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
            <div style={{fontSize:'10px',fontWeight:700,color:'#a8a29e',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'14px'}}>Pasul 3 / 3 · Detalii finale</div>
            <div style={{marginBottom:'14px'}}>
              <label style={labelStyle}>Buget estimativ (EUR)</label>
              <input type="number" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} placeholder="Ex: 5000" style={inputStyle} />
            </div>
            <div style={{marginBottom:'14px'}}>
              <label style={labelStyle}>Mesaj (optional)</label>
              <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Detalii suplimentare..." rows={5} style={{...inputStyle, resize:'vertical'}} />
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={() => setStep(2)} style={{flex:'0 0 80px',padding:'14px',borderRadius:'12px',border:'1px solid #e7e5e4',background:'white',color:'#44403c',fontSize:'13px',fontWeight:600,fontFamily:'Montserrat,sans-serif',cursor:'pointer'}}>Inapoi</button>
              <button onClick={handleSubmit} disabled={submitting} style={{flex:1,padding:'14px',borderRadius:'12px',border:'none',background:'#059669',color:'white',fontSize:'14px',fontWeight:700,fontFamily:'Montserrat,sans-serif',cursor: submitting ? 'wait' : 'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>{submitting ? 'Se trimite...' : <>Trimite cererea <ArrowRight size={14} /></>}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
