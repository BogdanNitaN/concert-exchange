'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { MessageCircle, Car, Hotel, Plane, ArrowRight, ChevronDown, ChevronUp, Calendar, MapPin, Users } from 'lucide-react'
import { ARTISTS_DATA } from '@/lib/artists-data'
import TierLegendProm from '@/components/modules/shared/TierLegendProm'
import ExpertModal from '@/components/modules/shared/ExpertModal'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const WHATSAPP = '40751144109'
const F = 'Montserrat,sans-serif'

const DISCLAIMER = 'Estimările sunt orientative și se confirmă în oferta finală, în funcție de disponibilitatea artistului, locație și dată. Detaliile complete le primești de la agent, în scris, în 30 de minute.'

// tier vizual - identic cu dashboard/client
const tierInfo = (tier: string) => {
  if (tier === 'Premium' || tier === 'A++') return { bg: '#eacda3', color: 'white', label: 'A++ · Icon', range: '10.000€+' }
  if (tier === 'A+') return { bg: '#7c3aed', color: 'white', label: 'A+ · Premium', range: '5.000–10.000€' }
  return { bg: '#78716c', color: 'white', label: 'A · Select', range: 'până la 5.000€' }
}

// distante aproximative din Bucuresti
const CITIES_KM: Record<string, number> = {
  'bucuresti': 0, 'bucurești': 0, 'ploiesti': 60, 'ploiești': 60, 'pitesti': 110, 'pitești': 110,
  'brasov': 170, 'brașov': 170, 'constanta': 225, 'constanța': 225, 'craiova': 230,
  'sibiu': 275, 'bacau': 300, 'bacău': 300, 'galati': 230, 'galați': 230,
  'targu mures': 350, 'târgu mureș': 350, 'cluj-napoca': 450, 'cluj': 450,
  'iasi': 400, 'iași': 400, 'timisoara': 550, 'timișoara': 550, 'oradea': 580,
  'suceava': 450, 'botosani': 450, 'botoșani': 450, 'baia mare': 600, 'arad': 600,
  'satu mare': 640, 'resita': 500, 'reșița': 500, 'targu jiu': 300, 'târgu jiu': 300,
  'buzau': 130, 'buzău': 130, 'focsani': 190, 'focșani': 190, 'braila': 220, 'brăila': 220,
  'piatra neamt': 350, 'piatra neamț': 350, 'deva': 400, 'alba iulia': 350,
}
const getKm = (city: string) => {
  const k = city.trim().toLowerCase()
  return CITIES_KM[k] !== undefined ? CITIES_KM[k] : 300
}

const SETURI_VOCAL = [{ id: '1x45', label: '1 set · 45 min' }]
const SETURI_DJ = [
  { id: '1x90', label: '1 set · 90 min' },
  { id: '1x120', label: 'Extended Set · 2h' },
  { id: 'allnight', label: 'All Night' },
]
const getSeturi = (a: any) => (a?.setType === 'dj' ? SETURI_DJ : SETURI_VOCAL)

type GenreKey = 'trap' | 'urban' | 'pop_dance' | 'balcanic'
const GENRES: Record<GenreKey, string> = {
  trap: 'Trap',
  urban: 'Urban / Hip-Hop',
  pop_dance: 'Pop-Dance',
  balcanic: 'Balcanic',
}

// tier MANUAL pe trap/urban (cool factor la baluri, nu fee)
// tier pe fee la pop-dance si balcanic
const PROM_MAP: { name: string; genre: GenreKey; promTier: string; display?: string }[] = [
  { name: 'Petre Stefan', genre: 'trap', promTier: 'Premium' },
  { name: 'Albert NBN', genre: 'trap', promTier: 'Premium' },
  { name: 'Killa Fonic', genre: 'trap', promTier: 'Premium' },
  { name: 'Satra Benz', genre: 'trap', promTier: 'Premium', display: 'SATRA B.E.N.Z.' },
  { name: 'IDK', genre: 'trap', promTier: 'Premium' },
  { name: 'Erika', genre: 'trap', promTier: 'Premium', display: 'Erika Isac' },
  { name: 'Oscar', genre: 'trap', promTier: 'Premium' },
  { name: 'Rava', genre: 'trap', promTier: 'Premium' },
  { name: 'Azteca', genre: 'trap', promTier: 'Premium' },
  { name: 'IAN', genre: 'trap', promTier: 'Premium' },
  { name: 'MGL', genre: 'trap', promTier: 'Premium' },
  { name: 'Noua Unspe', genre: 'trap', promTier: 'A+' },
  { name: 'Tussin', genre: 'trap', promTier: 'A+' },
  { name: 'Amuly', genre: 'trap', promTier: 'A+' },
  { name: 'Vanilla', genre: 'trap', promTier: 'A+' },
  { name: 'El Nino', genre: 'urban', promTier: 'A' },
  { name: 'Calinacho', genre: 'trap', promTier: 'A+' },
  { name: 'Madatorricelli', genre: 'trap', promTier: 'A+' },
  { name: 'Ursaru', genre: 'trap', promTier: 'A+' },
  { name: 'Grasu XXL', genre: 'urban', promTier: 'Premium' },
  { name: 'Puya', genre: 'urban', promTier: 'Premium' },
  { name: 'Guess Who', genre: 'urban', promTier: 'Premium' },
  { name: 'Deliric', genre: 'urban', promTier: 'Premium' },
  { name: 'Vescan', genre: 'urban', promTier: 'A+' },
  { name: 'The Motans', genre: 'pop_dance', promTier: 'Premium' },
  { name: 'Mira', genre: 'pop_dance', promTier: 'A+' },
  { name: 'Antonia', genre: 'pop_dance', promTier: 'A+' },
  { name: 'Alina Eremia', genre: 'pop_dance', promTier: 'A+' },
  { name: 'Mario Fresh', genre: 'pop_dance', promTier: 'A+' },
  { name: 'Ami', genre: 'pop_dance', promTier: 'A+' },
  { name: 'Stefania', genre: 'pop_dance', promTier: 'A+' },
  { name: 'Holy Molly', genre: 'pop_dance', promTier: 'A' },
  { name: 'Florian Rus', genre: 'pop_dance', promTier: 'A' },
  { name: 'Bogdan DLP', genre: 'balcanic', promTier: 'Premium' },
  { name: 'Babasha', genre: 'balcanic', promTier: 'Premium' },
  { name: 'Luis Gabriel', genre: 'balcanic', promTier: 'A+' },
  { name: 'Iuly Neamtu', genre: 'balcanic', promTier: 'A+' },
]

