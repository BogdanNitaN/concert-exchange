'use client'

import { useState } from 'react'
import { X, CheckCircle2, Shield, MessageCircle, Mail } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  eventDate?: string
  guestCount?: number
  selectedCity?: string
}

export default function ExpertModal({ isOpen, onClose, eventDate, guestCount, selectedCity }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState(selectedCity || '')
  const [desc, setDesc] = useState('')
  const [sent, setSent] = useState(false)

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!phone) return

    const lines = [
      'Cerere pachet complet — Concert Exchange',
      '',
      'DATE CONTACT:',
      `Nume: ${name || 'nespecificat'}`,
      `Telefon: ${phone}`,
      `Email: ${email || 'nespecificat'}`,
      '',
      'DETALII EVENIMENT:',
      `Oras: ${city || 'nespecificat'}`,
      `Data: ${eventDate || 'nespecificata'}`,
      `Nr invitati: ${guestCount || 'nespecificat'}`,
      '',
      'DESCRIERE:',
      desc || 'nespecificat',
    ]

    const msg = encodeURIComponent(lines.join('\n'))
    const subject = encodeURIComponent('Pachet complet — Concert Exchange')
    const body = encodeURIComponent(lines.join('\n'))

    window.open(`https://wa.me/40751144109?text=${msg}`, '_blank')
    setTimeout(() => {
      window.open(`mailto:me@bogdannita.ro?subject=${subject}&body=${body}`, '_blank')
    }, 500)

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
            <div style={{fontWeight:600, fontSize:'14px', color:'#059669', marginBottom:'6px'}}>Un expert te contactează în mai puțin de 30 min.</div>
            <div style={{fontSize:'13px', color:'#78716c', marginBottom:'28px'}}>Verifică WhatsApp și email-ul.</div>
            <button onClick={() => { onClose(); setSent(false); setName(''); setPhone(''); setEmail(''); setDesc('') }}
              style={{background:'#1c1917', color:'white', padding:'13px 32px', borderRadius:'14px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif'}}>
              Închide
            </button>
          </div>
        ) : (
          <>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px'}}>
              <div>
                <div style={{fontWeight:800, fontSize:'20px', color:'#1c1917', marginBottom:'6px'}}>Pachet complet</div>
                <div style={{display:'inline-flex', alignItems:'center', gap:'6px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'20px', padding:'4px 12px'}}>
                  <Shield size={11} color='#059669' strokeWidth={2} />
                  <span style={{fontSize:'11px', fontWeight:700, color:'#059669'}}>Răspuns în mai puțin de 30 min</span>
                </div>
              </div>
              <button onClick={onClose} style={{background:'none', border:'none', cursor:'pointer', color:'#a8a29e', padding:'4px'}}>
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px'}}>
              <div>
                <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>Nume și prenume *</div>
                <input type="text" placeholder="Ion Popescu" value={name} onChange={e => setName(e.target.value)}
                  style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
              </div>
              <div>
                <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>Telefon / WhatsApp *</div>
                <input type="tel" placeholder="+40 7xx xxx xxx" value={phone} onChange={e => setPhone(e.target.value)}
                  style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1.5px solid ' + (phone ? '#059669' : '#e7e5e4'), fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
              </div>
              <div>
                <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>Email</div>
                <input type="email" placeholder="email@tau.ro" value={email} onChange={e => setEmail(e.target.value)}
                  style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
              </div>
              <div>
                <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>Orașul evenimentului</div>
                <input type="text" placeholder="ex: București, Cluj-Napoca..." value={city} onChange={e => setCity(e.target.value)}
                  style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
              </div>
              <div>
                <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>Descrie ce îți dorești</div>
                <textarea rows={3} placeholder="ex: nuntă 200 persoane, pachet complet DJ + formație + dansatori, buget aproximativ..." value={desc} onChange={e => setDesc(e.target.value)}
                  style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', resize:'none', boxSizing:'border-box'}} />
              </div>
            </div>

            <button onClick={handleSubmit} disabled={!phone}
              style={{width:'100%', background: phone ? '#1c1917' : '#e7e5e4', color: phone ? 'white' : '#a8a29e', padding:'14px', borderRadius:'14px', border:'none', cursor: phone ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif', marginBottom:'12px', transition:'all 0.2s'}}>
              Trimite — răspuns în 30 min
            </button>

            <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'16px'}}>
              <div style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'11px', color:'#78716c'}}>
                <MessageCircle size={13} strokeWidth={2} color='#059669' /> WhatsApp
              </div>
              <div style={{width:'3px', height:'3px', borderRadius:'50%', background:'#e7e5e4'}} />
              <div style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'11px', color:'#78716c'}}>
                <Mail size={13} strokeWidth={2} color='#059669' /> Email
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
