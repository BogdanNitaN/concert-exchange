'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

const F = 'Montserrat, sans-serif'
const UI = { bg:'#f5f5f7', ink:'#1c1917', sub:'#57534e', faint:'#a8a29e', line:'#e7e5e4', green:'#059669', greenSoft:'#f0fdf4' }

function formatNum(n: number) {
  if (n >= 1000000000) return (n/1000000000).toFixed(1) + 'B'
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n/1000).toFixed(1) + 'K'
  return String(n)
}
function fmtEur(n: number) { return n.toLocaleString('ro-RO') + ' EUR' }

const TIER_MAP: Record<string, {label: string, color: string, tip: string}> = {
  'A++': {label: 'HEADLINER', color: '#eacda3', tip: 'Top tier - vinde singur orice eveniment'},
  'Premium': {label: 'HEADLINER', color: '#eacda3', tip: 'Top tier - vinde singur orice eveniment'},
  'A+': {label: 'POWER DRAW', color: '#7c3aed', tip: 'Tractiune puternica - vanzari consistente'},
  'A': {label: 'SOLID', color: '#78716c', tip: 'Atractie solida - fan base loial'},
}
const TAB_LABEL: Record<string, string> = { standard: 'Standard', revelion: 'Revelion', prom: 'Baluri / Prom' }

function textOferta(a: any, audienta: string, tab: string) {
  const lg = a.logistica || {}
  let t = '*' + a.nume.toUpperCase() + '*' + '\n'
  if (a.preturi) {
    if (audienta === 'b2b') {
      const pret = tab === 'revelion' ? a.preturi.revelion : tab === 'prom' ? a.preturi.prom : a.preturi.standard
      const sufix = tab === 'revelion' ? ' (Revelion)' : tab === 'prom' ? ' (Baluri / Prom)' : ''
      t += fmtEur(pret) + ' + TVA' + sufix + '\n'
    } else {
      t += 'de la ' + fmtEur(a.preturi.deLa) + ' + TVA' + '\n'
    }
  }
  t += 'Corporate / Private - la cerere' + '\n' + '\n'
  const ll: string[] = []
  if (lg.persoane) ll.push('- Persoane in deplasare: ' + lg.persoane)
  if (lg.format) ll.push('- Format: ' + lg.format + ' (' + (lg.durata || '45 min') + ')')
  else ll.push('- Durata show: ' + (lg.durata || '45 min'))
  if (lg.leiKm) ll.push('- Transport: ' + lg.leiKm + ' ' + (lg.transportMoneda || 'lei') + '/km + TVA')
  if (lg.bileteAvion) ll.push('- Bilete avion: ' + lg.bileteAvion + ' (distante mari)')
  if (lg.cazare) ll.push('- Cazare: ' + lg.cazare)
  if (lg.diurna) ll.push('- Diurna / masa: ' + lg.diurna)
  if (ll.length) t += '*DETALII LOGISTICE:*' + '\n' + ll.join('\n') + '\n' + '\n'
  t += 'Onorariul nu include transport, cazare si masa.'
  return t
}

