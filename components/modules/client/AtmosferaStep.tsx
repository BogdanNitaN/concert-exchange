'use client'

const ATMOSFERA = [
  { id: 'hype', icon: '🔥', label: 'Hype & Energie', desc: 'Dans, distracție, toată lumea pe ring' },
  { id: 'elegant', icon: '💎', label: 'Elegant & Luxury', desc: 'Rafinat, clasă, atmosferă premium' },
  { id: 'petrecere', icon: '🎊', label: 'Petrecere & Mainstream', desc: 'Hituri cunoscute, toată lumea cântă' },
  { id: 'balcanic', icon: '⚡', label: 'Balcanic & Românesc', desc: 'Manele, populară, lăutari, energie pură' },
  { id: 'chill', icon: '🌅', label: 'Chill & Lounge', desc: 'Relaxat, ambient, fundal muzical plăcut' },
]

const TIP_ENTERTAINMENT = [
  { id: 'dj', icon: '🎧', label: 'DJ' },
  { id: 'formatie', icon: '🎸', label: 'Formație / Trupă' },
  { id: 'vocal', icon: '🎤', label: 'Artist vocal / Solist' },
  { id: 'instrumental', icon: '🎺', label: 'Instrumente live' },
  { id: 'dansatori', icon: '💃', label: 'Dansatori / Show' },
  { id: 'expert', icon: '🎯', label: 'Pachet complet — consultă un expert' },
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
      <div style={{textAlign:'center', marginBottom:'32px'}}>
        <h1 style={{fontSize:'28px', fontWeight:800, color:'#1c1917', marginBottom:'8px'}}>Ce atmosferă vrei?</h1>
        <p style={{fontSize:'14px', color:'#78716c'}}>Alege până la 3 stări care descriu evenimentul tău</p>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px', marginBottom:'28px'}}>
        {ATMOSFERA.map(a => (
          <div key={a.id} onClick={() => toggleAtmosfera(a.id)}
            style={{background: atmosfera.includes(a.id) ? '#1c1917' : 'white', border:'2px solid ' + (atmosfera.includes(a.id) ? '#1c1917' : '#e7e5e4'), borderRadius:'16px', padding:'20px 14px', cursor:'pointer', textAlign:'center', transform: atmosfera.includes(a.id) ? 'scale(1.03)' : 'scale(1)', transition:'all 0.2s', position:'relative'}}>
            {atmosfera.includes(a.id) && <div style={{position:'absolute', top:'8px', right:'10px', fontSize:'10px', color:'#22c55e', fontWeight:800}}>✓</div>}
            <div style={{fontSize:'28px', marginBottom:'8px'}}>{a.icon}</div>
            <div style={{fontWeight:700, fontSize:'13px', color: atmosfera.includes(a.id) ? 'white' : '#1c1917', marginBottom:'4px'}}>{a.label}</div>
            <div style={{fontSize:'11px', color: atmosfera.includes(a.id) ? '#a8a29e' : '#78716c'}}>{a.desc}</div>
          </div>
        ))}
      </div>
      <div style={{marginBottom:'28px'}}>
        <div style={{fontSize:'13px', fontWeight:700, color:'#1c1917', marginBottom:'12px'}}>
          Ce tip de entertainment vrei?
          <span style={{color:'#a8a29e', fontWeight:400, fontSize:'12px'}}> (opțional)</span>
        </div>
        <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
          {TIP_ENTERTAINMENT.map(t => (
            <button key={t.id} onClick={() => toggleEntertainment(t.id)}
              style={{padding:'8px 16px', borderRadius:'20px', border:'2px solid', cursor:'pointer', fontSize:'13px', fontWeight:600, fontFamily:'Montserrat,sans-serif', display:'flex', alignItems:'center', gap:'6px',
                background: t.id === 'expert' ? '#f59e0b' : tipEntertainment.includes(t.id) ? '#1c1917' : 'white',
                color: t.id === 'expert' ? 'white' : tipEntertainment.includes(t.id) ? 'white' : '#78716c',
                borderColor: t.id === 'expert' ? '#f59e0b' : tipEntertainment.includes(t.id) ? '#1c1917' : '#e7e5e4'}}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{display:'flex', gap:'12px'}}>
        <button onClick={onBack} style={{padding:'12px 24px', borderRadius:'12px', border:'1px solid #e7e5e4', background:'white', color:'#78716c', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif'}}>← Înapoi</button>
        <button onClick={onNext} style={{flex:1, background:'#1c1917', color:'white', padding:'12px', borderRadius:'12px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif'}}>
          Continuă — Alege artistul →
        </button>
      </div>
    </div>
  )
}
