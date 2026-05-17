'use client'

import { useState } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  artist?: string
  eventDate?: string
  location?: string
  budgetMin?: number
  budgetMax?: number
}

export default function PriceExactModal({ isOpen, onClose, artist, eventDate, location, budgetMin, budgetMax }: Props) {
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  if (!isOpen) return null

  const message = encodeURIComponent(
    `Cerere pret exact Concert Exchange\n` +
    `Artist: ${artist || 'necunoscut'}\n` +
    `Data: ${eventDate || 'necunoscuta'}\n` +
    `Locatie: ${location || 'necunoscuta'}\n` +
    `Buget estimat: ${budgetMin || 0}-${budgetMax || 0}€\n` +
    `Telefon client: ${phone}\n` +
    `Email client: ${email}`
  )

  const handleSubmit = () => {
    if (!phone) return
    window.open(`https://wa.me/40751144109?text=${message}`, '_blank')
    window.open(`mailto:me@bogdannita.ro?subject=Cerere pret exact Concert Exchange&body=${message}`, '_blank')
    setSent(true)
  }

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:'Montserrat,sans-serif'}}
      onClick={onClose}>
      <div style={{background:'white', borderRadius:'24px', padding:'32px', width:'100%', maxWidth:'420px'}}
        onClick={e => e.stopPropagation()}>
        {sent ? (
          <div style={{textAlign:'center', padding:'20px 0'}}>
            <div style={{fontSize:'48px', marginBottom:'16px'}}>🎯</div>
            <div style={{fontWeight:800, fontSize:'20px', color:'#1c1917', marginBottom:'8px'}}>Cerere trimisa!</div>
            <div style={{fontWeight:700, fontSize:'14px', color:'#d97706', marginBottom:'4px'}}>Confirmam pretul exact in 30 min.</div>
            <div style={{fontSize:'12px', color:'#a8a29e', marginBottom:'24px'}}>Verifica WhatsApp si email-ul.</div>
            <button onClick={() => { onClose(); setSent(false); setPhone(''); setEmail('') }}
              style={{background:'#1c1917', color:'white', padding:'12px 32px', borderRadius:'12px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif'}}>
              Inchide
            </button>
          </div>
        ) : (
          <>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px'}}>
              <div>
                <div style={{fontWeight:800, fontSize:'18px', color:'#1c1917', marginBottom:'4px'}}>🎯 Pretul exact in 30 min</div>
                <div style={{display:'inline-flex', alignItems:'center', gap:'6px', background:'#fef3c7', border:'1px solid #fde68a', borderRadius:'20px', padding:'4px 12px', marginTop:'4px'}}>
                  <div style={{width:'6px', height:'6px', borderRadius:'50%', background:'#d97706'}} />
                  <span style={{fontSize:'11px', fontWeight:700, color:'#92400e'}}>Garantat. Fara surprize.</span>
                </div>
              </div>
              <button onClick={onClose} style={{background:'none', border:'none', cursor:'pointer', fontSize:'20px', color:'#a8a29e'}}>✕</button>
            </div>

            {artist && (
              <div style={{background:'#f5f5f4', borderRadius:'12px', padding:'12px 16px', marginBottom:'16px', fontSize:'12px', color:'#78716c'}}>
                <div style={{fontWeight:700, color:'#1c1917', marginBottom:'4px'}}>Cerere pentru:</div>
                <div>{artist} • {eventDate} • {location}</div>
                <div style={{marginTop:'4px', fontWeight:700, color:'#1c1917'}}>{budgetMin?.toLocaleString()}–{budgetMax?.toLocaleString()}€ estimat</div>
              </div>
            )}

            <div style={{display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px'}}>
              <div>
                <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Telefon / WhatsApp</div>
                <input type="tel" placeholder="+40 7xx xxx xxx" value={phone} onChange={e => setPhone(e.target.value)}
                  style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid ' + (phone ? '#22c55e' : '#e7e5e4'), fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
              </div>
              <div>
                <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Email</div>
                <input type="email" placeholder="email@tau.ro" value={email} onChange={e => setEmail(e.target.value)}
                  style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
              </div>
            </div>

            <button onClick={handleSubmit} disabled={!phone}
              style={{width:'100%', background: phone ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#e7e5e4', color: phone ? 'white' : '#a8a29e', padding:'14px', borderRadius:'12px', border:'none', cursor: phone ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:800, fontFamily:'Montserrat,sans-serif', boxShadow: phone ? '0 4px 16px rgba(245,158,11,0.3)' : 'none', transition:'all 0.2s'}}>
              🎯 Confirma — pretul exact in 30 min
            </button>
            <div style={{textAlign:'center', fontSize:'11px', color:'#a8a29e', marginTop:'10px'}}>
              Te contactam pe WhatsApp sau email
            </div>
          </>
        )}
      </div>
    </div>
  )
}
