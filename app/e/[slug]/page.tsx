'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle2, MapPin, Mic2, Disc3, Guitar } from 'lucide-react'

const F = 'Montserrat,sans-serif'
const UI = { bg:'#f5f5f7', ink:'#1c1917', sub:'#57534e', faint:'#a8a29e', line:'#e7e5e4', green:'#059669' }

const TIER: Record<string, { et: string; c: string }> = {
  'A++': { et: 'A++ · Icon', c: '#eacda3' },
  'A+':  { et: 'A+ · Premium', c: '#7c3aed' },
  'A':   { et: 'A · Select', c: '#78716c' },
}
const SET_ET: Record<string, string> = { dj: 'DJ set', cover: 'Cover band', vocal: 'Show vocal', band: 'Live band' }
const nr = (n: number) => n >= 1000000000 ? (n/1000000000).toFixed(2).replace('.00','') + ' mld' : n >= 1000000 ? Math.round(n/1000000).toLocaleString('ro-RO') + 'M' : n >= 1000 ? Math.round(n/1000) + 'K' : String(n)

export default function PaginaArtist() {
  const { slug } = useParams<{ slug: string }>()
  const [a, setA] = useState<any>(null)
  const [stare, setStare] = useState<'incarc' | 'gata' | 'lipsa'>('incarc')
  const [tip, setTip] = useState(false)

  useEffect(() => {
    fetch('/api/artist-public/' + slug + '?docs=1')
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
    st.tiktokVideos > 100 ? { v: st.tiktokVideos, et: 'TikTok', d: 'Creates · all-time' } : null,
    st.spotifyStreams > 1000 ? { v: st.spotifyStreams, et: 'Spotify', d: 'Streams · all-time' } : null,
    st.youtubeViews > 1000 ? { v: st.youtubeViews, et: 'YouTube', d: 'Views · all-time' } : null,
    st.shazamCount > 100 ? { v: st.shazamCount, et: 'Shazam', d: 'Identificări' } : null,
    st.instagramFollowers > 1000 ? { v: st.instagramFollowers, et: 'Instagram', d: 'Urmăritori' } : null,
    st.monthlyListeners > 1000 ? { v: st.monthlyListeners, et: 'Spotify', d: 'Ascultători lunari' } : null,
  ].filter(Boolean) as any[]

  // reach cumulat pe platforme, ca in media kituri; cifrele reale raman detaliate mai jos
  const peSpotify = (st.monthlyListeners || 0) + (st.spotifyFollowers || 0) + (st.spotifyStreams || 0)
  const peYoutube = st.youtubeViews || 0
  const peInstagram = st.instagramFollowers || 0
  const peTiktok = (st.tiktokFollowers || 0) + (st.tiktokVideos || 0)
  const peShazam = st.shazamCount || 0
  const reachTotal = peSpotify + peYoutube + peInstagram + peTiktok + peShazam
  const platforme = [peSpotify, peYoutube, peInstagram, peTiktok, peShazam].filter(x => x > 0).length

  const wa = 'https://wa.me/40751144109?text=' + encodeURIComponent('Buna Bogdan, as vrea sa verific disponibilitatea pentru ' + a.nume + ', in localitatea ______, data ______')

  return (
    <div style={{minHeight:'100vh', background:UI.bg, fontFamily:F}}>
      <nav style={{borderBottom:'1px solid '+UI.line, background:'white', height:'56px', display:'flex', alignItems:'center', padding:'0 20px', gap:'8px', position:'sticky', top:0, zIndex:100}}>
        <Link href="/" style={{display:'inline-flex', alignItems:'center', gap:'8px', textDecoration:'none'}}>
          <img src="/gigx-mark.png" width={24} height={24} alt="" style={{display:'block'}} />
          <span style={{fontSize:'20px', fontWeight:800, letterSpacing:'-0.5px', color:UI.ink}}>GIG<span style={{color:UI.green}}>x</span></span>
        </Link>
        <Link href="/roster" style={{marginLeft:'auto', fontSize:'13px', fontWeight:700, color:UI.sub, textDecoration:'none'}}>Catalog</Link>
      </nav>

      <div style={{maxWidth:'760px', margin:'0 auto', padding:'24px 18px 60px'}}>
        <div style={{background:'white', border:'1px solid '+UI.line, borderRadius:'20px', padding:'22px', marginBottom:'12px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
          <div style={{display:'flex', gap:'18px', alignItems:'center', flexWrap:'wrap'}}>
            {a.poza && <img src={a.poza} alt={a.nume} style={{width:'116px', height:'116px', objectFit:'cover', borderRadius:'18px', display:'block', flexShrink:0}} />}
            <div style={{minWidth:0, flex:'1 1 240px'}}>
              <div style={{display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap', marginBottom:'10px'}}>
                <h1 style={{fontSize:'28px', fontWeight:800, color:UI.ink, letterSpacing:'-1px', lineHeight:1.1, margin:0}}>{a.nume}</h1>
                <CheckCircle2 size={17} color={UI.green} strokeWidth={2.4} />
                {t && <span style={{fontSize:'10px', fontWeight:800, color:'white', background:t.c, padding:'3px 9px', borderRadius:'6px', letterSpacing:'0.06em'}}>{t.et}</span>}
              </div>
              <div style={{display:'flex', alignItems:'center', gap:'14px', flexWrap:'wrap', fontSize:'12px', color:UI.sub, fontWeight:600}}>
                {a.genuri?.length > 0 && <span>{a.genuri.join(' · ')}</span>}
                {a.setType && (
                  <span style={{display:'flex', alignItems:'center', gap:'4px'}}>
                    {a.setType === 'dj' ? <Disc3 size={12} strokeWidth={1.6} /> : a.setType === 'cover' ? <Guitar size={12} strokeWidth={1.6} /> : <Mic2 size={12} strokeWidth={1.6} />}
                    {SET_ET[a.setType] || a.setType}{a.durata ? ' · ' + a.durata : ''}
                  </span>
                )}
                {a.orasResedinta && <span style={{display:'flex', alignItems:'center', gap:'4px'}}><MapPin size={12} strokeWidth={1.6} />{a.orasResedinta}</span>}
              </div>
            </div>
          </div>
          {a.bio && <p style={{fontSize:'14px', color:'#44403c', lineHeight:1.7, margin:'18px 0 0'}}>{a.bio}</p>}
        </div>

        {reachTotal > 0 && (
          <div style={{background:UI.ink, borderRadius:'18px', padding:'20px', marginBottom:'12px', textAlign:'center'}}>
            <div style={{fontSize:'42px', fontWeight:800, color:'white', letterSpacing:'-2px', lineHeight:1}}>{nr(reachTotal)}</div>
            <div style={{fontSize:'11px', color:'rgba(245,242,236,0.75)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginTop:'8px'}}>Total Reach</div>
            <div onClick={() => setTip(!tip)} style={{position:'relative', fontSize:'11px', color:'rgba(245,242,236,0.5)', fontWeight:600, marginTop:'4px', borderBottom:'1px dotted rgba(245,242,236,0.35)', display:'inline-block', cursor:'pointer'}}>
              <span style={{color:'#34d399'}}>●</span> Pe {platforme} platforme
              {tip && (
                <div style={{position:'absolute', bottom:'calc(100% + 8px)', left:'50%', transform:'translateX(-50%)', background:'white', color:UI.ink, fontSize:'11px', fontWeight:600, padding:'8px 12px', borderRadius:'8px', boxShadow:'0 4px 16px rgba(0,0,0,0.18)', whiteSpace:'nowrap', zIndex:10}}>
                  Spotify · YouTube · TikTok · Instagram · Shazam
                </div>
              )}
            </div>
          </div>
        )}

        {cifre.length > 0 && (
          <div style={{background:'white', border:'1px solid '+UI.line, borderRadius:'18px', padding:'14px', marginBottom:'12px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(88px, 1fr))', gap:'6px'}}>
              {cifre.map((c, i) => (
                <div key={i} style={{textAlign:'center', padding:'6px 4px', borderRight: i < cifre.length - 1 ? '1px solid #f5f5f4' : 'none'}}>
                  <div style={{fontWeight:800, fontSize:'17px', color:UI.ink, letterSpacing:'-0.5px', lineHeight:1}}>{nr(c.v)}</div>
                  <div style={{fontSize:'9px', color:UI.sub, fontWeight:700, marginTop:'4px', textTransform:'uppercase', letterSpacing:'0.04em'}}>{c.et}</div>
                  <div style={{fontSize:'9px', color:UI.faint, fontWeight:500, marginTop:'2px'}}>{c.d}</div>
                </div>
              ))}
            </div>
            <div style={{textAlign:'center', marginTop:'10px', fontSize:'9px', color:UI.faint, fontWeight:500}}>Analytics provided by chartex.com</div>
          </div>
        )}


        <div style={{background:'white', border:'1px solid '+UI.line, borderRadius:'18px', padding:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
          {a.mediaKit && (
            <a href={a.mediaKit} target="_blank" rel="noreferrer"
              style={{display:'block', textAlign:'center', padding:'13px', background:'white', color:UI.ink, border:'1.5px solid '+UI.line, borderRadius:'12px', fontSize:'13px', fontWeight:700, textDecoration:'none', marginBottom:'10px'}}>
              Descarcă media kit
            </a>
          )}
          {[['Rider tehnic și ospitalitate', a.riderTehnic], ['UCMR', a.ucmr]].filter(d => d[1]).map(([et, url]: any) => (
            <a key={et} href={url} target="_blank" rel="noreferrer"
              style={{display:'block', textAlign:'center', padding:'13px', background:'white', color:UI.ink, border:'1.5px solid '+UI.line, borderRadius:'12px', fontSize:'13px', fontWeight:700, textDecoration:'none', marginBottom:'10px'}}>
              {et}
            </a>
          ))}
          <div style={{textAlign:'center', fontSize:'11.5px', color:UI.sub, fontWeight:600, padding:'6px 0 0'}}>Pentru detalii de producție, contactează inginerul de sunet sau production managerul din documentele de mai sus.</div>
        </div>

        <div style={{textAlign:'center', fontSize:'11.5px', color:UI.faint, marginTop:'18px', lineHeight:1.6}}>
          Booking prin Forward Agency · <Link href="/roster" style={{color:UI.green, fontWeight:700, textDecoration:'none'}}>vezi toți artiștii</Link>
        </div>
      </div>
    </div>
  )
}
