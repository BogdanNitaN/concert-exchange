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

  // Fetch disponibilitate urmatoarele 3 luni
  const today = new Date().toISOString().split('T')[0]
  const threeMonths = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const { data: availability } = await supabase
    .from('availability')
    .select('date, status')
    .eq('artist_id', artist.id)
    .gte('date', today)
    .lte('date', threeMonths)
    .order('date', { ascending: true })

  const bookedDates = (availability || []).filter((a: any) => a.status === 'booked').map((a: any) => a.date)
  const blockedDates = (availability || []).filter((a: any) => a.status === 'blocked').map((a: any) => a.date)

  const displayName = artist.artistName || artist.slug
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
            <div style={{width:'72px', height:'72px', borderRadius:'18px', background:'#1c1917', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
              <span style={{fontSize:'28px', color:'white', fontWeight:800}}>{displayName.charAt(0).toUpperCase()}</span>
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

          {/* Genuri */}
          {genres.length > 0 && (
            <div style={{display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'16px'}}>
              {genres.map((g: string) => (
                <span key={g} style={{padding:'4px 12px', borderRadius:'20px', background:'#f5f5f4', fontSize:'11px', fontWeight:600, color:'#44403c'}}>{g}</span>
              ))}
            </div>
          )}


        </div>

        {/* Social links */}
        {(artist.instagram || artist.spotify || artist.youtube || artist.tiktok || artist.facebook || artist.soundcloud) && (
          <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'20px', marginBottom:'16px'}}>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'12px'}}>Urmărește</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:'10px'}}>
              {artist.instagram && (
                <a href={'https://instagram.com/' + artist.instagram.replace('@','')} target="_blank" rel="noopener noreferrer"
                  style={{display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', borderRadius:'12px', background:'#fafaf9', border:'1px solid #e7e5e4', fontSize:'12px', fontWeight:600, color:'#1c1917', textDecoration:'none'}}>
                  📷 Instagram
                </a>
              )}
              {artist.spotify && (
                <a href={artist.spotify} target="_blank" rel="noopener noreferrer"
                  style={{display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', borderRadius:'12px', background:'#f0fdf4', border:'1px solid #bbf7d0', fontSize:'12px', fontWeight:600, color:'#059669', textDecoration:'none'}}>
                  🎵 Spotify
                </a>
              )}
              {artist.youtube && (
                <a href={artist.youtube} target="_blank" rel="noopener noreferrer"
                  style={{display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', borderRadius:'12px', background:'#fef2f2', border:'1px solid #fecaca', fontSize:'12px', fontWeight:600, color:'#dc2626', textDecoration:'none'}}>
                  ▶ YouTube
                </a>
              )}
              {artist.tiktok && (
                <a href={'https://tiktok.com/@' + artist.tiktok.replace('@','')} target="_blank" rel="noopener noreferrer"
                  style={{display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', borderRadius:'12px', background:'#fafaf9', border:'1px solid #e7e5e4', fontSize:'12px', fontWeight:600, color:'#1c1917', textDecoration:'none'}}>
                  🎵 TikTok
                </a>
              )}
              {artist.facebook && (
                <a href={artist.facebook} target="_blank" rel="noopener noreferrer"
                  style={{display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', borderRadius:'12px', background:'#eff6ff', border:'1px solid #bfdbfe', fontSize:'12px', fontWeight:600, color:'#1877f2', textDecoration:'none'}}>
                  👤 Facebook
                </a>
              )}
              {artist.soundcloud && (
                <a href={artist.soundcloud} target="_blank" rel="noopener noreferrer"
                  style={{display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', borderRadius:'12px', background:'#fff7ed', border:'1px solid #fed7aa', fontSize:'12px', fontWeight:600, color:'#ea580c', textDecoration:'none'}}>
                  ☁️ SoundCloud
                </a>
              )}
            </div>
          </div>
        )}

        {/* Calendar disponibilitate */}
        <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'24px', marginBottom:'16px'}}>
          <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'16px'}}>Disponibilitate — urmatoarele 90 zile</div>
          <div style={{display:'flex', gap:'16px', flexWrap:'wrap', marginBottom:'16px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
              <div style={{width:'12px', height:'12px', borderRadius:'3px', background:'#059669'}}></div>
              <span style={{fontSize:'11px', color:'#78716c', fontWeight:600}}>Disponibil</span>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
              <div style={{width:'12px', height:'12px', borderRadius:'3px', background:'#dc2626'}}></div>
              <span style={{fontSize:'11px', color:'#78716c', fontWeight:600}}>Rezervat</span>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
              <div style={{width:'12px', height:'12px', borderRadius:'3px', background:'#e7e5e4'}}></div>
              <span style={{fontSize:'11px', color:'#78716c', fontWeight:600}}>Blocat</span>
            </div>
          </div>
          {bookedDates.length === 0 && blockedDates.length === 0 ? (
            <div style={{fontSize:'13px', color:'#78716c', padding:'16px', background:'#f0fdf4', borderRadius:'12px', textAlign:'center'}}>
              ✅ Disponibil pentru evenimente în această perioadă
            </div>
          ) : (
            <div>
              {bookedDates.length > 0 && (
                <div style={{marginBottom:'12px'}}>
                  <div style={{fontSize:'11px', fontWeight:700, color:'#dc2626', marginBottom:'8px'}}>Date rezervate:</div>
                  <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
                    {bookedDates.map((d: string) => (
                      <span key={d} style={{padding:'4px 10px', borderRadius:'8px', background:'#fef2f2', border:'1px solid #fecaca', fontSize:'11px', fontWeight:600, color:'#dc2626'}}>
                        {new Date(d).toLocaleDateString('ro-RO', {day:'numeric', month:'short'})}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {blockedDates.length > 0 && (
                <div>
                  <div style={{fontSize:'11px', fontWeight:700, color:'#78716c', marginBottom:'8px'}}>Date indisponibile:</div>
                  <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
                    {blockedDates.map((d: string) => (
                      <span key={d} style={{padding:'4px 10px', borderRadius:'8px', background:'#f5f5f4', border:'1px solid #e7e5e4', fontSize:'11px', fontWeight:600, color:'#78716c'}}>
                        {new Date(d).toLocaleDateString('ro-RO', {day:'numeric', month:'short'})}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

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
