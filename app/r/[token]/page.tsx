'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

const F = 'Montserrat, sans-serif'
const INK = '#101014', CREM = '#F5F2EC', VERDE = '#059669', SUB = '#57534e', LINE = '#e7e5e4'

function fmtEur(n: number) { return n.toLocaleString('ro-RO') + ' EUR' }

function CardArtist({ a, audienta }: { a: any, audienta: string }) {
  return (
    <div style={{background:'white', borderRadius:'18px', border:'1px solid '+LINE, overflow:'hidden', boxShadow:'0 4px 24px rgba(16,16,20,0.06)'}}>
      {a.poza && <img src={a.poza} alt={a.nume} style={{width:'100%', height:'260px', objectFit:'cover', display:'block'}} />}
      <div style={{padding:'22px'}}>
        <div style={{display:'flex', alignItems:'baseline', gap:'10px', flexWrap:'wrap'}}>
          <div style={{fontSize:'24px', fontWeight:800, color:INK, letterSpacing:'-0.5px'}}>{a.nume}</div>
          {a.tier && <span style={{fontSize:'11px', fontWeight:800, color:VERDE, background:'#f0fdf4', padding:'3px 9px', borderRadius:'6px', textTransform:'uppercase'}}>{a.tier}</span>}
        </div>
        {a.genuri.length > 0 && <div style={{fontSize:'13px', color:SUB, marginTop:'4px'}}>{a.genuri.join(' · ')}</div>}

        {a.preturi && (
          <div style={{marginTop:'18px', borderTop:'1px solid '+LINE, paddingTop:'16px'}}>
            {audienta === 'b2b' ? (
              <div style={{display:'grid', gap:'8px'}}>
                <Rand k="Onorariu standard" v={fmtEur(a.preturi.standard)} bold />
                <Rand k="Revelion" v={fmtEur(a.preturi.revelion)} />
                <Rand k="Baluri / Prom" v={fmtEur(a.preturi.prom)} />
                <Rand k="Corporate · Private · Festival" v="la cerere" faint />
              </div>
            ) : (
              <div style={{display:'grid', gap:'8px'}}>
                <Rand k="Onorariu" v={'de la ' + fmtEur(a.preturi.deLa)} bold />
                <Rand k="Revelion · Corporate · Private" v="la cerere" faint />
              </div>
            )}
            <div style={{fontSize:'11px', color:'#a8a29e', marginTop:'10px'}}>Onorariile nu includ transport, cazare si masa.</div>
          </div>
        )}
        {!a.preturi && (
          <div style={{marginTop:'18px', borderTop:'1px solid '+LINE, paddingTop:'16px', fontSize:'14px', color:SUB}}>Onorariu la cerere.</div>
        )}

        {(a.epk || a.riderTehnic || a.riderAcomodare) && (
          <div style={{display:'flex', gap:'8px', flexWrap:'wrap', marginTop:'18px'}}>
            {a.epk && <a href={a.epk} target="_blank" style={{padding:'9px 14px', background:INK, color:'white', borderRadius:'9px', fontSize:'12px', fontWeight:700, textDecoration:'none'}}>Press Kit (EPK)</a>}
            {a.riderTehnic && <a href={a.riderTehnic} target="_blank" style={{padding:'9px 14px', background:'white', color:INK, border:'1.5px solid '+LINE, borderRadius:'9px', fontSize:'12px', fontWeight:700, textDecoration:'none'}}>Rider tehnic</a>}
            {a.riderAcomodare && <a href={a.riderAcomodare} target="_blank" style={{padding:'9px 14px', background:'white', color:INK, border:'1.5px solid '+LINE, borderRadius:'9px', fontSize:'12px', fontWeight:700, textDecoration:'none'}}>Rider acomodare</a>}
          </div>
        )}
      </div>
    </div>
  )
}

function Rand({ k, v, bold, faint }: { k: string, v: string, bold?: boolean, faint?: boolean }) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:'12px'}}>
      <span style={{fontSize:'13px', color:SUB, fontWeight:600}}>{k}</span>
      <span style={{fontSize: bold ? '18px' : '14px', fontWeight: bold ? 800 : 700, color: faint ? '#a8a29e' : INK}}>{v}</span>
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
    <div style={{minHeight:'100vh', background:CREM, fontFamily:F, padding:'28px 16px'}}>
      <div style={{maxWidth:'760px', margin:'0 auto'}}>
        <div style={{display:'flex', alignItems:'center', gap:'9px', marginBottom:'22px'}}>
          <img src="/gigx-mark.png" width={26} height={26} alt="" style={{display:'block'}} />
          <span style={{fontSize:'22px', fontWeight:800, letterSpacing:'-0.5px', color:INK}}>GIG<span style={{color:VERDE}}>x</span></span>
        </div>

        {err && <div style={{background:'white', border:'1px solid '+LINE, borderRadius:'14px', padding:'28px', textAlign:'center', color:SUB, fontSize:'15px', fontWeight:600}}>{err}</div>}
        {!err && !d && <div style={{textAlign:'center', color:'#a8a29e', fontSize:'14px', padding:'40px'}}>Se incarca...</div>}

        {d && (
          <>
            <div style={{fontSize:'13px', color:SUB, marginBottom:'16px'}}>
              Pregatit pentru <strong style={{color:INK}}>{d.destinatar}</strong> · valabil pana la {new Date(d.expiraLa).toLocaleDateString('ro-RO')}
            </div>
            {d.tip === 'artist' && <CardArtist a={d.artist} audienta={d.audienta} />}
            {d.tip === 'roster' && (
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'16px'}}>
                {d.artisti.map((a: any) => <CardArtist key={a.nume} a={a} audienta={d.audienta} />)}
              </div>
            )}
            <div style={{fontSize:'11px', color:'#a8a29e', marginTop:'26px', textAlign:'center'}}>
              Oferta confidentiala · Forward Agency · booking@forward.com.ro
            </div>
          </>
        )}
      </div>
    </div>
  )
}
