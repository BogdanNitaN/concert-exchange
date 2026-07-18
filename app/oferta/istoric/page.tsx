'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

const F = 'Montserrat,sans-serif'

interface Oferta {
  cod: string
  client: string | null
  oras: string | null
  locatie: string | null
  data_eveniment: string | null
  destinatar: string | null
  institutie_publica: boolean
  artisti: { nume: string; fee: number; feeLista: number; tipPret: string; tip?: string; format?: string }[]
  total_fee_eur: number
  total_discount_eur: number
  total_cag_eur: number
  status: string
  suma_finala: number | null
  nota: string | null
  created_at: string
}

const STATUSURI = ['generata', 'trimisa', 'confirmata', 'refuzata']
const STATUS_COLOR: Record<string, string> = { generata: '#a8a29e', trimisa: '#3b82f6', confirmata: '#059669', refuzata: '#dc2626' }

export default function IstoricPage() {
  const [authed, setAuthed] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [loginUser, setLoginUser] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

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
  const [oferte, setOferte] = useState<Oferta[]>([])
  const [loading, setLoading] = useState(false)
  const [expandat, setExpandat] = useState<string | null>(null)
  const [selectate, setSelectate] = useState<Set<string>>(new Set())

  function toggleSelect(cod: string) {
    setSelectate(prev => {
      const n = new Set(prev)
      if (n.has(cod)) n.delete(cod); else n.add(cod)
      return n
    })
  }

  async function stergeSelectate() {
    if (selectate.size === 0) return
    if (!confirm('Sigur ștergi ' + selectate.size + ' oferte selectate? Nu se poate reveni.')) return
    const coduri = Array.from(selectate)
    setOferte(prev => prev.filter(o => !selectate.has(o.cod)))
    setSelectate(new Set())
    for (const cod of coduri) {
      try { await fetch('/api/oferta-save?cod=' + encodeURIComponent(cod), { method: 'DELETE' }) } catch {}
    }
  }

  // filtre
  const [search, setSearch] = useState('')
  const [dataStart, setDataStart] = useState('')
  const [dataEnd, setDataEnd] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fDestinatar, setFDestinatar] = useState('')
  const [fDiscount, setFDiscount] = useState(false)
  const [fCag, setFCag] = useState(false)
  const [fValoareMin, setFValoareMin] = useState('')
  const [sortBy, setSortBy] = useState('data-noua')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      const role = user?.user_metadata?.role
      if (user && (role === 'oferta_admin' || role === 'oferta_user') && !user?.user_metadata?.blocat) setAuthed(true)
      setCheckingAuth(false)
    })
  }, [])
  useEffect(() => { if (authed) load() }, [authed])

  async function load() {
    setLoading(true)
    try {
      const r = await fetch('/api/oferta-save')
      const d = await r.json()
      setOferte(d.oferte || [])
    } catch {}
    setLoading(false)
  }

  async function updateStatus(cod: string, status: string) {
    setOferte(prev => prev.map(o => o.cod === cod ? { ...o, status } : o))
    try {
      await fetch('/api/oferta-save', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cod, status }) })
    } catch {}
  }

  async function stergeOferta(cod: string) {
    if (!confirm('Sigur ștergi oferta ' + cod + '? Nu se poate reveni.')) return
    setOferte(prev => prev.filter(o => o.cod !== cod))
    try { await fetch('/api/oferta-save?cod=' + encodeURIComponent(cod), { method: 'DELETE' }) } catch {}
  }

  async function updateNegociere(cod: string, suma_finala: number | null, nota: string | null) {
    setOferte(prev => prev.map(o => o.cod === cod ? { ...o, suma_finala, nota } : o))
    try {
      await fetch('/api/oferta-save', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cod, suma_finala, nota }) })
    } catch {}
  }

  const filtrate = useMemo(() => {
    let r = [...oferte]
    const q = search.trim().toLowerCase()
    if (q) r = r.filter(o =>
      o.cod.toLowerCase().includes(q) ||
      (o.client || '').toLowerCase().includes(q) ||
      (o.oras || '').toLowerCase().includes(q) ||
      (o.locatie || '').toLowerCase().includes(q) ||
      (o.artisti || []).some(a => a.nume.toLowerCase().includes(q))
    )
    if (dataStart) r = r.filter(o => new Date(o.created_at) >= new Date(dataStart))
    if (dataEnd) r = r.filter(o => new Date(o.created_at) <= new Date(dataEnd + 'T23:59:59'))
    if (fStatus) r = r.filter(o => o.status === fStatus)
    if (fDestinatar === 'institutie') r = r.filter(o => o.institutie_publica)
    else if (fDestinatar) r = r.filter(o => o.destinatar === fDestinatar && !o.institutie_publica)
    if (fDiscount) r = r.filter(o => o.total_discount_eur > 0)
    if (fCag) r = r.filter(o => o.total_cag_eur > 0)
    if (fValoareMin) r = r.filter(o => o.total_fee_eur >= Number(fValoareMin))
    r.sort((a, b) => {
      if (sortBy === 'data-noua') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === 'data-veche') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sortBy === 'valoare-mare') return b.total_fee_eur - a.total_fee_eur
      if (sortBy === 'valoare-mica') return a.total_fee_eur - b.total_fee_eur
      return 0
    })
    return r
  }, [oferte, search, dataStart, dataEnd, fStatus, fDestinatar, fDiscount, fCag, fValoareMin, sortBy])

  function resetFiltre() {
    setSearch(''); setDataStart(''); setDataEnd(''); setFStatus(''); setFDestinatar(''); setFDiscount(false); setFCag(false); setFValoareMin(''); setSortBy('data-noua')
  }

  const inputStyle: React.CSSProperties = { padding: '9px 11px', borderRadius: '8px', border: '1.5px solid #e7e5e4', fontSize: '13px', fontFamily: F, boxSizing: 'border-box', color: '#1c1917' }
  const label: React.CSSProperties = { fontSize: '10px', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px', display: 'block' }

  if (checkingAuth) {
    return <div style={{minHeight:'100vh', background:'#f5f5f7', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F, color:'#78716c'}}>Verificare...</div>
  }
  if (!authed) {
    return (
      <div style={{minHeight:'100vh', background:'#f5f5f7', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F, padding:'20px'}}>
        <div style={{background:'white', padding:'40px', borderRadius:'16px', border:'2px solid #e7e5e4', width:'340px'}}>
          <div style={{fontSize:'22px', fontWeight:800, marginBottom:'6px'}}>GIG<span style={{color:'#059669'}}>x</span> Istoric</div>
          <div style={{fontSize:'13px', color:'#78716c', marginBottom:'20px'}}>Autentificare</div>
          <input type="text" placeholder="Utilizator" value={loginUser} autoComplete="username"
            onChange={e => setLoginUser(e.target.value)}
            style={{...inputStyle, width:'100%', padding:'10px 12px', fontSize:'14px', marginBottom:'10px'}} />
          <input type="password" placeholder="Parola" value={loginPass} autoComplete="current-password"
            onChange={e => setLoginPass(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') faLogin() }}
            style={{...inputStyle, width:'100%', padding:'10px 12px', fontSize:'14px'}} />
          {loginErr && <div style={{fontSize:'12px', color:'#dc2626', marginTop:'8px'}}>{loginErr}</div>}
          <button onClick={faLogin} disabled={loggingIn}
            style={{width:'100%', marginTop:'14px', padding:'11px', background:'#1c1917', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:700, cursor: loggingIn ? 'wait' : 'pointer', fontFamily:F, opacity: loggingIn ? 0.6 : 1}}>
            {loggingIn ? 'Se conecteaza...' : 'Intra in cont'}
          </button>
        </div>
      </div>
    )
  }

  const totalFee = filtrate.reduce((s, o) => s + o.total_fee_eur, 0)
  const totalDisc = filtrate.reduce((s, o) => s + o.total_discount_eur, 0)
  const totalCag = filtrate.reduce((s, o) => s + o.total_cag_eur, 0)

  return (
    <div style={{minHeight:'100vh', background:'#f5f5f7', fontFamily:F, padding:'32px 20px'}}>
      <div style={{maxWidth:'1100px', margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
          <div style={{fontSize:'24px', fontWeight:800}}>GIG<span style={{color:'#059669'}}>x</span> · Istoric oferte</div>
          <a href="/oferta" style={{fontSize:'14px', color:'#059669', fontWeight:700, textDecoration:'none'}}>+ Ofertă nouă</a>
        </div>

        {/* FILTRE */}
        <div style={{background:'white', padding:'18px', borderRadius:'14px', border:'2px solid #e7e5e4', marginBottom:'20px'}}>
          <input placeholder="Caută în cod, client, oraș, locație, artist..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{...inputStyle, width:'100%', padding:'11px 13px', fontSize:'14px', marginBottom:'14px'}} />

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'12px', marginBottom:'14px'}}>
            <div><label style={label}>De la data</label><input type="date" value={dataStart} onChange={e => setDataStart(e.target.value)} style={{...inputStyle, width:'100%'}} /></div>
            <div><label style={label}>Până la</label><input type="date" value={dataEnd} onChange={e => setDataEnd(e.target.value)} style={{...inputStyle, width:'100%'}} /></div>
            <div><label style={label}>Status</label>
              <select value={fStatus} onChange={e => setFStatus(e.target.value)} style={{...inputStyle, width:'100%'}}>
                <option value="">Toate</option>
                {STATUSURI.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label style={label}>Destinatar</label>
              <select value={fDestinatar} onChange={e => setFDestinatar(e.target.value)} style={{...inputStyle, width:'100%'}}>
                <option value="">Toți</option>
                <option value="client">Client</option>
                <option value="intermediar">Intermediar</option>
                <option value="institutie">Instituție publică</option>
              </select>
            </div>
            <div><label style={label}>Valoare min (€)</label><input type="number" value={fValoareMin} onChange={e => setFValoareMin(e.target.value)} placeholder="ex: 5000" style={{...inputStyle, width:'100%'}} /></div>
            <div><label style={label}>Sortare</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{...inputStyle, width:'100%'}}>
                <option value="data-noua">Cele mai noi</option>
                <option value="data-veche">Cele mai vechi</option>
                <option value="valoare-mare">Valoare mare</option>
                <option value="valoare-mica">Valoare mică</option>
              </select>
            </div>
          </div>

          <div style={{display:'flex', gap:'16px', alignItems:'center', flexWrap:'wrap'}}>
            <label style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', cursor:'pointer', fontWeight:700}}>
              <input type="checkbox" checked={fDiscount} onChange={e => setFDiscount(e.target.checked)} style={{width:'16px', height:'16px', accentColor:'#059669'}} /> Cu discount
            </label>
            <label style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', cursor:'pointer', fontWeight:700}}>
              <input type="checkbox" checked={fCag} onChange={e => setFCag(e.target.checked)} style={{width:'16px', height:'16px', accentColor:'#7c3aed'}} /> Cu CAG
            </label>
            <button onClick={resetFiltre} style={{marginLeft:'auto', padding:'8px 16px', background:'#e7e5e4', color:'#1c1917', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F}}>Resetează</button>
          </div>
        </div>

        {/* SUMAR */}
        <div style={{display:'flex', gap:'12px', marginBottom:'20px', flexWrap:'wrap'}}>
          <div style={{background:'#1c1917', color:'white', padding:'12px 18px', borderRadius:'10px', flex:1, minWidth:'140px'}}>
            <div style={{fontSize:'11px', color:'#a8a29e', textTransform:'uppercase'}}>{filtrate.length} oferte</div>
            <div style={{fontSize:'20px', fontWeight:800}}>{totalFee.toLocaleString('ro-RO')} €</div>
          </div>
          {totalDisc > 0 && <div style={{background:'white', border:'2px solid #059669', padding:'12px 18px', borderRadius:'10px', flex:1, minWidth:'140px'}}>
            <div style={{fontSize:'11px', color:'#059669', textTransform:'uppercase', fontWeight:700}}>Total discount</div>
            <div style={{fontSize:'20px', fontWeight:800, color:'#059669'}}>{totalDisc.toLocaleString('ro-RO')} €</div>
          </div>}
          {totalCag > 0 && <div style={{background:'white', border:'2px solid #7c3aed', padding:'12px 18px', borderRadius:'10px', flex:1, minWidth:'140px'}}>
            <div style={{fontSize:'11px', color:'#7c3aed', textTransform:'uppercase', fontWeight:700}}>Total CAG</div>
            <div style={{fontSize:'20px', fontWeight:800, color:'#7c3aed'}}>{totalCag.toLocaleString('ro-RO')} €</div>
          </div>}
        </div>

        {selectate.size > 0 && (
          <div style={{position:'sticky', top:'10px', zIndex:30, background:'#dc2626', color:'white', padding:'12px 18px', borderRadius:'10px', marginBottom:'16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span style={{fontWeight:700, fontSize:'14px'}}>{selectate.size} selectate</span>
            <div style={{display:'flex', gap:'8px'}}>
              <button onClick={() => setSelectate(new Set())} style={{padding:'7px 14px', background:'rgba(255,255,255,0.2)', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F}}>Anulează</button>
              <button onClick={stergeSelectate} style={{padding:'7px 14px', background:'white', color:'#dc2626', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:800, cursor:'pointer', fontFamily:F}}>Șterge selectate</button>
            </div>
          </div>
        )}
        {loading ? <div style={{color:'#78716c'}}>Se încarcă...</div> : (
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            {filtrate.length === 0 && <div style={{color:'#78716c', textAlign:'center', padding:'40px'}}>Nicio ofertă găsită</div>}
            {filtrate.map(o => (
              <div key={o.cod} style={{background:'white', padding:'18px', borderRadius:'12px', border:'2px solid #e7e5e4'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px'}}>
                  <div style={{display:'flex', gap:'10px', alignItems:'flex-start'}}>
                    <input type="checkbox" checked={selectate.has(o.cod)} onChange={() => toggleSelect(o.cod)} style={{width:'18px', height:'18px', marginTop:'2px', accentColor:'#dc2626', cursor:'pointer'}} />
                    <div>
                    <div style={{fontSize:'15px', fontWeight:800, color:'#059669'}}>{o.cod}</div>
                    <div style={{fontSize:'14px', fontWeight:700, marginTop:'2px'}}>{o.client || '—'}{o.oras ? ' · ' + o.oras : ''}{o.locatie ? ' · ' + o.locatie : ''}</div>
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:'11px', color:'#78716c'}}>{new Date(o.created_at).toLocaleDateString('ro-RO')} {new Date(o.created_at).toLocaleTimeString('ro-RO', {hour:'2-digit',minute:'2-digit'})}</div>
                    <select value={o.status} onChange={e => updateStatus(o.cod, e.target.value)}
                      style={{marginTop:'4px', padding:'3px 8px', borderRadius:'6px', border:'1.5px solid ' + (STATUS_COLOR[o.status] || '#e7e5e4'), color: STATUS_COLOR[o.status] || '#1c1917', fontSize:'11px', fontWeight:700, fontFamily:F, cursor:'pointer', background:'white'}}>
                      {STATUSURI.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{fontSize:'13px', color:'#57534e', marginBottom:'10px'}}>
                  {(o.artisti || []).map(a => a.nume).join(', ')}
                  {o.institutie_publica && <span style={{marginLeft:'8px', fontSize:'10px', fontWeight:700, color:'#7c3aed'}}>INST. PUBLICĂ</span>}
                </div>
                <div style={{display:'flex', gap:'20px', fontSize:'13px', paddingTop:'10px', borderTop:'1px solid #f5f5f4', alignItems:'center', flexWrap:'wrap'}}>
                  <span>Fee: <strong>{o.total_fee_eur.toLocaleString('ro-RO')} €</strong></span>
                  {o.total_discount_eur > 0 && <span style={{color:'#059669'}}>Discount: <strong>{o.total_discount_eur.toLocaleString('ro-RO')} €</strong></span>}
                  {o.total_cag_eur > 0 && <span style={{color:'#7c3aed'}}>CAG: <strong>{o.total_cag_eur.toLocaleString('ro-RO')} €</strong></span>}
                  {o.suma_finala != null && <span style={{color:'#059669', fontWeight:700}}>Închis: {o.suma_finala.toLocaleString('ro-RO')} €</span>}
                  <button onClick={() => setExpandat(expandat === o.cod ? null : o.cod)}
                    style={{marginLeft:'auto', padding:'6px 14px', background:'#f5f5f4', color:'#1c1917', border:'none', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:F}}>
                    {expandat === o.cod ? 'Ascunde' : 'Detalii'}
                  </button>
                  <button onClick={() => { try { localStorage.setItem('oferta_edit', JSON.stringify(o)) } catch {}; window.location.href = '/oferta' }}
                    style={{padding:'6px 14px', background:'#1c1917', color:'white', border:'none', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:F}}>
                    Editează
                  </button>
                  <button onClick={() => stergeOferta(o.cod)}
                    style={{padding:'6px 14px', background:'#fef2f2', color:'#dc2626', border:'1.5px solid #fecaca', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:F}}>
                    Șterge
                  </button>
                </div>

                {expandat === o.cod && (
                  <div style={{marginTop:'14px', paddingTop:'14px', borderTop:'2px solid #f5f5f4'}}>
                    {/* detalii per artist */}
                    <div style={{fontSize:'11px', fontWeight:700, color:'#78716c', textTransform:'uppercase', marginBottom:'8px'}}>Artiști ofertați</div>
                    {(o.artisti || []).map((a, i) => (
                      <div key={i} style={{display:'flex', justifyContent:'space-between', fontSize:'13px', padding:'6px 0', borderBottom:'1px solid #f5f5f4'}}>
                        <span style={{fontWeight:600}}>{a.nume}
                          <span style={{marginLeft:'6px', fontSize:'8px', fontWeight:800, padding:'1px 5px', borderRadius:'4px', background: a.tip === 'intermediere' ? '#faf5ff' : '#f0fdf4', color: a.tip === 'intermediere' ? '#7c3aed' : '#059669'}}>{a.tip === 'intermediere' ? 'EXTERN' : 'FWD'}</span>
                          {a.format && <span style={{color:'#a8a29e', fontWeight:400, fontSize:'12px'}}> · {a.format}</span>}
                          <span style={{color:'#a8a29e', fontWeight:400}}> · {a.tipPret}</span></span>
                        <span>{a.feeLista > a.fee ? <span style={{color:'#a8a29e', textDecoration:'line-through', marginRight:'6px'}}>{a.feeLista}€</span> : ''}<strong>{a.fee}€</strong></span>
                      </div>
                    ))}

                    {/* negociere */}
                    <div style={{marginTop:'14px', padding:'14px', background:'#f5f5f4', borderRadius:'10px'}}>
                      <div style={{fontSize:'12px', fontWeight:700, color:'#1c1917', marginBottom:'10px'}}>Rezultat negociere</div>
                      <div style={{display:'flex', gap:'10px', alignItems:'flex-end', flexWrap:'wrap'}}>
                        <div>
                          <label style={{fontSize:'11px', color:'#78716c', display:'block', marginBottom:'4px'}}>Sumă finală închisă (€)</label>
                          <input type="number" defaultValue={o.suma_finala ?? ''} placeholder={String(o.total_fee_eur)}
                            onBlur={e => updateNegociere(o.cod, e.target.value ? Number(e.target.value) : null, o.nota)}
                            style={{padding:'8px 10px', borderRadius:'8px', border:'1.5px solid #e7e5e4', fontSize:'13px', fontFamily:F, width:'140px'}} />
                        </div>
                        <div style={{flex:1, minWidth:'160px'}}>
                          <label style={{fontSize:'11px', color:'#78716c', display:'block', marginBottom:'4px'}}>Notă</label>
                          <input type="text" defaultValue={o.nota ?? ''} placeholder="ex: a cerut reducere"
                            onBlur={e => updateNegociere(o.cod, o.suma_finala, e.target.value || null)}
                            style={{padding:'8px 10px', borderRadius:'8px', border:'1.5px solid #e7e5e4', fontSize:'13px', fontFamily:F, width:'100%', boxSizing:'border-box'}} />
                        </div>
                      </div>
                      {o.suma_finala != null && o.suma_finala !== o.total_fee_eur && (
                        <div style={{fontSize:'12px', marginTop:'8px', fontWeight:700, color: o.suma_finala < o.total_fee_eur ? '#dc2626' : '#059669'}}>
                          {o.suma_finala < o.total_fee_eur ? 'Scădere' : 'Creștere'}: {Math.abs(o.total_fee_eur - o.suma_finala).toLocaleString('ro-RO')} € față de ofertă
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
