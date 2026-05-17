'use client'

import { Zap, Gem, Music2, Flame, Sunset, Sun, Star, Radio, Clock, HelpCircle, Disc3, Guitar, Mic2, Piano, Users2 } from 'lucide-react'

const ATMOSFERA = [
  { id: 'hype', icon: Zap, label: 'Hype & Energie', desc: 'Dans, distracție, toată lumea pe ring' },
  { id: 'elegant', icon: Gem, label: 'Elegant & Luxury', desc: 'Rafinat, clasă, atmosferă premium' },
  { id: 'petrecere', icon: Music2, label: 'Petrecere & Mainstream', desc: 'Hituri cunoscute, toată lumea cântă' },
  { id: 'balcanic', icon: Flame, label: 'Balkan Energy', desc: 'Manele, populară, lăutari, energie pură' },
  { id: 'chill', icon: Sunset, label: 'Chill & Lounge', desc: 'Relaxat, ambient, fundal muzical plăcut' },
  { id: 'dayparty', icon: Sun, label: 'Day Party', desc: 'Energie de zi, outdoor, vibe relaxat' },
  { id: 'festival', icon: Star, label: 'Festival Energy', desc: 'Mulțime mare, energie maximă, spectacol' },
  { id: 'rooftop', icon: Radio, label: 'Rooftop Cool', desc: 'Exclusivist, urban, view & muzică bună' },
  { id: 'nostalgic', icon: Clock, label: 'Nostalgic & Evergreen', desc: 'Hituri clasice, șlagăre, retro vibes' },
]

const TIP_ENTERTAINMENT = [
  { id: 'dj', icon: Disc3, label: 'DJ' },
  { id: 'formatie', icon: Guitar, label: 'Formație / Trupă' },
  { id: 'vocal', icon: Mic2, label: 'Artist vocal / Solist' },
  { id: 'instrumental', icon: Piano, label: 'Instrumente live' },
  { id: 'dansatori', icon: Users2, label: 'Dansatori / Show' },
]

interface Props {
  atmosfera: string[]
  toggleAtmosfera: (id: string) => void
  tipEntertainment: string[]
  toggleEntertainment: (id: string) => void
  onBack: () => void
  onNext: () => void
  onExpert: () => void
}

export default function AtmosferaStep({ atmosfera, toggleAtmosfera, tipEntertainment, toggleEntertainment, onBack, onNext, onExpert }: Props) {
  return (
    <div>
      <div style={{textAlign:'center', marginBottom:'32px'}}>
        <h1 style={{fontSize:'32px', fontWeight:800, color:'#1c1917', marginBottom:'8px', letterSpacing:'-0.5px'}}>Ce atmosferă vrei?</h1>
        <p style={{fontSize:'15px', color:'#78716c'}}>Alege până la 3 stări care descriu evenimentul tău</p>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'10px', marginBottom:'28px'}}>
        {ATMOSFERA.map(a => {
          const Icon = a.icon
          const isSelected = atmosfera.includes(a.id)
          return (
            <div key={a.id} onClick={() => toggleAtmosfera(a.id)}
              style={{background: isSelected ? '#1c1917' : 'white', border:'1.5px solid ' + (isSelected ? '#1c1917' : '#e7e5e4'), borderRadius:'16px', padding:'18px 14px', cursor:'pointer', textAlign:'center', transform: isSelected ? 'scale(1.02)' : 'scale(1)', transition:'all 0.15s', boxShadow: isSelected ? '0 4px 20px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.04)', position:'relative'}}>
              {isSelected && (
                <div style={{position:'absolute', top:'8px', right:'10px', width:'16px', height:'16px', borderRadius:'50%', background:'#059669', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <span style={{color:'white', fontSize:'9px', fontWeight:800}}>✓</span>
                </div>
              )}
              <div style={{display:'flex', justifyContent:'center', marginBottom:'10px'}}>
                <Icon size={22} color={isSelected ? 'white' : '#44403c'} strokeWidth={1.5} />
              </div>
              <div style={{fontWeight:700, fontSize:'12px', color: isSelected ? 'white' : '#1c1917', marginBottom:'4px'}}>{a.label}</div>
              <div style={{fontSize:'10px', color: isSelected ? 'rgba(255,255,255,0.65)' : '#78716c', lineHeight:1.4}}>{a.desc}</div>
            </div>
          )
        })}
      </div>

      <div style={{marginBottom:'24px'}}>
        <div style={{fontSize:'12px', fontWeight:700, color:'#1c1917', marginBottom:'4px'}}>Ce tip de entertainment vrei?</div>
        <div style={{fontSize:'12px', color:'#a8a29e', marginBottom:'14px'}}>Opțional — poți alege mai multe</div>
        <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
          {TIP_ENTERTAINMENT.map(t => {
            const Icon = t.icon
            const isSelected = tipEntertainment.includes(t.id)
            return (
              <button key={t.id} onClick={() => toggleEntertainment(t.id)}
                style={{padding:'9px 18px', borderRadius:'20px', border:'1.5px solid', cursor:'pointer', fontSize:'13px', fontWeight:600, fontFamily:'Montserrat,sans-serif', display:'flex', alignItems:'center', gap:'7px', transition:'all 0.15s',
                  background: isSelected ? '#1c1917' : 'white',
                  color: isSelected ? 'white' : '#44403c',
                  borderColor: isSelected ? '#1c1917' : '#e7e5e4'}}>
                <Icon size={14} strokeWidth={1.5} />
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{background:'#f5f3ff', border:'1px solid #ddd6fe', borderRadius:'14px', padding:'16px 20px', marginBottom:'24px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:'13px', fontWeight:700, color:'#7c3aed', marginBottom:'2px'}}>Nu știi ce să alegi?</div>
          <div style={{fontSize:'12px', color:'#8b5cf6'}}>Un expert te ajută gratuit în mai puțin de 30 min.</div>
        </div>
        <button onClick={onExpert}
          style={{background:'#7c3aed', color:'white', padding:'9px 18px', borderRadius:'10px', border:'none', cursor:'pointer', fontSize:'12px', fontWeight:700, fontFamily:'Montserrat,sans-serif', whiteSpace:'nowrap'}}>
          Vorbește cu un expert
        </button>
      </div>

      <div style={{display:'flex', gap:'10px'}}>
        <button onClick={onBack}
          style={{padding:'13px 24px', borderRadius:'14px', border:'1.5px solid #e7e5e4', background:'white', color:'#78716c', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif'}}>
          Înapoi
        </button>
        <button onClick={onNext}
          style={{flex:1, background:'#1c1917', color:'white', padding:'13px', borderRadius:'14px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif'}}>
          Continuă — Alege artistul
        </button>
      </div>
    </div>
  )
}
