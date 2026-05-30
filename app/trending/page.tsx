'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, TrendingUp, Music2, Play } from 'lucide-react'

export default function TrendingPage() {
  const [sounds, setSounds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/chartex?action=trending&country=RO&limit=20')
      .then(r => r.json())
      .then(d => {
        setSounds(d.data?.items || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{minHeight:'100vh', background:'#fafaf9', fontFamily:'Montserrat,sans-serif'}}>
      <nav style={{background:'white', borderBottom:'1px solid #e7e5e4', position:'sticky', top:0, zIndex:100}}>
        <div style={{maxWidth:'1100px', margin:'0 auto', padding:'0 24px', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <Link href="/" style={{fontWeight:800, fontSize:'18px', color:'#1c1917', textDecoration:'none', letterSpacing:'-0.5px'}}>
            GIG<span style={{color:'#059669'}}>x</span>
          </Link>
          <Link href="/dashboard/client" style={{background:'#1c1917', color:'white', padding:'9px 20px', borderRadius:'12px', fontSize:'13px', fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', gap:'6px'}}>
            Caută artist <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>
      </nav>

      <div style={{maxWidth:'900px', margin:'0 auto', padding:'40px 24px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'8px'}}>
          <TrendingUp size={28} color='#dc2626' strokeWidth={2} />
          <h1 style={{fontSize:'32px', fontWeight:800, color:'#1c1917', margin:0, letterSpacing:'-1px'}}>Trending în România</h1>
        </div>
        <p style={{fontSize:'15px', color:'#78716c', marginBottom:'32px'}}>
          Sound-urile virale de pe TikTok România în ultima săptămână. Updatat în timp real.
        </p>

        {loading && <div style={{textAlign:'center', padding:'40px', color:'#a8a29e'}}>Se încarcă...</div>}

        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
          {sounds.map((s, i) => (
            <div key={s.tiktok_sound_id} style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'16px', padding:'16px', display:'flex', alignItems:'center', gap:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
              <div style={{width:'32px', textAlign:'center', fontWeight:800, fontSize:'18px', color:'#a8a29e'}}>{i + 1}</div>
              {s.song_image_url ? (
                <img src={s.song_image_url} alt={s.song_name} style={{width:'64px', height:'64px', borderRadius:'12px', objectFit:'cover'}} />
              ) : (
                <div style={{width:'64px', height:'64px', borderRadius:'12px', background:'#f5f5f4', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <Music2 size={24} color='#a8a29e' strokeWidth={1.5} />
                </div>
              )}
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontWeight:700, fontSize:'15px', color:'#1c1917', marginBottom:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                  {s.song_name || s.tiktok_name_of_sound}
                </div>
                <div style={{fontSize:'13px', color:'#78716c', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                  {s.artists || s.tiktok_sound_creator_name}
                </div>
                {s.label_name && (
                  <div style={{fontSize:'11px', color:'#a8a29e', marginTop:'2px'}}>{s.label_name}</div>
                )}
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontWeight:800, fontSize:'18px', color:'#dc2626'}}>+{s.tiktok_last_7_days_video_count?.toLocaleString('ro-RO')}</div>
                <div style={{fontSize:'10px', color:'#78716c', fontWeight:600, textTransform:'uppercase'}}>video-uri/7 zile</div>
                <div style={{fontSize:'11px', color:'#059669', fontWeight:600, marginTop:'4px'}}>{(s.total_video_views / 1000000).toFixed(1)}M views</div>
              </div>
              <a href={s.tiktok_official_link} target="_blank" rel="noopener noreferrer"
                style={{padding:'10px', borderRadius:'10px', background:'#1c1917', color:'white', textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <Play size={14} strokeWidth={2} fill='white' />
              </a>
            </div>
          ))}
        </div>

        <div style={{marginTop:'40px', padding:'24px', background:'#1c1917', borderRadius:'20px', textAlign:'center'}}>
          <div style={{fontWeight:800, fontSize:'20px', color:'white', marginBottom:'8px', letterSpacing:'-0.5px'}}>
            Vrei să bookezi acești artiști?
          </div>
          <div style={{fontSize:'13px', color:'rgba(255,255,255,0.6)', marginBottom:'20px'}}>
            GIGx te conectează cu artiști trending din România.
          </div>
          <Link href="/dashboard/client" style={{background:'#059669', color:'white', padding:'13px 28px', borderRadius:'14px', fontSize:'14px', fontWeight:700, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'8px'}}>
            Trimite cerere de booking <ArrowRight size={16} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  )
}
