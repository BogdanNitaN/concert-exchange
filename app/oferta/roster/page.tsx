'use client'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

const F = 'Montserrat, sans-serif'

interface Artist {
  id: number; nume: string; fee_standard: number; lei_km: number; transport_moneda?: string
  cazare: string; nr_persoane: number; bilete_avion: number; alcool_default: number
  categorie: string; tip: string; set_type?: string; durata_default?: string
  diurna_fixa?: number | null; observatii?: string
}

export default function RosterPage() {
  const [authed, setAuthed] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [loginUser, setLoginUser] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [artists, setArtists] = useState<Artist[]>([])
  const [search, setSearch] = useState('')
  const [edit, setEdit] = useState<Artist | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function faLogin() {
    setLoggingIn(true); setLoginErr('')
    const mapRes = await fetch('/api/oferta-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: loginUser.trim() }) })
    const mapData = await mapRes.json()
    if (!mapData.email) { setLoginErr('Utilizator inexistent'); setLoggingIn(false); return }
    if (mapData.blocat) { setLoginErr('Cont blocat'); setLoggingIn(false); return }
    const { data, error } = await supabase.auth.signInWithPassword({ email: mapData.email, password: loginPass })
    if (error) { setLoginErr('Utilizator sau parola gresita'); setLoggingIn(false); return }
    const role = data.user?.user_metadata?.role
    if (role === 'oferta_admin' || role === 'oferta_user') setAuthed(true)
    else { setLoginErr('Nu ai acces'); await supabase.auth.signOut() }
    setLoggingIn(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      const role = user?.user_metadata?.role
      if (user && (role === 'oferta_admin' || role === 'oferta_user') && !user?.user_metadata?.blocat) setAuthed(true)
      setCheckingAuth(false)
    })
  }, [])

  useEffect(() => {
    if (!authed) return
    fetch('/api/oferta-artist').then(r => r.json()).then(d => setArtists(d.artists || []))
  }, [authed])

  const filtrati = useMemo(() => {
    const s = search.toLowerCase()
    return artists.filter(a => a.nume.toLowerCase().includes(s))
  }, [artists, search])

  const fwd = filtrati.filter(a => a.tip !== 'intermediere')
  const externi = filtrati.filter(a => a.tip === 'intermediere')

  async function stergeArtist() {
    if (!edit) return
    if (!confirm('Sigur ștergi artistul ' + edit.nume + '? Nu se poate reveni.')) return
    setSaving(true); setMsg('')
    const r = await fetch('/api/oferta-update-artist?nume=' + encodeURIComponent(edit.nume), { method: 'DELETE' })
    const d = await r.json()
    if (d.ok) {
      setArtists(prev => prev.filter(a => a.nume !== edit.nume))
      setEdit(null)
    } else setMsg('Eroare la ștergere')
    setSaving(false)
  }

  async function salveaza() {
    if (!edit) return
    setSaving(true); setMsg('')
    const r = await fetch('/api/oferta-update-artist', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...edit, nume_original: edit.nume })
    })
    const d = await r.json()
    if (d.ok) {
      const ar = await fetch('/api/oferta-artist').then(x => x.json())
      setArtists(ar.artists || [])
      setMsg('Salvat!')
      setTimeout(() => { setEdit(null); setMsg('') }, 800)
    } else setMsg('Eroare: ' + (d.error || '?'))
    setSaving(false)
  }

  const inp: React.CSSProperties = { width: '100%', padding: '9px 11px', borderRadius: '8px', border: '1.5px solid #e7e5e4', fontSize: '13px', fontFamily: F, boxSizing: 'border-box', color: '#1c1917' }
  const lbl: React.CSSProperties = { fontSize: '10px', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }

  if (checkingAuth) return <div style={{minHeight:'100vh', background:'#f5f5f7', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F, color:'#78716c'}}>Verificare...</div>

  if (!authed) return (
    <div style={{minHeight:'100vh', background:'#f5f5f7', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F, padding:'20px'}}>
      <div style={{background:'white', padding:'40px', borderRadius:'16px', border:'2px solid #e7e5e4', width:'340px'}}>
        <div style={{fontSize:'22px', fontWeight:800, marginBottom:'6px'}}>GIG<span style={{color:'#059669'}}>x</span> Roster</div>
        <div style={{fontSize:'13px', color:'#78716c', marginBottom:'20px'}}>Autentificare</div>
        <input type="text" placeholder="Utilizator" value={loginUser} onChange={e => setLoginUser(e.target.value)} style={{...inp, marginBottom:'10px'}} />
        <input type="password" placeholder="Parola" value={loginPass} onChange={e => setLoginPass(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') faLogin() }} style={inp} />
        {loginErr && <div style={{fontSize:'12px', color:'#dc2626', marginTop:'8px'}}>{loginErr}</div>}
        <button onClick={faLogin} disabled={loggingIn} style={{width:'100%', marginTop:'14px', padding:'11px', background:'#1c1917', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:F}}>{loggingIn ? 'Se conecteaza...' : 'Intra in cont'}</button>
      </div>
    </div>
  )

  const Row = (a: Artist) => (
    <div key={a.id} onClick={() => setEdit({ ...a })}
      style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'white', borderRadius:'10px', border:'1px solid #e7e5e4', cursor:'pointer', marginBottom:'8px'}}>
      <div>
        <div style={{fontSize:'14px', fontWeight:700}}>{a.nume}</div>
        <div style={{fontSize:'12px', color:'#78716c', marginTop:'2px'}}>{a.categorie} · {a.set_type || 'band'} · {a.fee_standard}€{a.diurna_fixa ? ' · diurna ' + a.diurna_fixa : ''}</div>
      </div>
      <span style={{fontSize:'11px', color:'#a8a29e'}}>editează →</span>
    </div>
  )

  return (
    <div style={{minHeight:'100vh', background:'#f5f5f7', fontFamily:F, padding:'32px 20px'}}>
      <div style={{maxWidth:'760px', margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
          <div>
            <div style={{fontSize:'24px', fontWeight:800}}>Roster artiști</div>
            <div style={{fontSize:'13px', color:'#78716c'}}>{artists.length} artiști în baza de date</div>
          </div>
          <a href="/oferta" style={{fontSize:'14px', color:'#059669', fontWeight:700, textDecoration:'none'}}>← Deviz</a>
        </div>

        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Caută artist..." style={{...inp, marginBottom:'20px', padding:'12px 14px', fontSize:'14px'}} />

        <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px'}}>
          <span style={{fontSize:'11px', fontWeight:800, padding:'3px 10px', borderRadius:'6px', background:'#f0fdf4', color:'#059669'}}>FWD</span>
          <span style={{fontSize:'13px', color:'#78716c'}}>{fwd.length} artiști</span>
        </div>
        {fwd.map(Row)}

        <div style={{display:'flex', alignItems:'center', gap:'8px', margin:'24px 0 12px'}}>
          <span style={{fontSize:'11px', fontWeight:800, padding:'3px 10px', borderRadius:'6px', background:'#faf5ff', color:'#7c3aed'}}>EXTERN</span>
          <span style={{fontSize:'13px', color:'#78716c'}}>{externi.length} artiști</span>
        </div>
        {externi.map(Row)}
      </div>

      {edit && (
        <div onClick={() => setEdit(null)} style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px'}}>
          <div onClick={e => e.stopPropagation()} style={{background:'white', borderRadius:'16px', padding:'24px', width:'520px', maxHeight:'90vh', overflowY:'auto'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px'}}>
              <div style={{fontSize:'18px', fontWeight:800}}>Editează artist</div>
              <button onClick={() => setEdit(null)} style={{background:'none', border:'none', fontSize:'22px', cursor:'pointer', color:'#78716c'}}>×</button>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              <div><label style={lbl}>Nume</label><input value={edit.nume} onChange={e => setEdit({...edit, nume: e.target.value})} style={inp} /></div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                <div><label style={lbl}>Fee (€)</label><input type="number" value={edit.fee_standard} onFocus={e => e.target.select()} onChange={e => setEdit({...edit, fee_standard: Number(e.target.value)})} style={inp} /></div>
                <div><label style={lbl}>Transport /km</label>
                  <div style={{display:'flex', gap:'6px'}}>
                    <input type="number" step="0.1" value={edit.lei_km} onFocus={e => e.target.select()} onChange={e => setEdit({...edit, lei_km: Number(e.target.value)})} style={{...inp, flex:1, minWidth:0}} />
                    <select value={edit.transport_moneda || 'lei'} onChange={e => setEdit({...edit, transport_moneda: e.target.value})} style={{...inp, width:'auto'}}><option value="lei">lei</option><option value="euro">€</option></select>
                  </div>
                </div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                <div><label style={lbl}>Categorie</label>
                  <select value={edit.categorie} onChange={e => setEdit({...edit, categorie: e.target.value})} style={inp}>
                    <option value="pop">Pop</option><option value="urban">Urban</option><option value="trap">Trap</option><option value="dance">Dance</option><option value="manele">Manele</option><option value="balcanic">Balcanic</option><option value="lautareasca">Lăutărească</option><option value="dj">DJ</option><option value="cover">Cover band</option><option value="alternativ">Alternativ</option>
                  </select>
                </div>
                <div><label style={lbl}>Tip</label>
                  <select value={edit.tip} onChange={e => setEdit({...edit, tip: e.target.value})} style={inp}><option value="propriu">FWD</option><option value="intermediere">EXTERN</option></select>
                </div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                <div><label style={lbl}>Tip set (durată)</label>
                  <select value={edit.set_type || 'band'} onChange={e => setEdit({...edit, set_type: e.target.value})} style={inp}>
                    <option value="band">Band</option><option value="dj">DJ</option><option value="vocal">Vocal</option><option value="cover">Cover</option><option value="show">Show</option><option value="instrument">Instrument</option><option value="mc">MC</option>
                  </select>
                </div>
                <div><label style={lbl}>Diurnă fixă (lei)</label><input type="number" value={edit.diurna_fixa || ''} onFocus={e => e.target.select()} onChange={e => setEdit({...edit, diurna_fixa: e.target.value ? Number(e.target.value) : null})} placeholder="opțional" style={inp} /></div>
              </div>
              <div><label style={lbl}>Cazare (persoane auto)</label><input value={edit.cazare} onChange={e => setEdit({...edit, cazare: e.target.value})} style={inp} /></div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                <div><label style={lbl}>Bilete avion</label><input type="number" value={edit.bilete_avion} onFocus={e => e.target.select()} onChange={e => setEdit({...edit, bilete_avion: Number(e.target.value)})} style={inp} /></div>
                <div><label style={lbl}>Alcool (lei)</label><input type="number" value={edit.alcool_default} onFocus={e => e.target.select()} onChange={e => setEdit({...edit, alcool_default: Number(e.target.value)})} style={inp} /></div>
              </div>
              <div><label style={lbl}>Observații</label><textarea value={edit.observatii || ''} onChange={e => setEdit({...edit, observatii: e.target.value})} rows={3} style={{...inp, resize:'vertical'}} /></div>
              {msg && <div style={{fontSize:'13px', fontWeight:700, color: msg === 'Salvat!' ? '#059669' : '#dc2626'}}>{msg}</div>}
              <div style={{display:'flex', gap:'10px'}}>
                <button onClick={salveaza} disabled={saving} style={{flex:1, padding:'12px', background:'#7c3aed', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:700, cursor: saving ? 'wait' : 'pointer', fontFamily:F, opacity: saving ? 0.6 : 1}}>{saving ? 'Se salvează...' : 'Salvează'}</button>
                <button onClick={stergeArtist} disabled={saving} style={{padding:'12px 18px', background:'#fef2f2', color:'#dc2626', border:'1.5px solid #fecaca', borderRadius:'8px', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:F}}>Șterge</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
