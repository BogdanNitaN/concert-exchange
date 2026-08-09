'use client'

import { useState } from 'react'
import { formatDataRo } from '@/lib/format-data'
import { X, MessageCircle, Mail, CheckCircle2, Shield } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  artists?: any[]
  eventDate?: string
  location?: string
  locationCity?: string
  budget?: number
  guestCount?: number
}

export default function PriceExactModal({ isOpen, onClose, artists = [], eventDate, location, locationCity, budget, guestCount }: Props) {
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [sent, setSent] = useState(false)
  const [honeypot, setHoneypot] = useState('')

  if (!isOpen) return null

  const artistNames = artists.map(a => {
    const tier = a.tier === 'Premium' ? 'A++ Icon' : a.tier === 'A+' ? 'A+ Premium' : 'A Select'
    return `${a.name} (${tier})`
  }).join(', ')

  const handleSubmit = () => {
    if (!phone || !name || honeypot) return

    const lines = [
      'Cerere pret exact — GIGx',
      '',
      'ARTISTI SOLICITATI:',
      artistNames,
      '',
      'DETALII EVENIMENT:',
      `Data: ${eventDate ? formatDataRo(eventDate) : 'nespecificata'}`,
      `Locatie: ${location || 'nespecificata'}${locationCity ? ' — ' + locationCity : ''}`,
      `Nr invitati: ${guestCount || 'nespecificat'}`,
      `Buget client: ${budget ? budget.toLocaleString() + ' EUR' : 'nespecificat'}`,
      '',
      'DATE CONTACT:',
      `Nume: ${name || 'nespecificat'}`,
      `Telefon: ${phone}`,
      `Email: ${email || 'nespecificat'}`,
    ]

    const msg = encodeURIComponent(lines.join('\n'))
    const subject = encodeURIComponent('Cerere pret exact — GIGx')
    const body = encodeURIComponent(lines.join('\n'))

    window.open(`https://wa.me/40751144109?text=${msg}`, '_blank')

    setSent(true)
  }

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:'Montserrat,sans-serif'}}
      onClick={onClose}>
      <div style={{background:'white', borderRadius:'24px', padding:'32px', width:'100%', maxWidth:'440px', boxShadow:'0 24px 64px rgba(0,0,0,0.2)'}}
        onClick={e => e.stopPropagation()}>

        {sent ? (
          <div style={{textAlign:'center', padding:'20px 0'}}>
            <div style={{display:'flex', justifyContent:'center', marginBottom:'20px'}}>
              <CheckCircle2 size={56} color='#059669' strokeWidth={1.5} />
            </div>
            <div style={{fontWeight:800, fontSize:'22px', color:'#1c1917', marginBottom:'8px'}}>Cerere trimisă!</div>
            <div style={{fontWeight:600, fontSize:'14px', color:'#059669', marginBottom:'6px'}}>Confirmăm prețul exact în 30 min.</div>
            <div style={{fontSize:'13px', color:'#78716c', marginBottom:'28px'}}>Verifică WhatsApp și email-ul.</div>
            <button onClick={() => { onClose(); setSent(false); setPhone(''); setEmail(''); setName('') }}
              style={{background:'#1c1917', color:'white', padding:'13px 32px', borderRadius:'14px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif'}}>
              Închide
            </button>
          </div>
        ) : (
          <>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px'}}>
              <div>
                <div style={{fontWeight:800, fontSize:'20px', color:'#1c1917', marginBottom:'6px'}}>Prețul exact în 30 min</div>
                <div style={{display:'inline-flex', alignItems:'center', gap:'6px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'20px', padding:'4px 12px'}}>
                  <Shield size={11} color='#059669' strokeWidth={2} />
                  <span style={{fontSize:'11px', fontWeight:700, color:'#059669'}}>Garantat. Fără surprize.</span>
                </div>
              </div>
              <button onClick={onClose} style={{background:'none', border:'none', cursor:'pointer', color:'#a8a29e', padding:'4px'}}>
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            {artists.length > 0 && (
              <div style={{background:'#fafaf9', border:'1px solid #f0f0ef', borderRadius:'14px', padding:'14px 16px', marginBottom:'20px'}}>
                <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'10px'}}>Cerere pentru</div>
                <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                  {artists.map(a => {
                    const tier = a.tier === 'Premium' ? 'A++ · Icon' : a.tier === 'A+' ? 'A+ · Premium' : 'A · Select'
                    const tierBg = a.tier === 'Premium' ? '#1c1917' : a.tier === 'A+' ? '#7c3aed' : '#f5f5f4'
                    const tierColor = a.tier === 'A' ? '#44403c' : 'white'
                    return (
                      <div key={a.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                        <span style={{fontSize:'13px', fontWeight:700, color:'#1c1917'}}>{a.name}</span>
                        <span style={{fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', background: tierBg, color: tierColor}}>{tier}</span>
                      </div>
                    )
                  })}
                </div>
                <div style={{borderTop:'1px solid #f0f0ef', marginTop:'10px', paddingTop:'10px', display:'flex', flexDirection:'column', gap:'4px'}}>
                  {eventDate && <div style={{fontSize:'12px', color:'#78716c'}}>Data: <strong>{formatDataRo(eventDate)}</strong></div>}
                  {location && <div style={{fontSize:'12px', color:'#78716c'}}>Locație: <strong>{location}{locationCity ? ' — ' + locationCity : ''}</strong></div>}
                  {guestCount && <div style={{fontSize:'12px', color:'#78716c'}}>Invitați: <strong>{guestCount}</strong></div>}
                  {budget && <div style={{fontSize:'12px', color:'#78716c'}}>Buget: <strong>{budget.toLocaleString()} EUR</strong></div>}
                </div>
              </div>
            )}

            <div style={{display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px'}}>
              <input type="text" value={honeypot} onChange={e => setHoneypot(e.target.value)} style={{display:'none'}} tabIndex={-1} autoComplete="off" />
              <div>
                <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>Nume și prenume</div>
                <input type="text" placeholder="ex: Ion Popescu" value={name} onChange={e => setName(e.target.value)}
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
            </div>

            <button onClick={handleSubmit} disabled={!phone}
              style={{width:'100%', background: phone && name ? '#1c1917' : '#e7e5e4', color: phone && name ? 'white' : '#a8a29e', padding:'14px', borderRadius:'14px', border:'none', cursor: phone && name ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif', marginBottom:'12px', transition:'all 0.2s'}}>
              Confirmă — prețul exact în 30 min
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
