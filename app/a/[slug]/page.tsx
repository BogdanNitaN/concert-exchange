'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const F = 'Montserrat,sans-serif'
const UI = { bg:'#f5f5f7', ink:'#1c1917', sub:'#57534e', faint:'#a8a29e', line:'#e7e5e4', green:'#059669' }

const TIER: Record<string, { et: string; c: string }> = {
  'A++': { et: 'A++ · Icon', c: '#eacda3' },
  'A+':  { et: 'A+ · Premium', c: '#7c3aed' },
  'A':   { et: 'A · Select', c: '#78716c' },
}
const nrScurt = (n: number) => n >= 1000000 ? (n/1000000).toFixed(1).replace('.0','') + 'M' : n >= 1000 ? Math.round(n/1000) + 'K' : String(n)

export default function PaginaArtist() {
  const { slug } = useParams<{ slug: string }>()
  const [a, setA] = useState<any>(null)
  const [stare, setStare] = useState<'incarc' | 'gata' | 'lipsa'>('incarc')

  useEffect(() => {
    fetch('/api/artist-public/' + slug)
      .then(r => r.json())
      .then(d => { if (d.ok) { setA(d.artist); setStare('gata') } else setStare('lipsa') })
      .catch(() => setStare('lipsa'))
  }, [slug])

  if (stare === 'incarc') return <div style={{minHeight:'100vh', background:UI.bg, fontFamily:F, display:'flex', alignItems:'center', justifyContent:'center', color:UI.faint, fontSize:'14px'}}>Se încarcă…</div>

  if (stare === 'lipsa') return (
    <div style={{minHeight:'100vh', background:UI.bg, fontFamily:F, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'18px', fontWeight:800, color:UI.ink, marginBottom:'8px'}}>Artist negăsit</div>
        <Link href="/roster" style={{color:UI.green, fontWeight:700, fontSize:'14px', textDecoration:'none'}}>Vezi catalogul Forward →</Link>
      </div>
    </div>
  )

  const t = TIER[a.tier] || null
  const st = a.stats || {}
  const cifre = [
    st.monthlyListeners ? { et: 'Ascultători lunari', v: nrScurt(st.monthlyListeners) } : null,
    st.spotifyFollowers ? { et: 'Spotify', v: nrScurt(st.spotifyFollowers) } : null,
    st.instagramFollowers ? { et: 'Instagram', v: nrScurt(st.instagramFollowers) } : null,
    st.tiktokFollowers ? { et: 'TikTok', v: nrScurt(st.tiktokFollowers) } : null,
  ].filter(Boolean) as any[]

  const wa = 'https://wa.me/40751144109?text=' + encodeURIComponent('Buna Bogdan, as vrea o oferta pentru ' + a.nume)

  return (
    <div style={{minHeight:'100vh', background:UI.bg, fontFamily:F}}>
      <nav style={{borderBottom:'1px solid '+UI.line, background:'white', height:'56px', display:'flex', alignItems:'center', padding:'0 20px', gap:'8px', position:'sticky', top:0, zIndex:100}}>
        <Link href="/" style={{display:'inline-flex', alignItems:'center', gap:'8px', textDecoration:'none'}}>
          <img src="/gigx-mark.png" width={24} height={24} alt="" style={{display:'block'}} />
          <span style={{fontSize:'20px', fontWeight:800, letterSpacing:'-0.5px', color:UI.ink}}>GIG<span style={{color:UI.green}}>x</span></span>
        </Link>
        <Link href="/roster" style={{marginLeft:'auto', fontSize:'13px', fontWeight:700, color:UI.sub, textDecoration:'none'}}>Catalog</Link>
      </nav>

      <div style={{maxWidth:'760px', margin:'0 auto', padding:'28px 20px 60px'}}>
        <div style={{background:'white', border:'1px solid '+UI.line, borderRadius:'20px', overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.04)'}}>
          <div style={{display:'flex', gap:'18px', alignItems:'center', padding:'22px 22px 0', flexWrap:'wrap'}}>
            {a.poza && <img src={a.poza} alt={a.nume} style={{width:'120px', height:'120px', objectFit:'cover', borderRadius:'18px', display:'block', flexShrink:0}} />}
            <div style={{minWidth:0}}>
              <h1 style={{fontSize:'30px', fontWeight:800, color:UI.ink, letterSpacing:'-1px', lineHeight:1.1, margin:'0 0 8px'}}>{a.nume}</h1>
              <div style={{display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap'}}>
                {a.genuri?.length > 0 && <span style={{fontSize:'13px', color:UI.sub, fontWeight:600}}>{a.genuri.join(' · ')}</span>}
                {t && <span style={{fontSize:'10px', fontWeight:800, color:'white', background:t.c, padding:'3px 9px', borderRadius:'6px', letterSpacing:'0.06em'}}>{t.et}</span>}
              </div>
            </div>
          </div>

          {cifre.length > 0 && (
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:'10px', padding:'20px 22px 0'}}>
              {cifre.map((c, i) => (
                <div key={i} style={{background:UI.bg, borderRadius:'12px', padding:'12px 14px'}}>
                  <div style={{fontSize:'19px', fontWeight:800, color:UI.ink}}>{c.v}</div>
                  <div style={{fontSize:'10.5px', color:UI.faint, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', marginTop:'2px'}}>{c.et}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{padding:'20px 22px 22px'}}>
            {a.mediaKit && (
              <a href={a.mediaKit} target="_blank" rel="noreferrer"
                style={{display:'block', textAlign:'center', padding:'13px', background:'white', color:UI.ink, border:'1.5px solid '+UI.line, borderRadius:'12px', fontSize:'13px', fontWeight:700, textDecoration:'none', marginBottom:'10px'}}>
                Descarcă media kit
              </a>
            )}
            <a href={wa} target="_blank" rel="noreferrer"
              style={{display:'block', textAlign:'center', padding:'14px', background:UI.ink, color:'white', borderRadius:'12px', fontSize:'14px', fontWeight:700, textDecoration:'none'}}>
              Cere o ofertă
              <span style={{display:'block', fontSize:'10.5px', fontWeight:600, color:'rgba(245,242,236,0.7)', marginTop:'3px'}}>
                <span style={{color:'#34d399'}}>●</span> răspuns în mai puțin de 30 min
              </span>
            </a>
          </div>
        </div>

        <div style={{textAlign:'center', fontSize:'11.5px', color:UI.faint, marginTop:'18px', lineHeight:1.6}}>
          Booking prin Forward Agency · <Link href="/roster" style={{color:UI.green, fontWeight:700, textDecoration:'none'}}>vezi toți artiștii</Link>
        </div>
      </div>
    </div>
  )
}