type PromArtist = {
  id: number; name: string; genre: GenreKey; tier: string
  cazare: string; nrBileteAvion: number; costPerKm: number; setType: string
}

const PROM_ARTISTS: PromArtist[] = PROM_MAP.map(m => {
  const a: any = ARTISTS_DATA.find((x: any) => x.name === m.name)
  if (!a) return null
  return {
    id: a.id, name: m.display || a.name, genre: m.genre, tier: m.promTier,
    cazare: a.cazare || 'la cerere',
    nrBileteAvion: a.nrBileteAvion || 0,
    costPerKm: a.costPerKm || 0,
    setType: a.setType || 'vocal',
  }
}).filter(Boolean) as PromArtist[]

const ORGANIZER_TYPES = ['Liceu', 'Colegiu', 'Facultate', 'Universitate', 'Liga Studentilor', 'Asociatie de parinti', 'Promoter']

const EVENT_LABEL: Record<string, string> = {
  'Liceu': 'Bal de liceu',
  'Colegiu': 'Bal de colegiu',
  'Facultate': 'Bal de facultate',
  'Universitate': 'Bal universitar',
  'Liga Studentilor': 'Bal studențesc',
  'Asociatie de parinti': 'Bal de absolvire',
  'Promoter': 'Bal de absolvire',
}

