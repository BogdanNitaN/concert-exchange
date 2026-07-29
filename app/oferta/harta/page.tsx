'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
const F = 'Montserrat,sans-serif'
const UI = { bg:'#f5f5f7', ink:'#1c1917', sub:'#57534e', faint:'#a8a29e', line:'#e7e5e4', green:'#059669', purple:'#7c3aed', amber:'#d97706' }
const inputStyle: React.CSSProperties = { padding:'9px 11px', borderRadius:'8px', border:'1.5px solid #e7e5e4', fontSize:'13px', fontFamily:F, boxSizing:'border-box', color:'#1c1917' }

const GRUPE = [
  { titlu: 'Public — fluxul actual', culoare: UI.green, pagini: [
    { p:'/home', d:'Prima pagină (încă în spatele redirectului)' },
    { p:'/prom', d:'Baluri / Prom — calculator de buget' },
    { p:'/roster', d:'Catalog public, fără prețuri' },
    { p:'/rosterfwd', d:'Poartă cu cod pentru parteneri' },
    { p:'/r/fwd2626', d:'Listă b2b (exemplu de link cu token)' },
    { p:'/transport', d:'Calculator de transport' },
  ]},
  { titlu: 'Legal', culoare: UI.faint, pagini: [
    { p:'/termeni', d:'Termeni' },
    { p:'/confidentialitate', d:'Confidențialitate' },
    { p:'/cookies', d:'Cookies' },
  ]},
  { titlu: 'Intern — cu login', culoare: UI.purple, pagini: [
    { p:'/oferta', d:'Generator de deviz' },
    { p:'/oferta/asistent', d:'Asistent' },
    { p:'/oferta/disponibilitate', d:'Calendar disponibilitate' },
    { p:'/oferta/istoric', d:'Istoric oferte' },
    { p:'/oferta/roster', d:'Roster editabil' },
    { p:'/oferta/coduri', d:'Coduri de acces' },
    { p:'/oferta/admin', d:'Administrare utilizatori' },
  ]},
  { titlu: 'Vechi / neintegrate în flux', culoare: UI.amber, pagini: [
    { p:'/', d:'Redirect către /prom' },
    { p:'/trending', d:'Artiști în trend' },
    { p:'/search', d:'Căutare' },
    { p:'/calculator', d:'Calculator vechi' },
    { p:'/pricing', d:'Prețuri platformă' },
    { p:'/demo', d:'Demo' },
    { p:'/login', d:'Conectare' },
    { p:'/signup', d:'Înregistrare' },
    { p:'/dashboard/client', d:'Zona client' },
    { p:'/dashboard/artist', d:'Zona artist' },
    { p:'/dashboard/artist/venues', d:'Locații artist' },
    { p:'/dashboard/promoter', d:'Zona promoter' },
    { p:'/dashboard/admin', d:'Zona admin' },
    { p:'/venues/add', d:'Adaugă locație' },
  ]},
  { titlu: 'Dinamice — au nevoie de un identificator', culoare: UI.faint, pagini: [
    { p:'/artist/[slug]', d:'Pagină de artist (produsul vechi)', fara: true },
    { p:'/book/[slug]', d:'Formular de booking per artist', fara: true },
    { p:'/r/[token]', d:'Pagină de share (vezi exemplul de mai sus)', fara: true },
  ]},
]

export default function HartaPage() {
  const [authed, setAuthed] = useState(false)
  const [loginUser, setLoginUser] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

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

  if (!authed) return (
    <div style={{minHeight:'100vh', background:UI.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F, padding:'20px'}}>
      <div style={{background:'white', padding:'40px', borderRadius:'16px', border:'2px solid '+UI.line, width:'340px'}}>
        <div style={{fontSize:'22px', fontWeight:800, marginBottom:'6px'}}>GIG<span style={{color:UI.purple}}>x</span> Hartă</div>
        <div style={{fontSize:'13px', color:UI.sub, marginBottom:'20px'}}>Autentificare</div>
        <input type="text" placeholder="Utilizator" value={loginUser} autoComplete="username" onChange={e => setLoginUser(e.target.value)} style={{...inputStyle, width:'100%', padding:'10px 12px', fontSize:'14px', marginBottom:'10px'}} />
        <input type="password" placeholder="Parola" value={loginPass} autoComplete="current-password" onChange={e => setLoginPass(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') faLogin() }} style={{...inputStyle, width:'100%', padding:'10px 12px', fontSize:'14px'}} />
        {loginErr && <div style={{fontSize:'12px', color:'#dc2626', marginTop:'8px'}}>{loginErr}</div>}
        <button onClick={faLogin} disabled={loggingIn} style={{width:'100%', marginTop:'14px', padding:'11px', background:UI.ink, color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:700, cursor: loggingIn ? 'wait':'pointer', fontFamily:F}}>{loggingIn ? 'Se conecteaza...' : 'Intra in cont'}</button>
      </div>
    </div>
  )

  const total = GRUPE.reduce((s, g) => s + g.pagini.length, 0)

  return (
    <div style={{minHeight:'100vh', background:UI.bg, fontFamily:F, padding:'24px 16px 60px'}}>
      <div style={{maxWidth:'840px', margin:'0 auto'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', flexWrap:'wrap', gap:'10px'}}>
          <div>
            <div style={{fontSize:'24px', fontWeight:800, color:UI.ink}}>Harta site-ului</div>
            <div style={{fontSize:'13px', color:UI.sub}}>{total} pagini · fiecare se deschide în tab nou</div>
          </div>
          <Link href="/oferta" style={{fontSize:'13px', fontWeight:700, color:UI.purple, textDecoration:'none'}}>← Inapoi</Link>
        </div>

        {GRUPE.map(g => (
          <div key={g.titlu} style={{marginBottom:'20px'}}>
            <div style={{fontSize:'11px', fontWeight:800, color:g.culoare, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px'}}>{g.titlu}</div>
            <div style={{background:'white', border:'1px solid '+UI.line, borderRadius:'14px', overflow:'hidden'}}>
              {g.pagini.map((x: any, i: number) => (
                <div key={x.p} style={{padding:'11px 14px', borderTop: i ? '1px solid #f5f5f4' : 'none', display:'flex', alignItems:'center', gap:'12px', justifyContent:'space-between'}}>
                  <div style={{minWidth:0}}>
                    <code style={{fontSize:'12.5px', fontWeight:800, color:UI.ink}}>{x.p}</code>
                    <div style={{fontSize:'11.5px', color:UI.sub, marginTop:'2px'}}>{x.d}</div>
                  </div>
                  {!x.fara && (
                    <a href={x.p} target="_blank" rel="noreferrer" style={{flexShrink:0, padding:'6px 12px', background:'white', color:UI.ink, border:'1.5px solid '+UI.line, borderRadius:'8px', fontSize:'11px', fontWeight:700, textDecoration:'none'}}>Deschide</a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
