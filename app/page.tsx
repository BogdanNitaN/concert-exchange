import Link from 'next/link'
import { Music2, MapPin, Zap, Star, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function HomePage() {
  return (
    <div style={{minHeight:'100vh', background:'#f5f5f7', fontFamily:'Montserrat,sans-serif'}}>
      
      {/* Navbar */}
      <nav style={{background:'white', borderBottom:'1px solid #e7e5e4', position:'sticky', top:0, zIndex:100}}>
        <div style={{maxWidth:'1100px', margin:'0 auto', padding:'0 24px', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{fontWeight:800, fontSize:'18px', color:'#1c1917', letterSpacing:'-0.5px'}}>
            GIG<span style={{color:'#059669'}}>x</span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
            <Link href="/login" style={{fontSize:'13px', fontWeight:600, color:'#78716c', textDecoration:'none'}}>Conectare</Link>
            <Link href="/signup" style={{background:'#1c1917', color:'white', padding:'9px 20px', borderRadius:'12px', fontSize:'13px', fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', gap:'6px'}}>
              Înregistrare <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{maxWidth:'900px', margin:'0 auto', padding:'80px 24px 60px', textAlign:'center'}}>
        <div style={{display:'inline-flex', alignItems:'center', gap:'8px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'20px', padding:'6px 16px', marginBottom:'24px'}}>
          <CheckCircle2 size={14} color='#059669' strokeWidth={2} />
          <span style={{fontSize:'12px', fontWeight:700, color:'#059669'}}>Platforma #1 de booking artistic în România</span>
        </div>
        <h1 style={{fontSize:'52px', fontWeight:800, color:'#1c1917', lineHeight:1.1, letterSpacing:'-1px', marginBottom:'20px'}}>
          Toată industria.<br/>
          <span style={{color:'#059669'}}>Un singur loc.</span>
        </h1>
        <p style={{fontSize:'18px', color:'#78716c', maxWidth:'600px', margin:'0 auto 12px', lineHeight:1.6}}>
          Artiști verificați, prețuri reale, răspuns în 30 de minute.
        </p>
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', flexWrap:'wrap'}}>
          <Link href="/dashboard/client" style={{background:'#1c1917', color:'white', padding:'14px 32px', borderRadius:'14px', fontSize:'15px', fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', gap:'8px', boxShadow:'0 4px 20px rgba(0,0,0,0.15)'}}>
            Caută un artist <ArrowRight size={16} strokeWidth={2} />
          </Link>
          <Link href="/signup" style={{background:'white', color:'#1c1917', padding:'14px 32px', borderRadius:'14px', fontSize:'15px', fontWeight:700, textDecoration:'none', border:'1.5px solid #e7e5e4'}}>
            Înregistrează-te gratuit
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section style={{background:'#1c1917', padding:'40px 24px'}}>
        <div style={{maxWidth:'900px', margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'24px', textAlign:'center'}}>
          <div>
            <div style={{fontWeight:800, fontSize:'36px', color:'white', marginBottom:'4px'}}>80+</div>
            <div style={{fontSize:'13px', color:'rgba(255,255,255,0.6)'}}>Artiști verificați</div>
          </div>
          <div>
            <div style={{fontWeight:800, fontSize:'36px', color:'white', marginBottom:'4px'}}>1.600+</div>
            <div style={{fontSize:'13px', color:'rgba(255,255,255,0.6)'}}>Evenimente/an</div>
          </div>
          <div>
            <div style={{fontWeight:800, fontSize:'36px', color:'white', marginBottom:'4px'}}>30 min</div>
            <div style={{fontSize:'13px', color:'rgba(255,255,255,0.6)'}}>Timp mediu răspuns</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{maxWidth:'900px', margin:'0 auto', padding:'60px 24px'}}>
        <h2 style={{fontSize:'32px', fontWeight:800, color:'#1c1917', textAlign:'center', marginBottom:'40px', letterSpacing:'-0.5px'}}>
          De ce GIGx?
        </h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'20px'}}>
          {[
            { icon: Music2, title: '80+ artiști verificați', desc: 'Pop, Hip-Hop, Rock, Jazz, Manele și multe altele. Toți verificați și aprobați.' },
            { icon: MapPin, title: 'Smart routing', desc: 'Vedem ce artiști sunt în zona ta și reducem costurile de transport automat.' },
            { icon: Zap, title: 'Rapid și simplu', desc: 'Cerere în 5 minute. Deviz estimativ instant. Confirmare în 30 de minute.' },
          ].map((f, i) => (
            <div key={i} style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'28px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
              <div style={{width:'44px', height:'44px', borderRadius:'14px', background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px'}}>
                <f.icon size={22} color='#059669' strokeWidth={1.5} />
              </div>
              <div style={{fontWeight:700, fontSize:'15px', color:'#1c1917', marginBottom:'8px'}}>{f.title}</div>
              <div style={{fontSize:'13px', color:'#78716c', lineHeight:1.6}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{background:'#f0fdf4', borderTop:'1px solid #bbf7d0', borderBottom:'1px solid #bbf7d0', padding:'60px 24px', textAlign:'center'}}>
        <h2 style={{fontSize:'32px', fontWeight:800, color:'#1c1917', marginBottom:'12px', letterSpacing:'-0.5px'}}>
          Gata să găsești artistul perfect?
        </h2>
        <p style={{fontSize:'16px', color:'#78716c', marginBottom:'28px'}}>Gratuit. Fără comisioane ascunse. Răspuns garantat în 30 min.</p>
        <Link href="/dashboard/client" style={{background:'#1c1917', color:'white', padding:'14px 36px', borderRadius:'14px', fontSize:'15px', fontWeight:700, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'8px', boxShadow:'0 4px 20px rgba(0,0,0,0.15)'}}>
          Începe acum <ArrowRight size={16} strokeWidth={2} />
        </Link>
      </section>

      {/* Footer */}
      <footer style={{background:'#1c1917', padding:'32px 24px', textAlign:'center'}}>
        <div style={{fontWeight:800, fontSize:'16px', color:'white', marginBottom:'8px'}}>GIGx</div>
        <div style={{fontSize:'12px', color:'rgba(255,255,255,0.4)'}}>© 2026 GIGx. Toate drepturile rezervate.</div>
        <div style={{display:'flex', justifyContent:'center', gap:'20px', marginTop:'16px'}}>
          <Link href="/signup" style={{fontSize:'12px', color:'rgba(255,255,255,0.5)', textDecoration:'none'}}>Înregistrare</Link>
          <Link href="/login" style={{fontSize:'12px', color:'rgba(255,255,255,0.5)', textDecoration:'none'}}>Login</Link>
          <Link href="/dashboard/client" style={{fontSize:'12px', color:'rgba(255,255,255,0.5)', textDecoration:'none'}}>Caută artist</Link>
        </div>
      </footer>

    </div>
  )
}
