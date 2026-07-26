'use client'
import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { jsPDF } from 'jspdf'
import { deseneazaHeaderForward, deseneazaFooterForward } from '@/lib/pdf-forward'

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
  'A++': {label: 'A++ · Icon', color: '#eacda3', tip: 'Top tier — vinde singur orice eveniment'},
  'Premium': {label: 'A++ · Icon', color: '#eacda3', tip: 'Top tier — vinde singur orice eveniment'},
  'A+': {label: 'A+ · Premium', color: '#7c3aed', tip: 'Tracțiune puternică — vânzări consistente'},
  'A': {label: 'A · Select', color: '#78716c', tip: 'Atracție solidă — fan base loial'},
}
const TAB_LABEL: Record<string, string> = { standard: 'Standard', prom: 'Baluri / Prom' }

function textOferta(a: any, audienta: string, tab: string) {
  const lg = a.logistica || {}
  let t = '*' + a.nume.toUpperCase() + '*' + '\n'
  if (a.preturi) {
    if (audienta === 'b2b') {
      const pret = tab === 'prom' ? a.preturi.prom : a.preturi.standard
      const sufix = tab === 'prom' ? ' (Baluri / Prom)' : ''
      t += fmtEur(pret) + ' + TVA' + sufix + '\n'
    } else {
      t += fmtEur(a.preturi.deLa) + ' + TVA' + '\n'
    }
  }
  t += 'Corporate / Private (la cerere)' + '\n' + '\n'
  const ll: string[] = []
  if (lg.persoane) ll.push('- Persoane in deplasare: ' + lg.persoane)
  if (lg.format) ll.push('- Format: ' + lg.format + ' (' + (lg.durata || '45 min') + ')')
  else ll.push('- Durata show: ' + (lg.durata || '45 min'))
  if (lg.landed) ll.push('- Transport: inclus in onorariu (oriunde in RO)')
  else if (lg.leiKm) ll.push('- Transport: ' + lg.leiKm + ' ' + (lg.transportMoneda || 'lei') + '/km + TVA')
  if (lg.bileteAvion) ll.push('- Bilete avion: ' + lg.bileteAvion + ' (distante mari)')
  if (lg.cazare) ll.push('- Cazare: ' + lg.cazare)
  if (lg.diurna) ll.push('- Diurna / masa: ' + lg.diurna)
  if (ll.length) t += '*DETALII LOGISTICE:*' + '\n' + ll.join('\n') + '\n' + '\n'
  t += lg.landed ? 'Onorariul nu include cazare si masa.' : 'Onorariul nu include transport, cazare si masa.'
  return t
}

