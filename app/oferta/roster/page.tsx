'use client'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

const F = 'Montserrat, sans-serif'
const UI = {
  bg: '#f5f5f7', card: '#ffffff', ink: '#1c1917', sub: '#57534e', faint: '#a8a29e',
  line: '#e7e5e4', green: '#059669', greenSoft: '#f0fdf4', purple: '#7c3aed', dark: '#1c1917',
  radius: '16px', radiusSm: '12px',
  shadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)',
  shadowBtn: '0 8px 30px rgba(0,0,0,0.18)',
  mesh: 'radial-gradient(circle at 20% 20%, rgba(5,150,105,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(124,58,237,0.05) 0%, transparent 50%), radial-gradient(circle at 50% 90%, rgba(234,205,163,0.06) 0%, transparent 50%)',
}

interface Format {
  nume: string
  fee: number
  leiKm: number
  cazare: string
  persoane: number
  bilete: number
  durata?: string
  comision?: number
}
interface Artist {
  id: number; nume: string; fee_standard: number; lei_km: number; transport_moneda?: string
  cazare: string; nr_persoane: number; bilete_avion: number; alcool_default: number
  categorie: string; tip: string; set_type?: string; durata_default?: string
  diurna_fixa?: number | null; cazare_fixa?: number | null; observatii?: string; format_show?: string; formate?: Format[] | null
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
  const [filtreGen, setFiltreGen] = useState<Set<string>>(new Set())
  const [filtruTip, setFiltruTip] = useState<'toti' | 'fwd' | 'extern'>('toti')
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
    return artists.filter(a => {
      if (!a.nume.toLowerCase().includes(s)) return false
      if (filtruTip === 'fwd' && a.tip === 'intermediere') return false
      if (filtruTip === 'extern' && a.tip !== 'intermediere') return false
      if (filtreGen.size > 0) { const gg = GENURI.find(g => g.cats.includes((a.categorie || '').toLowerCase())); if (!gg || !filtreGen.has(gg.key)) return false }
      return true
    })
  }, [artists, search, filtreGen, filtruTip])

  function toggleGen(cat: string) {
    setFiltreGen(prev => { const n = new Set(prev); if (n.has(cat)) n.delete(cat); else n.add(cat); return n })
  }

  // grupare pe gen muzical
  const GENURI: { key: string; label: string; cats: string[] }[] = [
    { key: 'international', label: 'Internațional', cats: ['international', 'pop', 'alternativ', 'special', 'rock'] },
    { key: 'urban', label: 'Urban', cats: ['urban', 'trap'] },
    { key: 'romanesc', label: 'Românesc', cats: ['romanesc', 'balcanic', 'manele', 'lautareasca'] },
    { key: 'electronic', label: 'Electronic', cats: ['electronic', 'dance', 'dj'] },
    { key: 'live', label: 'Live', cats: ['live', 'cover'] },
  ]
  const grupuri = GENURI.map(g => ({ ...g, artisti: filtrati.filter(a => g.cats.includes((a.categorie || '').toLowerCase())) })).filter(g => g.artisti.length > 0)
  const altele = filtrati.filter(a => !GENURI.some(g => g.cats.includes((a.categorie || '').toLowerCase())))

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

  function addVarianta() {
    if (!edit) return
    const noua = { nume: '', fee: 0, leiKm: edit.lei_km || 0, cazare: edit.cazare || '', persoane: edit.nr_persoane || 0, bilete: edit.bilete_avion || 0 }
    setEdit({ ...edit, formate: [...(edit.formate || []), noua] })
  }
  function updVarianta(i: number, patch: Partial<Format>) {
    if (!edit) return
    const f = [...(edit.formate || [])]
    f[i] = { ...f[i], ...patch }
    setEdit({ ...edit, formate: f })
  }
  function delVarianta(i: number) {
    if (!edit) return
    setEdit({ ...edit, formate: (edit.formate || []).filter((_, j) => j !== i) })
  }

  async function salveaza() {
    if (!edit) return
    setSaving(true); setMsg('')
    const r = await fetch('/api/oferta-update-artist', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...edit, formate: edit.formate || null, format_show: edit.format_show || null, nume_original: edit.nume })
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
      style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', background:UI.card, borderRadius:UI.radiusSm, border:'1px solid '+UI.line, boxShadow:UI.shadow, cursor:'pointer', marginBottom:'8px', transition:'all 0.15s'}}>
      <div>
        <div style={{fontSize:'14px', fontWeight:700, display:'flex', alignItems:'center', gap:'8px'}}>{a.nume}
          <span style={{fontSize:'8px', fontWeight:800, padding:'2px 6px', borderRadius:'4px', background: a.tip === 'intermediere' ? '#faf5ff' : '#f0fdf4', color: a.tip === 'intermediere' ? '#7c3aed' : '#059669'}}>{a.tip === 'intermediere' ? 'EXTERN' : 'FWD'}</span>
        </div>
        <div style={{fontSize:'12px', color:'#78716c', marginTop:'2px'}}>{a.set_type || 'band'} · {a.fee_standard}€{a.diurna_fixa ? ' · diurna ' + a.diurna_fixa : ''}</div>
      </div>
      <span style={{fontSize:'11px', color:'#a8a29e'}}>editează →</span>
    </div>
  )

  return (
    <div style={{minHeight:'100vh', background:'#f5f5f7', fontFamily:F, padding:'32px 20px'}}>
      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
      <div style={{maxWidth:'760px', margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
          <div>
            <div style={{fontSize:'26px', fontWeight:800, letterSpacing:'-0.5px', color:UI.ink}}>GIG<span style={{color:UI.green}}>x</span></div>
            <div style={{fontSize:'13px', color:UI.faint, fontWeight:500, marginTop:'2px'}}>Roster · {artists.length} artiști</div>
          </div>
          <a href="/oferta" style={{display:'flex', alignItems:'center', gap:'7px', fontSize:'13px', color:'white', fontWeight:700, textDecoration:'none', background:UI.dark, padding:'11px 18px', borderRadius:UI.radiusSm, boxShadow:UI.shadowBtn}}>Deviz</a>
        </div>

        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Caută artist..." style={{...inp, marginBottom:'14px', padding:'12px 14px', fontSize:'14px'}} />

        <div style={{display:'flex', gap:'6px', marginBottom:'10px', flexWrap:'wrap'}}>
          {(['toti','fwd','extern'] as const).map(t => (
            <button key={t} onClick={() => setFiltruTip(t)}
              style={{padding:'6px 14px', borderRadius:'8px', border:'1.5px solid ' + (filtruTip===t ? '#1c1917' : '#e7e5e4'), background: filtruTip===t ? '#1c1917' : 'white', color: filtruTip===t ? 'white' : '#57534e', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:F}}>
              {t === 'toti' ? 'Toți' : t === 'fwd' ? 'FWD' : 'Externi'}
            </button>
          ))}
        </div>
        <div style={{display:'flex', gap:'6px', marginBottom:'20px', flexWrap:'wrap'}}>
          {[{c:'international',l:'Internațional'},{c:'urban',l:'Urban'},{c:'romanesc',l:'Românesc'},{c:'electronic',l:'Electronic'},{c:'live',l:'Live'}].map(g => (
            <button key={g.c} onClick={() => toggleGen(g.c)}
              style={{padding:'5px 12px', borderRadius:'20px', border:'1.5px solid ' + (filtreGen.has(g.c) ? '#7c3aed' : '#e7e5e4'), background: filtreGen.has(g.c) ? '#faf5ff' : 'white', color: filtreGen.has(g.c) ? '#7c3aed' : '#78716c', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:F}}>
              {g.l}
            </button>
          ))}
          {filtreGen.size > 0 && <button onClick={() => setFiltreGen(new Set())} style={{padding:'5px 12px', borderRadius:'20px', border:'none', background:'none', color:'#dc2626', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:F}}>× Resetează</button>}
        </div>

        {grupuri.map(g => (
          <div key={g.key} style={{marginBottom:'28px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px', paddingBottom:'8px', borderBottom:'2px solid #e7e5e4'}}>
              <span style={{fontSize:'16px', fontWeight:800, color:'#1c1917'}}>{g.label}</span>
              <span style={{fontSize:'12px', color:'#a8a29e', fontWeight:600}}>{g.artisti.length}</span>
            </div>
            {g.artisti.map(Row)}
          </div>
        ))}
        {altele.length > 0 && (
          <div style={{marginBottom:'28px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px', paddingBottom:'8px', borderBottom:'2px solid #e7e5e4'}}>
              <span style={{fontSize:'16px', fontWeight:800, color:'#1c1917'}}>Alte genuri</span>
              <span style={{fontSize:'12px', color:'#a8a29e', fontWeight:600}}>{altele.length}</span>
            </div>
            {altele.map(Row)}
          </div>
        )}
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
                    <option value="International">Internațional</option><option value="Urban">Urban</option><option value="Romanesc">Românesc</option><option value="Electronic">Electronic</option><option value="Live">Live</option>
                  </select>
                </div>
                <div><label style={lbl}>Tip</label>
                  <select value={edit.tip} onChange={e => setEdit({...edit, tip: e.target.value})} style={inp}><option value="propriu">FWD</option><option value="intermediere">EXTERN</option></select>
                </div>
              </div>
              <div><label style={lbl}>Format show</label>
                <select value={edit.format_show || ''} onChange={e => setEdit({...edit, format_show: e.target.value})} style={inp}>
                  <option value="">—</option>
                  <option value="dj_set">DJ set (pe negative)</option>
                  <option value="live_band">Live band</option>
                  <option value="dansatori">Dansatori</option>
                  <option value="live_band_dansatori">Live band + dansatori</option>
                </select>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                <div><label style={lbl}>Durată</label>
                  <input value={edit.durata_default || ''} onChange={e => setEdit({...edit, durata_default: e.target.value})} placeholder="40 min" style={inp} />
                </div>
                <div><label style={lbl}>Diurnă fixă (lei)</label><input type="number" value={edit.diurna_fixa || ''} onFocus={e => e.target.select()} onChange={e => setEdit({...edit, diurna_fixa: e.target.value ? Number(e.target.value) : null})} placeholder="opțional" style={inp} /></div>
                <div><label style={lbl}>Cazare fixă (lei)</label><input type="number" value={edit.cazare_fixa || ''} onFocus={e => e.target.select()} onChange={e => setEdit({...edit, cazare_fixa: e.target.value ? Number(e.target.value) : null})} placeholder="opțional" style={inp} /></div>
              </div>
              <div><label style={lbl}>Cazare (persoane auto)</label><input value={edit.cazare} onChange={e => setEdit({...edit, cazare: e.target.value})} style={inp} /></div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                <div><label style={lbl}>Bilete avion</label><input type="number" value={edit.bilete_avion} onFocus={e => e.target.select()} onChange={e => setEdit({...edit, bilete_avion: Number(e.target.value)})} style={inp} /></div>
                <div><label style={lbl}>Protocol (lei)</label><input type="number" value={edit.alcool_default} onFocus={e => e.target.select()} onChange={e => setEdit({...edit, alcool_default: Number(e.target.value)})} style={inp} /></div>
              </div>
              <div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}>
                  <label style={{...lbl, marginBottom:0}}>Variante de preț (durată + fee)</label>
                  <button onClick={addVarianta} style={{fontSize:'11px', fontWeight:700, color:'#7c3aed', background:'none', border:'1px solid #7c3aed', borderRadius:'6px', padding:'3px 8px', cursor:'pointer', fontFamily:F}}>+ Variantă</button>
                </div>
                {(edit.formate || []).length === 0 && <div style={{fontSize:'12px', color:'#a8a29e', marginBottom:'8px'}}>Fără variante. Se folosește fee-ul standard. Adaugă variante pentru artiști cu prețuri diferite pe set/durată.</div>}
                {(edit.formate || []).map((f, i) => (
                  <div key={i} style={{background:'#f5f5f4', borderRadius:'8px', padding:'10px', marginBottom:'8px'}}>
                    <div style={{display:'flex', gap:'6px', marginBottom:'6px'}}>
                      <input value={f.nume} onChange={e => updVarianta(i, { nume: e.target.value })} placeholder="ex: 2 seturi × 40 min" style={{...inp, flex:1, fontSize:'12px', padding:'7px 9px'}} />
                      <button onClick={() => delVarianta(i)} style={{padding:'0 10px', background:'#fef2f2', color:'#dc2626', border:'none', borderRadius:'6px', fontSize:'16px', cursor:'pointer'}}>×</button>
                    </div>
                    <div><span style={{fontSize:'9px', color:'#78716c', fontWeight:700}}>FEE €</span><input type="number" value={f.fee || ''} onFocus={e => e.target.select()} onChange={e => updVarianta(i, { fee: Number(e.target.value) })} style={{...inp, fontSize:'12px', padding:'7px 9px'}} /></div>
                  </div>
                ))}
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
