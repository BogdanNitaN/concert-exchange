'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Shield, Lock, Unlock, KeyRound, ArrowLeft } from 'lucide-react'
const F = 'Montserrat,sans-serif'
const UI = {
  bg: '#f5f5f7', card: '#ffffff', ink: '#1c1917', sub: '#57534e', faint: '#a8a29e',
  line: '#e7e5e4', green: '#059669', greenSoft: '#f0fdf4', purple: '#7c3aed', dark: '#1c1917',
  radius: '16px', radiusSm: '12px',
  shadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)',
}
interface U { id: string; email: string; username: string; role: string; blocat: boolean; ultimaLogare: string | null }

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [adminUsername, setAdminUsername] = useState('')
  const [loginUser, setLoginUser] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [users, setUsers] = useState<U[]>([])
  const [toast, setToast] = useState('')
  const [resetFor, setResetFor] = useState<string | null>(null)
  const [parolaNoua, setParolaNoua] = useState('')

  function arataToast(m: string) { setToast(m); setTimeout(() => setToast(''), 2800) }

  async function faLogin() {
    setLoggingIn(true); setLoginErr('')
    const mapRes = await fetch('/api/oferta-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: loginUser.trim() }) })
    const mapData = await mapRes.json()
    if (!mapData.email) { setLoginErr('Utilizator inexistent'); setLoggingIn(false); return }
    if (mapData.blocat) { setLoginErr('Cont blocat'); setLoggingIn(false); return }
    const { data, error } = await supabase.auth.signInWithPassword({ email: mapData.email, password: loginPass })
    if (error) { setLoginErr('Utilizator sau parolă greșită'); setLoggingIn(false); return }
    const role = data.user?.user_metadata?.role
    if (role === 'oferta_admin') { setAdminUsername(data.user?.user_metadata?.username || ''); setAuthed(true) }
    else { setLoginErr('Doar administratorul are acces aici'); await supabase.auth.signOut() }
    setLoggingIn(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      const role = user?.user_metadata?.role
      if (user && role === 'oferta_admin' && !user?.user_metadata?.blocat) {
        setAdminUsername(user?.user_metadata?.username || ''); setAuthed(true)
      }
      setCheckingAuth(false)
    })
  }, [])

  async function incarcaUseri() {
    const r = await fetch('/api/oferta-admin?admin=' + encodeURIComponent(adminUsername))
    const d = await r.json()
    if (d.ok) setUsers(d.users)
    else arataToast('Eroare: ' + (d.error || 'necunoscută'))
  }
  useEffect(() => { if (authed && adminUsername) incarcaUseri() }, [authed, adminUsername])

  async function actiune(userId: string, act: string, extra?: any) {
    const r = await fetch('/api/oferta-admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminUsername, actiune: act, userId, ...extra }) })
    const d = await r.json()
    if (d.ok) { arataToast(act === 'block' ? 'Cont blocat' : act === 'unblock' ? 'Cont deblocat' : 'Parolă resetată'); incarcaUseri() }
    else arataToast('Eroare: ' + (d.error || 'necunoscută'))
  }

  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: UI.radiusSm, border: '1px solid ' + UI.line, fontSize: '14px', fontFamily: F, boxSizing: 'border-box', outline: 'none' }
  const bg = 'linear-gradient(160deg, #eceef2 0%, #e8eaf0 45%, #dde1ea 100%)'

  if (checkingAuth) return <div style={{minHeight:'100vh', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F, color:UI.sub}}>Verificare...</div>

  if (!authed) return (
    <div style={{minHeight:'100vh', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F, padding:'20px'}}>
      <div style={{background:UI.card, borderRadius:UI.radius, padding:'32px', width:'360px', boxShadow:UI.shadow}}>
        <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px'}}>
          <Shield size={22} strokeWidth={2.2} color={UI.purple} />
          <div style={{fontSize:'20px', fontWeight:800, color:UI.ink}}>Panou Admin</div>
        </div>
        <div style={{fontSize:'13px', color:UI.sub, marginBottom:'20px'}}>Acces doar pentru administrator</div>
        <input type="text" placeholder="Utilizator" value={loginUser} autoComplete="username" onChange={e => setLoginUser(e.target.value)} style={{...inp, marginBottom:'10px'}} />
        <input type="password" placeholder="Parolă" value={loginPass} autoComplete="current-password" onChange={e => setLoginPass(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') faLogin() }} style={{...inp, marginBottom:'14px'}} />
        {loginErr && <div style={{fontSize:'13px', color:'#dc2626', marginBottom:'12px'}}>{loginErr}</div>}
        <button onClick={faLogin} disabled={loggingIn} style={{width:'100%', padding:'12px', background:UI.dark, color:'white', border:'none', borderRadius:UI.radiusSm, fontSize:'14px', fontWeight:700, cursor: loggingIn ? 'wait' : 'pointer', fontFamily:F, opacity: loggingIn ? 0.6 : 1}}>{loggingIn ? 'Se conectează...' : 'Intră'}</button>
        <a href="/oferta" style={{display:'block', textAlign:'center', marginTop:'16px', fontSize:'13px', color:UI.sub, textDecoration:'none'}}>← Înapoi la ofertă</a>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh', background:bg, fontFamily:F, padding:'40px 20px'}}>
      {toast && <div style={{position:'fixed', bottom:'28px', left:'50%', transform:'translateX(-50%)', zIndex:1000, background:UI.dark, color:'white', padding:'14px 24px', borderRadius:'12px', fontSize:'14px', fontWeight:700, boxShadow:'0 8px 30px rgba(0,0,0,0.25)'}}>{toast}</div>}
      <div style={{maxWidth:'720px', margin:'0 auto'}}>
        <a href="/oferta" style={{display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'13px', color:UI.sub, textDecoration:'none', marginBottom:'20px'}}><ArrowLeft size={15} /> Înapoi la ofertă</a>
        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'24px'}}>
          <Shield size={26} strokeWidth={2.2} color={UI.purple} />
          <div>
            <div style={{fontSize:'24px', fontWeight:800, color:UI.ink}}>Panou Admin</div>
            <div style={{fontSize:'13px', color:UI.faint}}>Gestionează conturile utilizatorilor</div>
          </div>
        </div>

        {users.map(u => (
          <div key={u.id} style={{background:UI.card, borderRadius:UI.radius, border:'1px solid '+UI.line, padding:'18px 20px', marginBottom:'12px', boxShadow:UI.shadow}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'12px'}}>
              <div>
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                  <span style={{fontSize:'16px', fontWeight:800, color:UI.ink}}>{u.username}</span>
                  {u.role === 'oferta_admin' && <span style={{fontSize:'11px', fontWeight:700, color:UI.purple, background:'#faf5ff', padding:'2px 8px', borderRadius:'6px'}}>ADMIN</span>}
                  {u.blocat && <span style={{fontSize:'11px', fontWeight:700, color:'#dc2626', background:'#fef2f2', padding:'2px 8px', borderRadius:'6px'}}>BLOCAT</span>}
                </div>
                <div style={{fontSize:'12px', color:UI.faint, marginTop:'4px'}}>{u.email}</div>
                <div style={{fontSize:'12px', color:UI.faint, marginTop:'2px'}}>Ultima logare: {u.ultimaLogare ? new Date(u.ultimaLogare).toLocaleString('ro-RO') : 'niciodată'}</div>
              </div>
              {u.role !== 'oferta_admin' && (
                <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                  {u.blocat
                    ? <button onClick={() => actiune(u.id, 'unblock')} style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', fontWeight:700, color:UI.green, background:'white', border:'1.5px solid '+UI.green, borderRadius:'9px', padding:'8px 12px', cursor:'pointer', fontFamily:F}}><Unlock size={14} /> Deblochează</button>
                    : <button onClick={() => actiune(u.id, 'block')} style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', fontWeight:700, color:'#dc2626', background:'white', border:'1.5px solid #dc2626', borderRadius:'9px', padding:'8px 12px', cursor:'pointer', fontFamily:F}}><Lock size={14} /> Blochează</button>}
                  <button onClick={() => { setResetFor(resetFor === u.id ? null : u.id); setParolaNoua('') }} style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', fontWeight:700, color:UI.ink, background:'white', border:'1.5px solid '+UI.line, borderRadius:'9px', padding:'8px 12px', cursor:'pointer', fontFamily:F}}><KeyRound size={14} /> Resetează parola</button>
                </div>
              )}
            </div>
            {resetFor === u.id && (
              <div style={{display:'flex', gap:'8px', marginTop:'14px', paddingTop:'14px', borderTop:'1px solid '+UI.line}}>
                <input type="text" placeholder="Parolă nouă (min 6 caractere)" value={parolaNoua} onChange={e => setParolaNoua(e.target.value)} style={{...inp, flex:1}} />
                <button onClick={() => { if (parolaNoua.length >= 6) { actiune(u.id, 'reset-password', { parolaNoua }); setResetFor(null); setParolaNoua('') } else arataToast('Minim 6 caractere') }} style={{padding:'11px 18px', background:UI.green, color:'white', border:'none', borderRadius:UI.radiusSm, fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F, whiteSpace:'nowrap'}}>Setează</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
