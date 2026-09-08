'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
const F = 'Montserrat,sans-serif'
const UI = { bg:'#f5f5f7', card:'#ffffff', ink:'#1c1917', sub:'#57534e', faint:'#a8a29e', line:'#e7e5e4', green:'#059669', greenSoft:'#f0fdf4', purple:'#7c3aed', amber:'#d97706', red:'#dc2626' }

function dataScurta(x: string | null) { if (!x) return '—'; return new Date(x).toLocaleDateString('ro-RO', { day:'numeric', month:'short' }) }
const ACT_LABEL: Record<string,string> = { 'cta-whatsapp':'WhatsApp', 'cta-disponibilitate':'cerut disponibilitate', 'doc-media-kit':'media kit', 'doc-rider-tehnic':'rider tehnic', 'doc-rider-acomodare':'rider acomodare', 'doc-rider-tehnic-si-ospitalitate':'rider tehnic+ospitalitate', 'doc-ucmr':'UCMR', 'pdf-catalog':'catalog PDF', 'copy-standard':'copiat pret', 'copy-catalog':'copiat catalog', 'calcul-transport':'calcul transport' }

export default function AnalyticsPage() {
  const [authed, setAuthed] = useState(false)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const role = data.session?.user?.user_metadata?.role
      if (data.session && (role === 'oferta_admin' || role === 'oferta_user')) setAuthed(true)
    })
  }, [])
  useEffect(() => { if (authed) load() }, [authed])
  async function tok() { const { data } = await supabase.auth.getSession(); return data.session?.access_token || '' }
  async function load() {
    setLoading(true)
    try {
      const r = await fetch('/api/roster-analytics', { headers: { authorization: 'Bearer ' + await tok() }, cache:'no-store' })
      const d = await r.json()
      if (d.ok) setData(d)
    } catch {}
    setLoading(false)
  }

  if (!authed) return <div style={{minHeight:'100vh', background:UI.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F, color:UI.sub}}>Autentifica-te in pagina de coduri intai.</div>

  const s = data?.sumar
  const maxZi = data ? Math.max(1, ...data.activitate.map((a: any) => a.n)) : 1
  const totMobDesk = s ? (s.mobil + s.desktop) : 0

  const Card = ({ children, style }: any) => <div style={{background:UI.card, borderRadius:'16px', padding:'18px', boxShadow:'0 1px 3px rgba(0,0,0,0.04)', ...style}}>{children}</div>
  const Titlu = ({ children }: any) => <div style={{fontSize:'13px', fontWeight:800, color:UI.ink, marginBottom:'14px'}}>{children}</div>

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(160deg,#eceef2,#e8eaf0 45%,#dde1ea)', fontFamily:F, padding:'20px 16px 60px'}}>
      <div style={{maxWidth:'760px', margin:'0 auto'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', flexWrap:'wrap', gap:'10px'}}>
          <div>
            <div style={{fontSize:'22px', fontWeight:800, color:UI.ink}}>Analytics coduri</div>
            <div style={{fontSize:'13px', color:UI.sub, marginTop:'2px'}}>Ce se deschide, cine e interesat, pe cine sa suni</div>
          </div>
          <Link href="/oferta/coduri" style={{fontSize:'12px', fontWeight:700, color:UI.purple, textDecoration:'none', background:'white', padding:'8px 14px', borderRadius:'10px', border:'1px solid '+UI.line}}>Inapoi la coduri</Link>
        </div>

        {loading && <div style={{textAlign:'center', color:UI.sub, padding:'40px'}}>Se incarca...</div>}

        {s && (
          <>
            {/* SUMAR */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'12px', marginBottom:'16px'}}>
              <Card>
                <div style={{fontSize:'28px', fontWeight:800, color:UI.ink}}>{s.totalVizite.toLocaleString('ro-RO')}</div>
                <div style={{fontSize:'12px', color:UI.sub}}>deschideri total</div>
              </Card>
              <Card>
                <div style={{fontSize:'28px', fontWeight:800, color:UI.green}}>{s.vizite7.toLocaleString('ro-RO')}</div>
                <div style={{fontSize:'12px', color:UI.sub}}>ultimele 7 zile</div>
              </Card>
              <Card>
                <div style={{fontSize:'28px', fontWeight:800, color:UI.ink}}>{totMobDesk ? Math.round(s.mobil/totMobDesk*100) : 0}%</div>
                <div style={{fontSize:'12px', color:UI.sub}}>pe mobil ({s.mobil.toLocaleString('ro-RO')} vs {s.desktop.toLocaleString('ro-RO')} desktop)</div>
              </Card>
              <Card>
                <div style={{fontSize:'28px', fontWeight:800, color:UI.ink}}>{s.coduriActive}<span style={{fontSize:'15px', color:UI.faint}}> / {s.totalCoduri}</span></div>
                <div style={{fontSize:'12px', color:UI.sub}}>coduri active</div>
              </Card>
            </div>

            {/* ACTIVITATE PE ZILE */}
            <Card style={{marginBottom:'16px'}}>
              <Titlu>Activitate ultimele 30 zile</Titlu>
              <div style={{display:'flex', alignItems:'flex-end', gap:'2px', height:'80px'}}>
                {data.activitate.map((a: any) => (
                  <div key={a.data} title={dataScurta(a.data) + ': ' + a.n} style={{flex:1, background:UI.green, opacity:0.25 + 0.75*(a.n/maxZi), height: Math.max(4, a.n/maxZi*80)+'px', borderRadius:'2px 2px 0 0'}} />
                ))}
              </div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'10px', color:UI.faint, marginTop:'6px'}}>
                <span>{data.activitate[0] ? dataScurta(data.activitate[0].data) : ''}</span>
                <span>{data.activitate.length ? dataScurta(data.activitate[data.activitate.length-1].data) : ''}</span>
              </div>
            </Card>

            {/* TOP ARTISTI */}
            <Card style={{marginBottom:'16px'}}>
              <Titlu>Cei mai deschisi artisti</Titlu>
              {data.topArtisti.map((a: any, i: number) => {
                const max = data.topArtisti[0]?.n || 1
                return (
                  <div key={a.nume} style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px'}}>
                    <span style={{fontSize:'12px', color:UI.faint, minWidth:'18px'}}>{i+1}</span>
                    <span style={{fontSize:'13px', color:UI.ink, minWidth:'130px', fontWeight:600}}>{a.nume}</span>
                    <div style={{flex:1, background:UI.bg, borderRadius:'4px', height:'8px', overflow:'hidden'}}>
                      <div style={{background:UI.green, height:'100%', width:(a.n/max*100)+'%'}} />
                    </div>
                    <span style={{fontSize:'12px', color:UI.sub, minWidth:'36px', textAlign:'right'}}>{a.n}</span>
                  </div>
                )
              })}
            </Card>

            {/* SEMNALE DE INTENTIE */}
            <Card style={{marginBottom:'16px'}}>
              <Titlu>Semnale de intentie (au descarcat / cerut ceva)</Titlu>
              {data.semnale.length === 0 && <div style={{fontSize:'12px', color:UI.faint}}>Nimic inca.</div>}
              {data.semnale.map((c: any) => (
                <div key={c.token} style={{padding:'10px 0', borderBottom:'1px solid '+UI.bg}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span style={{fontSize:'13px', fontWeight:700, color:UI.ink}}>{c.destinatar}</span>
                    <code style={{fontSize:'11px', color:UI.sub, background:UI.bg, padding:'2px 6px', borderRadius:'5px'}}>{c.token}</code>
                  </div>
                  <div style={{display:'flex', flexWrap:'wrap', gap:'5px', marginTop:'6px'}}>
                    {c.actiuni.map((x: any) => (
                      <span key={x.a} style={{fontSize:'10px', background:UI.greenSoft, color:UI.green, border:'1px solid #bbf7d0', borderRadius:'5px', padding:'2px 7px', fontWeight:700}}>{ACT_LABEL[x.a] || x.a}{x.n > 1 ? ' ' + x.n + 'x' : ''}</span>
                    ))}
                  </div>
                </div>
              ))}
            </Card>

            {/* CODURI FIERBINTI */}
            <Card style={{marginBottom:'16px'}}>
              <Titlu>Coduri fierbinti (deschise mult, recent) — suna-i</Titlu>
              {data.fierbinti.length === 0 && <div style={{fontSize:'12px', color:UI.faint}}>Niciun cod fierbinte acum.</div>}
              {data.fierbinti.map((c: any) => (
                <div key={c.token} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid '+UI.bg}}>
                  <div>
                    <span style={{fontSize:'13px', fontWeight:700, color:UI.ink}}>{c.destinatar}</span>
                    <span style={{fontSize:'11px', color:UI.faint}}> · {c.scop}</span>
                  </div>
                  <div style={{fontSize:'12px', color:UI.sub}}>
                    <b style={{color:UI.amber}}>{c.vizite} vizite</b> · {dataScurta(c.ultima)}
                  </div>
                </div>
              ))}
            </Card>

            {/* CODURI NEATINSE */}
            <Card>
              <Titlu>Coduri neatinse (trimise, 0 deschideri) — follow-up</Titlu>
              {data.neatinse.length === 0 && <div style={{fontSize:'12px', color:UI.faint}}>Toate codurile active au fost deschise.</div>}
              {data.neatinse.map((c: any) => (
                <div key={c.token} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid '+UI.bg}}>
                  <div>
                    <span style={{fontSize:'13px', fontWeight:700, color:UI.ink}}>{c.destinatar}</span>
                    <span style={{fontSize:'11px', color:UI.faint}}> · {c.scop}</span>
                  </div>
                  <span style={{fontSize:'11px', color:UI.sub}}>trimis {dataScurta(c.created_at)}</span>
                </div>
              ))}
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
