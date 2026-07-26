'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

const F = 'Montserrat, sans-serif'
const INK = '#101014', CREM = '#F5F2EC', VERDE = '#059669', SUB = '#57534e', FAINT = '#a8a29e', LINE = '#e7e5e4'

function formatNum(n: number) {
  if (n >= 1000000000) return (n/1000000000).toFixed(1) + 'B'
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n/1000).toFixed(1) + 'K'
  return String(n)
}
function fmtEur(n: number) { return n.toLocaleString('ro-RO') + ' EUR' }

const TIER_MAP: Record<string, {label: string, color: string}> = {
  'A++': {label: 'HEADLINER', color: '#b8860b'},
  'Premium': {label: 'HEADLINER', color: '#b8860b'},
  'A+': {label: 'POWER DRAW', color: '#7c3aed'},
  'A': {label: 'SOLID', color: '#44403c'},
}

function CardArtist({ a, audienta, token, tabInitial }: { a: any, audienta: string, token: string, tabInitial: string }) {
  const [tab, setTab] = useState(tabInitial)
  const tier = a.tier ? (TIER_MAP[a.tier] || {label: 'BOOKING ACTIV', color: VERDE}) : null

  function schimbaTab(t: string) {
    setTab(t)
    fetch('/api/share/' + token, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ actiune: 'tap-' + t, artist: a.nume }) }).catch(() => {})
  }

  function copiaza() {
    const pret = a.preturi ? (audienta === 'b2b' ? (tab === 'revelion' ? a.preturi.revelion : tab === 'prom' ? a.preturi.prom : a.preturi.standard) : a.preturi.deLa) : null
    const eticheta = tab === 'revelion' ? 'Revelion' : tab === 'prom' ? 'Baluri / Prom' : 'Standard'
    let txt = a.nume.toUpperCase() + '\n'
    if (a.genuri.length) txt += a.genuri.join(' / ') + '\n'
    if (pret) txt += eticheta + ': ' + (audienta === 'b2b' ? fmtEur(pret) : 'de la ' + fmtEur(pret)) + '\n'
    txt += 'Onorariul nu include transport, cazare si masa.\n'
    txt += 'Corporate / Private / Festival: la cerere\n'
    txt += 'Forward Agency · booking@forward.com.ro'
    navigator.clipboard.writeText(txt).then(() => alert('Copiat - gata de trimis'))
    fetch('/api/share/' + token, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ actiune: 'copy', artist: a.nume }) }).catch(() => {})
  }

  function distribuie() {
    fetch('/api/share/' + token, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ actiune: 'share', artist: a.nume }) }).catch(() => {})
    if (navigator.share) navigator.share({ title: a.nume + ' - GIGx', url: window.location.href }).catch(() => {})
    else { navigator.clipboard.writeText(window.location.href); alert('Link copiat') }
  }

  const statCards = a.stats ? [
    { v: a.stats.monthlyListeners, l: 'Ascultatori lunari' },
    { v: a.stats.spotifyFollowers, l: 'Followers Spotify' },
    { v: a.stats.tiktokFollowers, l: 'Followers TikTok' },
    { v: a.stats.instagramFollowers, l: 'Followers Instagram' },
  ].filter(x => x.v > 1000) : []

  return (
    <div style={{background:'white', borderRadius:'22px', border:'1px solid '+LINE, overflow:'hidden', boxShadow:'0 6px 32px rgba(16,16,20,0.08)'}}>
      {a.poza && (
        <div style={{position:'relative'}}>
          <img src={a.poza} alt={a.nume} style={{width:'100%', height:'300px', objectFit:'cover', display:'block'}} />
          <div style={{position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(16,16,20,0) 45%, rgba(16,16,20,0.85) 100%)'}} />
          <div style={{position:'absolute', left:'22px', right:'22px', bottom:'18px'}}>
            <div style={{fontSize:'30px', fontWeight:800, color:CREM, letterSpacing:'-1px', lineHeight:1.05, textShadow:'0 2px 12px rgba(0,0,0,0.3)'}}>{a.nume}</div>
            <div style={{display:'flex', alignItems:'center', gap:'10px', marginTop:'6px', flexWrap:'wrap'}}>
              {a.genuri.length > 0 && <span style={{fontSize:'12px', color:'rgba(245,242,236,0.85)', fontWeight:600}}>{a.genuri.join(' · ')}</span>}
              {tier && <span style={{fontSize:'10px', fontWeight:800, color:CREM, background:tier.color, padding:'3px 9px', borderRadius:'6px', letterSpacing:'0.06em'}}>{tier.label}</span>}
            </div>
          </div>
        </div>
      )}
      <div style={{padding:'20px 22px 22px'}}>
        {!a.poza && (
          <div style={{marginBottom:'14px'}}>
            <div style={{fontSize:'26px', fontWeight:800, color:INK, letterSpacing:'-0.5px'}}>{a.nume}</div>
            {a.genuri.length > 0 && <div style={{fontSize:'13px', color:SUB, marginTop:'3px'}}>{a.genuri.join(' · ')}</div>}
          </div>
        )}

        {statCards.length > 0 && (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:'10px', marginBottom:'18px'}}>
            {statCards.map(sc => (
              <div key={sc.l} style={{textAlign:'center', padding:'13px 8px', background:'#f0fdf4', borderRadius:'14px'}}>
                <div style={{fontWeight:800, fontSize:'19px', color:VERDE, letterSpacing:'-0.5px'}}>{formatNum(sc.v)}</div>
                <div style={{fontSize:'9.5px', color:'#78716c', fontWeight:600, marginTop:'4px', textTransform:'uppercase', letterSpacing:'0.04em'}}>{sc.l}</div>
              </div>
            ))}
          </div>
        )}

        {a.preturi && audienta === 'b2b' && (
          <div>
            <div style={{display:'flex', background:'#f5f5f4', borderRadius:'12px', padding:'4px', gap:'4px'}}>
              {[['standard','Standard'],['revelion','Revelion'],['prom','Baluri / Prom']].map(([k, l]) => (
                <button key={k} onClick={() => schimbaTab(k)}
                  style={{flex:1, padding:'9px 6px', borderRadius:'9px', border:'none', cursor:'pointer', fontFamily:F, fontSize:'12px', fontWeight:700,
                    background: tab === k ? INK : 'transparent', color: tab === k ? CREM : SUB, transition:'all 0.15s'}}>
                  {l}
                </button>
              ))}
            </div>
            <div style={{textAlign:'center', padding:'22px 0 6px'}}>
              <div style={{fontSize:'34px', fontWeight:800, color:INK, letterSpacing:'-1.5px', lineHeight:1}}>
                {fmtEur(tab === 'revelion' ? a.preturi.revelion : tab === 'prom' ? a.preturi.prom : a.preturi.standard)}
              </div>
              <div style={{fontSize:'11px', color:FAINT, fontWeight:600, marginTop:'8px'}}>Onorariul nu include transport, cazare si masa</div>
            </div>
            <div style={{textAlign:'center', fontSize:'12px', color:FAINT, fontWeight:600, paddingTop:'10px', borderTop:'1px solid '+LINE, marginTop:'12px'}}>
              Corporate · Private · Festival — <span style={{color:VERDE, fontWeight:700}}>la cerere</span>
            </div>
          </div>
        )}
        {a.preturi && audienta !== 'b2b' && (
          <div style={{textAlign:'center', padding:'14px 0 6px'}}>
            <div style={{fontSize:'13px', color:SUB, fontWeight:600}}>Onorariu</div>
            <div style={{fontSize:'32px', fontWeight:800, color:INK, letterSpacing:'-1.5px', marginTop:'4px'}}>de la {fmtEur(a.preturi.deLa)}</div>
            <div style={{fontSize:'11px', color:FAINT, fontWeight:600, marginTop:'8px'}}>Revelion · Corporate · Private — la cerere</div>
          </div>
        )}
        {!a.preturi && <div style={{textAlign:'center', padding:'16px 0', fontSize:'14px', color:SUB, fontWeight:600}}>Onorariu la cerere</div>}

        {(a.epk || a.riderTehnic || a.riderAcomodare) && (
          <div style={{display:'flex', gap:'8px', flexWrap:'wrap', marginTop:'16px'}}>
            {a.epk && <a href={a.epk} target="_blank" onClick={() => fetch('/api/share/' + token, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({actiune:'epk', artist:a.nume}) }).catch(()=>{})} style={{padding:'10px 15px', background:INK, color:CREM, borderRadius:'10px', fontSize:'12px', fontWeight:700, textDecoration:'none'}}>Press Kit (EPK)</a>}
            {a.riderTehnic && <a href={a.riderTehnic} target="_blank" style={{padding:'10px 15px', background:'white', color:INK, border:'1.5px solid '+LINE, borderRadius:'10px', fontSize:'12px', fontWeight:700, textDecoration:'none'}}>Rider tehnic</a>}
            {a.riderAcomodare && <a href={a.riderAcomodare} target="_blank" style={{padding:'10px 15px', background:'white', color:INK, border:'1.5px solid '+LINE, borderRadius:'10px', fontSize:'12px', fontWeight:700, textDecoration:'none'}}>Rider acomodare</a>}
          </div>
        )}

        <div style={{display:'flex', gap:'8px', marginTop:'16px', paddingTop:'16px', borderTop:'1px solid '+LINE}}>
          <button onClick={copiaza} style={{flex:1, padding:'11px', background:'#f5f5f4', color:INK, border:'none', borderRadius:'10px', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:F}}>Copiaza oferta</button>
          <button onClick={distribuie} style={{flex:1, padding:'11px', background:'#f5f5f4', color:INK, border:'none', borderRadius:'10px', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:F}}>Trimite mai departe</button>
        </div>
      </div>
    </div>
  )
}

