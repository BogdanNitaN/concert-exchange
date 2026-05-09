'use client'

import Link from 'next/link'
import { useState } from 'react'

const PLANS = [
  {
    name: 'Free',
    price: 0,
    currency: '€',
    period: 'forever',
    description: 'Perfect pentru a explora platforma',
    color: '#78716c',
    bg: '#fafaf9',
    border: '#e7e5e4',
    features: [
      { text: 'Profil basic vizibil pe hartă', included: true },
      { text: 'Caută artiști și venue-uri', included: true },
      { text: '3 mesaje / lună', included: true },
      { text: '5 cereri booking / lună', included: true },
      { text: 'Adaugă venue-uri pe hartă', included: true },
      { text: 'Fee artist vizibil', included: false },
      { text: 'Contact venue vizibil', included: false },
      { text: 'Calendar sync Google', included: false },
      { text: 'Analytics & statistici', included: false },
      { text: 'Mesaje nelimitate', included: false },
      { text: 'Notificări smart routing', included: false },
    ],
    cta: 'Începe gratuit',
    ctaLink: '/signup',
    popular: false,
  },
  {
    name: 'Pro',
    price: 10,
    currency: '€',
    period: 'lună',
    description: 'Pentru artiști și promoteri activi',
    color: '#1c1917',
    bg: '#1c1917',
    border: '#1c1917',
    features: [
      { text: 'Profil premium cu badge verificat', included: true },
      { text: 'Caută artiști și venue-uri', included: true },
      { text: 'Mesaje nelimitate', included: true },
      { text: 'Cereri booking nelimitate', included: true },
      { text: 'Adaugă venue-uri pe hartă', included: true },
      { text: 'Fee artist vizibil', included: true },
      { text: 'Contact venue vizibil', included: true },
      { text: 'Calendar sync Google', included: true },
      { text: 'Analytics & statistici', included: true },
      { text: 'Notificări smart routing', included: true },
      { text: 'Export date & rapoarte', included: true },
    ],
    cta: 'Începe Pro — 10€/lună',
    ctaLink: '/signup?plan=pro',
    popular: true,
  },
  {
    name: 'Agenție',
    price: 49,
    currency: '€',
    period: 'lună',
    description: 'Pentru agenții cu portofoliu de artiști',
    color: '#7c3aed',
    bg: '#faf5ff',
    border: '#ddd6fe',
    features: [
      { text: 'Tot ce include Pro', included: true },
      { text: 'Până la 50 artiști în portofoliu', included: true },
      { text: 'Dashboard agenție dedicat', included: true },
      { text: 'Matching automat oportunități', included: true },
      { text: 'Smart routing între concerte', included: true },
      { text: 'Calculator distanță rutieră', included: true },
      { text: 'Curs valutar live BNR', included: true },
      { text: 'Import calendar .ics', included: true },
      { text: 'Analytics avansat per artist', included: true },
      { text: 'Reprezentare artiști (10% comision)', included: true },
      { text: 'Suport prioritar', included: true },
    ],
    cta: 'Contactează-ne',
    ctaLink: '/signup?plan=agentie',
    popular: false,
  },
]