function CardArtist({ a, audienta, token, tabInitial, destinatar }: { a: any, audienta: string, token: string, tabInitial: string, destinatar?: string }) {
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
  if (lg.landed) logi.push(['Transport', 'inclus (oriunde in RO)'])
  else if (lg.leiKm) logi.push(['Transport', lg.leiKm + ' ' + (lg.transportMoneda || 'lei') + '/km'])
  if (lg.bileteAvion) logi.push(['Bilete avion', String(lg.bileteAvion)])
  if (lg.cazare) logi.push(['Cazare', lg.cazare])
  if (lg.diurna) logi.push(['Diurna / masa', String(lg.diurna)])

  const docs: [string, string][] = []
  if (a.epk) docs.push(['Media Kit', a.epk])
  if (a.riderTehnic) docs.push(['Rider tehnic', a.riderTehnic])
  if (a.riderAcomodare) docs.push(['Rider acomodare', a.riderAcomodare])
  if (a.ucmr) docs.push(['UCMR', a.ucmr])
  if (docs.length === 0 && a.docs) docs.push(['Documente artist', a.docs])

  return (
    <div style={{background:'white', borderRadius:'20px', border:'1px solid '+UI.line, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
      <div style={{display:'flex', gap:'16px', alignItems:'center', padding:'18px 20px 0'}}>
        {a.poza && <img src={a.poza} alt={a.nume} style={{width:'104px', height:'104px', objectFit:'cover', borderRadius:'16px', display:'block', flexShrink:0}} />}
        <div style={{minWidth:0}}>
          <div style={{fontSize:'24px', fontWeight:800, color:UI.ink, letterSpacing:'-0.8px', lineHeight:1.1}}>{a.nume}</div>
          <div style={{display:'flex', alignItems:'center', gap:'8px', marginTop:'6px', flexWrap:'wrap'}}>
            {a.genuri.length > 0 && <span style={{fontSize:'12px', color:UI.sub, fontWeight:600}}>{a.genuri.join(' · ')}</span>}
            {tier && <span title={tier.tip} style={{fontSize:'10px', fontWeight:800, color: 'white', background:tier.color, padding:'3px 9px', borderRadius:'6px', letterSpacing:'0.06em', cursor:'help'}}>{tier.label}</span>}
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
                {fmtEur(tab === 'prom' ? a.preturi.prom : a.preturi.standard)}
              </div>
              <div style={{fontSize:'11px', color:UI.faint, fontWeight:600, marginTop:'8px'}}>{a.logistica?.landed ? 'Transport inclus · onorariul nu include cazare si masa' : 'Onorariul nu include transport, cazare si masa'}</div>
            </div>
            <div style={{textAlign:'center', fontSize:'12px', color:UI.faint, fontWeight:600, padding:'10px 0', borderTop:'1px solid '+UI.line, marginTop:'12px'}}>
              Corporate · Private · Festival <span style={{color:UI.green, fontWeight:700}}>(la cerere)</span>
            </div>
          </div>
        )}
        {a.preturi && audienta !== 'b2b' && (
          <div style={{textAlign:'center', padding:'12px 0 4px'}}>
            <div style={{fontSize:'13px', color:UI.sub, fontWeight:600}}>Onorariu</div>
            <div style={{fontSize:'31px', fontWeight:800, color:UI.ink, letterSpacing:'-1.5px', marginTop:'4px'}}>de la {fmtEur(a.preturi.deLa)}</div>
            <div style={{fontSize:'11px', color:UI.faint, fontWeight:600, marginTop:'8px'}}>Corporate · Private — la cerere</div>
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

        <a href={'https://wa.me/40751144109?text=' + encodeURIComponent('Buna Bogdan, sunt ' + (destinatar || '') + ', te contactez despre ' + a.nume + (audienta === 'b2b' && tab === 'prom' ? ' (Baluri / Prom)' : '') + ', in localitatea ______, data ______ (link GIGx)')} target="_blank" onClick={() => log('cta-whatsapp')}
          style={{display:'block', textAlign:'center', marginTop:'16px', padding:'13px', background:UI.ink, color:'white', borderRadius:'10px', fontSize:'13px', fontWeight:700, textDecoration:'none'}}>
          Discuta cu Bogdan Nita · verifica disponibilitatea
        </a>
        <div style={{display:'flex', gap:'8px', marginTop:'8px', paddingTop:'0px'}}>
          <button onClick={copiaza} style={{flex:1, padding:'12px', background: copiat ? '#047857' : UI.green, color:'white', border:'none', borderRadius:'10px', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:F, boxShadow:'0 1px 3px rgba(5,150,105,0.3)', transition:'background 0.15s'}}>{copiat ? '✓ Copiat' : 'Copiaza oferta'}</button>
          <button onClick={distribuie} style={{flex:1, padding:'12px', background:'white', color:UI.ink, border:'1.5px solid '+UI.line, borderRadius:'10px', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:F}}>Trimite mai departe</button>
        </div>
      </div>
    </div>
  )
}


function ListaRoster({ artisti, audienta, token }: { artisti: any[], audienta: string, token: string }) {
  const [q, setQ] = useState('')
  const [gen, setGen] = useState('')
  const [deschis, setDeschis] = useState('')
  const [totiDeschisi, setTotiDeschisi] = useState(false)
  const [selectati, setSelectati] = useState<Set<string>>(new Set())
  const [copiat, setCopiat] = useState('')
  const [explT, setExplT] = useState('')

  const genuri = useMemo(() => {
    const gs = new Set<string>()
    for (const a of artisti) for (const g of (a.genuri || [])) gs.add(g)
    return Array.from(gs).sort()
  }, [artisti])

  const filtrati = useMemo(() => {
    let l = artisti
    if (gen) l = l.filter(a => (a.genuri || []).includes(gen))
    if (q.trim()) l = l.filter(a => a.nume.toLowerCase().includes(q.trim().toLowerCase()))
    return l
  }, [artisti, q, gen])

  const tinta = useMemo(() => selectati.size ? filtrati.filter(a => selectati.has(a.nume)) : filtrati, [filtrati, selectati])

  const randuri = useMemo(() => {
    if (gen || q.trim()) return filtrati
    const ordT: Record<string, number> = { 'A++': 0, 'Premium': 0, 'A+': 1, 'A': 2 }
    const ot = (t: string | null) => (t && ordT[t] !== undefined) ? ordT[t] : 3
    const top = filtrati.filter(a => ot(a.tier) === 0).sort((a, b) => ot(a.tier) - ot(b.tier))
    const topSet = new Set(top.map(a => a.nume))
    const grupe: Record<string, any[]> = {}
    for (const a of filtrati) {
      if (topSet.has(a.nume)) continue
      const g = (a.genuri && a.genuri[0]) || 'Alte genuri'
      if (!grupe[g]) grupe[g] = []
      grupe[g].push(a)
    }
    const out: any[] = []
    if (top.length) { out.push({ _h: 'Top artisti', _n: top.length }); out.push(...top) }
    for (const [g, l] of Object.entries(grupe).sort((x, y) => y[1].length - x[1].length)) {
      l.sort((a, b) => ot(a.tier) - ot(b.tier))
      out.push({ _h: g, _n: l.length }); out.push(...l)
    }
    return out
  }, [filtrati, gen, q])

  function log(actiune: string, artist?: string) {
    fetch('/api/share/' + token, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ actiune, artist }) }).catch(() => {})
  }
  function copiazaText(txt: string, cheie: string, actiune: string, artist?: string) {
    navigator.clipboard.writeText(txt).then(() => { setCopiat(cheie); setTimeout(() => setCopiat(''), 2000) })
    log(actiune, artist)
  }
  async function descarcaPdf() {
    log(gen ? 'pdf-catalog-' + gen : 'pdf-catalog')
    const noDia = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    let logo: string | null = null
    try {
      const r = await fetch('/forward-logo.png')
      const b = await r.blob()
      logo = await new Promise<string>((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result)); fr.onerror = rej; fr.readAsDataURL(b) })
    } catch {}
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const W = 210, M = 16
    deseneazaHeaderForward(doc, W, M, logo)
    let y = 52
    doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.setTextColor(28,25,23)
    doc.text(noDia(gen ? 'ROSTER FORWARD - ' + gen.toUpperCase() : 'ROSTER FORWARD'), M, y)
    y += 9
    // grupez pe genul principal
    const grupe: Record<string, any[]> = {}
    for (const a of tinta) {
      const g = (a.genuri && a.genuri[0]) || 'Alte genuri'
      if (!grupe[g]) grupe[g] = []
      grupe[g].push(a)
    }
    for (const [g, lista] of Object.entries(grupe)) {
      if (y > 200) { deseneazaFooterForward(doc, W, M); doc.addPage(); deseneazaHeaderForward(doc, W, M, logo); y = 52 }
      if (!gen) {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(120,113,108)
        doc.text(noDia(g.toUpperCase()), M, y)
        y += 6
      }
      for (const a of lista) {
        if (y > 210) { deseneazaFooterForward(doc, W, M); doc.addPage(); deseneazaHeaderForward(doc, W, M, logo); y = 52 }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5); doc.setTextColor(28,25,23)
        doc.text(noDia(a.nume.toUpperCase()), M, y)
        if (a.preturi) {
          const pretTxt = audienta === 'b2b'
            ? a.preturi.standard.toLocaleString('ro-RO') + ' EUR + TVA'
            : a.preturi.deLa.toLocaleString('ro-RO') + ' EUR + TVA'
          doc.setFontSize(11.5)
          doc.text(noDia(pretTxt), W - M, y, { align: 'right' })
        }
        y += 5.5
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(90,90,90)
        if (a.preturi && audienta === 'b2b') {
          doc.text(noDia('Corporate / Private / Festival (la cerere)'), M, y)
          y += 5
        }
        const lg = a.logistica || {}
        const li: string[] = []
        if (lg.persoane) li.push('Persoane: ' + lg.persoane)
        li.push('Show: ' + (lg.durata || '45 min'))
        if (lg.landed) li.push('Transport: inclus (oriunde in RO)')
        else if (lg.leiKm) li.push('Transport: ' + lg.leiKm + ' ' + (lg.transportMoneda || 'lei') + '/km + TVA')
        if (lg.bileteAvion) li.push('Bilete avion: ' + lg.bileteAvion)
        if (lg.cazare) li.push('Cazare: ' + lg.cazare)
        doc.setTextColor(140,140,140)
        doc.text(noDia(li.join('  ·  ')), M, y)
        y += 14
      }
      y += 8
    }
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(140,140,140)
    if (y > 220) { deseneazaFooterForward(doc, W, M); doc.addPage(); deseneazaHeaderForward(doc, W, M, logo); y = 52 }
    doc.text(noDia('Onorariile nu includ cazare si masa; transportul conform detaliilor per artist. Oferta confidentiala.'), M, y)
    deseneazaFooterForward(doc, W, M)
    doc.save(gen ? 'roster-forward-' + gen.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.pdf' : 'roster-forward.pdf')
  }

  function copiazaCatalog() {
    const titlu = gen ? '*ROSTER FORWARD - ' + gen.toUpperCase() + '*' : '*ROSTER FORWARD*'
    const txt = titlu + String.fromCharCode(10) + String.fromCharCode(10) + tinta.map(a => textOferta(a, audienta, 'standard')).join(String.fromCharCode(10) + String.fromCharCode(10) + '----------' + String.fromCharCode(10) + String.fromCharCode(10))
    copiazaText(txt, 'catalog', gen ? 'copy-catalog-' + gen : 'copy-catalog')
  }

  const chip = (activ: boolean): any => ({
    padding:'8px 14px', borderRadius:'18px', border:'1.5px solid '+(activ ? UI.ink : UI.line), cursor:'pointer',
    fontFamily:F, fontSize:'12px', fontWeight:700, background: activ ? UI.ink : 'white', color: activ ? 'white' : UI.sub, whiteSpace:'nowrap', flexShrink:0,
  })

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', gap:'14px', padding:'10px 14px', background:'#101014', borderRadius:'12px', overflowX:'auto', WebkitOverflowScrolling:'touch', whiteSpace:'nowrap', marginBottom:'12px', position:'sticky', top:'62px', zIndex:80}}>
        <span style={{fontSize:'10px', color:'#78716c', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', flexShrink:0}}>Tier</span>
        <span className="tier-legend-item" style={{fontSize:'11px', color:'#d6d3d1', fontWeight:600, display:'flex', alignItems:'center', gap:'6px', position:'relative', cursor:'help', flexShrink:0}}>
          <span style={{background:'#eacda3', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', color:'white', cursor:'pointer'}} onClick={() => setExplT(explT === 'Top tier — vinde singur orice eveniment' ? '' : 'Top tier — vinde singur orice eveniment')}>A++ · Icon</span>
          <span>10.000€+</span>
          <span className="tier-legend-tooltip">Top tier — vinde singur orice eveniment</span>
        </span>
        <span className="tier-legend-item" style={{fontSize:'11px', color:'#d6d3d1', fontWeight:600, display:'flex', alignItems:'center', gap:'6px', position:'relative', cursor:'help', flexShrink:0}}>
          <span style={{background:'#7c3aed', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', color:'white', cursor:'pointer'}} onClick={() => setExplT(explT === 'Tracțiune puternică — vânzări consistente' ? '' : 'Tracțiune puternică — vânzări consistente')}>A+ · Premium</span>
          <span>5.000–10.000€</span>
          <span className="tier-legend-tooltip">Tracțiune puternică — vânzări consistente</span>
        </span>
        <span className="tier-legend-item" style={{fontSize:'11px', color:'#d6d3d1', fontWeight:600, display:'flex', alignItems:'center', gap:'6px', position:'relative', cursor:'help', flexShrink:0}}>
          <span style={{background:'#78716c', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'6px', color:'white', cursor:'pointer'}} onClick={() => setExplT(explT === 'Atracție solidă — fan base loial' ? '' : 'Atracție solidă — fan base loial')}>A · Select</span>
          <span>până la 5.000€</span>
          <span className="tier-legend-tooltip">Atracție solidă — fan base loial</span>
        </span>
      </div>
      {explT && <div style={{marginBottom:'10px', padding:'10px 14px', background:'white', border:'1px solid #e7e5e4', borderRadius:'11px', fontSize:'12px', color:'#57534e', fontWeight:600}}>{explT}</div>}
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cauta artist..."
        style={{width:'100%', boxSizing:'border-box', padding:'12px 16px', borderRadius:'12px', border:'1.5px solid '+UI.line, fontSize:'14px', fontFamily:F, outline:'none', background:'white', marginBottom:'10px'}} />
      <div style={{display:'flex', gap:'8px', overflowX:'auto', WebkitOverflowScrolling:'touch', paddingBottom:'6px', marginBottom:'10px'}}>
        <button onClick={() => setGen('')} style={chip(!gen)}>Toti</button>
        {genuri.map(g => <button key={g} onClick={() => setGen(gen === g ? '' : g)} style={chip(gen === g)}>{g}</button>)}
      </div>
      <div style={{display:'flex', gap:'8px', marginBottom:'14px'}}>
      <button onClick={copiazaCatalog}
        style={{flex:2, padding:'13px', background: copiat === 'catalog' ? '#047857' : UI.ink, color:'white', border:'none', borderRadius:'11px', fontSize:'13px', fontWeight:800, cursor:'pointer', fontFamily:F, transition:'background 0.15s'}}>
        {copiat === 'catalog' ? '✓ Copiat - gata de trimis' : (selectati.size ? 'Copiaza selectia (' + selectati.size + ')' : (gen ? 'Copiaza oferta ' + gen : 'Copiaza tot catalogul'))}
      </button>
      <button onClick={descarcaPdf}
        style={{flex:1, padding:'13px', background:'white', color:UI.ink, border:'1.5px solid '+UI.line, borderRadius:'11px', fontSize:'13px', fontWeight:800, cursor:'pointer', fontFamily:F}}>
        PDF
      </button>
      </div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px', marginBottom:'10px'}}>
        <label style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', fontWeight:700, color:UI.sub, cursor:'pointer'}}>
          <input type="checkbox" checked={filtrati.length > 0 && filtrati.every(a => selectati.has(a.nume))}
            onChange={ev => setSelectati(ev.target.checked ? new Set(filtrati.map(a => a.nume)) : new Set())}
            style={{width:'17px', height:'17px', accentColor:'#059669', cursor:'pointer'}} />
          Selecteaza tot{selectati.size > 0 ? ' · ' + selectati.size + ' selectati' : ''}
        </label>
        <button onClick={() => { setTotiDeschisi(!totiDeschisi); setDeschis(''); if (!totiDeschisi) log('expand-all') }}
          style={{padding:'9px 14px', background:UI.ink, color:'white', border:'none', borderRadius:'9px', fontSize:'11px', fontWeight:800, cursor:'pointer', fontFamily:F, whiteSpace:'nowrap'}}>
          {totiDeschisi ? 'Ascunde detaliile' : 'Vezi toate detaliile'}
        </button>
      </div>
      {selectati.size > 0 && (
        <div style={{position:'fixed', bottom:0, left:0, right:0, zIndex:300, padding:'12px 16px calc(12px + env(safe-area-inset-bottom))', background:'rgba(255,255,255,0.96)', backdropFilter:'blur(10px)', borderTop:'1px solid '+UI.line}}>
          <a href={'https://wa.me/40751144109?text=' + encodeURIComponent('Buna Bogdan, te rog disponibilitatea pentru: ' + Array.from(selectati).join(', ') + ', in localitatea ______, data ______')} target="_blank" onClick={() => log('cta-disponibilitate')}
            style={{display:'block', maxWidth:'688px', margin:'0 auto', textAlign:'center', padding:'14px', background:UI.green, color:'white', borderRadius:'12px', fontSize:'13.5px', fontWeight:800, textDecoration:'none', boxShadow:'0 4px 16px rgba(5,150,105,0.35)'}}>
            Cere disponibilitate pe WhatsApp ({selectati.size} selectati)
          </a>
        </div>
      )}

      <div style={{background:'white', border:'1px solid '+UI.line, borderRadius:'16px', overflow:'hidden', marginBottom: selectati.size > 0 ? '90px' : '0'}}>
        {randuri.map((item: any, i: number) => {
          if (item._h) return (
            <div key={'h-' + item._h} style={{padding:'10px 14px', background:'#f5f5f7', borderTop: i > 0 ? '1px solid #f0f0ef' : 'none', fontSize:'11px', fontWeight:800, color:UI.sub, textTransform:'uppercase', letterSpacing:'0.08em'}}>{item._h} <span style={{color:UI.faint}}>· {item._n}</span></div>
          )
          const a = item
          const tier = a.tier ? (TIER_MAP[a.tier] || null) : null
          const e = totiDeschisi || deschis === a.nume
          const lg = a.logistica || {}
          const docs: [string, string][] = []
          if (a.epk) docs.push(['Media Kit', a.epk])
          if (a.riderTehnic) docs.push(['Rider tehnic', a.riderTehnic])
          if (a.riderAcomodare) docs.push(['Rider acomodare', a.riderAcomodare])
          if (a.ucmr) docs.push(['UCMR', a.ucmr])
          if (docs.length === 0 && a.docs) docs.push(['Documente artist', a.docs])
          return (
            <div key={a.nume} style={{borderTop: i > 0 ? '1px solid #f0f0ef' : 'none'}}>
              <div onClick={() => { const nou = e ? '' : a.nume; setDeschis(nou); if (nou) log('expand', a.nume) }}
                style={{display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', cursor:'pointer', background: e ? '#fafaf9' : 'white'}}>
                <input type="checkbox" checked={selectati.has(a.nume)}
                  onClick={ev => ev.stopPropagation()}
                  onChange={() => { const n = new Set(selectati); if (n.has(a.nume)) n.delete(a.nume); else n.add(a.nume); setSelectati(n) }}
                  style={{width:'17px', height:'17px', accentColor:'#059669', cursor:'pointer', flexShrink:0}} />
                {a.poza
                  ? <img src={a.poza} alt="" width={44} height={44} style={{width:'44px', height:'44px', objectFit:'cover', borderRadius:'10px', flexShrink:0}} />
                  : <div style={{width:'44px', height:'44px', borderRadius:'10px', background:UI.bg, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:UI.faint, flexShrink:0}}>{a.nume.charAt(0)}</div>}
                <div style={{minWidth:0, flex:1}}>
                  <div style={{fontSize:'14px', fontWeight:800, color:UI.ink, letterSpacing:'-0.2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{a.nume}</div>
                  {tier && <span style={{fontSize:'8.5px', fontWeight:800, color: 'white', background:tier.color, padding:'2px 6px', borderRadius:'4px', letterSpacing:'0.05em'}}>{tier.label}</span>}
                </div>
                <div style={{textAlign:'right', flexShrink:0}}>
                  {a.preturi
                    ? <div style={{fontSize:'clamp(13.5px, 3.8vw, 16px)', fontWeight:800, color:UI.ink, letterSpacing:'-0.5px'}}>{fmtEur(audienta === 'b2b' ? a.preturi.standard : a.preturi.deLa)}<span style={{fontSize:'10px', color:UI.faint, fontWeight:700}}> +TVA</span></div>
                    : <div style={{fontSize:'12px', fontWeight:700, color:UI.faint}}>la cerere</div>}
                  <div style={{fontSize:'10px', color:UI.green, fontWeight:800}}>{e ? 'închide ▲' : 'detalii ▼'}</div>
                </div>
              </div>
              {e && (
                <div style={{padding:'4px 14px 16px', background:'#fafaf9'}}>
                  {a.preturi && audienta === 'b2b' && (
                    <div style={{display:'grid', gap:'5px', fontSize:'13px', marginBottom:'12px'}}>
                      <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:UI.sub, fontWeight:600}}>Corporate · Private · Festival</span><span style={{color:UI.green, fontWeight:700}}>(la cerere)</span></div>
                    </div>
                  )}
                  <div style={{display:'grid', gap:'4px', fontSize:'12px', color:UI.sub, marginBottom: docs.length ? '12px' : '0'}}>
                    {lg.persoane && <div>Persoane: <strong style={{color:UI.ink}}>{lg.persoane}</strong></div>}
                    <div>Durata show: <strong style={{color:UI.ink}}>{lg.durata || '45 min'}</strong></div>
                    {lg.landed ? <div>Transport: <strong style={{color:UI.green}}>inclus in onorariu (oriunde in RO)</strong></div> : lg.leiKm ? <div>Transport: <strong style={{color:UI.ink}}>{lg.leiKm} {lg.transportMoneda || 'lei'}/km +TVA</strong></div> : null}
                    {lg.bileteAvion && <div>Bilete avion: <strong style={{color:UI.ink}}>{lg.bileteAvion}</strong></div>}
                    {lg.cazare && <div>Cazare: <strong style={{color:UI.ink}}>{lg.cazare}</strong></div>}
                    {lg.diurna && <div>Diurna / masa: <strong style={{color:UI.ink}}>{lg.diurna}</strong></div>}
                  </div>
                  {docs.length > 0 && (
                    <div style={{display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'12px'}}>
                      {docs.map(([l, url]) => (
                        <a key={l} href={url} target="_blank" onClick={() => log('doc-' + l.toLowerCase().replace(/ /g, '-'), a.nume)}
                          style={{padding:'8px 12px', background:'white', color:UI.ink, border:'1.5px solid '+UI.line, borderRadius:'9px', fontSize:'11px', fontWeight:700, textDecoration:'none'}}>{l}</a>
                      ))}
                    </div>
                  )}
                  <div style={{display:'flex', gap:'8px'}}>
                    <button onClick={() => copiazaText(textOferta(a, audienta, 'standard'), a.nume, 'copy-standard', a.nume)}
                      style={{flex:1, padding:'10px', background: copiat === a.nume ? '#047857' : UI.green, color:'white', border:'none', borderRadius:'9px', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:F, transition:'background 0.15s'}}>
                      {copiat === a.nume ? '✓ Copiat' : 'Copiaza oferta'}
                    </button>
                    <button onClick={() => { log('share', a.nume); const t = textOferta(a, audienta, 'standard'); if (navigator.share) navigator.share({ text: t }).catch(() => {}); else copiazaText(t, a.nume, 'copy-standard', a.nume) }}
                      style={{flex:1, padding:'10px', background:'white', color:UI.ink, border:'1.5px solid '+UI.line, borderRadius:'9px', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:F}}>
                      Trimite mai departe
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ShareView() {
  const params = useParams()
  const token = String(params.token || '')
  const [d, setD] = useState<any>(null)
  const [err, setErr] = useState('')
  const [acum, setAcum] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setAcum(Date.now()), 1000); return () => clearInterval(t) }, [])

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
        {d && (() => {
          const ms = new Date(d.expiraLa).getTime() - acum
          const p2 = (n: number) => String(n).padStart(2, '0')
          const ceas = p2(Math.floor((ms%86400000)/3600000)) + ':' + p2(Math.floor((ms%3600000)/60000)) + ':' + p2(Math.floor((ms%60000)/1000))
          const ramasTimp = ms <= 0 ? 'expirat' : ms < 86400000 ? ceas : Math.floor(ms/86400000) + 'z ' + ceas
          return <span style={{fontSize:'12px', fontWeight:800, color:'white', background: ms < 86400000 ? '#d97706' : UI.green, padding:'7px 14px', borderRadius:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.15)', whiteSpace:'nowrap', fontVariantNumeric:'tabular-nums'}}>valabil inca {ramasTimp}</span>
        })()}
      </nav>

      <div style={{maxWidth:'720px', margin:'0 auto', padding:'24px 16px 44px'}}>
        {err && (
          <div style={{background:'#101014', borderRadius:'18px', padding:'36px 24px', textAlign:'center'}}>
            <div style={{fontSize:'17px', fontWeight:800, color:'#F5F2EC', letterSpacing:'-0.3px'}}>{err.includes('expirat') ? 'Acest acces a expirat' : 'Link indisponibil'}</div>
            <div style={{fontSize:'13px', color:'#a8a29e', fontWeight:500, marginTop:'8px', lineHeight:1.5}}>{err.includes('expirat') ? 'Ofertele Forward se actualizeaza constant - cere un cod nou si primesti lista la zi.' : err}</div>
            <a href={'https://wa.me/40751144109?text=' + encodeURIComponent('Buna Bogdan, codul meu de acces la rosterul Forward a expirat - te rog unul nou')} target="_blank"
              style={{display:'inline-block', marginTop:'18px', padding:'12px 24px', background:UI.green, color:'white', borderRadius:'11px', fontSize:'13px', fontWeight:800, textDecoration:'none'}}>
              Cere un cod nou pe WhatsApp
            </a>
            <a href="/rosterfwd" style={{display:'block', marginTop:'10px', color:'#a8a29e', fontSize:'12px', fontWeight:700, textDecoration:'underline'}}>
              Am alt cod de acces
            </a>
          </div>
        )}
        {!err && !d && <div style={{textAlign:'center', color:UI.faint, fontSize:'14px', padding:'50px'}}>Se incarca...</div>}

        {d && (
          <>
            <div style={{fontSize:'13px', color:UI.sub, marginBottom:'16px'}}>Pregatit pentru <strong style={{color:UI.ink}}>{d.destinatar}</strong></div>
            {d.tip === 'artist' && <CardArtist a={d.artist} audienta={d.audienta} token={token} tabInitial="standard" destinatar={d.destinatar} />}
            {d.tip === 'roster' && <ListaRoster artisti={d.artisti} audienta={d.audienta} token={token} />}
            {d.audienta !== 'b2b' && (
            <a href="/roster" target="_blank" style={{display:'block', textAlign:'center', marginTop:'24px', padding:'12px', background:'white', color:UI.sub, border:'1.5px solid '+UI.line, borderRadius:'11px', fontSize:'11px', fontWeight:800, letterSpacing:'0.08em', textDecoration:'none'}}>
              CATALOG ARTISTI FORWARD
            </a>
            )}
            <div style={{fontSize:'11px', color:UI.faint, marginTop:'18px', textAlign:'center', lineHeight:1.6}}>
              Oferta confidentiala pregatita de Forward Agency<br/>Bogdan Nita · bogdan@forward.ro · +40 751 144 109
            </div>
          </>
        )}
      </div>
    </div>
  )
}
