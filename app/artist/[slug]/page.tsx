import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Music2, MapPin, CheckCircle2, ArrowRight, Mic2, Disc3, Guitar } from 'lucide-react'
import { InstagramLogo, SpotifyLogo, YoutubeLogo, TiktokLogo, FacebookLogo, SoundcloudLogo } from '@phosphor-icons/react/dist/ssr'


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const VIBE_LABELS: Record<string, string> = {
  hype: 'Hype & Energie',
  elegant: 'Elegant & Luxury',
  petrecere: 'Petrecere & Mainstream',
  balcanic: 'Balkan Energy',
  chill: 'Chill & Lounge',
  dayparty: 'Day Party',
  festival: 'Festival Energy',
  rooftop: 'Rooftop Cool',
  nostalgic: 'Nostalgic & Evergreen',
}

const SET_TYPE_LABELS: Record<string, string> = {
  vocal: 'Artist Vocal',
  dj: 'DJ Set',
  cover: 'Trupă / Cover Band',
}

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: artist } = await supabase
    .from('artists')
    .select('*')
    .eq('slug', slug)
    .single()

  console.log("Slug:", slug, "Artist:", artist)
  if (!artist) notFound()



  const displayName = artist.artistName || artist.slug

  // Fetch imagine din Spotify daca exista link
  let spotifyImage = null
  let chartexStats: any = null
  const baseUrl = process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'
  
  let spotifyData: any = null
  if (artist.spotify) {
    try {
      const res = await fetch(baseUrl + '/api/spotify?url=' + encodeURIComponent(artist.spotify), { next: { revalidate: 86400 } })
      const data = await res.json()
      if (data.image) spotifyImage = data.image
      if (data.followers || data.popularity) spotifyData = data
    } catch {}
  }

  try {
    const chartexRes = await fetch(
      baseUrl + '/api/chartex?action=artist_full&artist=' + encodeURIComponent(artist.artistName || '') + '&country=RO',
      { next: { revalidate: 3600 } }
    )
    const data = await chartexRes.json()
    chartexStats = {
      totalViews: data.totalTiktokViews || 0,
      total7DaysVideos: data.total7DaysVideos || 0,
      soundsCount: data.soundsCount || 0,
      bestPosition: data.bestTrendingPosition || 0,
      topSongs: data.topSongs || [],
      heatScore: data.heatScore || 65,
      hypeStatus: data.hypeStatus || 'verified',
    }
  } catch {}
  let vibes: string[] = []
  if (Array.isArray(artist.vibes)) {
    vibes = artist.vibes
  } else if (typeof artist.vibes === 'string') {
    try { vibes = JSON.parse(artist.vibes) } catch { vibes = [artist.vibes] }
  }
  const genres = Array.isArray(artist.genres) ? artist.genres : []

  return (
    <div style={{minHeight:'100vh', background:'#f5f5f7', fontFamily:'Montserrat,sans-serif'}}>
      
      {/* Navbar */}
      <nav style={{background:'white', borderBottom:'1px solid #e7e5e4', position:'sticky', top:0, zIndex:100}}>
        <div style={{maxWidth:'900px', margin:'0 auto', padding:'0 24px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <Link href="/" style={{fontWeight:800, fontSize:'16px', color:'#1c1917', textDecoration:'none', letterSpacing:'-0.5px'}}>
            GIG<span style={{color:'#059669'}}>x</span>
          </Link>
          <Link href="/dashboard/client" style={{background:'#1c1917', color:'white', padding:'8px 18px', borderRadius:'10px', fontSize:'12px', fontWeight:700, textDecoration:'none'}}>
            Caută artiști
          </Link>
        </div>
      </nav>

      <div style={{maxWidth:'700px', margin:'0 auto', padding:'32px 24px'}}>
        
        {/* Header artist */}
        <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'24px', padding:'32px', marginBottom:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
          <div style={{display:'flex', alignItems:'flex-start', gap:'20px', marginBottom:'20px'}}>
            <div style={{width:'72px', height:'72px', borderRadius:'18px', background:'#1c1917', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden'}}>
              {spotifyImage ? (
                <img src={spotifyImage} alt={displayName} style={{width:'100%', height:'100%', objectFit:'cover'}} />
              ) : (
                <span style={{fontSize:'28px', color:'white', fontWeight:800}}>{displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div style={{flex:1}}>
              <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px'}}>
                <h1 style={{fontSize:'24px', fontWeight:800, color:'#1c1917', margin:0, letterSpacing:'-0.5px'}}>{displayName}</h1>
                {artist.is_verified && (
                  <CheckCircle2 size={18} color='#059669' strokeWidth={2} />
                )}
              </div>
              <div style={{display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap'}}>
                {artist.setType && (
                  <div style={{display:'flex', alignItems:'center', gap:'4px', fontSize:'12px', color:'#78716c', fontWeight:600}}>
                    {artist.setType === 'dj' ? <Disc3 size={12} strokeWidth={1.5} /> : artist.setType === 'cover' ? <Guitar size={12} strokeWidth={1.5} /> : <Mic2 size={12} strokeWidth={1.5} />}
                    {SET_TYPE_LABELS[artist.setType] || artist.setType}
                  </div>
                )}
                {artist.cityFrom && (
                  <div style={{display:'flex', alignItems:'center', gap:'4px', fontSize:'12px', color:'#78716c', fontWeight:600}}>
                    <MapPin size={12} strokeWidth={1.5} />
                    {artist.cityFrom}
                  </div>
                )}
              </div>
            </div>
          </div>

          {artist.bio && (
            <p style={{fontSize:'14px', color:'#44403c', lineHeight:1.7, margin:'0 0 20px'}}>{artist.bio}</p>
          )}




        </div>

        {/* Spotify Stats (fallback cand nu avem Chartex) */}
        {!chartexStats && spotifyData && (spotifyData.followers > 1000 || spotifyData.popularity > 30) && (
          <div style={{background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'20px', padding:'20px', marginBottom:'16px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'6px', marginBottom:'12px'}}>
              <span style={{fontSize:'10px', fontWeight:700, color:'#059669', textTransform:'uppercase', letterSpacing:'0.08em'}}>● Spotify Stats</span>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'12px'}}>
              {spotifyData.followers > 1000 && (
                <div style={{textAlign:'center', padding:'14px 10px', background:'white', borderRadius:'12px'}}>
                  <div style={{fontWeight:800, fontSize:'18px', color:'#059669', letterSpacing:'-0.5px'}}>{spotifyData.followers > 1000000 ? (spotifyData.followers/1000000).toFixed(1)+'M' : spotifyData.followers > 1000 ? (spotifyData.followers/1000).toFixed(1)+'K' : spotifyData.followers}</div>
                  <div style={{fontSize:'10px', color:'#78716c', fontWeight:600, marginTop:'4px', textTransform:'uppercase'}}>Followers Spotify</div>
                </div>
              )}
              {spotifyData.popularity > 30 && (
                <div style={{textAlign:'center', padding:'14px 10px', background:'white', borderRadius:'12px'}}>
                  <div style={{fontWeight:800, fontSize:'18px', color:'#059669', letterSpacing:'-0.5px'}}>{spotifyData.popularity}/100</div>
                  <div style={{fontSize:'10px', color:'#78716c', fontWeight:600, marginTop:'4px', textTransform:'uppercase'}}>Popularity Score</div>
                </div>
              )}
              {spotifyData.popularity > 60 && (
                <div style={{textAlign:'center', padding:'14px 10px', background:'white', borderRadius:'12px'}}>
                  <div style={{fontWeight:800, fontSize:'18px', color:'#059669', letterSpacing:'-0.5px'}}>Top {Math.max(1, 100 - spotifyData.popularity)}%</div>
                  <div style={{fontSize:'10px', color:'#78716c', fontWeight:600, marginTop:'4px', textTransform:'uppercase'}}>Artisti Spotify</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Cards 2026 */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'10px', marginBottom:'16px'}}>
          {/* Card 1 - Raspuns */}
          <div style={{padding:'20px 14px', background:'white', border:'1px solid #e7e5e4', borderRadius:'18px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', position:'relative', overflow:'hidden'}}>
            <div style={{position:'absolute', top:0, right:0, width:'4px', height:'100%', background:'#059669'}}></div>
            <div style={{fontWeight:800, fontSize:'26px', color:'#1c1917', letterSpacing:'-1px', lineHeight:1}}>30<span style={{fontSize:'14px', fontWeight:700, color:'#78716c', marginLeft:'2px'}}>min</span></div>
            <div style={{fontSize:'10px', color:'#78716c', fontWeight:700, marginTop:'10px', textTransform:'uppercase', letterSpacing:'0.06em'}}>Răspuns garantat</div>
            <div style={{marginTop:'8px', display:'flex', alignItems:'center', gap:'4px'}}>
              <div style={{width:'6px', height:'6px', borderRadius:'50%', background:'#059669'}}></div>
              <span style={{fontSize:'10px', color:'#059669', fontWeight:700}}>Activ acum</span>
            </div>
          </div>

          {/* Card 2 - Heat Score */}
          <div style={{padding:'20px 14px', background:'white', border:'1px solid #e7e5e4', borderRadius:'18px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', position:'relative', overflow:'hidden'}}>
            {(() => {
              const score = chartexStats?.heatScore || 65
              const color = score >= 90 ? '#7c3aed' : score >= 75 ? '#3b82f6' : score >= 65 ? '#06b6d4' : '#a8a29e'
              const label = score >= 90 ? 'Hot' : score >= 75 ? 'Trending' : score >= 65 ? 'Active' : 'New'
              return (
                <>
                  <div style={{position:'absolute', top:0, right:0, width:'4px', height:'100%', background:color}}></div>
                  <div style={{fontWeight:800, fontSize:'26px', color:'#1c1917', letterSpacing:'-1px', lineHeight:1}}>{score}<span style={{fontSize:'14px', fontWeight:700, color:'#78716c', marginLeft:'2px'}}>/100</span></div>
                  <div style={{fontSize:'10px', color:'#78716c', fontWeight:700, marginTop:'10px', textTransform:'uppercase', letterSpacing:'0.06em'}}>Heat Score</div>
                  <div style={{marginTop:'8px', width:'100%', height:'4px', background:'#f5f5f4', borderRadius:'2px', overflow:'hidden'}}>
                    <div style={{width: score + '%', height:'100%', background:color, borderRadius:'2px'}}></div>
                  </div>
                  <div style={{marginTop:'6px', fontSize:'10px', color:color, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>{label}</div>
                </>
              )
            })()}
          </div>

          {/* Card 3 - Verified */}
          <div style={{padding:'20px 14px', background:'white', border:'1px solid #e7e5e4', borderRadius:'18px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', position:'relative', overflow:'hidden'}}>
            <div style={{position:'absolute', top:0, right:0, width:'4px', height:'100%', background:'#1c1917'}}></div>
            <CheckCircle2 size={26} color='#059669' strokeWidth={2.5} fill='#dcfce7' />
            <div style={{fontSize:'10px', color:'#78716c', fontWeight:700, marginTop:'10px', textTransform:'uppercase', letterSpacing:'0.06em'}}>GIGx Verified</div>
            <div style={{marginTop:'8px', fontSize:'10px', color:'#1c1917', fontWeight:700}}>Artist confirmat</div>
          </div>
        </div>

        {/* Social links - monocrom default, colorat la hover */}
        {(artist.instagram || artist.spotify || artist.youtube || artist.tiktok || artist.facebook || artist.soundcloud) && (
          <>
            <style>{`
              .social-btn { transition: all 0.2s ease; color: #1c1917; background: white; border: 1px solid #e7e5e4; text-decoration: none; }
              .social-btn svg { transition: all 0.2s ease; color: #1c1917; }
              .social-btn-ig:hover { background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045); color: white; border-color: transparent; }
              .social-btn-ig:hover svg { color: white; }
              .social-btn-sp:hover { background: #1db954; color: white; border-color: #1db954; }
              .social-btn-sp:hover svg { color: white; }
              .social-btn-yt:hover { background: #ff0000; color: white; border-color: #ff0000; }
              .social-btn-yt:hover svg { color: white; }
              .social-btn-tt:hover { background: #000000; color: white; border-color: #000000; }
              .social-btn-tt:hover svg { color: white; }
              .social-btn-fb:hover { background: #1877f2; color: white; border-color: #1877f2; }
              .social-btn-fb:hover svg { color: white; }
              .social-btn-sc:hover { background: #ff5500; color: white; border-color: #ff5500; }
              .social-btn-sc:hover svg { color: white; }
            `}</style>
            <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'20px', marginBottom:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'12px'}}>Urmărește</div>
              <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
                {artist.instagram && (
                  <a href={'https://instagram.com/' + artist.instagram.replace('@','')} target="_blank" rel="noopener noreferrer" className="social-btn social-btn-ig"
                    style={{display:'flex', alignItems:'center', gap:'6px', padding:'9px 14px', borderRadius:'12px', fontSize:'12px', fontWeight:600}}>
                    <InstagramLogo size={14} weight="fill" /> Instagram
                  </a>
                )}
                {artist.spotify && (
                  <a href={artist.spotify} target="_blank" rel="noopener noreferrer" className="social-btn social-btn-sp"
                    style={{display:'flex', alignItems:'center', gap:'6px', padding:'9px 14px', borderRadius:'12px', fontSize:'12px', fontWeight:600}}>
                    <SpotifyLogo size={14} weight="fill" /> Spotify
                  </a>
                )}
                {artist.youtube && (
                  <a href={artist.youtube} target="_blank" rel="noopener noreferrer" className="social-btn social-btn-yt"
                    style={{display:'flex', alignItems:'center', gap:'6px', padding:'9px 14px', borderRadius:'12px', fontSize:'12px', fontWeight:600}}>
                    <YoutubeLogo size={14} weight="fill" /> YouTube
                  </a>
                )}
                {artist.tiktok && (
                  <a href={'https://tiktok.com/@' + artist.tiktok.replace('@','')} target="_blank" rel="noopener noreferrer" className="social-btn social-btn-tt"
                    style={{display:'flex', alignItems:'center', gap:'6px', padding:'9px 14px', borderRadius:'12px', fontSize:'12px', fontWeight:600}}>
                    <TiktokLogo size={14} weight="fill" /> TikTok
                  </a>
                )}
                {artist.facebook && (
                  <a href={artist.facebook} target="_blank" rel="noopener noreferrer" className="social-btn social-btn-fb"
                    style={{display:'flex', alignItems:'center', gap:'6px', padding:'9px 14px', borderRadius:'12px', fontSize:'12px', fontWeight:600}}>
                    <FacebookLogo size={14} weight="fill" /> Facebook
                  </a>
                )}
                {artist.soundcloud && (
                  <a href={artist.soundcloud} target="_blank" rel="noopener noreferrer" className="social-btn social-btn-sc"
                    style={{display:'flex', alignItems:'center', gap:'6px', padding:'9px 14px', borderRadius:'12px', fontSize:'12px', fontWeight:600}}>
                    <SoundcloudLogo size={14} weight="fill" /> SoundCloud
                  </a>
                )}
              </div>
            </div>
          </>
        )}

        {/* Rider Tehnic */}
        {artist.rider_url && (
          <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'20px', marginBottom:'16px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div>
              <div style={{fontWeight:700, fontSize:'14px', color:'#1c1917', marginBottom:'4px'}}>Rider Tehnic</div>
              <div style={{fontSize:'12px', color:'#78716c'}}>Cerințe scenă, sunet și lumini</div>
            </div>
            <a href={artist.rider_url} target="_blank" rel="noopener noreferrer"
              style={{background:'#1c1917', color:'white', padding:'10px 20px', borderRadius:'12px', fontSize:'12px', fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', gap:'6px', whiteSpace:'nowrap'}}>
              Vezi rider <ArrowRight size={14} strokeWidth={2} />
            </a>
          </div>
        )}

        {/* Rider Tehnic */}
        {artist.rider_url && (
          <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'20px', marginBottom:'16px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div>
              <div style={{fontWeight:700, fontSize:'14px', color:'#1c1917', marginBottom:'4px'}}>Rider Tehnic</div>
              <div style={{fontSize:'12px', color:'#78716c'}}>Cerințe scenă, sunet și lumini</div>
            </div>
            <a href={artist.rider_url} target="_blank" rel="noopener noreferrer"
              style={{background:'#1c1917', color:'white', padding:'10px 20px', borderRadius:'12px', fontSize:'12px', fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', gap:'6px', whiteSpace:'nowrap'}}>
              Vezi rider <ArrowRight size={14} strokeWidth={2} />
            </a>
          </div>
        )}

        {/* CTA Booking */}
        <div style={{background:'#1c1917', borderRadius:'20px', padding:'28px', textAlign:'center'}}>
          <div style={{fontWeight:800, fontSize:'18px', color:'white', marginBottom:'8px', letterSpacing:'-0.5px'}}>
            Vrei să bookezi {displayName}?
          </div>
          <div style={{fontSize:'13px', color:'rgba(255,255,255,0.6)', marginBottom:'20px'}}>
            Trimite o cerere și primești răspuns în 30 de minute.
          </div>
          <Link href={'/dashboard/client?artist=' + (artist.slug || '')}
            style={{background:'#059669', color:'white', padding:'13px 28px', borderRadius:'14px', fontSize:'14px', fontWeight:700, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'8px'}}>
            Solicită booking <ArrowRight size={16} strokeWidth={2} />
          </Link>
        </div>

      </div>
    </div>
  )
}