const FAQS = [
  { q: 'Pot schimba planul oricând?', a: 'Da — upgrade sau downgrade oricând, fără perioadă minimă de contract.' },
  { q: 'Ce se întâmplă după trial-ul de 15 zile?', a: 'Primești toate notificările timp de 15 zile. După aceea poți personaliza sau dezactiva notificările din setări.' },
  { q: 'Comisionul de 10% se aplică tuturor?', a: 'Doar pentru artiștii care aleg să fie reprezentați de o agenție prin platformă. Dacă lucrezi direct, nu există comision.' },
  { q: 'Datele mele sunt în siguranță?', a: 'Da. Contactele venue-urilor sunt vizibile doar ție. Publicul comunică prin mesageria internă.' },
  { q: 'Există contract pe termen lung?', a: 'Nu. Plătești lunar și poți anula oricând.' },
]

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [billing] = useState<'lunar'|'anual'>('lunar')

  return (
    <div style={{minHeight:'100vh', background:'#fafaf9', fontFamily:'Montserrat,sans-serif'}}>

      {/* NAV */}
      <nav style={{borderBottom:'1px solid #e7e5e4', background:'white', height:'56px', display:'flex', alignItems:'center', padding:'0 24px', justifyContent:'space-between', position:'sticky', top:0, zIndex:100}}>
        <Link href="/" style={{fontWeight:800, fontSize:'18px', color:'#1c1917', textDecoration:'none'}}>
          Concert <span style={{color:'#f59e0b'}}>●</span> Exchange
        </Link>
        <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
          <Link href="/search" style={{fontSize:'13px', color:'#78716c', textDecoration:'none'}}>Caută artiști</Link>
          <Link href="/signup" style={{background:'#1c1917', color:'white', padding:'8px 16px', borderRadius:'10px', fontSize:'13px', fontWeight:700, textDecoration:'none'}}>Înregistrare gratuită</Link>
        </div>
      </nav>

      <div style={{maxWidth:'1100px', margin:'0 auto', padding:'60px 24px'}}>

        {/* HEADER */}
        <div style={{textAlign:'center', marginBottom:'60px'}}>
          <div style={{display:'inline-flex', alignItems:'center', gap:'8px', background:'#fef3c7', border:'1px solid #fde68a', borderRadius:'20px', padding:'6px 16px', marginBottom:'20px'}}>
            <span style={{fontSize:'12px', fontWeight:700, color:'#92400e'}}>🎵 Simplu și transparent</span>
          </div>
          <h1 style={{fontSize:'42px', fontWeight:800, color:'#1c1917', margin:'0 0 16px', letterSpacing:'-0.02em'}}>
            Alege planul potrivit
          </h1>
          <p style={{fontSize:'16px', color:'#78716c', maxWidth:'500px', margin:'0 auto', lineHeight:1.6}}>
            Fără surprize. Fără contracte pe termen lung. Anulezi oricând.
          </p>
        </div>

        {/* PLANS */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'20px', marginBottom:'80px'}}>
          {PLANS.map(plan => (
            <div key={plan.name} style={{
              background: plan.name === 'Pro' ? '#1c1917' : 'white',
              border: `2px solid ${plan.name === 'Pro' ? '#1c1917' : plan.name === 'Agenție' ? '#ddd6fe' : '#e7e5e4'}`,
              borderRadius:'20px',
              padding:'32px',
              position:'relative',
              transform: plan.popular ? 'scale(1.03)' : 'scale(1)',
              boxShadow: plan.popular ? '0 20px 60px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              {plan.popular && (
                <div style={{position:'absolute', top:'-14px', left:'50%', transform:'translateX(-50%)', background:'#f59e0b', color:'white', fontSize:'11px', fontWeight:800, padding:'4px 16px', borderRadius:'20px', whiteSpace:'nowrap'}}>
                  ⭐ Cel mai popular
                </div>
              )}

              <div style={{marginBottom:'24px'}}>
                <div style={{fontSize:'13px', fontWeight:700, color: plan.name === 'Pro' ? '#a8a29e' : plan.name === 'Agenție' ? '#7c3aed' : '#78716c', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>
                  {plan.name}
                </div>
                <div style={{display:'flex', alignItems:'baseline', gap:'4px', marginBottom:'8px'}}>
                  <span style={{fontSize:'42px', fontWeight:800, color: plan.name === 'Pro' ? 'white' : '#1c1917'}}>
                    {plan.price === 0 ? 'Gratuit' : plan.price + '€'}
                  </span>
                  {plan.price > 0 && (
                    <span style={{fontSize:'14px', color: plan.name === 'Pro' ? '#a8a29e' : '#78716c'}}>/{plan.period}</span>
                  )}
                </div>
                <p style={{fontSize:'13px', color: plan.name === 'Pro' ? '#a8a29e' : '#78716c', margin:0, lineHeight:1.5}}>
                  {plan.description}
                </p>
              </div>

              <Link href={plan.ctaLink} style={{
                display:'block', textAlign:'center', padding:'12px', borderRadius:'12px', fontSize:'13px', fontWeight:700, textDecoration:'none', marginBottom:'28px',
                background: plan.name === 'Pro' ? 'white' : plan.name === 'Agenție' ? '#7c3aed' : '#1c1917',
                color: plan.name === 'Pro' ? '#1c1917' : 'white',
              }}>
                {plan.cta}
              </Link>

              <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <span style={{
                      fontSize:'14px', flexShrink:0,
                      color: f.included ? (plan.name === 'Pro' ? '#22c55e' : '#7c3aed') : '#d4d4d4'
                    }}>
                      {f.included ? '✓' : '✗'}
                    </span>
                    <span style={{fontSize:'12px', color: plan.name === 'Pro' ? (f.included ? '#e7e5e4' : '#57534e') : (f.included ? '#1c1917' : '#a8a29e')}}>
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* COMISION INFO */}
        <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'32px', marginBottom:'60px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'32px'}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'32px', fontWeight:800, color:'#1c1917', marginBottom:'4px'}}>3-5%</div>
            <div style={{fontSize:'13px', fontWeight:600, color:'#78716c', marginBottom:'4px'}}>Comision platformă</div>
            <div style={{fontSize:'12px', color:'#a8a29e'}}>Per booking confirmat prin platformă</div>
          </div>
          <div style={{textAlign:'center', borderLeft:'1px solid #e7e5e4', borderRight:'1px solid #e7e5e4'}}>
            <div style={{fontSize:'32px', fontWeight:800, color:'#7c3aed', marginBottom:'4px'}}>10%</div>
            <div style={{fontSize:'13px', fontWeight:600, color:'#78716c', marginBottom:'4px'}}>Comision agenție</div>
            <div style={{fontSize:'12px', color:'#a8a29e'}}>Doar dacă folosești serviciul de reprezentare</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'32px', fontWeight:800, color:'#22c55e', marginBottom:'4px'}}>0€</div>
            <div style={{fontSize:'13px', fontWeight:600, color:'#78716c', marginBottom:'4px'}}>Fără costuri ascunse</div>
            <div style={{fontSize:'12px', color:'#a8a29e'}}>Prețul afișat e tot ce plătești</div>
          </div>
        </div>

        {/* FAQ */}
        <div style={{maxWidth:'700px', margin:'0 auto'}}>
          <h2 style={{fontSize:'28px', fontWeight:800, color:'#1c1917', textAlign:'center', marginBottom:'32px'}}>Întrebări frecvente</h2>
          <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'14px', overflow:'hidden'}}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{width:'100%', textAlign:'left', padding:'16px 20px', border:'none', background:'none', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', fontFamily:'Montserrat,sans-serif'}}>
                  <span style={{fontSize:'14px', fontWeight:600, color:'#1c1917'}}>{faq.q}</span>
                  <span style={{fontSize:'18px', color:'#78716c', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)', transition:'transform 0.2s'}}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{padding:'0 20px 16px', fontSize:'13px', color:'#78716c', lineHeight:1.6}}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA FINAL */}
        <div style={{textAlign:'center', marginTop:'60px', padding:'48px', background:'#1c1917', borderRadius:'24px'}}>
          <h2 style={{fontSize:'28px', fontWeight:800, color:'white', marginBottom:'12px'}}>
            Gata să începi?
          </h2>
          <p style={{fontSize:'15px', color:'#a8a29e', marginBottom:'24px'}}>
            Înregistrare gratuită în 60 de secunde. Fără card de credit.
          </p>
          <Link href="/signup" style={{display:'inline-block', background:'#f59e0b', color:'#1c1917', padding:'14px 32px', borderRadius:'12px', fontSize:'15px', fontWeight:800, textDecoration:'none'}}>
            Încearcă gratuit →
          </Link>
        </div>

      </div>
    </div>
  )
}