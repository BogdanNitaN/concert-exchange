'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
const F = 'Montserrat,sans-serif'
const UI = { bg:'#f5f5f7', ink:'#1c1917', sub:'#57534e', faint:'#a8a29e', line:'#e7e5e4', green:'#059669', purple:'#7c3aed', amber:'#d97706', red:'#dc2626' }
const inputStyle: React.CSSProperties = { padding:'9px 11px', borderRadius:'8px', border:'1.5px solid #e7e5e4', fontSize:'13px', fontFamily:F, boxSizing:'border-box', color:'#1c1917' }

export default function CoduriPage() {
  const [authed, setAuthed] = useState(false)
  const [loginUser, setLoginUser] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [coduri, setCoduri] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [nouDest, setNouDest] = useState('Parteneri Forward')
  const [nouZile, setNouZile] = useState(30)
  const [nouToken, setNouToken] = useState('')
  const [nouAscunde, setNouAscunde] = useState(false)
  const [nouScop, setNouScop] = useState('roster')

  async function faLogin() {
    setLoggingIn(true); setLoginErr('')
    const mapRes = await fetch('/api/oferta-login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username: loginUser.trim() }) })
    const mapData = await mapRes.json()
    if (!mapData.email) { setLoginErr('Utilizator inexistent'); setLoggingIn(false); return }
    const { data, error } = await supabase.auth.signInWithPassword({ email: mapData.email, password: loginPass })
    if (error) { setLoginErr('Utilizator sau parola gresita'); setLoggingIn(false); return }
    const role = data.user?.user_metadata?.role
    if (role === 'oferta_admin' || role === 'oferta_user') setAuthed(true)
    else { setLoginErr('Nu ai acces'); await supabase.auth.signOut() }
    setLoggingIn(false)
  }
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const role = data.session?.user?.user_metadata?.role
      if (data.session && (role === 'oferta_admin' || role === 'oferta_user')) setAuthed(true)
    })
  }, [])
  useEffect(() => { if (authed) load() }, [authed])

  async function tok() {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token || ''
  }
  async function load() {
    setLoading(true)
    try {
      const r = await fetch('/api/roster-coduri', { headers: { authorization: 'Bearer ' + await tok() }, cache:'no-store' })
      const d = await r.json()
      setCoduri(d.coduri || [])
    } catch {}
    setLoading(false)
  }
  async function genereaza() {
    const r = await fetch('/api/roster-coduri', { method:'POST', headers: { 'Content-Type':'application/json', authorization: 'Bearer ' + await tok() }, body: JSON.stringify({ destinatar: nouDest, zile: nouZile, token: nouToken, ascunde_contacte: nouAscunde, scop: nouScop }) })
    const d = await r.json()
    if (d.ok) { setMsg('Cod nou: ' + d.token); setNouToken(''); load() } else setMsg('Eroare: ' + (d.error || ''))
    setTimeout(() => setMsg(''), 6000)
  }
  async function patch(token: string, body: any) {
    await fetch('/api/roster-coduri', { method:'PATCH', headers: { 'Content-Type':'application/json', authorization: 'Bearer ' + await tok() }, body: JSON.stringify({ token, ...body }) })
    load()
  }
  function zileRamase(x: string) { return Math.ceil((new Date(x).getTime() - Date.now()) / 86400000) }
  function stare(c: any) {
    if (!c.activ) return { txt:'oprit', col: UI.faint }
    const z = zileRamase(c.expira_la)
    if (z < 0) return { txt:'expirat', col: UI.red }
    if (z <= 2) return { txt: 'expira in ' + z + (z === 1 ? ' zi' : ' zile'), col: UI.amber }
    return { txt: z + ' zile', col: UI.green }
  }

  if (!authed) return (
    <div style={{minHeight:'100vh', background:UI.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F, padding:'20px'}}>
      <div style={{background:'white', padding:'40px', borderRadius:'16px', border:'2px solid '+UI.line, width:'340px'}}>
        <div style={{fontSize:'22px', fontWeight:800, marginBottom:'6px'}}>GIG<span style={{color:UI.purple}}>x</span> Coduri</div>
        <div style={{fontSize:'13px', color:UI.sub, marginBottom:'20px'}}>Autentificare</div>
        <input type="text" placeholder="Utilizator" value={loginUser} autoComplete="username" onChange={e => setLoginUser(e.target.value)} style={{...inputStyle, width:'100%', padding:'10px 12px', fontSize:'14px', marginBottom:'10px'}} />
        <input type="password" placeholder="Parola" value={loginPass} autoComplete="current-password" onChange={e => setLoginPass(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') faLogin() }} style={{...inputStyle, width:'100%', padding:'10px 12px', fontSize:'14px'}} />
        {loginErr && <div style={{fontSize:'12px', color:UI.red, marginTop:'8px'}}>{loginErr}</div>}
        <button onClick={faLogin} disabled={loggingIn} style={{width:'100%', marginTop:'14px', padding:'11px', background:UI.ink, color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:700, cursor: loggingIn ? 'wait':'pointer', fontFamily:F}}>{loggingIn ? 'Se conecteaza...' : 'Intra in cont'}</button>
      </div>
    </div>
  )

  const expira = coduri.filter(c => c.activ && zileRamase(c.expira_la) >= 0 && zileRamase(c.expira_la) <= 2)

  return (
    <div style={{minHeight:'100vh', background:UI.bg, fontFamily:F, padding:'24px 16px 60px'}}>
      <div style={{maxWidth:'980px', margin:'0 auto'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px', flexWrap:'wrap', gap:'10px'}}>
          <div>
            <div style={{fontSize:'24px', fontWeight:800, color:UI.ink}}>Coduri de acces</div>
            <div style={{fontSize:'13px', color:UI.sub}}>Linkuri de share si coduri pentru /rosterfwd</div>
          </div>
          <Link href="/oferta" style={{fontSize:'13px', fontWeight:700, color:UI.purple, textDecoration:'none'}}>← Inapoi</Link>
        </div>

        {expira.length > 0 && (
          <div style={{background:'#fffbeb', border:'1.5px solid #fcd34d', borderRadius:'12px', padding:'14px 16px', marginBottom:'16px'}}>
            <div style={{fontSize:'13px', fontWeight:800, color:'#92400e'}}>Atentie: {expira.length === 1 ? 'un cod expira' : expira.length + ' coduri expira'} in curand</div>
            <div style={{fontSize:'12px', color:'#a16207', marginTop:'4px'}}>{expira.map(c => c.token + ' (' + stare(c).txt + ')').join(' · ')} — genereaza unul nou si trimite-l partenerilor.</div>
          </div>
        )}

        <div style={{background:'white', border:'1px solid '+UI.line, borderRadius:'14px', padding:'16px', marginBottom:'18px'}}>
          <div style={{fontSize:'13px', fontWeight:800, color:UI.ink, marginBottom:'10px'}}>Cod nou pentru roster</div>
          <div style={{display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center'}}>
            <input value={nouDest} onChange={e => setNouDest(e.target.value)} placeholder="Destinatar" style={{...inputStyle, flex:'1 1 200px'}} />
            <select value={nouScop} onChange={e => setNouScop(e.target.value)} style={{...inputStyle, width:'150px'}}>
              <option value="roster">Roster standard</option>
              <option value="revelion">Revelion</option>
            </select>
            <input value={nouToken} onChange={e => setNouToken(e.target.value)} placeholder="Cod (gol = generat)" style={{...inputStyle, width:'170px'}} />
            <input type="number" value={nouZile} onChange={e => setNouZile(Number(e.target.value))} style={{...inputStyle, width:'90px'}} />
            <label style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'12px', fontWeight:700, color:UI.sub, cursor:'pointer'}}><input type="checkbox" checked={nouAscunde} onChange={e => setNouAscunde(e.target.checked)} style={{width:'15px', height:'15px', accentColor:UI.green}} />fara contacte</label>
            <button onClick={genereaza} style={{padding:'10px 18px', background:UI.green, color:'white', border:'none', borderRadius:'9px', fontSize:'13px', fontWeight:800, cursor:'pointer', fontFamily:F}}>Genereaza</button>
          </div>
          {msg && <div style={{fontSize:'12px', fontWeight:700, color:UI.green, marginTop:'10px'}}>{msg}</div>}
        </div>

        <div style={{background:'white', border:'1px solid '+UI.line, borderRadius:'14px', overflow:'hidden'}}>
          {loading && <div style={{padding:'20px', fontSize:'13px', color:UI.sub}}>Se incarca...</div>}
          {!loading && coduri.map((c, i) => {
            const st = stare(c)
            return (
              <div key={c.token} style={{padding:'12px 14px', borderTop: i ? '1px solid #f0f0ef' : 'none', display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap'}}>
                <div style={{flex:'1 1 220px', minWidth:0}}>
                  <div style={{fontSize:'13px', fontWeight:800, color:UI.ink}}>{c.destinatar || '—'}</div>
                  <div style={{fontSize:'11px', color:UI.sub, marginTop:'2px'}}>{c.scop === 'roster' ? 'Roster complet' : c.scop} · {c.tip_audienta} · {c.creat_de || '—'}</div>
                </div>
                <code style={{fontSize:'12px', fontWeight:700, background:UI.bg, padding:'4px 8px', borderRadius:'6px'}}>{c.token}</code>
                <span style={{fontSize:'11px', fontWeight:800, color:st.col, minWidth:'86px'}}>{st.txt}</span>
                <span style={{fontSize:'11px', color:UI.sub, minWidth:'70px'}}>{c.vizualizari} vizualizari</span>
                <button onClick={() => { navigator.clipboard.writeText('https://gigx.ro/r/' + c.token); setMsg('Link copiat'); setTimeout(() => setMsg(''), 2000) }} style={{padding:'6px 10px', background:'white', color:UI.ink, border:'1.5px solid '+UI.line, borderRadius:'8px', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:F}}>Copiaza</button>
                <button onClick={() => patch(c.token, { prelungesteZile: 30 })} style={{padding:'6px 10px', background:'white', color:UI.ink, border:'1.5px solid '+UI.line, borderRadius:'8px', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:F}}>+30z</button>
                <button onClick={() => patch(c.token, { activ: !c.activ })} style={{padding:'6px 10px', background: c.activ ? 'white' : UI.green, color: c.activ ? UI.red : 'white', border:'1.5px solid '+(c.activ ? UI.line : UI.green), borderRadius:'8px', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:F}}>{c.activ ? 'Opreste' : 'Repune'}</button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
