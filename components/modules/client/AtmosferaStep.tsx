'use client'

import { Zap, Gem, Music2, Flame, Sunset, Guitar, Mic2, Piano, Users2, Sparkles } from 'lucide-react'

const ATMOSFERA = [
  { id: 'hype', icon: Zap, label: 'Hype & Energie', desc: 'Dans, distracție, toată lumea pe ring' },
  { id: 'elegant', icon: Gem, label: 'Elegant & Luxury', desc: 'Rafinat, clasă, atmosferă premium' },
  { id: 'petrecere', icon: Music2, label: 'Petrecere & Mainstream', desc: 'Hituri cunoscute, toată lumea cântă' },
  { id: 'balcanic', icon: Flame, label: 'Balcanic & Românesc', desc: 'Manele, populară, lăutari, energie pură' },
  { id: 'chill', icon: Sunset, label: 'Chill & Lounge', desc: 'Relaxat, ambient, fundal muzical plăcut' },
]

const TIP_ENTERTAINMENT = [
  { id: 'dj', icon: Music2, label: 'DJ' },
  { id: 'formatie', icon: Guitar, label: 'Formație / Trupă' },
  { id: 'vocal', icon: Mic2, label: 'Artist vocal / Solist' },
  { id: 'instrumental', icon: Piano, label: 'Instrumente live' },
  { id: 'dansatori', icon: Users2, label: 'Dansatori / Show' },
  { id: 'expert', icon: Sparkles, label: 'Pachet complet — consultă un expert' },
]

interface Props {
  atmosfera: string[]
  toggleAtmosfera: (id: string) => void
  tipEntertainment: string[]
  toggleEntertainment: (id: string) => void
  onBack: () => void
  onNext: () => void
}

export default function AtmosferaStep({ atmosfera, toggleAtmosfera, tipEntertainment, toggleEntertainment, onBack, onNext }: Props) {
  return (
    <div>
      <div style={{textAlign:'center', marginBottom:'40px'}}>
        <h1 style={{fontSize:'32px', fontWeight:800, color:'#1c1917', marginBottom:'8px', letterSpacing:'-0.5px'}}>Ce atmosferă vrei?</h1>
        <p style={{fontSize:'15px', color:'#78716c'}}>Alege până la 3 stări care descriu evenimentul tău</p>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'10px', marginBottom:'32px'}}>
        {ATMOSFERA.map(a => {
          const Icon = a.icon
          const isSelected = atmosfera.includes(a.id)
          return (
            <div key={a.id} onClick={() => toggleAtmosfera(a.id)}
              style={{background: isSelected ? '#1c1917' : 'white', border:'1.5px solid ' + (isSelected ? '#1c1917' : '#e7e5e4'), borderRadius:'16px', padding:'22px 16px', cursor:'pointer', textAlign:'center', transform: isSelected ? 'scale(1.02)' : 'scale(1)', transition:'all 0.15s', boxShadow: isSelected ? '0 4px 20px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.04)', position:'relative'}}>
              {isSelected && (
                <div style={{position:'absolute', top:'10px', right:'12px', width:'16px', height:'16px', borderRadius:'50%', background:'#059669', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <span style={{color:'white', fontSize:'9px', fontWeight:800}}>✓</span>
                </div>
              )}
              <div style={{display:'flex', justifyContent:'center', marginBottom:'10px'}}>
                <Icon size={24} color={isSelected ? 'white' : '#44403c'} strokeWidth={1.5} />
              </div>
              <div style={{fontWeight:700, fontSize:'12px', color: isSelected ? 'white' : '#1c1917', marginBottom:'4px'}}>{a.label}</div>
              <div style={{fontSize:'11px', color: isSelected ? 'rgba(255,255,255,0.65)' : '#78716c', lineHeight:1.4}}>{a.desc}</div>
            </div>
          )
        })}
      </div>

      <div style={{marginBottom:'32px'}}>
        <div style={{fontSize:'12px', fontWeight:700, color:'#1c1917', marginBottom:'4px'}}>Ce tip de entertainment vrei?</div>
        <div style={{fontSize:'12px', color:'#a8a29e', marginBottom:'14px'}}>Opțional — poți alege mai multe</div>
        <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
          {TIP_ENTERTAINMENT.map(t => {
            const Icon = t.icon
            const isExpert = t.id === 'expert'
            const isSelected = tipEntertainment.includes(t.id)
            return (
              <button key={t.id} onClick={() => toggleEntertainment(t.id)}
                style={{padding:'9px 18px', borderRadius:'20px', border:'1.5px solid', cursor:'pointer', fontSize:'13px', fontWeight:600, fontFamily:'Montserrat,sans-serif', display:'flex', alignItems:'center', gap:'7px', transition:'all 0.15s',
                  background: isExpert ? '#7c3aed' : isSelected ? '#1c1917' : 'white',
                  color: isExpert ? 'white' : isSelected ? 'white' : '#44403c',
                  borderColor: isExpert ? '#7c3aed' : isSelected ? '#1c1917' : '#e7e5e4',
                  boxShadow: isExpert ? '0 2px 12px rgba(124,58,237,0.25)' : 'none'}}>
                <Icon size={14} strokeWidth={1.5} />
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{display:'flex', gap:'10px'}}>
        <button onClick={onBack}
          style={{padding:'13px 24px', borderRadius:'14px', border:'1.5px solid #e7e5e4', background:'white', color:'#78716c', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif'}}>
          Înapoi
        </button>
        <button onClick={onNext}
          style={{flex:1, background:'#1c1917', color:'white', padding:'13px', borderRadius:'14px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif', letterSpacing:'0.01em'}}>
          Continuă — Alege artistul
        </button>
      </div>
    </div>
  )
}
