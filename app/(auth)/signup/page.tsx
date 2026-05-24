'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Mic2, Building2, Megaphone, MapPin, Landmark, Wine, ArrowRight, CheckCircle2 } from 'lucide-react'

const ROLES = [
  { id: 'artist', icon: Mic2, label: 'Artist / DJ', desc: 'Îți gestionezi disponibilitatea și primești cereri de booking' },
  { id: 'agency', icon: Building2, label: 'Agenție', desc: 'Gestionezi mai mulți artiști și primești cereri' },
  { id: 'promoter', icon: Megaphone, label: 'Promoter / Organizator', desc: 'Organizezi evenimente și cauți artiști' },
  { id: 'venue', icon: MapPin, label: 'Venue / Locație', desc: 'Sală, club, restaurant — apari pe platformă și primești cereri' },
  { id: 'municipality', icon: Landmark, label: 'Municipalitate / Primărie', desc: 'City Days, concerte publice, evenimente locale' },
  { id: 'client', icon: Wine, label: 'Client Privat', desc: 'Nuntă, petrecere, eveniment privat' },
]

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) { setError('Selectează tipul de cont'); return }
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, role } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.user) {
      await (supabase as any).from('profiles').upsert({ id: data.user.id, name, email, role })
    }
    if (role === 'artist' || role === 'agency') router.push('/dashboard/artist')
    else if (role === 'promoter') router.push('/dashboard/promoter')
    else router.push('/dashboard/client')
  }

  return (
    <div style={{minHeight:'100vh', background:'#fafaf9', fontFamily:'Montserrat,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px'}}>
      <div style={{width:'100%', maxWidth:'480px'}}>
        <div style={{textAlign:'center', marginBottom:'32px'}}>
          <Link href="/" style={{textDecoration:'none'}}>
            <div style={{fontWeight:800, fontSize:'22px', color:'#1c1917', letterSpacing:'-0.5px', marginBottom:'8px'}}>Concert Exchange</div>
          </Link>
          <h1 style={{fontSize:'24px', fontWeight:800, color:'#1c1917', marginBottom:'6px', letterSpacing:'-0.5px'}}>
            {step === 1 ? 'Creează cont' : 'Detalii cont'}
          </h1>
          <p style={{fontSize:'14px', color:'#78716c'}}>
            {step === 1 ? 'Alege tipul de cont potrivit pentru tine' : 'Completează informațiile contului'}
          </p>
        </div>

        {step === 1 && (
          <div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'24px'}}>
              {ROLES.map(r => {
                const Icon = r.icon
                const isSelected = role === r.id
                return (
                  <div key={r.id} onClick={() => setRole(r.id)}
                    style={{background: isSelected ? '#1c1917' : 'white', border:'1.5px solid ' + (isSelected ? '#1c1917' : '#e7e5e4'), borderRadius:'16px', padding:'20px 16px', cursor:'pointer', textAlign:'center', transition:'all 0.15s', boxShadow: isSelected ? '0 4px 20px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.04)'}}>
                    <div style={{display:'flex', justifyContent:'center', marginBottom:'10px'}}>
                      <Icon size={24} color={isSelected ? 'white' : '#44403c'} strokeWidth={1.5} />
                    </div>
                    <div style={{fontWeight:700, fontSize:'13px', color: isSelected ? 'white' : '#1c1917', marginBottom:'4px'}}>{r.label}</div>
                    <div style={{fontSize:'11px', color: isSelected ? 'rgba(255,255,255,0.65)' : '#78716c', lineHeight:1.4}}>{r.desc}</div>
                  </div>
                )
              })}
            </div>
            {error && <div style={{background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', color:'#dc2626', marginBottom:'16px'}}>{error}</div>}
            <button onClick={() => { if(role) setStep(2); else setError('Selectează tipul de cont') }}
              style={{width:'100%', background:'#1c1917', color:'white', padding:'14px', borderRadius:'14px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
              Continuă <ArrowRight size={16} strokeWidth={2} />
            </button>
            <div style={{textAlign:'center', marginTop:'16px', fontSize:'13px', color:'#78716c'}}>
              Ai deja cont? <Link href="/login" style={{color:'#1c1917', fontWeight:700, textDecoration:'none'}}>Intră în cont</Link>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSignup}>
            <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'24px', marginBottom:'16px'}}>
              <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>
                <div>
                  <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>Nume și prenume</div>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ion Popescu" required
                    style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
                </div>
                <div>
                  <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>Email</div>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@tau.ro" required
                    style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
                </div>
                <div>
                  <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px'}}>Parolă</div>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minim 6 caractere" required minLength={6}
                    style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
                </div>
              </div>
            </div>
            {error && <div style={{background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', color:'#dc2626', marginBottom:'16px'}}>{error}</div>}
            <div style={{display:'flex', gap:'10px'}}>
              <button type="button" onClick={() => setStep(1)}
                style={{padding:'13px 24px', borderRadius:'14px', border:'1.5px solid #e7e5e4', background:'white', color:'#78716c', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif'}}>
                Înapoi
              </button>
              <button type="submit" disabled={loading}
                style={{flex:1, background:'#1c1917', color:'white', padding:'13px', borderRadius:'14px', border:'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif', opacity: loading ? 0.7 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
                {loading ? 'Se creează contul...' : 'Creează contul'} {!loading && <ArrowRight size={16} strokeWidth={2} />}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
