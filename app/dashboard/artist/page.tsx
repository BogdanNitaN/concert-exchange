'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Music, Music2, MapPin, Car, Hotel, Plane, Save, CheckCircle2, Mic2, Disc3, Guitar, Globe, Calendar, Sparkles } from 'lucide-react'
import { InstagramLogo, YoutubeLogo, SpotifyLogo } from '@phosphor-icons/react'

const VIBES = [
  { id: 'hype', label: 'Hype & Energie' },
  { id: 'elegant', label: 'Elegant & Luxury' },
  { id: 'petrecere', label: 'Petrecere & Mainstream' },
  { id: 'balcanic', label: 'Balkan Energy' },
  { id: 'chill', label: 'Chill & Lounge' },
  { id: 'dayparty', label: 'Day Party' },
  { id: 'festival', label: 'Festival Energy' },
  { id: 'rooftop', label: 'Rooftop Cool' },
  { id: 'nostalgic', label: 'Nostalgic & Evergreen' },
]

const GENRES = ['Pop', 'Open Format', 'Dance', 'Hip-Hop', 'Rap', 'Trap', 'Rock', 'Jazz', 'Folk', 'Manele', 'Lăutărească', 'Balcanic', 'Populară', 'Cover Band', 'EDM', 'R&B', 'Latino', 'Clasică', 'Altele']

const SET_TYPES = [
  { id: 'dj', icon: Disc3, label: 'DJ' },
  { id: 'vocal', icon: Mic2, label: 'Artist solist' },
  { id: 'band', icon: Guitar, label: 'Trupa' },
  { id: 'show', icon: Sparkles, label: 'Show artistic' },
  { id: 'instrument', icon: Music2, label: 'Instrumentist' },
  { id: 'mc', icon: Mic2, label: 'MC / Host' },
]

