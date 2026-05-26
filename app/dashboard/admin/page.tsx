'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle2, XCircle, Clock, Users, Music, MapPin, Megaphone, Building2, Landmark } from 'lucide-react'

const ADMIN_EMAIL = 'me@bogdannita.ro'

const ROLE_ICONS: Record<string, any> = {
  artist: Music,
  agency: Building2,
  promoter: Megaphone,
  venue: MapPin,
  municipality: Landmark,
  client: Users,
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  approved: '#059669',
  rejected: '#dc2626',
}

const REJECT_MESSAGES = [
  'Profil incomplet — te rugăm să completezi toate câmpurile obligatorii.',
  'Documentele lipsesc — te rugăm să adaugi actele necesare.',
  'Brand deja înregistrat — există deja un profil pentru acest artist.',
  'Informații incorecte — verifică datele introduse.',
  'Nu îndeplinești criteriile de eligibilitate.',
]

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [tab, setTab] = useState<'pending' | 'approved' | 'all'>('pending')
  const [artistProfiles, setArtistProfiles] = useState<Record<string, any>>({})

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUser(data.user)
        if (data.user.email === ADMIN_EMAIL) {
          setIsAdmin(true)
          loadProfiles()
        }
      }
      setLoading(false)
    })
  }, [])

  const loadProfiles = async () => {
    const { data } = await (supabase as any).from('profiles').select('*').order('created_at', { ascending: false })
    if (data) setProfiles(data)
  }

  const handleApprove = async (id: string) => {
    setActionLoading(id)
    await (supabase as any).from('profiles').update({ status: 'approved', admin_message: 'Profil aprobat. Bine ai venit pe GIGx!' }).eq('id', id)
    await loadProfiles()
    setActionLoading(null)
  }

  const handleReject = async (id: string) => {
    if (!selectedMessage) { alert('Selectează un motiv de respingere'); return }
    setActionLoading(id)
    await (supabase as any).from('profiles').update({ status: 'rejected', admin_message: selectedMessage }).eq('id', id)
    await loadProfiles()
    setActionLoading(null)
  }

  const filtered = profiles.filter(p => {
    if (tab === 'pending') return !p.status || p.status === 'pending'
    if (tab === 'approved') return p.status === 'approved'
    return true
  }).filter(p => p.role !== 'client')

  if (loading) return <div style={{padding:'40px', textAlign:'center', fontFamily:'Montserrat,sans-serif'}}>Se încarcă...</div>

  if (!isAdmin) return (
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Montserrat,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'48px', marginBottom:'16px'}}>🔒</div>
        <div style={{fontWeight:700, fontSize:'18px', color:'#1c1917'}}>Acces restricționat</div>
        <div style={{fontSize:'14px', color:'#78716c', marginTop:'8px'}}>Această pagină e disponibilă doar pentru administratori.</div>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh', background:'#fafaf9', fontFamily:'Montserrat,sans-serif'}}>
      <nav style={{background:'#1c1917', padding:'0 24px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div style={{fontWeight:800, fontSize:'16px', color:'white', letterSpacing:'-0.5px'}}>GIGx — Admin</div>
        <div style={{fontSize:'12px', color:'rgba(255,255,255,0.6)'}}>{user?.email}</div>
      </nav>

      <div style={{maxWidth:'900px', margin:'0 auto', padding:'24px'}}>
        <div style={{marginBottom:'24px'}}>
          <h1 style={{fontSize:'24px', fontWeight:800, color:'#1c1917', marginBottom:'6px'}}>Dashboard Admin</h1>
          <div style={{display:'flex', gap:'16px'}}>
            <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'12px', padding:'14px 20px', textAlign:'center'}}>
              <div style={{fontWeight:800, fontSize:'24px', color:'#f59e0b'}}>{profiles.filter(p => !p.status || p.status === 'pending').filter(p => p.role !== 'client').length}</div>
              <div style={{fontSize:'11px', color:'#78716c', fontWeight:600}}>În așteptare</div>
            </div>
            <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'12px', padding:'14px 20px', textAlign:'center'}}>
              <div style={{fontWeight:800, fontSize:'24px', color:'#059669'}}>{profiles.filter(p => p.status === 'approved').length}</div>
              <div style={{fontSize:'11px', color:'#78716c', fontWeight:600}}>Aprobate</div>
            </div>
            <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'12px', padding:'14px 20px', textAlign:'center'}}>
              <div style={{fontWeight:800, fontSize:'24px', color:'#1c1917'}}>{profiles.filter(p => p.role !== 'client').length}</div>
              <div style={{fontSize:'11px', color:'#78716c', fontWeight:600}}>Total</div>
            </div>
          </div>
        </div>

        <div style={{display:'flex', gap:'8px', marginBottom:'20px'}}>
          {(['pending', 'approved', 'all'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{padding:'8px 18px', borderRadius:'20px', border:'1.5px solid', cursor:'pointer', fontSize:'12px', fontWeight:600, fontFamily:'Montserrat,sans-serif',
                background: tab === t ? '#1c1917' : 'white', color: tab === t ? 'white' : '#44403c', borderColor: tab === t ? '#1c1917' : '#e7e5e4'}}>
              {t === 'pending' ? 'În așteptare' : t === 'approved' ? 'Aprobate' : 'Toate'}
            </button>
          ))}
        </div>

        <div style={{marginBottom:'16px'}}>
          <div style={{fontSize:'11px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px'}}>Mesaj respingere</div>
          <select value={selectedMessage} onChange={e => setSelectedMessage(e.target.value)}
            style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', background:'white'}}>
            <option value="">Selectează motiv respingere...</option>
            {REJECT_MESSAGES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
          {filtered.length === 0 && (
            <div style={{textAlign:'center', padding:'40px', color:'#a8a29e', fontSize:'14px'}}>
              Nicio cerere în această categorie
            </div>
          )}
          {filtered.map(p => {
            const Icon = ROLE_ICONS[p.role] || Users
            const statusColor = STATUS_COLORS[p.status || 'pending']
            return (
              <div key={p.id} style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'16px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                    <div style={{width:'40px', height:'40px', borderRadius:'12px', background:'#f5f5f4', display:'flex', alignItems:'center', justifyContent:'center'}}>
                      <Icon size={18} color='#44403c' strokeWidth={1.5} />
                    </div>
                    <div>
                      <div style={{fontWeight:700, fontSize:'14px', color:'#1c1917'}}>{p.name}</div>
                      <div style={{fontSize:'12px', color:'#78716c'}}>{p.email} · {p.role}</div>
                    </div>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', fontWeight:700, color: statusColor}}>
                      {p.status === 'approved' ? <CheckCircle2 size={12} strokeWidth={2} /> : p.status === 'rejected' ? <XCircle size={12} strokeWidth={2} /> : <Clock size={12} strokeWidth={2} />}
                      {p.status === 'approved' ? 'Aprobat' : p.status === 'rejected' ? 'Respins' : 'În așteptare'}
                    </div>
                  </div>
                </div>
                {p.admin_message && (
                  <div style={{background:'#f5f5f4', borderRadius:'10px', padding:'10px 14px', fontSize:'12px', color:'#78716c', marginBottom:'12px'}}>
                    {p.admin_message}
                  </div>
                )}
                {(!p.status || p.status === 'pending') && (
                  <div style={{display:'flex', gap:'8px'}}>
                    <button onClick={() => handleApprove(p.id)} disabled={actionLoading === p.id}
                      style={{flex:1, padding:'10px', borderRadius:'12px', background:'#059669', color:'white', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:700, fontFamily:'Montserrat,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'}}>
                      <CheckCircle2 size={14} strokeWidth={2} /> Aprobă
                    </button>
                    <button onClick={() => handleReject(p.id)} disabled={actionLoading === p.id}
                      style={{flex:1, padding:'10px', borderRadius:'12px', background:'#dc2626', color:'white', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:700, fontFamily:'Montserrat,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'}}>
                      <XCircle size={14} strokeWidth={2} /> Respinge
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
