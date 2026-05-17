'use client'

import { useState } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function ExpertModal({ isOpen, onClose }: Props) {
  const [phone, setPhone] = useState('')
  const [desc, setDesc] = useState('')
  const [sent, setSent] = useState(false)

  if (!isOpen) return null

  const handleSubmit = () => {
    const parts = ['Cerere pachet complet Concert Exchange', 'Telefon: ' + phone, 'Descriere: ' + desc]
    const msg = encodeURIComponent(parts.join('\n'))
    window.open('https://wa.me/40751144109?text=' + msg, '_blank')
    window.open('mailto:me@bogdannita.ro?subject=Pachet complet Concert Exchange&body=' + msg, '_blank')
    setSent(true)
  }

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:'Montserrat,sans-serif'}}
      onClick={onClose}>
      <div style={{background:'white', borderRadius:'24px', padding:'32px', width:'100%', maxWidth:'440px'}}
        onClick={e => e.stopPropagation()}>
        {sent ? (
          <div style={{textAlign:'center', padding:'20px 0'}}>
            <div style={{fontSize:'48px', marginBottom:'16px'}}>🎯</div>
            <div style={{fontWeight:800, fontSize:'20px', color:'#1c1917', marginBottom:'8px'}}>Mesaj trimis!</div>
            <div style={{fontWeight:700, fontSize:'14px', color:'#d97706', marginBottom:'24px'}}>Un expert te contactează în mai puțin de 30 min.</div>
            <button onClick={() => { onClose(); setSent(false); setPhone(''); setDesc('') }}
              style={{background:'#1c1917', color:'white', padding:'12px 32px', borderRadius:'12px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif'}}>
              Închide
            </button>
          </div>
        ) : (
          <>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px'}}>
              <div>
                <div style={{fontWeight:800, fontSize:'18px', color:'#1c1917', marginBottom:'4px'}}>🎯 Pachet complet</div>
                <div style={{display:'inline-flex', alignItems:'center', gap:'6px', background:'#fef3c7', border:'1px solid #fde68a', borderRadius:'20px', padding:'4px 12px', marginTop:'4px'}}>
                  <div style={{width:'6px', height:'6px', borderRadius:'50%', background:'#d97706'}} />
                  <span style={{fontSize:'11px', fontWeight:700, color:'#92400e'}}>Răspuns în mai puțin de 30 min</span>
                </div>
              </div>
              <button onClick={onClose} style={{background:'none', border:'none', cursor:'pointer', fontSize:'20px', color:'#a8a29e'}}>✕</button>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              <div>
                <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Telefon / WhatsApp</div>
                <input type="tel" placeholder="+40 7xx xxx xxx" value={phone} onChange={e => setPhone(e.target.value)}
                  style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
              </div>
              <div>
                <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>Descrie ce îți dorești</div>
                <textarea rows={3} placeholder="ex: nuntă 200 persoane, pachet complet DJ + formație + dansatori..." value={desc} onChange={e => setDesc(e.target.value)}
                  style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', resize:'none', boxSizing:'border-box'}} />
              </div>
              <button onClick={handleSubmit} disabled={!phone}
                style={{width:'100%', background: phone ? '#f59e0b' : '#e7e5e4', color:'white', padding:'13px', borderRadius:'12px', border:'none', cursor: phone ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif'}}>
                ⚡ Trimite — răspuns în 30 min
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
