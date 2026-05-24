'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Music, MapPin, Car, Hotel, Plane, Save, CheckCircle2, Mic2, Disc3, Guitar, Globe, Phone } from 'lucide-react'
import { InstagramLogo, YoutubeLogo, SpotifyLogo } from '@phosphor-icons/react'

const GENRES = ['Pop', 'Dance', 'Hip-Hop', 'Rap', 'Trap', 'Rock', 'Jazz', 'Folk', 'Manele', 'Lăutărească', 'Balcanic', 'Populară', 'Cover Band', 'EDM', 'R&B', 'Latino', 'Clasică', 'Altele']

const SET_TYPES = [
  { id: 'vocal', icon: Mic2, label: 'Artist vocal' },
  { id: 'dj', icon: Disc3, label: 'DJ Set' },
  { id: 'cover', icon: Guitar, label: 'Trupă / Cover Band' },
]

const CITIES = ['București', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Brașov', 'Oradea', 'Bacău', 'Galați', 'Craiova', 'Sibiu', 'Pitești', 'Târgu Mureș', 'Arad', 'Chișinău']

export default function ArtistDashboard() {
  const [user, setUser] = useState<any>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({
    artistName: '',
    bio: '',
    genres: [] as string[],
    setType: 'vocal',
    cityFrom: 'București',
    costPerKm: 2,
    nrBileteAvion: 0,
    cazare: '',
    instagram: '',
    spotify: '',
    youtube: '',
    website: '',
    phone: '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
        setProfile(p => ({ ...p, artistName: data.user.user_metadata?.name || '' }))
      }
    })
  }, [])

  const toggleGenre = (g: string) => {
    setProfile(p => ({
      ...p,
      genres: p.genres.includes(g) ? p.genres.filter(x => x !== g) : [...p.genres, g]
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await (supabase as any).from('artist_profiles').upsert({
        user_id: user?.id,
        ...profile,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {}
    setLoading(false)
  }

  const Section = ({ icon: Icon, title, children }: any) => (
    <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'24px', marginBottom:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
      <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px'}}>
        <Icon size={16} color='#1c1917' strokeWidth={1.5} />
        <span style={{fontWeight:700, fontSize:'14px', color:'#1c1917'}}>{title}</span>
      </div>
      {children}
    </div>
  )

  const Input = ({ label, value, onChange, placeholder, type = 'text' }: any) => (
    <div style={{marginBottom:'14px'}}>
      <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', background:'#fafaf9'}} />
    </div>
  )

  return (
    <div style={{minHeight:'100vh', background:'#fafaf9', fontFamily:'Montserrat,sans-serif'}}>
      <nav style={{background:'white', borderBottom:'1px solid #e7e5e4', padding:'0 24px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100}}>
        <div style={{fontWeight:800, fontSize:'16px', color:'#1c1917', letterSpacing:'-0.5px'}}>Concert Exchange</div>
        <div style={{fontSize:'13px', color:'#78716c'}}>Dashboard Artist</div>
      </nav>

      <div style={{maxWidth:'600px', margin:'0 auto', padding:'24px'}}>
        <div style={{marginBottom:'28px'}}>
          <h1 style={{fontSize:'24px', fontWeight:800, color:'#1c1917', marginBottom:'6px', letterSpacing:'-0.5px'}}>Profilul tău</h1>
          <p style={{fontSize:'14px', color:'#78716c'}}>Completează profilul pentru a primi cereri de booking</p>
        </div>

        <Section icon={User} title="Informații de bază">
          <Input label="Nume artistic / Nume scenă" value={profile.artistName} onChange={(v: string) => setProfile(p => ({...p, artistName: v}))} placeholder="ex: DJ Sava, Antonia, Bere Gratis" />
          <div>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>Bio scurt</div>
            <textarea value={profile.bio} onChange={e => setProfile(p => ({...p, bio: e.target.value}))} placeholder="Descrie-te în 2-3 propoziții..." rows={3}
              style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', resize:'none', boxSizing:'border-box', background:'#fafaf9'}} />
          </div>
        </Section>

        <Section icon={Music} title="Gen muzical & Tip artist">
          <div style={{marginBottom:'16px'}}>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'10px'}}>Tip artist</div>
            <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
              {SET_TYPES.map(s => {
                const Icon = s.icon
                const isSelected = profile.setType === s.id
                return (
                  <button key={s.id} onClick={() => setProfile(p => ({...p, setType: s.id}))}
                    style={{display:'flex', alignItems:'center', gap:'7px', padding:'9px 16px', borderRadius:'20px', border:'1.5px solid', cursor:'pointer', fontSize:'12px', fontWeight:600, fontFamily:'Montserrat,sans-serif', transition:'all 0.15s',
                      background: isSelected ? '#1c1917' : 'white', color: isSelected ? 'white' : '#44403c', borderColor: isSelected ? '#1c1917' : '#e7e5e4'}}>
                    <Icon size={13} strokeWidth={1.5} /> {s.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'10px'}}>Genuri muzicale</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
              {GENRES.map(g => {
                const isSelected = profile.genres.includes(g)
                return (
                  <button key={g} onClick={() => toggleGenre(g)}
                    style={{padding:'6px 14px', borderRadius:'20px', border:'1.5px solid', cursor:'pointer', fontSize:'11px', fontWeight:600, fontFamily:'Montserrat,sans-serif', transition:'all 0.15s',
                      background: isSelected ? '#1c1917' : 'white', color: isSelected ? 'white' : '#78716c', borderColor: isSelected ? '#1c1917' : '#e7e5e4'}}>
                    {g}
                  </button>
                )
              })}
            </div>
          </div>
        </Section>

        <Section icon={MapPin} title="Transport & Logistică">
          <div style={{marginBottom:'14px'}}>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px'}}>Oraș de reședință (de unde plec)</div>
            <select value={profile.cityFrom} onChange={e => setProfile(p => ({...p, cityFrom: e.target.value}))}
              style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', background:'#fafaf9'}}>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px'}}>
            <div>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px', display:'flex', alignItems:'center', gap:'4px'}}>
                <Car size={10} strokeWidth={2} /> Cost/km (€)
              </div>
              <input type="number" value={profile.costPerKm} onChange={e => setProfile(p => ({...p, costPerKm: Number(e.target.value)}))} step="0.5" min="0"
                style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', background:'#fafaf9'}} />
            </div>
            <div>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px', display:'flex', alignItems:'center', gap:'4px'}}>
                <Plane size={10} strokeWidth={2} /> Bilete avion (nr.)
              </div>
              <input type="number" value={profile.nrBileteAvion} onChange={e => setProfile(p => ({...p, nrBileteAvion: Number(e.target.value)}))} min="0"
                style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', background:'#fafaf9'}} />
            </div>
          </div>
          <div style={{marginTop:'14px'}}>
            <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px', display:'flex', alignItems:'center', gap:'4px'}}>
              <Hotel size={10} strokeWidth={2} /> Cazare necesară
            </div>
            <input type="text" value={profile.cazare} onChange={e => setProfile(p => ({...p, cazare: e.target.value}))} placeholder="ex: 2 camere single + 1 dubla"
              style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', background:'#fafaf9'}} />
          </div>
        </Section>

        <Section icon={Globe} title="Social & Contact">
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px'}}>
            <div>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px', display:'flex', alignItems:'center', gap:'4px'}}>
                <InstagramLogo size={10} strokeWidth={2} /> Instagram
              </div>
              <input type="text" value={profile.instagram} onChange={e => setProfile(p => ({...p, instagram: e.target.value}))} placeholder="@numeartist"
                style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', background:'#fafaf9'}} />
            </div>
            <div>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px', display:'flex', alignItems:'center', gap:'4px'}}>
                <YoutubeLogo size={10} strokeWidth={2} /> YouTube
              </div>
              <input type="text" value={profile.youtube} onChange={e => setProfile(p => ({...p, youtube: e.target.value}))} placeholder="link canal"
                style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', background:'#fafaf9'}} />
            </div>
            <div>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px', display:'flex', alignItems:'center', gap:'4px'}}>
                <SpotifyLogo size={10} /> Spotify
              </div>
              <input type="text" value={profile.spotify} onChange={e => setProfile(p => ({...p, spotify: e.target.value}))} placeholder="link artist"
                style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', background:'#fafaf9'}} />
            </div>
            <div>
              <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px', display:'flex', alignItems:'center', gap:'4px'}}>
                <Phone size={10} strokeWidth={2} /> Telefon / WhatsApp
              </div>
              <input type="tel" value={profile.phone} onChange={e => setProfile(p => ({...p, phone: e.target.value}))} placeholder="+40 7xx xxx xxx"
                style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box', background:'#fafaf9'}} />
            </div>
          </div>
        </Section>

        <button onClick={handleSave} disabled={loading}
          style={{width:'100%', background:'#1c1917', color:'white', padding:'15px', borderRadius:'14px', border:'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', opacity: loading ? 0.7 : 1, marginBottom:'24px'}}>
          {saved ? <><CheckCircle2 size={16} strokeWidth={2} /> Salvat!</> : <><Save size={16} strokeWidth={2} /> {loading ? 'Se salvează...' : 'Salvează profilul'}</>}
        </button>
      </div>
    </div>
  )
}
