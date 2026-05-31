import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Music2, MapPin, CheckCircle2, ArrowRight, Mic2, Disc3, Guitar } from 'lucide-react'


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
    if (data.soundsCount > 0) {
      chartexStats = {
        totalViews: data.totalTiktokViews,
        total7DaysVideos: data.total7DaysVideos,
        soundsCount: data.soundsCount,
        bestPosition: data.bestTrendingPosition,
        topSongs: data.topSongs,
      }
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
    <div style={{minHeight:'100vh', background:'#fafaf9', fontFamily:'Montserrat,sans-serif'}}>
      
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

        {/* Chartex Live Stats */}
        {chartexStats && (
          <div style={{background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'20px', padding:'20px', marginBottom:'16px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'6px', marginBottom:'12px'}}>
              <span style={{fontSize:'10px', fontWeight:700, color:'#dc2626', textTransform:'uppercase', letterSpacing:'0.08em'}}>● Live Stats — TikTok România</span>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'12px'}}>
              {chartexStats.totalViews > 1000000 && (
                <div style={{textAlign:'center', padding:'14px 10px', background:'white', borderRadius:'12px'}}>
                  <div style={{fontWeight:800, fontSize:'18px', color:'#dc2626', letterSpacing:'-0.5px'}}>{(chartexStats.totalViews / 1000000).toFixed(1)}M</div>
                  <div style={{fontSize:'10px', color:'#78716c', fontWeight:600, marginTop:'4px', textTransform:'uppercase'}}>Views TikTok</div>
                </div>
              )}
              {chartexStats.total7DaysVideos > 100 && (
                <div style={{textAlign:'center', padding:'14px 10px', background:'white', borderRadius:'12px'}}>
                  <div style={{fontWeight:800, fontSize:'18px', color:'#1c1917', letterSpacing:'-0.5px'}}>{chartexStats.total7DaysVideos.toLocaleString('ro-RO')}</div>
                  <div style={{fontSize:'10px', color:'#78716c', fontWeight:600, marginTop:'4px', textTransform:'uppercase'}}>Video-uri / 7 zile</div>
                </div>
              )}
              {chartexStats.bestPosition > 0 && chartexStats.bestPosition <= 50 && (
                <div style={{textAlign:'center', padding:'14px 10px', background:'white', borderRadius:'12px'}}>
                  <div style={{fontWeight:800, fontSize:'18px', color:'#dc2626', letterSpacing:'-0.5px'}}>Top {chartexStats.bestPosition}</div>
                  <div style={{fontSize:'10px', color:'#78716c', fontWeight:600, marginTop:'4px', textTransform:'uppercase'}}>Trending RO</div>
                </div>
              )}
              {chartexStats.soundsCount > 0 && (
                <div style={{textAlign:'center', padding:'14px 10px', background:'white', borderRadius:'12px'}}>
                  <div style={{fontWeight:800, fontSize:'18px', color:'#dc2626', letterSpacing:'-0.5px'}}>{chartexStats.soundsCount}</div>
                  <div style={{fontSize:'10px', color:'#78716c', fontWeight:600, marginTop:'4px', textTransform:'uppercase'}}>Sound{chartexStats.soundsCount > 1 ? '-uri' : ''} viral{chartexStats.soundsCount > 1 ? 'e' : ''}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats FOMO */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'10px', marginBottom:'16px'}}>
          <div style={{textAlign:'center', padding:'18px 12px', background:'#059669', borderRadius:'16px', boxShadow:'0 1px 4px rgba(5,150,105,0.15)'}}>
            <div style={{fontWeight:800, fontSize:'20px', color:'white', letterSpacing:'-0.5px'}}>30 min</div>
            <div style={{fontSize:'10px', color:'rgba(255,255,255,0.85)', fontWeight:600, marginTop:'6px', textTransform:'uppercase', letterSpacing:'0.05em'}}>Răspuns garantat</div>
          </div>
          <div style={{textAlign:'center', padding:'18px 12px', background:'white', border:'1px solid #e7e5e4', borderRadius:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
            <div style={{fontWeight:800, fontSize:'20px', color:'#1c1917', letterSpacing:'-0.5px'}}>Activ</div>
            <div style={{fontSize:'10px', color:'#78716c', fontWeight:600, marginTop:'6px', textTransform:'uppercase', letterSpacing:'0.05em'}}>Cereri luna aceasta</div>
          </div>
          <div style={{textAlign:'center', padding:'18px 12px', background:'#1c1917', borderRadius:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>
            <div style={{fontWeight:800, fontSize:'18px', color:'white', letterSpacing:'-0.5px', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px'}}>
              <CheckCircle2 size={18} color='#9ca3af' strokeWidth={2.5} />
              GIGx
            </div>
            <div style={{fontSize:'10px', color:'rgba(255,255,255,0.6)', fontWeight:600, marginTop:'6px', textTransform:'uppercase', letterSpacing:'0.05em'}}>Artist verificat</div>
          </div>
        </div>

        {/* Social links */}
        {(artist.instagram || artist.spotify || artist.youtube || artist.tiktok || artist.facebook || artist.soundcloud) && (
          <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'20px', marginBottom:'16px'}}>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'12px'}}>Urmărește</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:'10px'}}>
              {artist.instagram && (
                <a href={'https://instagram.com/' + artist.instagram.replace('@','')} target="_blank" rel="noopener noreferrer"
                  style={{display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', borderRadius:'12px', background:'#fafaf9', border:'1px solid #e7e5e4', fontSize:'12px', fontWeight:600, color:'#1c1917', textDecoration:'none'}}>
                  Instagram
                </a>
              )}
              {artist.spotify && (
                <a href={artist.spotify} target="_blank" rel="noopener noreferrer"
                  style={{display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', borderRadius:'12px', background:'#f0fdf4', border:'1px solid #bbf7d0', fontSize:'12px', fontWeight:600, color:'#059669', textDecoration:'none'}}>
                  Spotify
                </a>
              )}
              {artist.youtube && (
                <a href={artist.youtube} target="_blank" rel="noopener noreferrer"
                  style={{display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', borderRadius:'12px', background:'#fef2f2', border:'1px solid #fecaca', fontSize:'12px', fontWeight:600, color:'#dc2626', textDecoration:'none'}}>
                  YouTube
                </a>
              )}
              {artist.tiktok && (
                <a href={'https://tiktok.com/@' + artist.tiktok.replace('@','')} target="_blank" rel="noopener noreferrer"
                  style={{display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', borderRadius:'12px', background:'#fafaf9', border:'1px solid #e7e5e4', fontSize:'12px', fontWeight:600, color:'#1c1917', textDecoration:'none'}}>
                  TikTok
                </a>
              )}
              {artist.facebook && (
                <a href={artist.facebook} target="_blank" rel="noopener noreferrer"
                  style={{display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', borderRadius:'12px', background:'#eff6ff', border:'1px solid #bfdbfe', fontSize:'12px', fontWeight:600, color:'#1877f2', textDecoration:'none'}}>
                  Facebook
                </a>
              )}
              {artist.soundcloud && (
                <a href={artist.soundcloud} target="_blank" rel="noopener noreferrer"
                  style={{display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', borderRadius:'12px', background:'#fff7ed', border:'1px solid #fed7aa', fontSize:'12px', fontWeight:600, color:'#ea580c', textDecoration:'none'}}>
                  SoundCloud
                </a>
              )}
            </div>
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
