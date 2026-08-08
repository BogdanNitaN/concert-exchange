'use client'
import { useState } from 'react'

const F = 'Montserrat, sans-serif'

export default function BalGate() {
  const [cod, setCod] = useState('')
  function intra() {
    const c = cod.trim().replace(/^.*\/r\//, '').toLowerCase()
    if (c) window.location.href = '/r/' + c
  }
  return (
    <div style={{minHeight:'100vh', background:'#101014', fontFamily:F, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
      <div style={{width:'100%', maxWidth:'400px', textAlign:'center'}}>
        <img src="/gigx-mark.png" width={40} height={40} alt="" style={{display:'block', margin:'0 auto 12px', filter:'invert(1)'}} />
        <div style={{fontSize:'26px', fontWeight:800, color:'#F5F2EC', letterSpacing:'-0.8px'}}>GIG<span style={{color:'#059669'}}>x</span></div>
        <div style={{fontSize:'13px', color:'#7c3aed', fontWeight:700, marginTop:'6px'}}>Baluri 2027</div>
        <div style={{fontSize:'12px', color:'#a8a29e', fontWeight:500, marginTop:'4px', marginBottom:'28px'}}>Onorarii si logistica pentru baluri</div>
        <input value={cod} onChange={e => setCod(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') intra() }}
          placeholder="Codul tau de acces"
          style={{width:'100%', boxSizing:'border-box', padding:'14px 18px', borderRadius:'12px', border:'1.5px solid #2a2a30', fontSize:'15px', fontFamily:F, outline:'none', background:'#1a1a1f', color:'#F5F2EC', textAlign:'center', letterSpacing:'0.05em'}} />
        <button onClick={intra} disabled={!cod.trim()}
          style={{width:'100%', marginTop:'12px', padding:'14px', background: cod.trim() ? '#059669' : '#1a1a1f', color: cod.trim() ? 'white' : '#57534e', border:'none', borderRadius:'12px', fontSize:'14px', fontWeight:800, cursor: cod.trim() ? 'pointer' : 'not-allowed', fontFamily:F, transition:'all 0.15s'}}>
          Vezi oferta pentru baluri
        </button>
        <div style={{fontSize:'11.5px', color:'#57534e', fontWeight:500, marginTop:'22px', lineHeight:1.6}}>
          Nu ai cod de acces?<br/>
          <a href={'https://wa.me/40751144109?text=' + encodeURIComponent('Buna Bogdan, as vrea acces la oferta de Baluri 2027')} target="_blank" style={{color:'#059669', fontWeight:700, textDecoration:'none'}}>Cere-l pe WhatsApp</a>
        </div>
      </div>
    </div>
  )
}