function CardArtist({ a, audienta, token, tabInitial }: { a: any, audienta: string, token: string, tabInitial: string }) {
  const [tab, setTab] = useState(tabInitial)
  const [copiat, setCopiat] = useState(false)
  const tier = a.tier ? (TIER_MAP[a.tier] || {label: 'BOOKING ACTIV', color: UI.green, tip: 'Artist activ pe platforma'}) : null

  function log(actiune: string) {
    fetch('/api/share/' + token, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ actiune, artist: a.nume }) }).catch(() => {})
  }
  function schimbaTab(t: string) { setTab(t); log('tap-' + t) }
  function copiaza() {
    navigator.clipboard.writeText(textOferta(a, audienta, tab)).then(() => { setCopiat(true); setTimeout(() => setCopiat(false), 2000) })
    log('copy-' + tab)
  }
  function distribuie() {
    log('share')
    const txt = textOferta(a, audienta, tab)
    if (navigator.share) navigator.share({ text: txt }).catch(() => {})
    else { navigator.clipboard.writeText(txt); setCopiat(true); setTimeout(() => setCopiat(false), 2000) }
  }

  const statCards = a.stats ? [
    { v: a.stats.monthlyListeners, l: 'Ascultatori lunari' },
    { v: a.stats.spotifyFollowers, l: 'Followers Spotify' },
    { v: a.stats.tiktokFollowers, l: 'Followers TikTok' },
    { v: a.stats.instagramFollowers, l: 'Followers Instagram' },
  ].filter(x => x.v > 1000) : []

  const lg = a.logistica || {}
  const logi: [string, string][] = []
  if (lg.persoane) logi.push(['Persoane', String(lg.persoane)])
  if (lg.format) logi.push(['Format', lg.format + ' · ' + (lg.durata || '45 min')])
  else logi.push(['Durata show', String(lg.durata || '45 min')])
  if (lg.leiKm) logi.push(['Transport', lg.leiKm + ' ' + (lg.transportMoneda || 'lei') + '/km'])
  if (lg.bileteAvion) logi.push(['Bilete avion', String(lg.bileteAvion)])
  if (lg.cazare) logi.push(['Cazare', lg.cazare])
  if (lg.diurna) logi.push(['Diurna / masa', String(lg.diurna)])

  const docs: [string, string][] = []
  if (a.epk) docs.push(['Media Kit', a.epk])
  if (a.riderTehnic) docs.push(['Rider tehnic', a.riderTehnic])
  if (a.riderAcomodare) docs.push(['Rider acomodare', a.riderAcomodare])
  if (a.ucmr) docs.push(['UCMR', a.ucmr])

  return (
    <div style={{background:'white', borderRadius:'20px', border:'1px solid '+UI.line, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
      <div style={{display:'flex', gap:'16px', alignItems:'center', padding:'18px 20px 0'}}>
        {a.poza && <img src={a.poza} alt={a.nume} style={{width:'104px', height:'104px', objectFit:'cover', borderRadius:'16px', display:'block', flexShrink:0}} />}
        <div style={{minWidth:0}}>
          <div style={{fontSize:'24px', fontWeight:800, color:UI.ink, letterSpacing:'-0.8px', lineHeight:1.1}}>{a.nume}</div>
          <div style={{display:'flex', alignItems:'center', gap:'8px', marginTop:'6px', flexWrap:'wrap'}}>
            {a.genuri.length > 0 && <span style={{fontSize:'12px', color:UI.sub, fontWeight:600}}>{a.genuri.join(' · ')}</span>}
            {tier && <span title={tier.tip} style={{fontSize:'10px', fontWeight:800, color: tier.color === '#eacda3' ? '#101014' : 'white', background:tier.color, padding:'3px 9px', borderRadius:'6px', letterSpacing:'0.06em', cursor:'help'}}>{tier.label}</span>}
          </div>
        </div>
      </div>
      <div style={{padding:'18px 20px 20px'}}>
        {statCards.length > 0 && (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(118px, 1fr))', gap:'10px', marginBottom:'16px'}}>
            {statCards.map(sc => (
              <div key={sc.l} style={{textAlign:'center', padding:'13px 8px', background:UI.greenSoft, borderRadius:'12px'}}>
                <div style={{fontWeight:800, fontSize:'18px', color:UI.green, letterSpacing:'-0.5px'}}>{formatNum(sc.v)}</div>
                <div style={{fontSize:'9.5px', color:'#78716c', fontWeight:600, marginTop:'4px', textTransform:'uppercase', letterSpacing:'0.04em'}}>{sc.l}</div>
              </div>
            ))}
          </div>
        )}

        {a.preturi && audienta === 'b2b' && (
          <div>
            <div style={{display:'flex', background:UI.bg, borderRadius:'12px', padding:'4px', gap:'4px'}}>
              {Object.entries(TAB_LABEL).map(([k, l]) => (
                <button key={k} onClick={() => schimbaTab(k)}
                  style={{flex:1, padding:'9px 6px', borderRadius:'9px', border:'none', cursor:'pointer', fontFamily:F, fontSize:'12px', fontWeight:700,
                    background: tab === k ? UI.ink : 'transparent', color: tab === k ? 'white' : UI.sub, transition:'all 0.15s'}}>
                  {l}
                </button>
              ))}
            </div>
            <div style={{textAlign:'center', padding:'20px 0 4px'}}>
              <div style={{fontSize:'33px', fontWeight:800, color:UI.ink, letterSpacing:'-1.5px', lineHeight:1}}>
                {fmtEur(tab === 'revelion' ? a.preturi.revelion : tab === 'prom' ? a.preturi.prom : a.preturi.standard)}
              </div>
              <div style={{fontSize:'11px', color:UI.faint, fontWeight:600, marginTop:'8px'}}>Onorariul nu include transport, cazare si masa</div>
            </div>
            <div style={{textAlign:'center', fontSize:'12px', color:UI.faint, fontWeight:600, padding:'10px 0', borderTop:'1px solid '+UI.line, marginTop:'12px'}}>
              Corporate · Private · Festival — <span style={{color:UI.green, fontWeight:700}}>la cerere</span>
            </div>
          </div>
        )}
        {a.preturi && audienta !== 'b2b' && (
          <div style={{textAlign:'center', padding:'12px 0 4px'}}>
            <div style={{fontSize:'13px', color:UI.sub, fontWeight:600}}>Onorariu</div>
            <div style={{fontSize:'31px', fontWeight:800, color:UI.ink, letterSpacing:'-1.5px', marginTop:'4px'}}>de la {fmtEur(a.preturi.deLa)}</div>
            <div style={{fontSize:'11px', color:UI.faint, fontWeight:600, marginTop:'8px'}}>Revelion · Corporate · Private — la cerere</div>
          </div>
        )}
        {!a.preturi && <div style={{textAlign:'center', padding:'14px 0', fontSize:'14px', color:UI.sub, fontWeight:600}}>Onorariu la cerere</div>}

        {logi.length > 0 && (
          <div style={{marginTop:'14px', background:UI.bg, borderRadius:'14px', padding:'14px 16px'}}>
            <div style={{fontSize:'10px', fontWeight:700, color:'#78716c', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px'}}>Detalii logistice</div>
            <div style={{display:'grid', gap:'7px'}}>
              {logi.map(([k, v]) => (
                <div key={k} style={{display:'flex', justifyContent:'space-between', gap:'12px', fontSize:'13px'}}>
                  <span style={{color:UI.sub, fontWeight:600}}>{k}</span>
                  <span style={{color:UI.ink, fontWeight:700, textAlign:'right'}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {docs.length > 0 && (
          <div style={{display:'flex', gap:'8px', flexWrap:'wrap', marginTop:'14px'}}>
            {docs.map(([l, url], i) => (
              <a key={l} href={url} target="_blank" onClick={() => log('doc-' + l.toLowerCase().replace(/ /g, '-'))}
                style={{padding:'10px 15px', background: i === 0 ? UI.ink : 'white', color: i === 0 ? 'white' : UI.ink, border:'1.5px solid '+(i === 0 ? UI.ink : UI.line), borderRadius:'10px', fontSize:'12px', fontWeight:700, textDecoration:'none'}}>
                {l}
              </a>
            ))}
          </div>
        )}

        <a href={'https://wa.me/40751144109?text=' + encodeURIComponent('Buna Bogdan, te contactez despre ' + a.nume + (audienta === 'b2b' && tab !== 'standard' ? ' (' + TAB_LABEL[tab] + ')' : '') + ' - link GIGx')} target="_blank" onClick={() => log('cta-whatsapp')}
          style={{display:'block', textAlign:'center', marginTop:'16px', padding:'13px', background:UI.ink, color:'white', borderRadius:'10px', fontSize:'13px', fontWeight:700, textDecoration:'none'}}>
          Discuta cu Bogdan Nita · cere oferta exacta
        </a>
        <div style={{display:'flex', gap:'8px', marginTop:'8px', paddingTop:'0px'}}>
          <button onClick={copiaza} style={{flex:1, padding:'12px', background: copiat ? '#047857' : UI.green, color:'white', border:'none', borderRadius:'10px', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:F, boxShadow:'0 1px 3px rgba(5,150,105,0.3)', transition:'background 0.15s'}}>{copiat ? '✓ Copiat' : 'Copiaza oferta'}</button>
          <button onClick={distribuie} style={{flex:1, padding:'12px', background:'white', color:UI.ink, border:'1.5px solid '+UI.line, borderRadius:'10px', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:F}}>Trimite mai departe</button>
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
    <div style={{minHeight:'100vh', background:UI.bg, fontFamily:F}}>
      <nav style={{borderBottom:'1px solid '+UI.line, background:'white', height:'56px', display:'flex', alignItems:'center', padding:'0 20px', justifyContent:'space-between', position:'sticky', top:0, zIndex:100}}>
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <img src="/gigx-mark.png" width={24} height={24} alt="" style={{display:'block'}} />
          <span style={{fontSize:'20px', fontWeight:800, letterSpacing:'-0.5px', color:UI.ink}}>GIG<span style={{color:UI.green}}>x</span></span>
        </div>
        {d && <span style={{fontSize:'12px', fontWeight:800, color:'white', background:UI.green, padding:'7px 14px', borderRadius:'20px', boxShadow:'0 1px 3px rgba(5,150,105,0.3)'}}>valabil pana la {new Date(d.expiraLa).toLocaleDateString('ro-RO')}</span>}
      </nav>

      <div style={{maxWidth:'720px', margin:'0 auto', padding:'24px 16px 44px'}}>
        {err && <div style={{background:'white', border:'1px solid '+UI.line, borderRadius:'16px', padding:'32px', textAlign:'center', color:UI.sub, fontSize:'15px', fontWeight:600}}>{err}</div>}
        {!err && !d && <div style={{textAlign:'center', color:UI.faint, fontSize:'14px', padding:'50px'}}>Se incarca...</div>}

        {d && (
          <>
            <div style={{fontSize:'13px', color:UI.sub, marginBottom:'16px'}}>Pregatit pentru <strong style={{color:UI.ink}}>{d.destinatar}</strong></div>
            {d.tip === 'artist' && <CardArtist a={d.artist} audienta={d.audienta} token={token} tabInitial="standard" />}
            {d.tip === 'roster' && (
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'16px'}}>
                {d.artisti.map((a: any) => <CardArtist key={a.nume} a={a} audienta={d.audienta} token={token} tabInitial="standard" />)}
              </div>
            )}
            <a href="/roster" target="_blank" style={{display:'block', textAlign:'center', marginTop:'24px', padding:'12px', background:'white', color:UI.sub, border:'1.5px solid '+UI.line, borderRadius:'11px', fontSize:'11px', fontWeight:800, letterSpacing:'0.08em', textDecoration:'none'}}>
              CATALOG ARTISTI FORWARD
            </a>
            <div style={{fontSize:'11px', color:UI.faint, marginTop:'18px', textAlign:'center', lineHeight:1.6}}>
              Oferta confidentiala pregatita de Forward Agency<br/>Bogdan Nita · bogdan@forward.ro · +40 751 144 109
            </div>
          </>
        )}
      </div>
    </div>
  )
}
