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
      totalTiktokVideos: data.totalTiktokVideos || 0,
      total7DaysVideos: data.total7DaysVideos || 0,
      soundsCount: data.soundsCount || 0,
      songsCount: data.songsCount || 0,
      bestPosition: data.bestTrendingPosition || 0,
      topSongs: data.topSongs || [],
      heatScore: data.heatScore || 65,
      hypeStatus: data.hypeStatus || 'verified',
      spotifyStreams: data.spotifyStreams || 0,
      youtubeViews: data.youtubeViews || 0,
      shazamCount: data.shazamCount || 0,
      totalReach: data.totalReach || 0,
    }
  } catch {}
  const formatNum = (n: number) => {
    if (n >= 1000000000) return (n/1000000000).toFixed(1) + 'B'
    if (n >= 1000000) return (n/1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n/1000).toFixed(1) + 'K'
    return n.toString()
  }

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

      {/* Legenda tier-uri */}
      <style>{`
        .tier-item { position: relative; cursor: pointer; display: flex; align-items: center; gap: 5px; padding: 4px 8px; border-radius: 8px; transition: background 0.2s; }
        .tier-item:hover { background: #fafaf9; }
        .tier-tooltip { position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%); background: #1c1917; color: white; padding: 8px 12px; border-radius: 8px; font-size: 11px; font-weight: 500; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 0.2s; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .tier-item:hover .tier-tooltip { opacity: 1; }
      `}</style>
      <div style={{background:'white', borderBottom:'1px solid #f5f5f4'}}>
        <div style={{maxWidth:'900px', margin:'0 auto', padding:'10px 24px', display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', flexWrap:'wrap'}}>
          <span style={{fontSize:'10px', color:'#a8a29e', fontWeight:600, letterSpacing:'0.05em'}}>BOX OFFICE TIERS</span>
          <div className="tier-item">
            <span style={{width:'8px', height:'8px', borderRadius:'50%', background:'#eacda3'}}></span>
            <span style={{fontSize:'11px', color:'#44403c', fontWeight:600}}>A++ Headliner</span>
            <span className="tier-tooltip">Top tier - vinde singur orice eveniment</span>
          </div>
          <div className="tier-item">
            <span style={{width:'8px', height:'8px', borderRadius:'50%', background:'#7c3aed'}}></span>
            <span style={{fontSize:'11px', color:'#44403c', fontWeight:600}}>A+ Power Draw</span>
            <span className="tier-tooltip">Tractiune puternica - vanzari consistente</span>
          </div>
          <div className="tier-item">
            <span style={{width:'8px', height:'8px', borderRadius:'50%', background:'#44403c'}}></span>
            <span style={{fontSize:'11px', color:'#44403c', fontWeight:600}}>A Solid</span>
            <span className="tier-tooltip">Atractie solida - fan base loial</span>
          </div>
        </div>
      </div>

      <div style={{maxWidth:'700px', margin:'0 auto', padding:'32px 24px'}}>
        
        {/* Header artist */}
        <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'18px', padding:'20px', marginBottom:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
          <div style={{display:'flex', alignItems:'flex-start', gap:'20px', marginBottom:'20px'}}>
            <div style={{width:'56px', height:'56px', borderRadius:'14px', background:'#1c1917', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden'}}>
              {spotifyImage ? (
                <img src={spotifyImage} alt={displayName} style={{width:'100%', height:'100%', objectFit:'cover'}} />
              ) : (
                <span style={{fontSize:'22px', color:'white', fontWeight:800}}>{displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div style={{flex:1}}>
              <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                <h1 style={{fontSize:'20px', fontWeight:800, color:'#1c1917', margin:0, letterSpacing:'-0.5px'}}>{displayName}</h1>
                <span title="Artist verificat GIGx" style={{display:'inline-flex', alignItems:'center', justifyContent:'center', width:'18px', height:'18px', borderRadius:'50%', background:'#1c1917', flexShrink:0}}>
                  <CheckCircle2 size={11} color='#eacda3' strokeWidth={3.5} />
                </span>
              </div>
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
          <div style={{background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'20px', padding:'20px', marginBottom:'10px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'6px', marginBottom:'10px'}}>
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
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'10px', marginBottom:'10px'}}>
          {/* Card 1 - Raspuns */}
          <div style={{padding:'14px 12px', background:'white', border:'1px solid #e7e5e4', borderRadius:'18px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', position:'relative', overflow:'hidden'}}>
            <div style={{position:'absolute', top:'12px', right:'0', width:'3px', height:'calc(100% - 24px)', background:'#059669', borderTopLeftRadius:'2px', borderBottomLeftRadius:'2px'}}></div>
            <div style={{fontWeight:700, fontSize:'22px', color:'#1c1917', letterSpacing:'-1px', lineHeight:1}}>30<span style={{fontSize:'14px', fontWeight:500, color:'#78716c', marginLeft:'2px'}}>min</span></div>
            <div style={{fontWeight:600, fontSize:'12px', color:'#1c1917', letterSpacing:'-0.2px', lineHeight:1.3, marginTop:'6px'}}>Răspuns garantat</div>
            <div style={{fontSize:'10px', color:'#059669', fontWeight:500, marginTop:'5px', letterSpacing:'0.02em'}}>● Activ acum</div>
          </div>

          {/* Card 2 - Box Office Power */}
          <div className="tier-item" style={{padding:'14px 12px', background:'white', border:'1px solid #e7e5e4', borderRadius:'18px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', position:'relative', display:'block'}}>
            {(() => {
              const tier = artist.tier || ''
              const tierMap: Record<string, {label: string, color: string, public: boolean, sub: string}> = {
                'A++': {label: 'HEADLINER', color: '#eacda3', public: true, sub: 'Top tier'},
                'Premium': {label: 'HEADLINER', color: '#eacda3', public: true, sub: 'Top tier'},
                'A+': {label: 'POWER DRAW', color: '#7c3aed', public: true, sub: 'Tracțiune puternică'},
                'A': {label: 'SOLID', color: '#44403c', public: true, sub: 'Atracție solidă'},
              }
              const data = tierMap[tier] || {label: 'BOOKING ACTIV', color: '#059669', public: false, sub: 'Activ acum'}
              const tooltipText = data.label === 'HEADLINER' ? 'Top tier - vinde singur orice eveniment' 
                : data.label === 'POWER DRAW' ? 'Tractiune puternica - vanzari consistente' 
                : data.label === 'SOLID' ? 'Atractie solida - fan base loial' 
                : 'Artist activ pe platforma'
              return (
                <>
                  <div style={{position:'absolute', top:'12px', right:'0', width:'3px', height:'calc(100% - 24px)', background:data.color, borderTopLeftRadius:'2px', borderBottomLeftRadius:'2px'}}></div>
                  <span className="tier-tooltip">{tooltipText}</span>
                  {data.public && (
                    <div style={{fontWeight:700, fontSize:'22px', color:data.color, letterSpacing:'-1px', lineHeight:1}}>{tier}</div>
                  )}
                  <div style={{fontWeight:600, fontSize:'12px', color:'#1c1917', letterSpacing:'-0.2px', lineHeight:1.3, marginTop: data.public ? '10px' : '30px'}}>
                    {data.label}
                  </div>
                  <div style={{fontSize:'10px', color:data.color, fontWeight:500, marginTop:'5px', letterSpacing:'0.02em'}}>● {data.sub}</div>
                </>
              )
            })()}
          </div>

          {/* Card 3 - Total Reach */}
          <div style={{padding:'14px 12px', background:'white', border:'1px solid #e7e5e4', borderRadius:'18px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', position:'relative', overflow:'hidden'}}>
            <div style={{position:'absolute', top:'12px', right:'0', width:'3px', height:'calc(100% - 24px)', background:'#059669', borderTopLeftRadius:'2px', borderBottomLeftRadius:'2px'}}></div>
            {chartexStats && chartexStats.totalReach > 1000000 ? (
              <>
                <div style={{fontWeight:700, fontSize:'22px', color:'#1c1917', letterSpacing:'-1px', lineHeight:1}}>
                  {chartexStats.totalReach > 1000000000 ? (chartexStats.totalReach/1000000000).toFixed(1)+'B' : chartexStats.totalReach > 1000000 ? (chartexStats.totalReach/1000000).toFixed(1)+'M' : (chartexStats.totalReach/1000).toFixed(0)+'K'}
                </div>
                <div style={{fontWeight:600, fontSize:'12px', color:'#1c1917', letterSpacing:'-0.2px', lineHeight:1.3, marginTop:'6px'}}>Total Reach</div>
                <div style={{fontSize:'10px', color:'#059669', fontWeight:500, marginTop:'5px', letterSpacing:'0.02em'}}>● Pe 4 platforme</div>
              </>
            ) : (
              <>
                <CheckCircle2 size={22} color='#059669' strokeWidth={2.5} fill='#dcfce7' />
                <div style={{fontWeight:600, fontSize:'12px', color:'#1c1917', letterSpacing:'-0.2px', lineHeight:1.3, marginTop:'6px'}}>GIGx Verified</div>
                <div style={{fontSize:'10px', color:'#78716c', fontWeight:500, marginTop:'5px', letterSpacing:'0.02em'}}>Artist confirmat</div>
              </>
            )}
          </div>
        </div>

        {/* Social links - monocrom default, colorat la hover */}
        {(artist.instagram || artist.spotify || artist.youtube || artist.tiktok || artist.facebook || artist.soundcloud) && (
          <>
            <style>{`
              .social-btn { transition: all 0.2s ease; color: #78716c; background: transparent; border: 1px solid #e7e5e4; text-decoration: none; }
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
            <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'14px', padding:'14px', marginBottom:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>

              <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
                {artist.instagram && (
                  <a href={'https://instagram.com/' + artist.instagram.replace('@','')} target="_blank" rel="noopener noreferrer" className="social-btn social-btn-ig"
                    style={{display:'flex', alignItems:'center', gap:'5px', padding:'5px 10px', borderRadius:'8px', fontSize:'10px', fontWeight:500}}>
                    <InstagramLogo size={11} /> Instagram
                  </a>
                )}
                {artist.spotify && (
                  <a href={artist.spotify} target="_blank" rel="noopener noreferrer" className="social-btn social-btn-sp"
                    style={{display:'flex', alignItems:'center', gap:'5px', padding:'5px 10px', borderRadius:'8px', fontSize:'10px', fontWeight:500}}>
                    <SpotifyLogo size={11} /> Spotify
                  </a>
                )}
                {artist.youtube && (
                  <a href={artist.youtube} target="_blank" rel="noopener noreferrer" className="social-btn social-btn-yt"
                    style={{display:'flex', alignItems:'center', gap:'5px', padding:'5px 10px', borderRadius:'8px', fontSize:'10px', fontWeight:500}}>
                    <YoutubeLogo size={11} /> YouTube
                  </a>
                )}
                {artist.tiktok && (
                  <a href={'https://tiktok.com/@' + artist.tiktok.replace('@','')} target="_blank" rel="noopener noreferrer" className="social-btn social-btn-tt"
                    style={{display:'flex', alignItems:'center', gap:'5px', padding:'5px 10px', borderRadius:'8px', fontSize:'10px', fontWeight:500}}>
                    <TiktokLogo size={11} /> TikTok
                  </a>
                )}
                {artist.facebook && (
                  <a href={artist.facebook} target="_blank" rel="noopener noreferrer" className="social-btn social-btn-fb"
                    style={{display:'flex', alignItems:'center', gap:'5px', padding:'5px 10px', borderRadius:'8px', fontSize:'10px', fontWeight:500}}>
                    <FacebookLogo size={11} /> Facebook
                  </a>
                )}
                {artist.soundcloud && (
                  <a href={artist.soundcloud} target="_blank" rel="noopener noreferrer" className="social-btn social-btn-sc"
                    style={{display:'flex', alignItems:'center', gap:'5px', padding:'5px 10px', borderRadius:'8px', fontSize:'10px', fontWeight:500}}>
                    <SoundcloudLogo size={11} /> SoundCloud
                  </a>
                )}
              </div>
            </div>
          </>
        )}

{/* Spotify Music Showcase */}
        {artist.spotify && (() => {
          const match = artist.spotify.match(/artist\/([a-zA-Z0-9]+)/)
          const spotifyId = match ? match[1] : null
          if (!spotifyId) return null
          return (
            <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'14px', padding:'14px', marginBottom:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>

              <iframe
                src={'https://open.spotify.com/embed/artist/' + spotifyId + '?utm_source=generator&theme=0'}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{borderRadius:'12px'}}
              />
            </div>
          )
        })()}

        {/* Rider Tehnic */}
        {artist.rider_url && (
          <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'20px', marginBottom:'10px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
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

        
        {artist.rider_url && (
          <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'20px', marginBottom:'10px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
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
          <div style={{fontSize:'12px', color:'rgba(255,255,255,0.6)', marginBottom:'20px'}}>
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