const CITIES = ['București', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Brașov', 'Oradea', 'Bacău', 'Galați', 'Craiova', 'Sibiu', 'Pitești', 'Târgu Mureș', 'Arad', 'Chișinău']

const Section = ({ icon: Icon, title, children }: any) => (
  <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'24px', marginBottom:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
    <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px'}}>
      <Icon size={16} color='#1c1917' strokeWidth={1.5} />
      <span style={{fontWeight:700, fontSize:'14px', color:'#1c1917'}}>{title}</span>
    </div>
    {children}
  </div>
)

export default function ArtistDashboard() {
  const [user, setUser] = useState<any>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [artistName, setArtistName] = useState('')
  const [bio, setBio] = useState('')
  const [genres, setGenres] = useState<string[]>([])
  const [setType, setSetType] = useState('vocal')
  const [cityFrom, setCityFrom] = useState('București')
  const [costPerKm, setCostPerKm] = useState(2)
  const [nrBileteAvion, setNrBileteAvion] = useState(0)
  const [cazare, setCazare] = useState('')
  const [instagram, setInstagram] = useState('')
  const [spotify, setSpotify] = useState('')
  const [youtube, setYoutube] = useState('')
  const [website, setWebsite] = useState('')
  const [kmCurrency, setKmCurrency] = useState('RON')
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false)
  const [pressKitUrl, setPressKitUrl] = useState('')
  const [riderUrl, setRiderUrl] = useState('')
  const [venuesPlayed, setVenuesPlayed] = useState('')
  const [eventTypes, setEventTypes] = useState<string[]>([])
  const [cazareTip, setCazareTip] = useState('')
  const [durata, setDurata] = useState<string[]>([])
  const [availability, setAvailability] = useState<Record<string, string>>({})
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [artistId, setArtistId] = useState<string | null>(null)
  const [tiktok, setTiktok] = useState('')
  const [facebook, setFacebook] = useState('')
  const [soundcloud, setSoundcloud] = useState('')
  const [vibes, setVibes] = useState<string[]>([])
  const [spotifyLoading, setSpotifyLoading] = useState(false)
  const [spotifyError, setSpotifyError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUser(data.user)
        // setArtistName(data.user.user_metadata?.name || '')
        // Incarcam profilul existent
        const { data: profile } = await (supabase as any).from('artists').select('*').eq('user_id', data.user.id).single()
        if (profile) {
          if (profile.artistName) setArtistName(profile.artistName)
          if (profile.bio) setBio(profile.bio)
          if (profile.genres) setGenres(profile.genres)
          if (profile.vibes) setVibes(profile.vibes)
          if (profile.setType) setSetType(profile.setType)
          if (profile.cityFrom) setCityFrom(profile.cityFrom)
          if (profile.costPerKm) setCostPerKm(profile.costPerKm)
          if (profile.kmCurrency) setKmCurrency(profile.kmCurrency)
          if (profile.nrBileteAvion) setNrBileteAvion(profile.nrBileteAvion)
          if (profile.cazare) setCazare(profile.cazare)
          if (profile.instagram) setInstagram(profile.instagram)
          if (profile.spotify) setSpotify(profile.spotify)
          if (profile.youtube) setYoutube(profile.youtube)
          if (profile.tiktok) setTiktok(profile.tiktok)
          if (profile.facebook) setFacebook(profile.facebook)
          if (profile.soundcloud) setSoundcloud(profile.soundcloud)
          if (profile.press_kit_url) setPressKitUrl(profile.press_kit_url)
          if (profile.rider_url) setRiderUrl(profile.rider_url)
          if (profile.venues_played) setVenuesPlayed(profile.venues_played)
          if (profile.event_types && Array.isArray(profile.event_types)) setEventTypes(profile.event_types)
          if (profile.cazare_tip) setCazareTip(profile.cazare_tip)
          if (profile.durata) setDurata(Array.isArray(profile.durata) ? profile.durata : [])
          if (profile.id) setArtistId(profile.id)
          // Incarcam availability
          const { data: avData } = await (supabase as any).from('availability').select('date, status').eq('artist_id', profile.id)
          if (avData) {
            const map: Record<string, string> = {}
            avData.forEach((a: any) => { map[a.date] = a.status })
            setAvailability(map)
          }
        }
      }
    })
  }, [])

  const toggleGenre = (g: string) => {
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  const handleSave = async () => {
    if (hasPhone(bio) || hasPhone(artistName)) {
      alert('Nu poți include numere de telefon în profil. Clienții te contactează prin platformă.')
      return
    }
    setLoading(true)
    try {
      const slug = artistName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      const { data: upsertData, error: upsertError } = await (supabase as any).from('artists').upsert({
        user_id: user?.id,
        artistName, slug, bio, genres, vibes, setType, cityFrom, costPerKm, press_kit_url: pressKitUrl, rider_url: riderUrl, cazare_tip: cazareTip, durata, venues_played: venuesPlayed, event_types: eventTypes, is_verified: true,
        nrBileteAvion, cazare, instagram, spotify, youtube, tiktok, facebook, soundcloud,
        // updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      console.log('Upsert result:', upsertData, 'Error:', upsertError)
      if (upsertError) { alert('Eroare: ' + upsertError.message); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {}
    setLoading(false)
  }



  const hasPhone = (text: string) => {
    const phoneRegex = /(\+?4?0?[\s.-]?7\d{2}[\s.-]?\d{3}[\s.-]?\d{3}|\d{10})/g
    return phoneRegex.test(text)
  }

  const setDateStatus = async (date: string, status: string) => {
    if (!artistId) return
    setAvailability(prev => {
      const newMap = {...prev}
      if (status === 'available') delete newMap[date]
      else newMap[date] = status
      return newMap
    })
    if (status === 'available') {
      await (supabase as any).from('availability').delete().eq('artist_id', artistId).eq('date', date)
    } else {
      await (supabase as any).from('availability').upsert({ artist_id: artistId, date, status }, { onConflict: 'artist_id,date' })
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (number | null)[] = []
    const startOffset = firstDay === 0 ? 6 : firstDay - 1
    for (let i = 0; i < startOffset; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const importFromSpotify = async () => {
    if (!spotify) { setSpotifyError('Adaugă mai întâi link-ul Spotify'); return }
    setSpotifyLoading(true)
    setSpotifyError('')
    try {
      const res = await fetch('/api/spotify?url=' + encodeURIComponent(spotify))
      const data = await res.json()
      if (data.error) { setSpotifyError(data.error); return }
      if (data.name) setArtistName(data.name)
      if (data.genres && data.genres.length > 0) {
        const mappedGenres = data.genres.map((g: string) => {
          const lower = g.toLowerCase()
          if (lower.includes('pop')) return 'Pop'
          if (lower.includes('hip hop') || lower.includes('rap')) return 'Hip-Hop'
          if (lower.includes('dance') || lower.includes('edm') || lower.includes('electronic')) return 'Dance'
          if (lower.includes('rock')) return 'Rock'
          if (lower.includes('jazz')) return 'Jazz'
          if (lower.includes('r&b') || lower.includes('soul')) return 'R&B'
          if (lower.includes('folk') || lower.includes('country')) return 'Folk'
          if (lower.includes('latin')) return 'Latino'
          return 'Altele'
        }).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
        setGenres(mappedGenres)
      }
      const vibeLabels: Record<string,string> = {hype:'Hype & Energie', festival:'Festival Energy', dayparty:'Day Party', petrecere:'Petrecere & Mainstream', chill:'Chill & Lounge', elegant:'Elegant & Luxury', rooftop:'Rooftop Cool', nostalgic:'Nostalgic & Evergreen'}
        const vibeNames = (data.vibes || []).map((v: string) => vibeLabels[v] || v).join(', ')
        setSpotifyError('Import reușit! Vibe-uri detectate: ' + (vibeNames || 'nedetectate'))
        if (data.vibes && data.vibes.length > 0) setGenres(prev => [...new Set([...prev])])
    } catch { setSpotifyError('Eroare la import') }
    setSpotifyLoading(false)
  }

  return (
    <div style={{minHeight:'100vh', background:'#f5f5f7', fontFamily:'Montserrat,sans-serif'}}>
      <nav style={{background:'white', borderBottom:'1px solid #e7e5e4', padding:'0 24px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100}}>
        <div style={{fontWeight:800, fontSize:'16px', color:'#1c1917', letterSpacing:'-0.5px'}}>GIGx</div>
        <div style={{fontSize:'13px', color:'#78716c'}}>Dashboard Artist</div>
      </nav>

      <div style={{maxWidth:'600px', margin:'0 auto', padding:'24px'}}>
        <div style={{marginBottom:'28px'}}>
          <h1 style={{fontSize:'24px', fontWeight:800, color:'#1c1917', marginBottom:'6px', letterSpacing:'-0.5px'}}>Profilul tău</h1>
          <p style={{fontSize:'14px', color:'#78716c'}}>Completează profilul pentru a primi cereri de booking</p>
        </div>

        <Section icon={User} title="Informații de bază">
          <div style={{marginBottom:'14px'}}>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>Nume artistic / Nume scenă</div>
            <input type="text" value={artistName} onChange={e => setArtistName(e.target.value)} placeholder="ex: The Motans, Irina Rimes, Delia"
              style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', background:'#f5f5f7'}} />
          </div>
          <div>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>Bio scurt</div>
            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Descrie-te în 2-3 propoziții..." rows={3}
              style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', resize:'none', boxSizing:'border-box', background:'#f5f5f7'}} />
          </div>
        </Section>

        <Section icon={Music} title="Gen muzical & Tip artist">
          <div style={{marginBottom:'16px'}}>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'10px'}}>Tip artist</div>
            <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
              {SET_TYPES.map(s => {
                const Icon = s.icon
                const isSelected = setType === s.id
                const hasPhone = (text: string) => {
    const phoneRegex = /(\+?4?0?[\s.-]?7\d{2}[\s.-]?\d{3}[\s.-]?\d{3}|\d{10})/g
    return phoneRegex.test(text)
  }

  const setDateStatus = async (date: string, status: string) => {
    if (!artistId) return
    setAvailability(prev => {
      const newMap = {...prev}
      if (status === 'available') delete newMap[date]
      else newMap[date] = status
      return newMap
    })
    if (status === 'available') {
      await (supabase as any).from('availability').delete().eq('artist_id', artistId).eq('date', date)
    } else {
      await (supabase as any).from('availability').upsert({ artist_id: artistId, date, status }, { onConflict: 'artist_id,date' })
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (number | null)[] = []
    const startOffset = firstDay === 0 ? 6 : firstDay - 1
    for (let i = 0; i < startOffset; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const importFromSpotify = async () => {
    if (!spotify) { setSpotifyError('Adaugă mai întâi link-ul Spotify'); return }
    setSpotifyLoading(true)
    setSpotifyError('')
    try {
      const res = await fetch('/api/spotify?url=' + encodeURIComponent(spotify))
      const data = await res.json()
      if (data.error) { setSpotifyError(data.error); return }
      if (data.name) setArtistName(data.name)
      if (data.genres && data.genres.length > 0) {
        const mappedGenres = data.genres.map((g: string) => {
          const lower = g.toLowerCase()
          if (lower.includes('pop')) return 'Pop'
          if (lower.includes('hip hop') || lower.includes('rap')) return 'Hip-Hop'
          if (lower.includes('dance') || lower.includes('edm') || lower.includes('electronic')) return 'Dance'
          if (lower.includes('rock')) return 'Rock'
          if (lower.includes('jazz')) return 'Jazz'
          if (lower.includes('r&b') || lower.includes('soul')) return 'R&B'
          if (lower.includes('folk') || lower.includes('country')) return 'Folk'
          if (lower.includes('latin')) return 'Latino'
          return 'Altele'
        }).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
        setGenres(mappedGenres)
      }
      const vibeLabels: Record<string,string> = {hype:'Hype & Energie', festival:'Festival Energy', dayparty:'Day Party', petrecere:'Petrecere & Mainstream', chill:'Chill & Lounge', elegant:'Elegant & Luxury', rooftop:'Rooftop Cool', nostalgic:'Nostalgic & Evergreen'}
        const vibeNames = (data.vibes || []).map((v: string) => vibeLabels[v] || v).join(', ')
        setSpotifyError('Import reușit! Vibe-uri detectate: ' + (vibeNames || 'nedetectate'))
        if (data.vibes && data.vibes.length > 0) setGenres(prev => [...new Set([...prev])])
    } catch { setSpotifyError('Eroare la import') }
    setSpotifyLoading(false)
  }

  return (
                  <button key={s.id} onClick={() => setSetType(s.id)}
                    style={{display:'flex', alignItems:'center', gap:'7px', padding:'9px 16px', borderRadius:'20px', border:'1.5px solid', cursor:'pointer', fontSize:'12px', fontWeight:600, fontFamily:'Montserrat,sans-serif', transition:'all 0.15s',
                      background: isSelected ? '#1c1917' : 'white', color: isSelected ? 'white' : '#44403c', borderColor: isSelected ? '#1c1917' : '#e7e5e4'}}>
                    <Icon size={13} strokeWidth={1.5} /> {s.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>Genuri muzicale</div>
            <div style={{position:'relative'}}>
              <div onClick={() => setGenreDropdownOpen(!genreDropdownOpen)}
                style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color: genres.length > 0 ? '#1c1917' : '#a8a29e', background:'#f5f5f7', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', boxSizing:'border-box'}}>
                <span>{genres.length > 0 ? genres.join(', ') : 'Selectează genuri muzicale...'}</span>
                <span style={{fontSize:'10px'}}>{genreDropdownOpen ? '▲' : '▼'}</span>
              </div>
              {genreDropdownOpen && (
                <div style={{position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'white', border:'1.5px solid #e7e5e4', borderRadius:'14px', zIndex:200, boxShadow:'0 8px 32px rgba(0,0,0,0.12)', overflow:'hidden', maxHeight:'240px', overflowY:'auto'}}>
                  {GENRES.map(g => {
                    const isSelected = genres.includes(g)
                    const hasPhone = (text: string) => {
    const phoneRegex = /(\+?4?0?[\s.-]?7\d{2}[\s.-]?\d{3}[\s.-]?\d{3}|\d{10})/g
    return phoneRegex.test(text)
  }

  const setDateStatus = async (date: string, status: string) => {
    if (!artistId) return
    setAvailability(prev => {
      const newMap = {...prev}
      if (status === 'available') delete newMap[date]
      else newMap[date] = status
      return newMap
    })
    if (status === 'available') {
      await (supabase as any).from('availability').delete().eq('artist_id', artistId).eq('date', date)
    } else {
      await (supabase as any).from('availability').upsert({ artist_id: artistId, date, status }, { onConflict: 'artist_id,date' })
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (number | null)[] = []
    const startOffset = firstDay === 0 ? 6 : firstDay - 1
    for (let i = 0; i < startOffset; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const importFromSpotify = async () => {
    if (!spotify) { setSpotifyError('Adaugă mai întâi link-ul Spotify'); return }
    setSpotifyLoading(true)
    setSpotifyError('')
    try {
      const res = await fetch('/api/spotify?url=' + encodeURIComponent(spotify))
      const data = await res.json()
      if (data.error) { setSpotifyError(data.error); return }
      if (data.name) setArtistName(data.name)
      if (data.genres && data.genres.length > 0) {
        const mappedGenres = data.genres.map((g: string) => {
          const lower = g.toLowerCase()
          if (lower.includes('pop')) return 'Pop'
          if (lower.includes('hip hop') || lower.includes('rap')) return 'Hip-Hop'
          if (lower.includes('dance') || lower.includes('edm') || lower.includes('electronic')) return 'Dance'
          if (lower.includes('rock')) return 'Rock'
          if (lower.includes('jazz')) return 'Jazz'
          if (lower.includes('r&b') || lower.includes('soul')) return 'R&B'
          if (lower.includes('folk') || lower.includes('country')) return 'Folk'
          if (lower.includes('latin')) return 'Latino'
          return 'Altele'
        }).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
        setGenres(mappedGenres)
      }
      const vibeLabels: Record<string,string> = {hype:'Hype & Energie', festival:'Festival Energy', dayparty:'Day Party', petrecere:'Petrecere & Mainstream', chill:'Chill & Lounge', elegant:'Elegant & Luxury', rooftop:'Rooftop Cool', nostalgic:'Nostalgic & Evergreen'}
        const vibeNames = (data.vibes || []).map((v: string) => vibeLabels[v] || v).join(', ')
        setSpotifyError('Import reușit! Vibe-uri detectate: ' + (vibeNames || 'nedetectate'))
        if (data.vibes && data.vibes.length > 0) setGenres(prev => [...new Set([...prev])])
    } catch { setSpotifyError('Eroare la import') }
    setSpotifyLoading(false)
  }

  return (
                      <div key={g} onClick={() => toggleGenre(g)}
                        style={{padding:'11px 16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #f5f5f4', background: isSelected ? '#f0fdf4' : 'white'}}>
                        <span style={{fontSize:'13px', fontWeight: isSelected ? 700 : 400, color:'#1c1917'}}>{g}</span>
                        {isSelected && <span style={{color:'#059669', fontSize:'14px'}}>✓</span>}
                      </div>
                    )
                  })}
                </div>
              )}
              {genreDropdownOpen && <div style={{position:'fixed', inset:0, zIndex:199}} onClick={() => setGenreDropdownOpen(false)} />}
            </div>
            {genres.length > 0 && (
              <div style={{display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'8px'}}>
                {genres.map(g => (
                  <span key={g} onClick={() => toggleGenre(g)} style={{padding:'4px 12px', borderRadius:'20px', background:'#1c1917', color:'white', fontSize:'11px', fontWeight:600, cursor:'pointer'}}>
                    {g} ✕
                  </span>
                ))}
              </div>
            )}
          </div>
        </Section>

        <Section icon={Music} title="Vibe-uri & Atmosferă">
          <div style={{fontSize:'12px', color:'#78716c', marginBottom:'12px'}}>Ce atmosferă creezi la evenimentele tale?</div>
          <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
            {VIBES.map(v => {
              const isSelected = vibes.includes(v.id)
              return (
                <button key={v.id} onClick={() => setVibes(prev => prev.includes(v.id) ? prev.filter(x => x !== v.id) : [...prev, v.id])}
                  style={{padding:'8px 16px', borderRadius:'20px', border:'1.5px solid', cursor:'pointer', fontSize:'12px', fontWeight:600, fontFamily:'Montserrat,sans-serif', transition:'all 0.15s',
                    background: isSelected ? '#7c3aed' : 'white', color: isSelected ? 'white' : '#44403c', borderColor: isSelected ? '#7c3aed' : '#e7e5e4'}}>
                  {v.label}
                </button>
              )
            })}
          </div>
        </Section>

        <Section icon={MapPin} title="Transport & Logistică">
          <div style={{marginBottom:'14px'}}>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px'}}>Oraș de reședință (de unde plec)</div>
            <select value={cityFrom} onChange={e => setCityFrom(e.target.value)}
              style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', background:'#f5f5f7'}}>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px'}}>
            <div>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px', display:'flex', alignItems:'center', gap:'4px'}}>
                <Car size={10} strokeWidth={2} /> Cost/km (€)
              </div>
              <div style={{display:'flex', gap:'8px'}}>
                <input type="number" value={costPerKm} onChange={e => setCostPerKm(Number(e.target.value))} step="0.5" min="0"
                  style={{flex:1, padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', background:'#f5f5f7'}} />
                <select value={kmCurrency} onChange={e => setKmCurrency(e.target.value)}
                  style={{padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', background:'#f5f5f7'}}>
                  <option value="RON">RON</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
            <div>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px', display:'flex', alignItems:'center', gap:'4px'}}>
                <Plane size={10} strokeWidth={2} /> Bilete avion (nr.)
              </div>
              <input type="number" value={nrBileteAvion} onChange={e => setNrBileteAvion(Number(e.target.value))} min="0"
                style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', background:'#f5f5f7'}} />
            </div>
          </div>
          <div style={{marginTop:'14px'}}>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'10px', display:'flex', alignItems:'center', gap:'4px'}}>
              <Hotel size={10} strokeWidth={2} /> Cazare necesară
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              {[
                {id:'single_matrimoniala', label:'Single Matrimonială'},
                {id:'dubla_twin', label:'Dublă Twin'},
                {id:'suita', label:'Suită (Apartament)'},
              ].map(tip => {
                const count = parseInt((cazareTip.split(';').find(x => x.startsWith(tip.id + ':')) || '').split(':')[1] || '0')
                const setCount = (n: number) => {
                  const parts = cazareTip.split(';').filter(x => x && !x.startsWith(tip.id + ':'))
                  if (n > 0) parts.push(tip.id + ':' + n)
                  setCazareTip(parts.join(';'))
                }
                return (
                  <div key={tip.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', background:'white'}}>
                    <span style={{fontSize:'13px', fontWeight:600, color:'#1c1917'}}>{tip.label}</span>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                      <button type="button" onClick={() => setCount(Math.max(0, count - 1))}
                        style={{width:'28px', height:'28px', borderRadius:'8px', border:'1px solid #e7e5e4', background:'white', cursor:'pointer', fontSize:'16px', display:'flex', alignItems:'center', justifyContent:'center', color:'#44403c'}}>−</button>
                      <span style={{fontWeight:700, fontSize:'14px', color:'#1c1917', minWidth:'20px', textAlign:'center'}}>{count}</span>
                      <button type="button" onClick={() => setCount(count + 1)}
                        style={{width:'28px', height:'28px', borderRadius:'8px', border:'1px solid #e7e5e4', background:'#1c1917', cursor:'pointer', fontSize:'16px', display:'flex', alignItems:'center', justifyContent:'center', color:'white'}}>+</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{marginTop:'14px'}}>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'10px'}}>Durata setului</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'8px'}}>
              {(setType === 'dj' ? ['60 min', '90 min', '120 min', '180 min'] :
                setType === 'vocal' ? ['45 min', '60 min', '90 min'] :
                setType === 'band' ? ['45 min', '60 min', '90 min', '2x45 min', '2x60 min'] :
                setType === 'show' ? ['15 min', '20 min', '30 min', '45 min'] :
                setType === 'instrument' ? ['30 min', '45 min', '60 min', '90 min', '120 min'] :
                setType === 'mc' ? ['1 ora', '2 ore', '3 ore', '4 ore', '5+ ore'] :
                []).map(d => {
                const isSelected = durata.includes(d)
                return (
                  <button type="button" key={d} onClick={() => setDurata(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])}
                    style={{padding:'8px 16px', borderRadius:'20px', border:'1.5px solid', cursor:'pointer', fontSize:'12px', fontWeight:600, fontFamily:'Montserrat,sans-serif',
                      background: isSelected ? '#1c1917' : 'white', color: isSelected ? 'white' : '#44403c', borderColor: isSelected ? '#1c1917' : '#e7e5e4'}}>
                    {d}
                  </button>
                )
              })}
            </div>
            <input type="text"
              value={durata.find(d => !['60 min','90 min','120 min','180 min','45 min'].includes(d)) || ''}
              onChange={e => {
                const preset = durata.filter(d => ['60 min','90 min','120 min','180 min','45 min'].includes(d))
                if (e.target.value) setDurata([...preset, e.target.value])
                else setDurata(preset)
              }}
              placeholder="Durata personalizată (manual)"
              style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', background:'#f5f5f7'}} />
          </div>
        </Section>

        <Section icon={Globe} title="Social & Contact">
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px'}}>
            <div>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px', display:'flex', alignItems:'center', gap:'4px'}}>
                <InstagramLogo size={10} strokeWidth={2} /> Instagram
              </div>
              <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@numeartist"
                style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', background:'#f5f5f7'}} />
            </div>
            <div>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px', display:'flex', alignItems:'center', gap:'4px'}}>
                <YoutubeLogo size={10} strokeWidth={2} /> YouTube
              </div>
              <input type="text" value={youtube} onChange={e => setYoutube(e.target.value)} placeholder="link canal"
                style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', background:'#f5f5f7'}} />
            </div>
            <div>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px', display:'flex', alignItems:'center', gap:'4px'}}>
                <SpotifyLogo size={10} /> Spotify
              </div>
              <div style={{display:'flex', gap:'8px'}}>
                <input type="text" value={spotify} onChange={e => setSpotify(e.target.value)} placeholder="link artist"
                  style={{flex:1, padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', background:'#f5f5f7'}} />
                <button onClick={importFromSpotify} disabled={spotifyLoading}
                  style={{padding:'11px 16px', borderRadius:'12px', background:'#1DB954', color:'white', border:'none', cursor:'pointer', fontSize:'12px', fontWeight:700, fontFamily:'Montserrat,sans-serif', whiteSpace:'nowrap'}}>
                  {spotifyLoading ? '...' : 'Import'}
                </button>
              </div>
              {spotifyError && <div style={{fontSize:'12px', color: spotifyError.startsWith('✅') ? '#059669' : '#dc2626', marginTop:'6px'}}>{spotifyError}</div>}
            </div>
            <div>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>TikTok</div>
              <input type="text" value={tiktok} onChange={e => setTiktok(e.target.value)} placeholder="@numeartist"
                style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', background:'#f5f5f7'}} />
            </div>
            <div>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>Facebook</div>
              <input type="text" value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="link pagina"
                style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', background:'#f5f5f7'}} />
            </div>
            <div>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>SoundCloud</div>
              <input type="text" value={soundcloud} onChange={e => setSoundcloud(e.target.value)} placeholder="link profil"
                style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', background:'#f5f5f7'}} />
            </div>

          </div>
        </Section>

        <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'24px', marginBottom:'14px'}}>
          <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px'}}>
            <span style={{fontWeight:700, fontSize:'14px', color:'#1c1917'}}>Tipuri evenimente pe care le accepti</span>
          </div>
          <div style={{fontSize:'12px', color:'#78716c', marginBottom:'14px'}}>Selecteaza tipurile de evenimente pentru care vrei sa primesti cereri. Ajuta la matching-ul corect cu promoterii.</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'8px'}}>
            {[
              {id:'festival', label:'Festival'},
              {id:'popup', label:'Pop-Up Event'},
              {id:'citydays', label:'City Days / Open Air'},
              {id:'club', label:'Club Night'},
              {id:'corporate', label:'Corporate'},
              {id:'teambuilding', label:'Team Building'},
              {id:'poolparty', label:'Pool Party'},
              {id:'dayparty', label:'Day Party'},
              {id:'dinnershow', label:'Dinner & Show'},
              {id:'mall', label:'Mall'},
              {id:'brandactivation', label:'Brand Activation'},
              {id:'sport', label:'Eveniment sportiv'},
              {id:'nunta', label:'Nunta'},
              {id:'botez', label:'Botez'},
              {id:'private', label:'Petrecere privata'},
              {id:'revelion', label:'Revelion / Craciun'},
            ].map(et => {
              const isSelected = eventTypes.includes(et.id)
              return (
                <div key={et.id} onClick={() => { if(isSelected) setEventTypes(eventTypes.filter(x => x !== et.id)); else setEventTypes([...eventTypes, et.id]) }}
                  style={{padding:'10px 14px', borderRadius:'10px', border:'1.5px solid ' + (isSelected ? '#059669' : '#e7e5e4'), background: isSelected ? '#dcfce7' : 'white', cursor:'pointer', fontSize:'12px', fontWeight:600, color: isSelected ? '#059669' : '#44403c', textAlign:'center', transition:'all 0.15s'}}>
                  {et.label}
                </div>
              )
            })}
          </div>
        </div>

        <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'24px', marginBottom:'14px'}}>
          <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px'}}>
            <span style={{fontWeight:700, fontSize:'14px', color:'#1c1917'}}>Press Kit</span>
          </div>
          <div style={{fontSize:'12px', color:'#78716c', marginBottom:'12px'}}>Link Google Drive sau Dropbox cu materiale de presă (foto, bio, logo).</div>
          <input type="text" value={pressKitUrl} onChange={e => setPressKitUrl(e.target.value)} placeholder="https://drive.google.com/..."
            style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', background:'#f5f5f7'}} />
          
          <div style={{marginTop:'16px'}}>
            <div style={{fontWeight:700, fontSize:'13px', color:'#1c1917', marginBottom:'6px'}}>Rider Tehnic</div>
            <div style={{fontSize:'12px', color:'#78716c', marginBottom:'8px'}}>Link Google Drive sau Dropbox cu rider-ul tehnic (scenă, sunet, lumini).</div>
            <input type="text" value={riderUrl} onChange={e => setRiderUrl(e.target.value)} placeholder="https://drive.google.com/..."
              style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', background:'#f5f5f7'}} />
          </div>
        </div>

        <button onClick={handleSave} disabled={loading}
          style={{width:'100%', background:'#1c1917', color:'white', padding:'15px', borderRadius:'14px', border:'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', opacity: loading ? 0.7 : 1, marginBottom:'24px'}}>
          {saved ? <><CheckCircle2 size={16} strokeWidth={2} /> Salvat!</> : <><Save size={16} strokeWidth={2} /> {loading ? 'Se salvează...' : 'Salvează profilul'}</>}
        </button>
      </div>
    </div>
  )
}
