'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function BookArtistPage() {
  const params = useParams()
  const slug = params.slug as string

  const [artist, setArtist] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    eventDate: '', eventType: '', city: '', venueName: '', duration: '',
    budget: '', clientName: '', clientEmail: '', clientPhone: '', message: '',
  })

  useEffect(() => {
    const fetchArtist = async () => {
      const { data } = await supabase.from('artists').select('*').eq('slug', slug).single()
      setArtist(data)
      setLoading(false)
    }
    fetchArtist()
  }, [slug])

  const handleSubmit = async () => {
    if (!artist) return
    setSubmitting(true)
    const { error } = await supabase.from('requests').insert({
      artist_id: artist.id,
      event_date: form.eventDate || null,
      event_type: form.eventType,
      city: form.city,
      venue_name: form.venueName,
      duration: form.duration,
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

  const canProceedStep1 = form.eventDate && form.eventType && form.city
  const canProceedStep2 = form.clientName && form.clientEmail

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
              <label style={{display:'block',fontSize:'12px',fontWeight:600,color:'#44403c',marginBottom:'6px'}}>Data evenimentului *</label>
              <input type="date" value={form.eventDate} onChange={e => setForm({...form, eventDate: e.target.value})} style={{width:'100%',padding:'11px 14px',borderRadius:'12px',border:'1px solid #e7e5e4',fontSize:'13px',fontFamily:'Montserrat,sans-serif',color:'#1c1917',outline:'none',boxSizing:'border-box',background:'#fafaf9'}} />
            </div>
            <div style={{marginBottom:'14px'}}>
              <label style={{display:'block',fontSize:'12px',fontWeight:600,color:'#44403c',marginBottom:'6px'}}>Tip eveniment *</label>
              <select value={form.eventType} onChange={e => setForm({...form, eventType: e.target.value})} style={{width:'100%',padding:'11px 14px',borderRadius:'12px',border:'1px solid #e7e5e4',fontSize:'13px',fontFamily:'Montserrat,sans-serif',color:'#1c1917',outline:'none',boxSizing:'border-box',background:'#fafaf9'}}>
                <option value="">Selecteaza...</option>
                <option value="club">Club / Bar</option>
                <option value="festival">Festival</option>
                <option value="corporate">Corporate event</option>
                <option value="privat">Petrecere privata</option>
                <option value="nunta">Nunta</option>
                <option value="restaurant">Restaurant / Terasa</option>
                <option value="rooftop">Rooftop / Day party</option>
                <option value="altul">Altul</option>
              </select>
            </div>
            <div style={{marginBottom:'14px'}}>
              <label style={{display:'block',fontSize:'12px',fontWeight:600,color:'#44403c',marginBottom:'6px'}}>Oras *</label>
              <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="Bucuresti" style={{width:'100%',padding:'11px 14px',borderRadius:'12px',border:'1px solid #e7e5e4',fontSize:'13px',fontFamily:'Montserrat,sans-serif',color:'#1c1917',outline:'none',boxSizing:'border-box',background:'#fafaf9'}} />
            </div>
            <div style={{marginBottom:'14px'}}>
              <label style={{display:'block',fontSize:'12px',fontWeight:600,color:'#44403c',marginBottom:'6px'}}>Locatia evenimentului</label>
              <input type="text" value={form.venueName} onChange={e => setForm({...form, venueName: e.target.value})} placeholder="Crown Plaza, Beraria H..." style={{width:'100%',padding:'11px 14px',borderRadius:'12px',border:'1px solid #e7e5e4',fontSize:'13px',fontFamily:'Montserrat,sans-serif',color:'#1c1917',outline:'none',boxSizing:'border-box',background:'#fafaf9'}} />
            </div>
            <div style={{marginBottom:'14px'}}>
              <label style={{display:'block',fontSize:'12px',fontWeight:600,color:'#44403c',marginBottom:'6px'}}>Durata</label>
              <select value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} style={{width:'100%',padding:'11px 14px',borderRadius:'12px',border:'1px solid #e7e5e4',fontSize:'13px',fontFamily:'Montserrat,sans-serif',color:'#1c1917',outline:'none',boxSizing:'border-box',background:'#fafaf9'}}>
                <option value="">Selecteaza...</option>
                <option value="45 min">45 minute</option>
                <option value="60 min">60 minute</option>
                <option value="90 min">90 minute</option>
                <option value="120 min">2 ore</option>
                <option value="180 min">3 ore</option>
                <option value="all night">All night</option>
              </select>
            </div>
            <button onClick={() => setStep(2)} disabled={!canProceedStep1} style={{width:'100%',padding:'14px',borderRadius:'12px',border:'none',background: canProceedStep1 ? '#1c1917' : '#d6d3d1',color:'white',fontSize:'14px',fontWeight:700,fontFamily:'Montserrat,sans-serif',cursor: canProceedStep1 ? 'pointer' : 'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>Continua <ArrowRight size={14} /></button>
          </div>
        )}
        {step === 2 && (
          <div style={{background:'white',border:'1px solid #e7e5e4',borderRadius:'18px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
            <div style={{fontSize:'10px',fontWeight:700,color:'#a8a29e',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'14px'}}>Pasul 2 / 3 · Datele tale</div>
            <div style={{marginBottom:'14px'}}>
              <label style={{display:'block',fontSize:'12px',fontWeight:600,color:'#44403c',marginBottom:'6px'}}>Nume *</label>
              <input type="text" value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} placeholder="Nume si prenume" style={{width:'100%',padding:'11px 14px',borderRadius:'12px',border:'1px solid #e7e5e4',fontSize:'13px',fontFamily:'Montserrat,sans-serif',color:'#1c1917',outline:'none',boxSizing:'border-box',background:'#fafaf9'}} />
            </div>
            <div style={{marginBottom:'14px'}}>
              <label style={{display:'block',fontSize:'12px',fontWeight:600,color:'#44403c',marginBottom:'6px'}}>Email *</label>
              <input type="email" value={form.clientEmail} onChange={e => setForm({...form, clientEmail: e.target.value})} placeholder="email@exemplu.ro" style={{width:'100%',padding:'11px 14px',borderRadius:'12px',border:'1px solid #e7e5e4',fontSize:'13px',fontFamily:'Montserrat,sans-serif',color:'#1c1917',outline:'none',boxSizing:'border-box',background:'#fafaf9'}} />
            </div>
            <div style={{marginBottom:'14px'}}>
              <label style={{display:'block',fontSize:'12px',fontWeight:600,color:'#44403c',marginBottom:'6px'}}>Telefon</label>
              <input type="tel" value={form.clientPhone} onChange={e => setForm({...form, clientPhone: e.target.value})} placeholder="07XX XXX XXX" style={{width:'100%',padding:'11px 14px',borderRadius:'12px',border:'1px solid #e7e5e4',fontSize:'13px',fontFamily:'Montserrat,sans-serif',color:'#1c1917',outline:'none',boxSizing:'border-box',background:'#fafaf9'}} />
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
              <label style={{display:'block',fontSize:'12px',fontWeight:600,color:'#44403c',marginBottom:'6px'}}>Buget estimativ (EUR)</label>
              <input type="number" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} placeholder="Ex: 5000" style={{width:'100%',padding:'11px 14px',borderRadius:'12px',border:'1px solid #e7e5e4',fontSize:'13px',fontFamily:'Montserrat,sans-serif',color:'#1c1917',outline:'none',boxSizing:'border-box',background:'#fafaf9'}} />
            </div>
            <div style={{marginBottom:'14px'}}>
              <label style={{display:'block',fontSize:'12px',fontWeight:600,color:'#44403c',marginBottom:'6px'}}>Mesaj (optional)</label>
              <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Detalii suplimentare..." rows={5} style={{width:'100%',padding:'11px 14px',borderRadius:'12px',border:'1px solid #e7e5e4',fontSize:'13px',fontFamily:'Montserrat,sans-serif',color:'#1c1917',outline:'none',boxSizing:'border-box',background:'#fafaf9',resize:'vertical'}} />
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
