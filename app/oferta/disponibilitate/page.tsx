'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CalendarSearch, ArrowLeft, Check, X } from 'lucide-react'
const F = 'Montserrat,sans-serif'
const UI = {
  bg: '#f5f5f7', card: '#ffffff', ink: '#1c1917', sub: '#57534e', faint: '#a8a29e',
  line: '#e7e5e4', green: '#059669', greenSoft: '#f0fdf4', purple: '#7c3aed', dark: '#1c1917',
  radius: '16px', radiusSm: '12px',
  shadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)',
}
interface Ev { titlu: string; descriere: string; allDay: boolean }
interface Rez { artist: string; calendar: string; liber: boolean | null; evenimente: Ev[] }

export default function DisponibilitatePage() {
  const [authed, setAuthed] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [loginUser, setLoginUser] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [data, setData] = useState('')
  const [loading, setLoading] = useState(false)
  const [rez, setRez] = useState<{ liberi: Rez[]; ocupati: Rez[]; nrLiberi: number; nrOcupati: number } | null>(null)

  async function faLogin() {
    setLoggingIn(true); setLoginErr('')
    const mapRes = await fetch('/api/oferta-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: loginUser.trim() }) })
    const mapData = await mapRes.json()
    if (!mapData.email) { setLoginErr('Utilizator inexistent'); setLoggingIn(false); return }
    if (mapData.blocat) { setLoginErr('Cont blocat'); setLoggingIn(false); return }
    const { data: d, error } = await supabase.auth.signInWithPassword({ email: mapData.email, password: loginPass })
    if (error) { setLoginErr('Utilizator sau parola gresita'); setLoggingIn(false); return }
    const role = d.user?.user_metadata?.role
    if (role === 'oferta_admin' || role === 'oferta_user') setAuthed(true)
    else { setLoginErr('Nu ai acces'); await supabase.auth.signOut() }
    setLoggingIn(false)
  }
  useEffect(() => {
    supabase.auth.getSession().then(({ data: d }) => {
      const user = d.session?.user
      const role = user?.user_metadata?.role
      if (user && (role === 'oferta_admin' || role === 'oferta_user') && !user?.user_metadata?.blocat) setAuthed(true)
      setCheckingAuth(false)
    })
  }, [])

  async function cauta() {
    if (!data) return
    setLoading(true); setRez(null)
    try {
      const r = await fetch('/api/calendar-disponibilitate?data=' + data)
      const d = await r.json()
      if (d.ok) setRez(d)
    } catch {}
    setLoading(false)
  }

  const inp: React.CSSProperties = { padding: '11px 14px', borderRadius: UI.radiusSm, border: '1px solid ' + UI.line, fontSize: '14px', fontFamily: F, boxSizing: 'border-box', outline: 'none' }
  const bg = 'linear-gradient(160deg, #eceef2 0%, #e8eaf0 45%, #dde1ea 100%)'

  if (checkingAuth) return <div style={{minHeight:'100vh', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F, color:UI.sub}}>Verificare...</div>

  if (!authed) return (
    <div style={{minHeight:'100vh', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F, padding:'20px'}}>
      <div style={{background:UI.card, borderRadius:UI.radius, padding:'32px', width:'360px', boxShadow:UI.shadow}}>
        <div style={{fontSize:'20px', fontWeight:800, color:UI.ink, marginBottom:'20px'}}>Disponibilitate artiști</div>
        <input type="text" placeholder="Utilizator" value={loginUser} onChange={e => setLoginUser(e.target.value)} style={{...inp, width:'100%', marginBottom:'10px'}} />
        <input type="password" placeholder="Parolă" value={loginPass} onChange={e => setLoginPass(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') faLogin() }} style={{...inp, width:'100%', marginBottom:'14px'}} />
        {loginErr && <div style={{fontSize:'13px', color:'#dc2626', marginBottom:'12px'}}>{loginErr}</div>}
        <button onClick={faLogin} disabled={loggingIn} style={{width:'100%', padding:'12px', background:UI.dark, color:'white', border:'none', borderRadius:UI.radiusSm, fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:F}}>{loggingIn ? 'Se conectează...' : 'Intră'}</button>
        <a href="/oferta" style={{display:'block', textAlign:'center', marginTop:'16px', fontSize:'13px', color:UI.sub, textDecoration:'none'}}>← Înapoi</a>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh', background:bg, fontFamily:F, padding:'40px 20px'}}>
      <div style={{maxWidth:'900px', margin:'0 auto'}}>
        <a href="/oferta" style={{display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'13px', color:UI.sub, textDecoration:'none', marginBottom:'20px'}}><ArrowLeft size={15} /> Înapoi la ofertă</a>
        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'24px'}}>
          <CalendarSearch size={26} strokeWidth={2.2} color={UI.purple} />
          <div>
            <div style={{fontSize:'24px', fontWeight:800, color:UI.ink}}>Disponibilitate artiști</div>
            <div style={{fontSize:'13px', color:UI.faint}}>Verifică cine e liber într-o zi</div>
          </div>
        </div>

        <div style={{background:UI.card, borderRadius:UI.radius, border:'1px solid '+UI.line, padding:'20px', marginBottom:'20px', boxShadow:UI.shadow, display:'flex', gap:'12px', alignItems:'flex-end', flexWrap:'wrap'}}>
          <div>
            <label style={{fontSize:'11px', fontWeight:700, color:UI.sub, textTransform:'uppercase', display:'block', marginBottom:'6px'}}>Data evenimentului</label>
            <input type="date" value={data} onChange={e => setData(e.target.value)} style={inp} />
          </div>
          <button onClick={cauta} disabled={!data || loading} style={{padding:'11px 24px', background:UI.green, color:'white', border:'none', borderRadius:UI.radiusSm, fontSize:'14px', fontWeight:700, cursor: (!data||loading) ? 'wait' : 'pointer', fontFamily:F, opacity:(!data||loading)?0.6:1}}>{loading ? 'Se verifică...' : 'Verifică disponibilitatea'}</button>
        </div>

        {loading && <div style={{textAlign:'center', color:UI.sub, padding:'40px'}}>Se verifică calendarele artiștilor...</div>}

        {rez && (
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
            <div>
              <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px'}}>
                <Check size={18} color={UI.green} /><span style={{fontSize:'15px', fontWeight:800, color:UI.ink}}>Liberi ({rez.nrLiberi})</span>
              </div>
              {rez.liberi.map(r => (
                <div key={r.artist} style={{background:UI.card, borderRadius:'10px', border:'1px solid '+UI.greenSoft, borderLeft:'3px solid '+UI.green, padding:'10px 14px', marginBottom:'8px', fontSize:'14px', fontWeight:600, color:UI.ink}}>{r.artist}</div>
              ))}
            </div>
            <div>
              <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px'}}>
                <X size={18} color="#dc2626" /><span style={{fontSize:'15px', fontWeight:800, color:UI.ink}}>Ocupați ({rez.nrOcupati})</span>
              </div>
              {rez.ocupati.map(r => (
                <div key={r.artist} style={{background:UI.card, borderRadius:'10px', border:'1px solid '+UI.line, borderLeft:'3px solid #dc2626', padding:'10px 14px', marginBottom:'8px'}}>
                  <div style={{fontSize:'14px', fontWeight:700, color:UI.ink}}>{r.artist}</div>
                  {r.evenimente.map((e, i) => (
                    <div key={i} style={{fontSize:'12px', color:UI.sub, marginTop:'3px'}}>{e.titlu}{e.descriere ? ' · ' + e.descriere.slice(0,80) : ''}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
