'use client'

import { useState } from 'react'
import { X, CheckCircle2, MessageCircle, Mail } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  eventDate?: string
  guestCount?: number
  selectedCity?: string
  artists?: string[]
  eventLabel?: string
  descPlaceholder?: string
  title?: string
}

export default function ExpertModal({ isOpen, onClose, eventDate, guestCount, selectedCity, artists, eventLabel, descPlaceholder, title }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState(selectedCity || '')
  const [desc, setDesc] = useState('')
  const [sendEmail, setSendEmail] = useState(false)
  const [sent, setSent] = useState(false)
  const [honeypot, setHoneypot] = useState('')

  if (!isOpen) return null

  const canSubmit = name && phone && !honeypot

  const handleSubmit = () => {
    if (!canSubmit) return

    const lines = [
      'Vorbește cu un expert — GIGx',
      '',
      'DETALII EVENIMENT:',
      eventLabel ? `Tip: ${eventLabel}` : '',
      artists && artists.length ? `Artiști: ${artists.join(', ')}` : '',
      eventDate ? `Data: ${eventDate}` : '',
      `Oras: ${city || selectedCity || 'nespecificat'}`,
      guestCount ? `Participanti: ${guestCount}` : '',
      desc ? `Descriere: ${desc}` : '',
      '',
      'DATE CONTACT:',
      `Nume: ${name}`,
      `Telefon: ${phone}`,
      email ? `Email: ${email}` : '',
    ].filter(Boolean)

    const msg = encodeURIComponent(lines.join('\n'))
    window.open(`https://wa.me/40751144109?text=${msg}`, '_blank')

    if (sendEmail && email) {
      setTimeout(() => {
        const subject = encodeURIComponent('Vorbește cu un expert — GIGx')
        const body = encodeURIComponent(lines.join('\n'))
        window.open(`mailto:bogdan@gigx.ro?subject=${subject}&body=${body}`, '_blank')
      }, 500)
    }

    setSent(true)
  }

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:'Montserrat,sans-serif'}}
      onClick={onClose}>
      <div style={{background:'white', borderRadius:'24px', padding:'32px', width:'100%', maxWidth:'440px', boxShadow:'0 24px 64px rgba(0,0,0,0.2)', maxHeight:'90vh', overflowY:'auto'}}
        onClick={e => e.stopPropagation()}>

        {sent ? (
          <div style={{textAlign:'center', padding:'20px 0'}}>
            <div style={{display:'flex', justifyContent:'center', marginBottom:'20px'}}>
              <CheckCircle2 size={56} color='#059669' strokeWidth={1.5} />
            </div>
            <div style={{fontWeight:800, fontSize:'22px', color:'#1c1917', marginBottom:'8px'}}>Mesaj trimis!</div>
            <div style={{fontWeight:600, fontSize:'14px', color:'#059669', marginBottom:'24px'}}>Expertul te contactează în mai puțin de 30 min.</div>
            <button onClick={() => { onClose(); setSent(false); setName(''); setPhone(''); setEmail(''); setDesc('') }}
              style={{background:'#1c1917', color:'white', padding:'13px 32px', borderRadius:'14px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif'}}>
              Închide
            </button>
          </div>
        ) : (
          <>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px'}}>
              <div>
                <div style={{fontWeight:800, fontSize:'22px', color:'#1c1917', marginBottom:'6px'}}>{title || 'Vorbește cu un expert'}</div>
                <div style={{fontSize:'13px', color:'#059669', fontWeight:700}}>Răspuns garantat în mai puțin de 30 min.</div>
              </div>
              <button onClick={onClose} style={{background:'none', border:'none', cursor:'pointer', color:'#a8a29e', padding:'4px'}}>
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <input type="text" value={honeypot} onChange={e => setHoneypot(e.target.value)} style={{display:'none'}} tabIndex={-1} />

            <div style={{display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px'}}>
              <div>
                <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>Nume și prenume *</div>
                <input type="text" placeholder="Ion Popescu" value={name} onChange={e => setName(e.target.value)}
                  style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1.5px solid ' + (name ? '#059669' : '#e7e5e4'), fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
              </div>
              <div>
                <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>Telefon / WhatsApp *</div>
                <input type="tel" placeholder="+40 7xx xxx xxx" value={phone} onChange={e => setPhone(e.target.value)}
                  style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1.5px solid ' + (phone ? '#059669' : '#e7e5e4'), fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
              </div>
              <div>
                <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>Orașul evenimentului</div>
                <input type="text" placeholder="ex: București, Cluj..." value={city} onChange={e => setCity(e.target.value)}
                  style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
              </div>
              {eventDate && (
                <div style={{background:'#f5f5f4', borderRadius:'10px', padding:'10px 14px', fontSize:'12px', color:'#78716c'}}>
                  Data evenimentului: <strong style={{color:'#1c1917'}}>{eventDate}</strong>
                  {guestCount ? ` · ${guestCount} participanți` : ''}
                </div>
              )}
              <div>
                <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>Ce îți dorești?</div>
                <textarea rows={3} placeholder={descPlaceholder || "ex: nuntă 200 persoane, buget 5.000€, vreau DJ + formație..."} value={desc} onChange={e => setDesc(e.target.value)}
                  style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', resize:'none', boxSizing:'border-box'}} />
              </div>

              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <input type="checkbox" id="sendEmail" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)}
                  style={{width:'16px', height:'16px', cursor:'pointer', accentColor:'#059669'}} />
                <label htmlFor="sendEmail" style={{fontSize:'13px', color:'#78716c', cursor:'pointer'}}>
                  Trimite și pe email
                </label>
              </div>

              {sendEmail && (
                <div>
                  <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>Email</div>
                  <input type="email" placeholder="email@tau.ro" value={email} onChange={e => setEmail(e.target.value)}
                    style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
                </div>
              )}
            </div>

            <button onClick={handleSubmit} disabled={!canSubmit}
              style={{width:'100%', background: canSubmit ? '#1c1917' : '#e7e5e4', color: canSubmit ? 'white' : '#a8a29e', padding:'14px', borderRadius:'14px', border:'none', cursor: canSubmit ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif', marginBottom:'12px', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
              <MessageCircle size={16} strokeWidth={2} />
              Trimite pe WhatsApp
            </button>

            <div style={{textAlign:'center', fontSize:'11px', color:'#a8a29e'}}>
              Răspuns garantat în 30 min · Gratuit
            </div>
          </>
        )}
      </div>
    </div>
  )
}