export default function ShareView() {
  const params = useParams()
  const token = String(params.token || '')
  const [d, setD] = useState<any>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!token) return
    fetch('/api/share/' + token)
      .then(async r => { const j = await r.json(); if (!j.ok) throw new Error(j.error); setD(j) })
      .catch(e => setErr(e.message || 'Eroare'))
  }, [token])

  return (
    <div style={{minHeight:'100vh', background:CREM, fontFamily:F, padding:'26px 16px 40px'}}>
      <div style={{maxWidth:'720px', margin:'0 auto'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px'}}>
          <div style={{display:'flex', alignItems:'center', gap:'9px'}}>
            <img src="/gigx-mark.png" width={26} height={26} alt="" style={{display:'block'}} />
            <span style={{fontSize:'22px', fontWeight:800, letterSpacing:'-0.5px', color:INK}}>GIG<span style={{color:VERDE}}>x</span></span>
          </div>
          {d && <span style={{fontSize:'11px', fontWeight:700, color:SUB, background:'white', border:'1px solid '+LINE, padding:'6px 12px', borderRadius:'20px'}}>valabil pana la {new Date(d.expiraLa).toLocaleDateString('ro-RO')}</span>}
        </div>

        {err && <div style={{background:'white', border:'1px solid '+LINE, borderRadius:'16px', padding:'32px', textAlign:'center', color:SUB, fontSize:'15px', fontWeight:600}}>{err}</div>}
        {!err && !d && <div style={{textAlign:'center', color:FAINT, fontSize:'14px', padding:'50px'}}>Se incarca...</div>}

        {d && (
          <>
            <div style={{fontSize:'13px', color:SUB, marginBottom:'16px'}}>Pregatit pentru <strong style={{color:INK}}>{d.destinatar}</strong></div>
            {d.tip === 'artist' && <CardArtist a={d.artist} audienta={d.audienta} token={token} tabInitial="standard" />}
            {d.tip === 'roster' && (
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'18px'}}>
                {d.artisti.map((a: any) => <CardArtist key={a.nume} a={a} audienta={d.audienta} token={token} tabInitial="standard" />)}
              </div>
            )}
            <div style={{fontSize:'11px', color:FAINT, marginTop:'28px', textAlign:'center', lineHeight:1.6}}>
              Oferta confidentiala pregatita de Forward Agency<br/>booking@forward.com.ro
            </div>
          </>
        )}
      </div>
    </div>
  )
}
