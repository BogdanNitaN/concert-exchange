'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Search, MessageCircle, Award, BarChart3, ShieldCheck, Clock, Sparkles, Heart, Building2, PartyPopper, Disc3, Rocket, Star, Sun, Sunset, Wine, Flame, Baby } from 'lucide-react'

export default function HomePage() {
  return (
    <div style={{minHeight:'100vh', background:'#f5f5f7', fontFamily:'Montserrat,sans-serif'}}>
      
      {/* Navbar */}
      <nav style={{background:'rgba(255,255,255,0.85)', backdropFilter:'blur(20px)', borderBottom:'1px solid #e7e5e4', position:'sticky', top:0, zIndex:100}}>
        <div style={{maxWidth:'1200px', margin:'0 auto', padding:'0 24px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{display:'flex', alignItems:'center', gap:'8px', fontWeight:800, fontSize:'20px', color:'#1c1917', letterSpacing:'-0.5px'}}>
            <img src="/gigx-mark.png" width={24} height={24} alt="" style={{display:'block'}} />
            <span>GIG<span style={{color:'#059669'}}>x</span></span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <Link href="/roster" style={{color:'#57534e', padding:'10px 14px', borderRadius:'12px', fontSize:'13px', fontWeight:700, textDecoration:'none'}}>
              Artiști
            </Link>
            <Link href="/dashboard/client" style={{background:'#101014', color:'white', padding:'10px 22px', borderRadius:'12px', fontSize:'13px', fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', gap:'6px'}}>
              Spune-ne ce eveniment ai <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero cu mesh gradient */}
      <section style={{position:'relative', overflow:'hidden'}}>
        {/* Mesh gradient background */}
        <div style={{position:'absolute', inset:0, background:'radial-gradient(circle at 20% 20%, rgba(5,150,105,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(124,58,237,0.06) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(234,205,163,0.08) 0%, transparent 50%)', pointerEvents:'none'}}></div>
        <div style={{maxWidth:'1000px', margin:'0 auto', padding:'120px 24px 80px', textAlign:'center', position:'relative', zIndex:1}}>
        <div style={{fontSize:'11px', fontWeight:700, color:'#a8a29e', letterSpacing:'0.15em', marginBottom:'32px', textTransform:'uppercase'}}>
          Cei mai cautati artisti. Un singur loc.
        </div>
        <motion.h1 
          initial={{opacity:0, y:20}} 
          animate={{opacity:1, y:0}} 
          transition={{duration:0.8, ease:'easeOut'}}
          style={{fontSize:'64px', fontWeight:800, color:'#1c1917', lineHeight:1.05, letterSpacing:'-2px', marginBottom:'28px'}}
        >
          <motion.span initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6, delay:0.1}} style={{display:'inline-block'}}>Un singur apel.</motion.span><br/>
          <motion.span initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6, delay:0.3}} style={{display:'inline-block'}}>Un singur răspuns.</motion.span><br/>
          <motion.span initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6, delay:0.5}} style={{display:'inline-block', color:'#059669'}}>Artistul tău.</motion.span>
        </motion.h1>
        <p style={{fontSize:'19px', color:'#57534e', maxWidth:'620px', margin:'0 auto 40px', lineHeight:1.6, fontWeight:400}}>
          Booking artistic, făcut cu rigoare.<br/>
          30 de minute până la prețul real.<br/>
          21 de ani de relații în industrie.
        </p>
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', flexWrap:'wrap', marginBottom:'56px'}}>
          <Link href="/roster" style={{background:'#101014', color:'white', padding:'16px 40px', borderRadius:'14px', fontSize:'15px', fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', gap:'8px', boxShadow:'0 8px 30px rgba(0,0,0,0.18)'}}>
            Artiști Forward <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
          <Link href="/prom" style={{background:'white', color:'#1c1917', padding:'16px 40px', borderRadius:'14px', fontSize:'15px', fontWeight:700, textDecoration:'none', border:'1.5px solid #e7e5e4'}}>
            Calculează bugetul balului
          </Link>
        </div>
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'28px', flexWrap:'wrap', fontSize:'12px', color:'#78716c', fontWeight:500}}>
          <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
            <Clock size={14} color='#059669' strokeWidth={2.5} /> Răspuns în 30 minute
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
            <ShieldCheck size={14} color='#059669' strokeWidth={2.5} /> Artiști verificați manual
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
            <BarChart3 size={14} color='#059669' strokeWidth={2.5} /> Date de performanță reale
          </div>
        </div>
        </div>
      </section>


      {/* Stats */}
      <section style={{background:'#f5f5f4', padding:'72px 24px', borderTop:'1px solid #e7e5e4', borderBottom:'1px solid #e7e5e4'}}>
        <div style={{maxWidth:'1000px', margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'32px', textAlign:'center'}}>
          {[
            {n:'1.617', l:'Evenimente anual'},
            {n:'18M€+', l:'Contractați în 3 ani'},
            {n:'30 min', l:'Răspuns mediu'},
            {n:'21 ani', l:'În industrie'},
          ].map((s, i) => (
            <div key={i}>
              <div style={{fontWeight:800, fontSize:'44px', color:'#1c1917', marginBottom:'6px', letterSpacing:'-1.5px'}}>{s.n}</div>
              <div style={{fontSize:'12px', color:'#78716c', fontWeight:600, letterSpacing:'0.05em'}}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Showcase */}
      <section style={{background:'white', padding:'80px 24px', borderTop:'1px solid #e7e5e4', borderBottom:'1px solid #e7e5e4'}}>
        <div style={{maxWidth:'1000px', margin:'0 auto', textAlign:'center'}}>
          <div style={{fontSize:'11px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'16px'}}>De peste două decenii</div>
          <h2 style={{fontSize:'42px', fontWeight:800, color:'#1c1917', letterSpacing:'-1.5px', margin:'0 0 14px', lineHeight:1.1}}>
            Cei care contează,<br/>trec pe aici.
          </h2>
          <p style={{fontSize:'15px', color:'#78716c', maxWidth:'520px', margin:'0 auto 48px', lineHeight:1.6}}>
            +70 de artiști. 1.617 evenimente într-un an.<br/>
            Un standard pe care îl setăm din 2005.
          </p>
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'36px', flexWrap:'wrap', paddingTop:'24px', borderTop:'1px solid #f5f5f4'}}>
            {['HEADLINERS', 'POWER DRAWS', 'TOP DJs', 'LIVE BANDS', 'ICONIC VOICES', 'NEW WAVE'].map((label, i) => (
              <div key={i} style={{fontSize:'13px', fontWeight:800, color:'#78716c', letterSpacing:'0.12em'}}>{label}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Cum functioneaza */}
      <section id="how" style={{maxWidth:'1000px', margin:'0 auto', padding:'100px 24px'}}>
        <div style={{textAlign:'center', marginBottom:'56px'}}>
          <div style={{fontSize:'11px', fontWeight:700, color:'#059669', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'14px'}}>Trei pași</div>
          <h2 style={{fontSize:'42px', fontWeight:800, color:'#1c1917', letterSpacing:'-1.5px', margin:'0 0 14px', lineHeight:1.1}}>
            Trei pași. 30 de minute.<br/>Artistul tău.
          </h2>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'18px'}}>
          {[
            {n:'01', icon: Search, title:'Cere', desc:'Ne spui data, orașul, bugetul. Filtrăm artiștii potriviți.', color:'#059669'},
            {n:'02', icon: MessageCircle, title:'Primește', desc:'Răspundem în 30 de minute. Prețul real. Disponibilitatea reală.', color:'#7c3aed'},
            {n:'03', icon: Award, title:'Confirmă', desc:'Artistul tău, blocat în calendar. Garantat de noi, livrat de o echipă cu 21 de ani în industrie.', color:'#eacda3'},
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} style={{background:'white', border:'1px solid #e7e5e4', borderLeft:'4px solid ' + s.color, borderRadius:'20px', padding:'32px 26px', boxShadow:'0 2px 10px rgba(0,0,0,0.04)', transition:'transform 0.2s, box-shadow 0.2s'}}>
                <div style={{fontSize:'11px', fontWeight:800, color: s.color, letterSpacing:'0.12em', marginBottom:'18px'}}>{s.n}</div>
                <div style={{width:'48px', height:'48px', borderRadius:'14px', background: s.color + '15', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'20px'}}>
                  <Icon size={22} color={s.color} strokeWidth={2} />
                </div>
                <h3 style={{fontSize:'22px', fontWeight:800, color:'#1c1917', margin:'0 0 10px', letterSpacing:'-0.5px'}}>{s.title}</h3>
                <p style={{fontSize:'14px', color:'#78716c', lineHeight:1.6, margin:0}}>{s.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Categorii */}
      <section style={{background:'#101014', padding:'100px 24px'}}>
        <div style={{maxWidth:'1000px', margin:'0 auto'}}>
          <div style={{textAlign:'center', marginBottom:'48px'}}>
            <div style={{fontSize:'11px', fontWeight:700, color:'#eacda3', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'14px'}}>Evenimente</div>
            <h2 style={{fontSize:'42px', fontWeight:800, color:'white', letterSpacing:'-1.5px', margin:0, lineHeight:1.1}}>
              Tu spui ce ai nevoie. Noi îți spunem cine.<br/>
              <span style={{color:'rgba(255,255,255,0.7)', fontSize:'24px', fontWeight:500, letterSpacing:'-0.5px'}}>Îți răspundem în 30 de minute. Cu prețul real.</span>
            </h2>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'14px'}}>
            {[
              {label:'Festival', id:'festival', Icon: Star},
              {label:'Club Night', id:'clubnight', Icon: Disc3},
              {label:'Nuntă', id:'nunta', Icon: Heart},
              {label:'Botez', id:'botez', Icon: Baby},
              {label:'Corporate', id:'corporate', Icon: Building2},
              {label:'Gală / Revelion', id:'gala', Icon: Award},
              {label:'Beach Party', id:'beach', Icon: Sunset},
              {label:'Pop-Up', id:'popup', Icon: Sparkles},
              {label:'Day Party', id:'dayparty', Icon: Sun},
              {label:'Brand Activation', id:'corporate2', Icon: Rocket},
              {label:'City Days / Open Air', id:'citydays', Icon: Flame},
              {label:'Dinner & Show', id:'dinnershow', Icon: Wine},
              {label:'Privat', id:'private', Icon: PartyPopper},
            ].map((cat, i) => {
              const Icon = cat.Icon
              return (
                <Link key={i} href={'/dashboard/client' + ((cat as any).id ? '?tip=' + (cat as any).id : '')} style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'16px', padding:'28px 24px', textAlign:'center', textDecoration:'none', transition:'all 0.2s'}}>
                  <div style={{display:'flex', justifyContent:'center', marginBottom:'14px'}}>
                    <Icon size={28} color='#eacda3' strokeWidth={1.5} />
                  </div>
                  <div style={{fontSize:'13px', fontWeight:700, color:'white', letterSpacing:'-0.2px'}}>{cat.label}</div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* De ce GIGx */}
      <section style={{maxWidth:'1000px', margin:'0 auto', padding:'100px 24px'}}>
        <div style={{textAlign:'center', marginBottom:'56px'}}>
          <div style={{fontSize:'11px', fontWeight:700, color:'#059669', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'14px'}}>Trei motive</div>
          <h2 style={{fontSize:'42px', fontWeight:800, color:'#1c1917', letterSpacing:'-1.5px', margin:0, lineHeight:1.1}}>
            Diferența dintre 'a căuta un artist'<br/>și 'a-ți rezerva artistul'.
          </h2>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(290px, 1fr))', gap:'18px'}}>
          {[
            {icon: BarChart3, title:'Date reale, nu impresii', desc:'Vezi streams, views și followeri în timp real, direct din surse oficiale. Decizia ta, sprijinită pe cifre, nu pe păreri.', color:'#059669'},
            {icon: Award, title:'Un sistem de ordine', desc:'Box Office Power: A++ Icon. A+ Premium. A Select. Limbajul după care funcționează industria, acum vizibil pentru tine.', color:'#7c3aed'},
            {icon: Sparkles, title:'Două decenii de relații', desc:'Booking-ul nu se face pe Google. Se face cu telefoane, semnături și încredere construită în ani. Noi avem 20.', color:'#eacda3'},
          ].map((f, i) => {
            const Icon = f.icon
            return (
              <div key={i} style={{background:'white', border:'1px solid #e7e5e4', borderLeft:'4px solid ' + f.color, borderRadius:'20px', padding:'32px 26px', boxShadow:'0 2px 10px rgba(0,0,0,0.04)', transition:'transform 0.2s, box-shadow 0.2s'}}>
                <div style={{width:'48px', height:'48px', borderRadius:'14px', background: f.color + '15', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'20px'}}>
                  <Icon size={22} color={f.color} strokeWidth={2} />
                </div>
                <h3 style={{fontSize:'18px', fontWeight:800, color:'#1c1917', margin:'0 0 12px', letterSpacing:'-0.3px'}}>{f.title}</h3>
                <p style={{fontSize:'14px', color:'#78716c', lineHeight:1.65, margin:0}}>{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* FAQ */}
      <section style={{maxWidth:'820px', margin:'0 auto', padding:'100px 24px'}}>
        <div style={{textAlign:'center', marginBottom:'48px'}}>
          <h2 style={{fontSize:'36px', fontWeight:800, color:'#1c1917', letterSpacing:'-1px', margin:0}}>Întrebări frecvente</h2>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>
          {[
            {q:'Costă să trimit o cerere?', a:'Nu. Cererea este gratuită. Plătești doar artistul confirmat.'},
            {q:'Ce înseamnă tier-ul A++ / A+ / A?', a:'Box Office Power. Indicator de impact al artistului la public. A++ Icon — Headliner (10.000€+). A+ Premium — Power Draw (5.000€–10.000€). A Select — Solid (până la 5.000€).'},
            {q:'Cum sunt verificați artiștii?', a:'Manual. De echipă cu 21 de ani de experiență. Datele de performanță sunt agregate live de la platformele oficiale (Spotify, YouTube, TikTok, Instagram) prin parteneriat cu Chartex.'},
            {q:'Pot anula o cerere?', a:'Da, oricând înainte de confirmarea finală. Până atunci, totul este flexibil.'},
            {q:'De ce să nu sun direct artistul?', a:'Pentru că rapiditatea contează. Artiștii ne știu, lucrăm cu ei zilnic. Tu primești răspuns la preț, calendar și condiții când ai nevoie — 24/7, în 30 de minute.'},
          ].map((f, i) => (
            <div key={i} style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'16px', padding:'22px 26px', boxShadow:'0 1px 4px rgba(0,0,0,0.03)'}}>
              <div style={{fontSize:'15px', fontWeight:700, color:'#1c1917', marginBottom:'8px'}}>{f.q}</div>
              <div style={{fontSize:'14px', color:'#78716c', lineHeight:1.65}}>{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section style={{background:'#059669', padding:'80px 24px', textAlign:'center'}}>
        <div style={{maxWidth:'700px', margin:'0 auto'}}>
          <div style={{fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'14px'}}>Spre pasul următor</div>
          <h2 style={{fontSize:'42px', fontWeight:800, color:'white', letterSpacing:'-1.5px', margin:'0 0 14px', lineHeight:1.1}}>
            Începe o cerere.<br/>Vezi diferența.
          </h2>
          <p style={{fontSize:'16px', color:'rgba(255,255,255,0.85)', margin:'0 0 32px', lineHeight:1.5}}>
            30 de minute. Prețul real.<br/>Răspuns de la oameni reali, nu chatboți.
          </p>
          <div style={{display:'flex', gap:'10px', flexWrap:'wrap', justifyContent:'center', marginBottom:'22px'}}>
              <Link href="/dashboard/client?tip=nunta" style={{background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.35)', color:'white', padding:'12px 20px', borderRadius:'12px', fontSize:'14px', fontWeight:700, textDecoration:'none'}}>Nuntă</Link>
              <Link href="/dashboard/client?tip=corporate" style={{background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.35)', color:'white', padding:'12px 20px', borderRadius:'12px', fontSize:'14px', fontWeight:700, textDecoration:'none'}}>Corporate</Link>
              <Link href="/dashboard/client?tip=festival" style={{background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.35)', color:'white', padding:'12px 20px', borderRadius:'12px', fontSize:'14px', fontWeight:700, textDecoration:'none'}}>Festival</Link>
              <Link href="/dashboard/client?tip=clubnight" style={{background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.35)', color:'white', padding:'12px 20px', borderRadius:'12px', fontSize:'14px', fontWeight:700, textDecoration:'none'}}>Club Night</Link>
              <Link href="/dashboard/client?tip=private" style={{background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.35)', color:'white', padding:'12px 20px', borderRadius:'12px', fontSize:'14px', fontWeight:700, textDecoration:'none'}}>Privat</Link>
              <Link href="/dashboard/client?tip=gala" style={{background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.35)', color:'white', padding:'12px 20px', borderRadius:'12px', fontSize:'14px', fontWeight:700, textDecoration:'none'}}>Gală / Revelion</Link>
          </div>
          <Link href="/dashboard/client" style={{background:'white', color:'#059669', padding:'16px 40px', borderRadius:'14px', fontSize:'15px', fontWeight:800, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'8px', boxShadow:'0 8px 30px rgba(0,0,0,0.15)'}}>
            Alt tip de eveniment <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{background:'#101014', padding:'56px 24px 36px', color:'rgba(255,255,255,0.7)'}}>
        <div style={{maxWidth:'1100px', margin:'0 auto'}}>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'40px', marginBottom:'40px'}}>
            <div>
              <div style={{display:'flex', alignItems:'center', gap:'8px', fontWeight:800, fontSize:'20px', color:'white', marginBottom:'12px', letterSpacing:'-0.5px'}}><img src="/gigx-mark.png" width={24} height={24} alt="" style={{display:'block', filter:'brightness(0) invert(1)'}} /><span>GIG<span style={{color:'#059669'}}>x</span></span></div>
              <div style={{fontSize:'13px', lineHeight:1.6, color:'rgba(255,255,255,0.6)'}}>Booking artistic, făcut cu rigoare.<br/>Din 2005.</div>
            </div>
            <div>
              <div style={{fontSize:'11px', fontWeight:700, color:'white', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'14px'}}>Platformă</div>
              <div style={{display:'flex', flexDirection:'column', gap:'10px', fontSize:'13px'}}>
                <Link href="/roster" style={{color:'rgba(255,255,255,0.7)', textDecoration:'none'}}>Artiști Forward</Link>
                <Link href="/prom" style={{color:'rgba(255,255,255,0.7)', textDecoration:'none'}}>Baluri / Prom</Link>
              </div>
            </div>
            <div>
              <div style={{fontSize:'11px', fontWeight:700, color:'white', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'14px'}}>Legal</div>
              <div style={{display:'flex', flexDirection:'column', gap:'10px', fontSize:'13px'}}>
                <Link href="/termeni" style={{color:'rgba(255,255,255,0.7)', textDecoration:'none'}}>Termeni</Link>
                <Link href="/confidentialitate" style={{color:'rgba(255,255,255,0.7)', textDecoration:'none'}}>Confidențialitate</Link>
                <Link href="/cookies" style={{color:'rgba(255,255,255,0.7)', textDecoration:'none'}}>Cookies</Link>
              </div>
            </div>
            <div>
              <div style={{fontSize:'11px', fontWeight:700, color:'white', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'14px'}}>Contact</div>
              <div style={{fontSize:'13px', lineHeight:1.6, color:'rgba(255,255,255,0.7)'}}>hello@gigx.ro</div>
            </div>
          </div>
          <div style={{borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:'28px', fontSize:'12px', textAlign:'center', color:'rgba(255,255,255,0.5)'}}>
            © 2026 GIGx · Toate drepturile rezervate
          </div>
        </div>
      </footer>
    </div>
  )
}