const MAX_ARTISTS = 3
const BUDGET_RANGES = ['pana la 5.000 EUR', '5.000 la 10.000 EUR', 'peste 10.000 EUR', 'nu stim inca']

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: '12px',
  border: '1px solid #e7e5e4', background: 'white', fontSize: '13px',
  color: '#1c1917', outline: 'none', boxSizing: 'border-box',
  fontFamily: F, fontWeight: 500,
}
const labelStyle: React.CSSProperties = {
  fontSize: '10px', color: '#a8a29e', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px',
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

export default function PromPage() {
  const [step, setStep] = useState<'form' | 'summary'>('form')
  const [images, setImages] = useState<Record<string, string>>({})
  const [selection, setSelection] = useState<PromArtist[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [expertOpen, setExpertOpen] = useState(false)
  const [openArtistId, setOpenArtistId] = useState<number | null>(null)
  const [seturi, setSeturi] = useState<Record<number, string>>({})
  const [maxWarning, setMaxWarning] = useState(false)
  const [expertArtists, setExpertArtists] = useState<string[]>([])

  const [form, setForm] = useState({
    organizer_type: '', institution_name: '', city: '',
    event_date: '', event_date_alternative: '', budget_range: '',
    other_artists: '', organizer_name: '', organizer_email: '',
    organizer_phone: '', is_minor: false, parent_contact: '', message: '',
  })
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    fetch('/api/prom-images').then(r => r.json())
      .then(d => { if (d && !d.error) setImages(d) }).catch(() => {})
  }, [])

  const toggleArtist = (a: PromArtist) => {
    setSelection(s => {
      if (s.find(x => x.id === a.id)) return s.filter(x => x.id !== a.id)
      if (s.length >= MAX_ARTISTS) {
        setMaxWarning(true)
        setTimeout(() => setMaxWarning(false), 2500)
        return s
      }
      return [...s, a]
    })
  }

  const openExpert = (only?: string[]) => {
    setExpertArtists(only && only.length ? only : artistNames)
    setExpertOpen(true)
  }

  const byGenre = useMemo(() => {
    const map: Record<GenreKey, PromArtist[]> = { trap: [], urban: [], pop_dance: [], balcanic: [] }
    PROM_ARTISTS.forEach(a => map[a.genre].push(a))
    return map
  }, [])

  const canContinue = Boolean(
    form.organizer_type && form.institution_name.trim() && form.city.trim() &&
    form.event_date && form.organizer_name.trim() && form.organizer_phone.trim() &&
    (!form.is_minor || form.parent_contact.trim()) &&
    (selection.length > 0 || form.other_artists.trim())
  )

  const artistNames = [
    ...selection.map(a => a.name),
    ...form.other_artists.split(',').map(s => s.trim()).filter(Boolean),
  ]

  function waLink() {
    const lines = [
      'Cerere ' + (EVENT_LABEL[form.organizer_type] || 'bal de absolvire') + ' — GIGx', '',
      'Organizator: ' + form.organizer_type + ' - ' + form.institution_name,
      'Oras: ' + form.city,
      'Data: ' + form.event_date + (form.event_date_alternative ? ' (alternativ ' + form.event_date_alternative + ')' : ''),
      'Buget: ' + (form.budget_range || 'nespecificat'),
      'Artisti: ' + (artistNames.length ? artistNames.join(', ') : 'nespecificat'), '',
      'Contact: ' + form.organizer_name,
      'Telefon: ' + form.organizer_phone,
      form.organizer_email ? 'Email: ' + form.organizer_email : '',
      form.is_minor ? 'Minor. Contact adult: ' + form.parent_contact : '',
      form.message ? 'Mesaj: ' + form.message : '',
    ].filter(Boolean)
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n'))
  }

  async function submit() {
    if (submitting) return
    setSubmitting(true)
    setError('')

    const { error: dbError } = await supabase.from('requests_prom').insert({
      organizer_type: form.organizer_type,
      institution_name: form.institution_name.trim(),
      city: form.city.trim(),
      event_date: form.event_date,
      event_date_alternative: form.event_date_alternative || null,
      budget_range: form.budget_range || null,
      artists_wanted: artistNames,
      organizer_name: form.organizer_name.trim(),
      organizer_email: form.organizer_email.trim() || null,
      organizer_phone: form.organizer_phone.trim(),
      is_minor: form.is_minor,
      parent_contact: form.is_minor ? form.parent_contact.trim() : null,
      message: form.message.trim() || null,
      status: 'new',
    })

    setSubmitting(false)
    if (dbError) {
      console.error('SUPABASE ERROR:', dbError)
      setError('Cererea nu a putut fi salvata. ' + (dbError.message || ''))
      return
    }

    window.open(waLink(), '_blank')
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const Nav = () => (
    <>
      <nav style={{borderBottom:'1px solid #e7e5e4', background:'white', height:'56px', display:'flex', alignItems:'center', padding:'0 24px', justifyContent:'space-between', position:'sticky', top:0, zIndex:100}}>
        <Link href="/" style={{fontSize:'20px', fontWeight:800, color:'#1c1917', textDecoration:'none', letterSpacing:'-0.5px'}}>
          GIG<span style={{color:'#059669'}}>x</span>
        </Link>
        <button onClick={() => openExpert()}
          style={{background:'#059669', border:'none', fontSize:'13px', fontWeight:700, color:'white', cursor:'pointer', fontFamily:F, padding:'9px 18px', borderRadius:'10px'}}>
          Vorbește cu un expert
        </button>
      </nav>
      <TierLegendProm />
    </>
  )

  const SelectedBar = () => selection.length === 0 ? null : (
    <div style={{background:'#1c1917', borderRadius:'12px', padding:'12px 16px', marginBottom:'20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'8px'}}>
      <div style={{display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap'}}>
        {selection.map((a, i) => {
          const t = tierInfo(a.tier)
          return (
            <div key={a.id} style={{display:'flex', alignItems:'center', gap:'8px'}}>
              {i > 0 && <span style={{color:'#44403c', fontSize:'12px'}}>·</span>}
              <span style={{fontSize:'13px', fontWeight:700, color:'white'}}>{a.name}</span>
              <span style={{fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', background:t.bg, color:'white'}}>{t.label}</span>
            </div>
          )
        })}
      </div>
      <span style={{fontSize:'11px', color:'#78716c'}}>fee la cerere</span>
    </div>
  )

  const Disclaimer = () => (
    <div style={{fontSize:'11px', color:'#a8a29e', lineHeight:1.6, textAlign:'center', maxWidth:'600px', margin:'0 auto', paddingTop:'8px'}}>
      {DISCLAIMER}
    </div>
  )

  const Footer = () => (
    <footer style={{background:'#1c1917', padding:'48px 24px 32px'}}>
      <div style={{maxWidth:'1100px', margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'32px', marginBottom:'32px'}}>
          <div style={{maxWidth:'260px'}}>
            <div style={{fontWeight:800, fontSize:'20px', color:'white', marginBottom:'12px', letterSpacing:'-0.5px'}}>
              GIG<span style={{color:'#059669'}}>x</span>
            </div>
            <div style={{fontSize:'13px', color:'#a8a29e', lineHeight:1.6}}>
              Booking artistic, făcut cu rigoare.<br />Din 2005.
            </div>
          </div>
          <div>
            <div style={{fontSize:'10px', fontWeight:700, color:'#78716c', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'12px'}}>Legal</div>
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              <Link href="/termeni" style={{fontSize:'13px', color:'#a8a29e', textDecoration:'none'}}>Termeni</Link>
              <Link href="/confidentialitate" style={{fontSize:'13px', color:'#a8a29e', textDecoration:'none'}}>Confidențialitate</Link>
              <Link href="/cookies" style={{fontSize:'13px', color:'#a8a29e', textDecoration:'none'}}>Cookies</Link>
            </div>
          </div>
          <div>
            <div style={{fontSize:'10px', fontWeight:700, color:'#78716c', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'12px'}}>Contact</div>
            <a href="mailto:contact@gigx.ro" style={{fontSize:'13px', color:'#a8a29e', textDecoration:'none'}}>contact@gigx.ro</a>
          </div>
        </div>
        <div style={{borderTop:'1px solid #292524', paddingTop:'24px', textAlign:'center', fontSize:'12px', color:'#78716c'}}>
          © 2026 GIGx · Toate drepturile rezervate
        </div>
      </div>
    </footer>
  )

  // ---------- CONFIRMARE ----------
  if (submitted) {
    return (
      <div style={{minHeight:'100vh', background:'#f5f5f7', fontFamily:F, display:'flex', flexDirection:'column'}}>
        <Nav />
        <div style={{flex:1, maxWidth:'560px', margin:'0 auto', padding:'80px 24px', width:'100%'}}>
          <div style={{background:'white', border:'2px solid #e7e5e4', borderRadius:'14px', padding:'40px', textAlign:'center'}}>
            <div style={{width:'52px', height:'52px', borderRadius:'50%', background:'#059669', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:'white', fontSize:'24px', fontWeight:800}}>✓</div>
            <div style={{fontWeight:800, fontSize:'22px', color:'#1c1917', marginBottom:'8px'}}>Cerere trimisă!</div>
            <div style={{fontWeight:600, fontSize:'14px', color:'#059669', marginBottom:'24px'}}>Un agent te contactează în mai puțin de 30 min.</div>
            <a href={'https://wa.me/' + WHATSAPP} target="_blank" rel="noreferrer"
              style={{display:'inline-block', background:'#1c1917', color:'white', padding:'13px 32px', borderRadius:'14px', fontSize:'14px', fontWeight:700, textDecoration:'none', fontFamily:F}}>
              Deschide WhatsApp
            </a>
          </div>
        </div>
        <Footer />
        <ExpertModal isOpen={expertOpen} onClose={() => setExpertOpen(false)} artists={expertArtists} eventLabel={EVENT_LABEL[form.organizer_type]} />
      </div>
    )
  }

  // ---------- DEVIZ ----------
  if (step === 'summary') {
    const km = getKm(form.city)
    const isBucuresti = km === 0
    return (
      <div style={{minHeight:'100vh', background:'#f5f5f7', fontFamily:F}}>
        <Nav />
        <div style={{maxWidth:'760px', margin:'0 auto', padding:'32px 24px 60px'}}>

          <div style={{textAlign:'center', marginBottom:'28px'}}>
            <h1 style={{fontSize:'28px', fontWeight:800, color:'#1c1917', marginBottom:'8px', letterSpacing:'-0.5px'}}>Rezumat bal</h1>
            <p style={{fontSize:'15px', color:'#78716c'}}>Verifică detaliile înainte de a trimite cererea</p>
          </div>

          <SelectedBar />

          <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'24px', marginBottom:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', marginBottom:'20px'}}>
              <div>
                <div style={{...labelStyle, display:'flex', alignItems:'center', gap:'4px'}}>
                  <Calendar size={10} strokeWidth={2} /> Eveniment
                </div>
                <div style={{fontSize:'14px', fontWeight:700, color:'#1c1917'}}>{EVENT_LABEL[form.organizer_type] || 'Bal de absolvire'}</div>
              </div>
              <div>
                <div style={{...labelStyle, display:'flex', alignItems:'center', gap:'4px'}}>
                  <Calendar size={10} strokeWidth={2} /> Data
                </div>
                <div style={{fontSize:'14px', fontWeight:700, color:'#1c1917'}}>{form.event_date}</div>
              </div>
              <div>
                <div style={{...labelStyle, display:'flex', alignItems:'center', gap:'4px'}}>
                  <Users size={10} strokeWidth={2} /> Organizator
                </div>
                <div style={{fontSize:'14px', fontWeight:700, color:'#1c1917'}}>{form.organizer_type}</div>
              </div>
            </div>

            <div style={{borderTop:'1px solid #f5f5f4', paddingTop:'20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px'}}>
              <div>
                <div style={{...labelStyle, display:'flex', alignItems:'center', gap:'4px'}}>
                  <MapPin size={10} strokeWidth={2} /> Locație
                </div>
                <div style={{background:'#fafaf9', borderRadius:'12px', padding:'12px 14px', border:'1px solid #f0f0ef'}}>
                  <div style={{fontWeight:700, fontSize:'14px', color:'#1c1917', marginBottom:'2px'}}>{form.institution_name}</div>
                  <div style={{fontSize:'12px', color:'#78716c'}}>{form.city}</div>
                </div>
              </div>
              <div>
                <div style={labelStyle}>Bugetul vostru</div>
                <div style={{background:'#fafaf9', borderRadius:'12px', padding:'12px 14px', border:'1px solid #f0f0ef'}}>
                  <div style={{fontWeight:800, fontSize:'16px', color:'#1c1917', marginBottom:'2px'}}>{form.budget_range || 'Nespecificat'}</div>
                  <div style={{fontSize:'11px', color:'#78716c'}}>buget total eveniment</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:'10px', marginBottom:'14px'}}>
            {selection.map(a => {
              const isOpen = openArtistId === a.id
              const ts = tierInfo(a.tier)
              const costRutier = a.costPerKm > 0 ? Math.round(km * a.costPerKm / 10) * 10 : 0
              const necesitaZbor = !isBucuresti && km > 300 && a.nrBileteAvion > 0
              const seturiArtist = getSeturi(a)
              const img = images[a.name]

              return (
                <div key={a.id} style={{background:'white', border:'1.5px solid ' + (isOpen ? '#1c1917' : '#e7e5e4'), borderRadius:'16px', overflow:'hidden', transition:'all 0.2s'}}>
                  <div onClick={() => setOpenArtistId(isOpen ? null : a.id)}
                    style={{padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', background: isOpen ? '#1c1917' : 'white'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                      <div style={{width:'36px', height:'36px', borderRadius:'10px', overflow:'hidden', background: isOpen ? 'rgba(255,255,255,0.15)' : '#f5f5f4', display:'flex', alignItems:'center', justifyContent:'center', color: isOpen ? 'white' : '#1c1917', fontWeight:800, fontSize:'12px', flexShrink:0}}>
                        {img
                          ? <img src={img} alt={a.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                          : initials(a.name)}
                      </div>
                      <div>
                        <div style={{fontWeight:700, fontSize:'14px', color: isOpen ? 'white' : '#1c1917', marginBottom:'4px'}}>{a.name}</div>
                        <span style={{fontSize:'10px', fontWeight:700, padding:'2px 7px', borderRadius:'6px', background: isOpen ? 'rgba(255,255,255,0.15)' : ts.bg, color:'white'}}>{ts.label}</span>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp size={18} color='white' strokeWidth={2} /> : <ChevronDown size={18} color='#78716c' strokeWidth={2} />}
                  </div>

                  {isOpen && (
                    <div style={{padding:'20px', borderTop:'1px solid #f0f0ef'}}>
                      <div style={{display:'flex', flexDirection:'column', gap:'10px', marginBottom:'16px'}}>

                        {!isBucuresti && (
                          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fafaf9', borderRadius:'12px', padding:'12px 14px'}}>
                            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                              <Car size={16} color='#44403c' strokeWidth={1.5} />
                              <div>
                                <div style={{fontSize:'13px', fontWeight:600, color:'#1c1917'}}>Transport rutier</div>
                                {costRutier > 0 && (
                                  <div style={{fontSize:'11px', color:'#a8a29e'}}>{km} km · din București</div>
                                )}
                              </div>
                            </div>
                            <div style={{fontSize:'14px', fontWeight:800, color: costRutier > 0 ? '#1c1917' : '#78716c'}}>
                              {costRutier > 0 ? costRutier.toLocaleString() + ' €' : 'la cerere'}
                            </div>
                          </div>
                        )}

                        {necesitaZbor && (
                          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', background:'#eff6ff', borderRadius:'12px', padding:'12px 14px', border:'1px solid #bfdbfe'}}>
                            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                              <Plane size={16} color='#1e40af' strokeWidth={1.5} />
                              <div>
                                <div style={{fontSize:'13px', fontWeight:600, color:'#1e40af'}}>Zbor artist</div>
                                <div style={{fontSize:'11px', color:'#3b82f6'}}>{a.nrBileteAvion} {a.nrBileteAvion === 1 ? 'bilet' : 'bilete'} · {km} km</div>
                              </div>
                            </div>
                            <div style={{fontSize:'12px', fontWeight:700, color:'#1e40af'}}>necesar</div>
                          </div>
                        )}

                        {isBucuresti ? null : a.cazare && a.cazare !== 'la cerere' ? (
                          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', background:'#f5f3ff', borderRadius:'12px', padding:'12px 14px', border:'1px solid #ddd6fe'}}>
                            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                              <Hotel size={16} color='#7c3aed' strokeWidth={1.5} />
                              <div>
                                <div style={{fontSize:'13px', fontWeight:600, color:'#7c3aed'}}>Cazare necesară</div>
                                <div style={{fontSize:'11px', color:'#8b5cf6'}}>{a.cazare}</div>
                              </div>
                            </div>
                            <div style={{fontSize:'12px', fontWeight:700, color:'#7c3aed'}}>necesar</div>
                          </div>
                        ) : (
                          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fafaf9', borderRadius:'12px', padding:'12px 14px'}}>
                            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                              <Hotel size={16} color='#44403c' strokeWidth={1.5} />
                              <div style={{fontSize:'13px', fontWeight:600, color:'#1c1917'}}>Cazare</div>
                            </div>
                            <div style={{fontSize:'13px', fontWeight:700, color:'#78716c'}}>la cerere</div>
                          </div>
                        )}

                        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderTop:'1px solid #f0f0ef'}}>
                          <div>
                            <div style={{fontSize:'13px', fontWeight:600, color:'#1c1917'}}>Fee artist</div>
                            <div style={{fontSize:'11px', color:'#a8a29e'}}>Tier {ts.label} · {ts.range}</div>
                          </div>
                          <div style={{fontSize:'13px', fontWeight:700, color:'#78716c'}}>La cerere</div>
                        </div>

                        <div style={{borderTop:'1px solid #f0f0ef', padding:'12px 14px'}}>
                          <div style={{fontSize:'11px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'10px'}}>Seturi</div>
                          <div style={{display:'flex', gap:'6px', flexWrap:'wrap'}}>
                            {seturiArtist.map(st => {
                              const active = (seturi[a.id] || seturiArtist[0]?.id) === st.id
                              return (
                                <button key={st.id} onClick={() => setSeturi(prev => ({ ...prev, [a.id]: st.id }))}
                                  style={{padding:'6px 14px', borderRadius:'20px', border:'1.5px solid', cursor:'pointer', fontSize:'11px', fontWeight:600, fontFamily:F, transition:'all 0.15s',
                                    background: active ? '#1c1917' : 'white',
                                    color: active ? 'white' : '#44403c',
                                    borderColor: active ? '#1c1917' : '#e7e5e4'}}>
                                  {st.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      <div style={{background:'#1c1917', borderRadius:'14px', padding:'16px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer'}}
                        onClick={() => openExpert([a.name])}>
                        <div>
                          <div style={{fontWeight:800, fontSize:'13px', color:'white', marginBottom:'2px'}}>Prețul exact, confirmat în 30 min.</div>
                          <div style={{fontSize:'11px', color:'rgba(255,255,255,0.6)'}}>Fără surprize. Garantat.</div>
                        </div>
                        <div style={{background:'#059669', color:'white', fontWeight:700, fontSize:'12px', padding:'8px 14px', borderRadius:'10px', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:'6px'}}>
                          Vreau prețul <ArrowRight size={13} strokeWidth={2} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {form.other_artists.trim() && (
            <div style={{background:'white', border:'1.5px solid #e7e5e4', borderRadius:'16px', padding:'16px 20px', marginBottom:'14px'}}>
              <div style={labelStyle}>Alți artiști ceruți</div>
              <div style={{fontSize:'14px', fontWeight:700, color:'#1c1917'}}>{form.other_artists}</div>
              <div style={{fontSize:'11px', color:'#a8a29e', marginTop:'4px'}}>Verificăm disponibilitatea și îți revenim cu ofertă.</div>
            </div>
          )}

          {error && (
            <div style={{padding:'12px 14px', borderRadius:'12px', background:'#fef2f2', border:'1px solid #fecaca', color:'#b91c1c', fontSize:'13px', fontWeight:600, marginBottom:'14px'}}>
              {error}
            </div>
          )}

          <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
            <button onClick={() => { setStep('form'); window.scrollTo({top:0}) }}
              style={{padding:'14px 28px', borderRadius:'14px', border:'1.5px solid #1c1917', background:'white', color:'#1c1917', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:F}}>
              Înapoi
            </button>
            <button onClick={submit} disabled={submitting}
              style={{flex:1, background:'#1c1917', color:'white', padding:'14px', borderRadius:'14px', border:'none', cursor: submitting ? 'not-allowed' : 'pointer', fontSize:'14px', fontWeight:700, fontFamily:F, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
              {submitting ? 'Se trimite...' : 'Trimite cererea'} <ArrowRight size={16} strokeWidth={2} />
            </button>
          </div>

          <Disclaimer />
        </div>
        <Footer />
        <ExpertModal isOpen={expertOpen} onClose={() => setExpertOpen(false)} eventDate={form.event_date} selectedCity={form.city} artists={expertArtists} eventLabel={EVENT_LABEL[form.organizer_type]} />
      </div>
    )
  }

  // ---------- FORMULAR + CATALOG ----------
  return (
    <div style={{minHeight:'100vh', background:'#f5f5f7', fontFamily:F}}>
      <Nav />

      <div style={{maxWidth:'860px', margin:'0 auto', padding:'48px 24px 28px'}}>
        <div style={{fontSize:'11px', fontWeight:700, color:'#059669', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'14px'}}>
          GIGx pentru baluri
        </div>
        <h1 style={{fontSize:'clamp(30px, 5vw, 44px)', fontWeight:800, letterSpacing:'-0.03em', lineHeight:1.1, margin:'0 0 14px', color:'#1c1917'}}>
          Nu mai sunați în gol.
        </h1>
        <p style={{fontSize:'16px', color:'#57534e', lineHeight:1.65, maxWidth:'540px', margin:'0 0 18px', fontWeight:500}}>
          Știm cine e liber și cât costă. Aceiași oameni care au făcut booking-ul și pentru Beach Please. Răspuns în 30 de minute.
        </p>
      </div>

      <div style={{maxWidth:'860px', margin:'0 auto', padding:'0 24px 20px'}}>
        <SelectedBar />

        <div style={{background:'white', border:'2px solid #e7e5e4', borderRadius:'14px', padding:'28px'}}>
          <div style={{fontWeight:800, fontSize:'20px', color:'#1c1917', marginBottom:'6px'}}>Detaliile balului</div>
          <div style={{fontSize:'13px', color:'#78716c', marginBottom:'24px', fontWeight:500}}>
            Completează detaliile. Poți alege artiști din catalogul de mai jos sau scrie orice nume.
          </div>

          <div style={{display:'grid', gap:'16px'}}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'16px'}}>
              <div>
                <div style={labelStyle}>Tip organizator *</div>
                <select value={form.organizer_type} onChange={e => set('organizer_type', e.target.value)}
                  style={{...inputStyle, cursor:'pointer', border:'1.5px solid ' + (form.organizer_type ? '#059669' : '#e7e5e4')}}>
                  <option value="">Alege</option>
                  {ORGANIZER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <div style={labelStyle}>Numele instituției *</div>
                <input style={{...inputStyle, border:'1.5px solid ' + (form.institution_name ? '#059669' : '#e7e5e4')}}
                  placeholder="ex: Colegiul Național Vasile Alecsandri" value={form.institution_name} onChange={e => set('institution_name', e.target.value)} />
              </div>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'16px'}}>
              <div>
                <div style={labelStyle}>Oraș *</div>
                <input style={{...inputStyle, border:'1.5px solid ' + (form.city ? '#059669' : '#e7e5e4')}}
                  placeholder="ex: Bacău" value={form.city} onChange={e => set('city', e.target.value)} />
              </div>
              <div>
                <div style={labelStyle}>Data balului *</div>
                <input type="date" style={{...inputStyle, border:'1.5px solid ' + (form.event_date ? '#059669' : '#e7e5e4'), cursor:'pointer'}}
                  value={form.event_date} onChange={e => set('event_date', e.target.value)}
                  onClick={e => { try { (e.target as any).showPicker?.() } catch {} }} />
              </div>
              <div>
                <div style={labelStyle}>Dată alternativă</div>
                <input type="date" style={{...inputStyle, cursor:'pointer'}} value={form.event_date_alternative}
                  onChange={e => set('event_date_alternative', e.target.value)}
                  onClick={e => { try { (e.target as any).showPicker?.() } catch {} }} />
              </div>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'16px'}}>
              <div>
                <div style={labelStyle}>Buget estimat</div>
                <select value={form.budget_range} onChange={e => set('budget_range', e.target.value)} style={{...inputStyle, cursor:'pointer'}}>
                  <option value="">Alege</option>
                  {BUDGET_RANGES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <div style={labelStyle}>Alți artiști doriți</div>
                <input style={inputStyle} placeholder="orice nume, separate prin virgulă" value={form.other_artists} onChange={e => set('other_artists', e.target.value)} />
              </div>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'16px'}}>
              <div>
                <div style={labelStyle}>Numele tău *</div>
                <input style={{...inputStyle, border:'1.5px solid ' + (form.organizer_name ? '#059669' : '#e7e5e4')}}
                  placeholder="Ion Popescu" value={form.organizer_name} onChange={e => set('organizer_name', e.target.value)} />
              </div>
              <div>
                <div style={labelStyle}>Telefon / WhatsApp *</div>
                <input type="tel" style={{...inputStyle, border:'1.5px solid ' + (form.organizer_phone ? '#059669' : '#e7e5e4')}}
                  placeholder="+40 7xx xxx xxx" value={form.organizer_phone} onChange={e => set('organizer_phone', e.target.value)} />
              </div>
              <div>
                <div style={labelStyle}>Email</div>
                <input type="email" style={inputStyle} placeholder="email@tau.ro" value={form.organizer_email} onChange={e => set('organizer_email', e.target.value)} />
              </div>
            </div>

            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
              <input type="checkbox" id="isMinor" checked={form.is_minor} onChange={e => set('is_minor', e.target.checked)}
                style={{width:'16px', height:'16px', cursor:'pointer', accentColor:'#059669'}} />
              <label htmlFor="isMinor" style={{fontSize:'13px', color:'#78716c', cursor:'pointer'}}>Am sub 18 ani</label>
            </div>

            {form.is_minor && (
              <div>
                <div style={labelStyle}>Contact părinte sau profesor coordonator *</div>
                <input style={{...inputStyle, border:'1.5px solid ' + (form.parent_contact ? '#059669' : '#e7e5e4')}}
                  placeholder="Nume și telefon" value={form.parent_contact} onChange={e => set('parent_contact', e.target.value)} />
                <div style={{fontSize:'11px', color:'#a8a29e', marginTop:'6px'}}>
                  Contractul și discuțiile comerciale se fac cu un adult responsabil.
                </div>
              </div>
            )}

            <div>
              <div style={labelStyle}>Ce îți dorești?</div>
              <textarea rows={3} style={{...inputStyle, resize:'none'}}
                placeholder="ex: bal 300 persoane, sala X, vrem trap + DJ..." value={form.message} onChange={e => set('message', e.target.value)} />
            </div>

            <button onClick={() => { setStep('summary'); window.scrollTo({top:0}) }} disabled={!canContinue}
              style={{width:'100%', background: canContinue ? '#1c1917' : '#e7e5e4', color: canContinue ? 'white' : '#a8a29e', padding:'14px', borderRadius:'14px', border:'none', cursor: canContinue ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:700, fontFamily:F}}>
              Continuă — Vezi devizul
            </button>

            <div style={{textAlign:'center', fontSize:'11px', color:'#a8a29e'}}>
              Răspuns garantat în 30 min · Gratuit
            </div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:'860px', margin:'0 auto', padding:'0 24px 48px'}}>
        <div style={{background:'#f5f3ff', border:'1px solid #ddd6fe', borderRadius:'14px', padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px'}}>
          <div>
            <div style={{fontSize:'13px', fontWeight:700, color:'#7c3aed', marginBottom:'2px'}}>Nu știi ce să alegi?</div>
            <div style={{fontSize:'12px', color:'#059669', fontWeight:600}}>Răspuns garantat în mai puțin de 30 min.</div>
          </div>
          <button onClick={() => openExpert()}
            style={{background:'#7c3aed', color:'white', padding:'9px 18px', borderRadius:'10px', border:'none', cursor:'pointer', fontSize:'12px', fontWeight:700, fontFamily:F, whiteSpace:'nowrap'}}>
            Vorbește cu un expert
          </button>
        </div>
      </div>

      <div style={{maxWidth:'1100px', margin:'0 auto', padding:'0 24px 60px'}}>
        <div style={{fontWeight:800, fontSize:'22px', color:'#1c1917', marginBottom:'4px', letterSpacing:'-0.02em'}}>Artiști pentru baluri</div>
        <div style={{fontSize:'13px', color:'#78716c', marginBottom:'16px', fontWeight:500}}>
          Apasă pe orice artist ca să îl adaugi în cerere. <strong style={{color:'#1c1917'}}>Poți verifica maxim {MAX_ARTISTS} simultan.</strong>
        </div>

        {maxWarning && (
          <div style={{background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'12px', padding:'12px 16px', marginBottom:'16px', fontSize:'13px', fontWeight:600, color:'#92400e'}}>
            Poți verifica maxim {MAX_ARTISTS} artiști simultan. Scoate unul din selecție ca să adaugi altul, sau scrie-i numele în câmpul „Alți artiști doriți".
          </div>
        )}

        <div style={{background:'#ecfdf5', border:'1px solid #a7f3d0', borderRadius:'12px', padding:'12px 16px', marginBottom:'28px', display:'inline-block'}}>
          <span style={{fontSize:'13px', color:'#065f46', fontWeight:600}}>
            O selecție din cei mai ceruți. Lucrăm cu peste 300 de artiști — dacă nu îl vezi pe al tău, scrie-i numele în formular.
          </span>
        </div>

        {(Object.keys(GENRES) as GenreKey[]).map(g => (
          <div key={g} style={{marginBottom:'36px'}}>
            <div style={{fontSize:'15px', fontWeight:700, color:'#1c1917', marginBottom:'14px'}}>{GENRES[g]}</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(170px, 1fr))', gap:'14px'}}>
              {byGenre[g].map(a => {
                const isSelected = !!selection.find(x => x.id === a.id)
                const img = images[a.name]
                const t = tierInfo(a.tier)
                return (
                  <div key={a.id} onClick={() => toggleArtist(a)}
                    style={{background:'white', border:'2px solid ' + (isSelected ? '#059669' : '#e7e5e4'), borderRadius:'14px', overflow:'hidden', cursor:'pointer', transition:'all 0.2s'}}>
                    <div style={{width:'100%', aspectRatio:'1/1', background:'#f5f5f4', display:'flex', alignItems:'center', justifyContent:'center'}}>
                      {img
                        ? <img src={img} alt={a.name} style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}} />
                        : <span style={{fontSize:'26px', fontWeight:800, color:'#d6d3d1'}}>{initials(a.name)}</span>}
                    </div>
                    <div style={{padding:'12px 14px'}}>
                      <div style={{fontSize:'14px', fontWeight:700, color:'#1c1917', marginBottom:'8px'}}>{a.name}</div>
                      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px'}}>
                        <span style={{fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', background:t.bg, color:'white'}}>{t.label}</span>
                        <span style={{fontSize:'11px', fontWeight:700, color: isSelected ? '#059669' : '#a8a29e'}}>
                          {isSelected ? '✓ Adăugat' : '+ Adaugă'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <Disclaimer />
      </div>

      <Footer />
      <ExpertModal isOpen={expertOpen} onClose={() => setExpertOpen(false)} eventDate={form.event_date} selectedCity={form.city} artists={expertArtists} eventLabel={EVENT_LABEL[form.organizer_type]} />
    </div>
  )
}
