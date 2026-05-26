'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowRight, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.user?.email === 'me@bogdannita.ro') { router.push('/dashboard/admin'); return }
    const role = data.user?.user_metadata?.role
    if (role === 'artist' || role === 'agency') router.push('/dashboard/artist')
    else if (role === 'promoter') router.push('/dashboard/promoter')
    else router.push('/dashboard/client')
  }

  return (
    <div style={{minHeight:'100vh', background:'#fafaf9', fontFamily:'Montserrat,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px'}}>
      <div style={{width:'100%', maxWidth:'400px'}}>
        <div style={{textAlign:'center', marginBottom:'32px'}}>
          <Link href="/" style={{textDecoration:'none'}}>
            <div style={{fontWeight:800, fontSize:'22px', color:'#1c1917', letterSpacing:'-0.5px', marginBottom:'8px'}}>GIGx</div>
          </Link>
          <h1 style={{fontSize:'24px', fontWeight:800, color:'#1c1917', marginBottom:'6px', letterSpacing:'-0.5px'}}>Intră în cont</h1>
          <p style={{fontSize:'14px', color:'#78716c'}}>Bine ai revenit</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'24px', marginBottom:'16px'}}>
            <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>
              <div>
                <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px', display:'flex', alignItems:'center', gap:'5px'}}>
                  <Mail size={10} strokeWidth={2} /> Email
                </div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@tau.ro" required
                  style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
              </div>
              <div>
                <div style={{fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px', display:'flex', alignItems:'center', gap:'5px'}}>
                  <Lock size={10} strokeWidth={2} /> Parolă
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Parola ta" required
                  style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid #e7e5e4', fontSize:'13px', fontFamily:'Montserrat,sans-serif', color:'#1c1917', outline:'none', boxSizing:'border-box'}} />
              </div>
            </div>
          </div>

          {error && (
            <div style={{background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', color:'#dc2626', marginBottom:'16px'}}>{error}</div>
          )}

          <button type="submit" disabled={loading}
            style={{width:'100%', background:'#1c1917', color:'white', padding:'14px', borderRadius:'14px', border:'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat,sans-serif', opacity: loading ? 0.7 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginBottom:'16px'}}>
            {loading ? 'Se conectează...' : 'Intră în cont'} {!loading && <ArrowRight size={16} strokeWidth={2} />}
          </button>

          <div style={{textAlign:'center', fontSize:'13px', color:'#78716c'}}>
            Nu ai cont? <Link href="/signup" style={{color:'#1c1917', fontWeight:700, textDecoration:'none'}}>Creează cont</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
