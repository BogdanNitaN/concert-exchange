'use client'

import { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import DatePicker from '@/components/modules/shared/DatePicker'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { UserPlus, Users, History, LogOut, Copy, MessageCircle, Mail, FileDown, Calendar } from 'lucide-react'

const F = 'Montserrat,sans-serif'
// Design tokens premium
const UI = {
  bg: '#f5f5f7',
  card: '#ffffff',
  ink: '#1c1917',
  sub: '#57534e',
  faint: '#a8a29e',
  line: '#e7e5e4',
  lineStrong: '#e7e5e4',
  green: '#059669',
  greenSoft: '#f0fdf4',
  greenLine: '#d1fae5',
  purple: '#7c3aed',
  purpleSoft: '#faf5ff',
  gold: '#eacda3',
  neon: '#059669',
  violet: '#7c3aed',
  navy: '#1c1917',
  ok: '#059669',
  okSoft: '#f0fdf4',
  attention: '#7c3aed',
  attentionSoft: '#faf5ff',
  dark: '#1c1917',
  charcoal: '#292524',
  radius: '16px',
  radiusSm: '12px',
  shadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)',
  shadowHover: '0 8px 30px rgba(0,0,0,0.12)',
  shadowBtn: '0 8px 30px rgba(0,0,0,0.18)',
  shadowNeon: '0 8px 30px rgba(0,0,0,0.18)',
  glass: 'rgba(255,255,255,0.18)',
  glassStrong: 'rgba(255,255,255,0.28)',
  glassBorder: '1px solid rgba(255,255,255,0.35)',
  glassShadow: '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.4)',
  glassBlur: 'blur(16px)',
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
  nume: string
  fee_standard: number
  lei_km: number
  cazare: string
  nr_persoane: number
  bilete_avion: number
  alcool_default: number
  categorie: string
  tip?: string
  set_type?: string
  durata_default?: string
  diurna_fixa?: number | null
  cazare_fixa?: number | null
  transport_moneda?: string
  formate?: Format[] | null
}

// un artist adaugat in deviz, cu setarile lui
interface Linie {
  key: string
  artist: Artist
  formatSelectat: string
  durata: string
  tipPret: string
  feeLista: number
  fee: number
  leiKm: number
  useMarja: boolean
  cazare: string
  persoane: number
  bileteAvion: number
  restulRutier: boolean
  tipMasa: 'diurna' | 'alacarte'
  zile: number
  diurnaPerPers: number
  diurnaFixa: number
  cazareFixa: number
  useAlcool: boolean
  alcool: number
  useCag: boolean
  cagProcent: number
  cagSuma: number
  cagMod: 'procent' | 'suma'
  includeExport: boolean
}

const LUNI = ['ianuarie','februarie','martie','aprilie','mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie']
function formatData(v: string): string {
  if (!v) return ''
  // acccepta YYYY-MM-DD sau DD.MM.YYYY
  let d: Date | null = null
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) d = new Date(v)
  else if (/^\d{2}\.\d{2}\.\d{4}/.test(v)) { const [zi,lu,an] = v.split('.'); d = new Date(+an, +lu-1, +zi) }
  if (!d || isNaN(d.getTime())) return v
  return d.getDate() + ' ' + LUNI[d.getMonth()] + ' ' + d.getFullYear()
}

function useIsMobile() {
  const [m, setM] = useState(false)
  useEffect(() => {
    const check = () => setM(window.innerWidth < 640)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return m
}

export default function OfertaPage() {
  const isMobile = useIsMobile()
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [userRole, setUserRole] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [resetMsg, setResetMsg] = useState('')

  async function faLogin() {
    setLoggingIn(true); setLoginErr('')
    const mapRes = await fetch('/api/oferta-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: loginEmail.trim() }) })
    const mapData = await mapRes.json()
    const emailReal = mapData.email
    if (!emailReal) { setLoginErr('Utilizator inexistent'); setLoggingIn(false); return }
    if (mapData.blocat) { setLoginErr('Cont blocat. Contacteaza administratorul.'); setLoggingIn(false); return }
    const { data, error } = await supabase.auth.signInWithPassword({ email: emailReal, password: loginPass })
    if (error) { setLoginErr('Utilizator sau parola gresita'); setLoggingIn(false); return }
    const role = data.user?.user_metadata?.role
    const blocat = data.user?.user_metadata?.blocat
    if (blocat) { setLoginErr('Cont blocat. Contacteaza administratorul.'); await supabase.auth.signOut(); setLoggingIn(false); return }
    if (role === 'oferta_admin' || role === 'oferta_user') { setAuthed(true); setUserRole(role) }
    else { setLoginErr('Nu ai acces la aceasta sectiune'); await supabase.auth.signOut() }
    setLoggingIn(false)
  }

  async function faLogout() {
    await supabase.auth.signOut()
    setAuthed(false)
    setLoginEmail(''); setLoginPass('')
  }

  async function faReset() {
    if (!loginEmail.trim()) { setLoginErr('Introdu email-ul pentru resetare'); return }
    const { error } = await supabase.auth.resetPasswordForEmail(loginEmail.trim(), { redirectTo: window.location.origin + '/oferta' })
    if (error) setLoginErr('Eroare la trimiterea email-ului')
    else setResetMsg('Ti-am trimis un email cu link de resetare.')
  }
  const [artists, setArtists] = useState<Artist[]>([])
  const [search, setSearch] = useState('')
  const [linii, setLinii] = useState<Linie[]>([])

  const [fromCity, setFromCity] = useState('Bucuresti')
  const [toCity, setToCity] = useState('')
  const [citySuggestions, setCitySuggestions] = useState<{description: string}[]>([])
  const [showCitySugg, setShowCitySugg] = useState(false)
  const [locatie, setLocatie] = useState('')
  const [dataEveniment, setDataEveniment] = useState('')
  const [numeClient, setNumeClient] = useState('')
  const [km, setKm] = useState<number | null>(null)
  const [loadingKm, setLoadingKm] = useState(false)
  const [eurRate, setEurRate] = useState<number | null>(null)
  const [toast, setToast] = useState<string>('')
  const [useAdaos, setUseAdaos] = useState(false)
  const [destinatar, setDestinatar] = useState<'' | 'client' | 'intermediar'>('')
  const [institutiePublica, setInstitutiePublica] = useState(false)
  const [codOferta, setCodOferta] = useState(() => 'GIGX-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random()*9000)+1000))
  const [adaosProcent, setAdaosProcent] = useState(1)
  const [showAddArtist, setShowAddArtist] = useState(false)
  const [newArtist, setNewArtist] = useState<any>({ nume: '', categorie: 'pop', tip: 'propriu', durata: '40 min', fee: '', leiKm: '', transportMoneda: 'lei', cazare: '', bileteAvion: '', alcool: '', diurnaFixa: '', variante: [] as {nume:string,fee:string,durata:string}[] })
  const [savingArtist, setSavingArtist] = useState(false)

  useEffect(() => {
    // verific sesiunea Supabase
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      const role = user?.user_metadata?.role
      const blocat = user?.user_metadata?.blocat
      if (user && (role === 'oferta_admin' || role === 'oferta_user') && !blocat) {
        setAuthed(true)
        setUserRole(role)
      } else if (user && blocat) {
        supabase.auth.signOut()
        setAuthed(false)
      }
      setCheckingAuth(false)
    })
  }, [])

  useEffect(() => {
    if (!authed) return
    fetch('/api/oferta-artist').then(r => r.json()).then(d => {
      const arts = d.artists || []
      setArtists(arts)
      // verific daca vine o oferta de editat din istoric
      try {
        const raw = localStorage.getItem('oferta_edit')
        if (raw) {
          const o = JSON.parse(raw)
          localStorage.removeItem('oferta_edit')
          if (o.cod) setCodOferta(o.cod)
          if (o.client) setNumeClient(o.client)
          if (o.oras) setToCity(o.oras)
          if (o.locatie) setLocatie(o.locatie)
          if (o.data_eveniment) setDataEveniment(o.data_eveniment)
          if (o.from_city) setFromCity(o.from_city)
          if (o.destinatar) setDestinatar(o.destinatar)
          if (o.institutie_publica) setInstitutiePublica(o.institutie_publica)
          if (o.use_adaos) setUseAdaos(o.use_adaos)
          // reconstruiesc liniile
          if (o.linii_complete && Array.isArray(o.linii_complete)) {
            const noiLinii = o.linii_complete.map((lc: any, i: number) => {
              const art = arts.find((a: Artist) => a.nume === lc.artistNume) || { nume: lc.artistNume, fee_standard: lc.fee, lei_km: lc.leiKm, cazare: lc.cazare, nr_persoane: lc.persoane, bilete_avion: lc.bileteAvion, alcool_default: 0, categorie: '', tip: lc.tip }
              return {
                key: lc.artistNume + '-' + Date.now() + '-' + i,
                artist: art, formatSelectat: lc.formatSelectat || '', durata: lc.durata || '',
                tipPret: lc.tipPret, feeLista: lc.feeLista, fee: lc.fee, leiKm: lc.leiKm,
                useMarja: lc.useMarja, cazare: lc.cazare, persoane: lc.persoane, bileteAvion: lc.bileteAvion,
                tipMasa: lc.tipMasa, zile: lc.zile, diurnaPerPers: lc.diurnaPerPers, diurnaFixa: lc.diurnaFixa || 0, cazareFixa: lc.cazareFixa || 0,
                useAlcool: lc.useAlcool, alcool: lc.alcool,
                useCag: lc.useCag, cagProcent: lc.cagProcent, cagSuma: lc.cagSuma, cagMod: lc.cagMod,
                includeExport: true,
              }
            })
            setLinii(noiLinii)
          }
        }
      } catch {}
    })
    fetch('/api/bnr-rate').then(r => r.json()).then(d => { if (d?.rate) setEurRate(d.rate) })
  }, [authed])

  function addVariantaNou() {
    setNewArtist((prev: any) => ({ ...prev, variante: [...(prev.variante || []), { nume: '', fee: '', durata: '' }] }))
  }
  function updVariantaNou(i: number, patch: any) {
    setNewArtist((prev: any) => { const v = [...(prev.variante || [])]; v[i] = { ...v[i], ...patch }; return { ...prev, variante: v } })
  }
  function delVariantaNou(i: number) {
    setNewArtist((prev: any) => ({ ...prev, variante: (prev.variante || []).filter((_: any, j: number) => j !== i) }))
  }
  async function salveazaArtistNou() {
    if (!newArtist.nume.trim()) { alert('Completează numele'); return }
    // verific conflict: exista deja artist cu acest nume?
    const existent = artists.find(a => a.nume.toLowerCase().trim() === newArtist.nume.toLowerCase().trim())
    if (existent) {
      const ok = confirm('Artistul "' + existent.nume + '" există deja în bază.\n\nVrei să actualizezi datele lui cu cele introduse acum?')
      if (!ok) return
    }
    setSavingArtist(true)
    try {
      const r = await fetch('/api/oferta-add-artist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newArtist) })
      const d = await r.json()
      if (d.ok) {
        // reincarc lista artisti
        const ar = await fetch('/api/oferta-artist').then(x => x.json())
        setArtists(ar.artists || [])
        setShowAddArtist(false)
        setNewArtist({ nume: '', categorie: 'pop', tip: 'propriu', durata: '40 min', fee: '', leiKm: '', transportMoneda: 'lei', cazare: '', bileteAvion: '', alcool: '', diurnaFixa: '', variante: [] })
        arataToast('Artist salvat')
      } else alert('Eroare: ' + (d.error || 'necunoscuta'))
    } catch { alert('Eroare la salvare') }
    setSavingArtist(false)
  }

  async function cautaOras(input: string) {
    setToCity(input)
    if (input.trim().length < 2) { setCitySuggestions([]); setShowCitySugg(false); return }
    try {
      const r = await fetch('/api/places?input=' + encodeURIComponent(input) + '&type=cities')
      const d = await r.json()
      const preds = (d.predictions || []).map((p: any) => ({ description: p.description }))
      setCitySuggestions(preds)
      setShowCitySugg(preds.length > 0)
    } catch { setCitySuggestions([]) }
  }

  function alegeOras(desc: string) {
    // iau doar orasul (inainte de prima virgula)
    const oras = desc.split(',')[0].trim()
    setToCity(oras)
    setCitySuggestions([])
    setShowCitySugg(false)
  }

  function getDurationOptions(setType?: string): string[] {
    if (setType === 'dj') return ['90 min', '120 min', '180 min', 'manual']
    if (setType === 'vocal') return ['40 min', '60 min', '90 min', 'manual']
    if (setType === 'band' || setType === 'cover') return ['40 min', '40 x2', '40 x3', '60 min', '90 min', 'manual']
    if (setType === 'show') return ['15 min', '20 min', '30 min', '45 min', 'manual']
    if (setType === 'instrument') return ['30 min', '40 min', '60 min', '90 min', '120 min', 'manual']
    if (setType === 'mc') return ['1 ora', '2 ore', '3 ore', '4 ore', 'manual']
    return ['40 min', '40 x2', '40 x3', '60 min', '90 min', 'manual']
  }

  function addArtist(a: Artist) {
    const fmt = (a.formate && a.formate.length > 0) ? a.formate[0] : null
    setLinii(prev => [...prev, {
      key: a.nume + '-' + Date.now(),
      artist: a,
      formatSelectat: fmt ? fmt.nume : '',
      durata: (fmt && fmt.durata) ? fmt.durata : (a.durata_default || '40 min'),
      tipPret: 'Standard',
      feeLista: fmt ? fmt.fee : a.fee_standard,
      fee: fmt ? fmt.fee : a.fee_standard,
      leiKm: fmt ? fmt.leiKm : a.lei_km,
      useMarja: true,
      cazare: fmt ? fmt.cazare : a.cazare,
      persoane: fmt ? fmt.persoane : a.nr_persoane,
      bileteAvion: fmt ? fmt.bilete : (a.bilete_avion || 0),
      restulRutier: true,
      tipMasa: 'alacarte',
      zile: 1,
      diurnaPerPers: 180,
      diurnaFixa: a.diurna_fixa || 0,
      cazareFixa: a.cazare_fixa || 0,
      useAlcool: false,
      alcool: a.alcool_default || 0,
      useCag: false,
      cagProcent: 10,
      cagSuma: 0,
      cagMod: 'procent',
      includeExport: true,
    }])
    setSearch('')
  }

  function schimbaFormat(key: string, formatNume: string) {
    setLinii(prev => prev.map(l => {
      if (l.key !== key) return l
      const fmt = l.artist.formate?.find(f => f.nume === formatNume)
      if (!fmt) return { ...l, formatSelectat: formatNume }
      return { ...l, formatSelectat: formatNume, feeLista: fmt.fee, fee: fmt.fee, leiKm: fmt.leiKm, cazare: fmt.cazare, persoane: fmt.persoane, bileteAvion: fmt.bilete, durata: fmt.durata || l.durata }
    }))
  }

  function updateLinie(key: string, patch: Partial<Linie>) {
    setLinii(prev => prev.map(l => l.key === key ? { ...l, ...patch } : l))
  }
  function removeLinie(key: string) {
    setLinii(prev => prev.filter(l => l.key !== key))
  }

  async function calcTransport() {
    if (!toCity.trim()) return
    setLoadingKm(true)
    try {
      const r = await fetch('/api/distance?to=' + encodeURIComponent(toCity) + '&from=' + encodeURIComponent(fromCity))
      const d = await r.json()
      if (d?.km) setKm(d.km)
    } catch {}
    setLoadingKm(false)
  }

  // calcule per linie
  function calcLinie(l: Linie) {
    const marjaProc = km !== null && km > 300 ? 0.065 : 0.115
    const kmTotal = km !== null ? (l.useMarja ? (km + Math.round(km * marjaProc)) * 2 : km * 2) : 0
    const totiZboara = km !== null && km > 300 && !l.restulRutier
    const transportEuro = l.artist.transport_moneda === 'euro'
    const transportRaw = (kmTotal > 0 && l.leiKm > 0 && !totiZboara) ? kmTotal * l.leiKm : 0
    const transportLei = transportEuro ? 0 : Math.round(transportRaw / 10) * 10
    const transportEur = transportEuro ? Math.round(transportRaw) : 0
    const transportEurInLei = transportEuro && eurRate ? Math.round(transportEur * eurRate) : 0
    const diurnaTotal = l.diurnaFixa > 0 ? l.diurnaFixa : (l.tipMasa === 'diurna' ? l.persoane * l.diurnaPerPers * l.zile : 0)
    const alcoolTotal = l.useAlcool ? l.alcool : 0
    const discount = l.feeLista > l.fee ? l.feeLista - l.fee : 0
    const cursAdaos = eurRate ? eurRate * (1 + (useAdaos ? adaosProcent : 0) / 100) : 0
    const savingLei = discount > 0 && eurRate ? Math.round(discount * eurRate) : 0
    let cag = 0
    
    if (l.useCag) {
      if (l.cagMod === 'suma') cag = l.cagSuma
      else { cag = Math.round(l.fee * l.cagProcent / 100); if (cag > 1000) cag = 1000 }
    }
    const netGigx = l.fee - cag
    const feeLeiConv = eurRate ? Math.round(l.fee * (cursAdaos || eurRate)) : 0
    return { kmTotal, transportLei, transportEur, transportEurInLei, transportEuro, diurnaTotal, alcoolTotal, discount, cursAdaos, savingLei, cag, netGigx, feeLeiConv }
  }

  function genText(): string {
    const out: string[] = []
    for (const l of linii.filter(x => x.includeExport)) {
      const c = calcLinie(l)
      out.push('*' + l.artist.nume.toUpperCase() + '*')

      if (institutiePublica) {
        // format oficial in lei
        if (dataEveniment) out.push('Disponibilitate: ' + formatData(dataEveniment))
        out.push('Onorariu: ' + c.feeLeiConv.toLocaleString('ro-RO') + ' lei + TVA')
        if (c.transportLei > 0) out.push('Transport: ' + c.transportLei.toLocaleString('ro-RO') + ' lei + TVA')
        if (c.transportEur > 0) out.push('Transport: ' + c.transportEur.toLocaleString('ro-RO') + ' EUR + TVA' + (c.transportEurInLei > 0 ? ' (aprox ' + c.transportEurInLei.toLocaleString('ro-RO') + ' lei)' : ''))
        out.push(l.cazareFixa > 0 ? 'Cazare: ' + l.cazareFixa.toLocaleString('ro-RO') + ' lei' : 'Cazare: ' + l.cazare)
        if (c.diurnaTotal > 0) out.push('Diurna: ' + c.diurnaTotal.toLocaleString('ro-RO') + ' lei + TVA')
        if (l.tipMasa === 'alacarte' && l.diurnaFixa === 0 && l.cazareFixa === 0) out.push('Masa: a la carte ' + l.persoane + ' pers (pranz, cina) + mic dejun la hotel')
        if (c.alcoolTotal > 0) out.push('Protocol: ' + c.alcoolTotal.toLocaleString('ro-RO') + ' lei + TVA')
        // echivalent euro defalcat
        out.push('(echivalent: ' + l.fee + ' EUR onorariu, curs ' + c.cursAdaos.toFixed(4) + ' lei/EUR)')
      } else {
        // format comercial normal
        const parts: string[] = []
        parts.push(l.fee + ' EUR + TVA')
        if (c.transportLei > 0) parts.push('transport ' + l.leiKm + ' lei/km x ' + c.kmTotal + ' km = ' + c.transportLei.toLocaleString('ro-RO') + ' lei + TVA')
        if (c.transportEur > 0) parts.push('transport ' + l.leiKm + ' EUR/km x ' + c.kmTotal + ' km = ' + c.transportEur.toLocaleString('ro-RO') + ' EUR + TVA' + (c.transportEurInLei > 0 ? ' (aprox ' + c.transportEurInLei.toLocaleString('ro-RO') + ' lei)' : ''))
        if (km !== null && km > 300 && l.bileteAvion > 0) {
          let av = l.bileteAvion + (l.bileteAvion === 1 ? ' bilet avion' : ' bilete avion')
          av += ' + transfer de asigurat'
          parts.push(av)
        }
        parts.push(l.cazareFixa > 0 ? 'cazare ' + l.cazareFixa.toLocaleString('ro-RO') + ' lei' : 'cazare ' + l.cazare)
        if (c.diurnaTotal > 0) parts.push('diurna ' + c.diurnaTotal.toLocaleString('ro-RO') + ' lei + TVA')
        if (l.tipMasa === 'alacarte' && l.diurnaFixa === 0 && l.cazareFixa === 0) parts.push('masa a la carte ' + l.persoane + ' pers (pranz, cina) + mic dejun la hotel')
        if (c.alcoolTotal > 0) parts.push('protocol ' + c.alcoolTotal.toLocaleString('ro-RO') + ' lei + TVA')
        if (l.durata) parts.push('durata: ' + l.durata)
        out.push(parts.join(' || '))
        if (destinatar === 'client' && c.discount > 0) out.push('SALVEZI: ' + c.discount + ' EUR' + (c.savingLei > 0 ? ' (aprox ' + c.savingLei.toLocaleString('ro-RO') + ' lei)' : ''))
      }
      out.push('')
    }
    return out.join('\n').trim()
  }

  function arataToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }
  async function salveazaOferta() {
    try {
      const activi = linii.filter(l => l.includeExport)
      const totalFee = activi.reduce((s, l) => s + l.fee, 0)
      const totalDiscount = activi.reduce((s, l) => { const c = calcLinie(l); return s + c.discount }, 0)
      const totalCag = activi.reduce((s, l) => { const c = calcLinie(l); return s + c.cag }, 0)
      const rezSalvare = await fetch('/api/oferta-save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cod: codOferta,
          client: numeClient || null,
          oras: toCity || null,
          locatie: locatie || null,
          data_eveniment: dataEveniment || null,
          destinatar: destinatar || null,
          institutie_publica: institutiePublica,
          artisti: activi.map(l => ({ nume: l.artist.nume, fee: l.fee, feeLista: l.feeLista, tipPret: l.tipPret, tip: l.artist.tip, format: l.formatSelectat })),
          total_fee_eur: totalFee,
          total_discount_eur: totalDiscount,
          total_cag_eur: totalCag,
          status: 'generata',
          from_city: fromCity,
          use_adaos: useAdaos,
          linii_complete: activi.map(l => ({
            artistNume: l.artist.nume,
            formatSelectat: l.formatSelectat, durata: l.durata,
            tipPret: l.tipPret, feeLista: l.feeLista, fee: l.fee, leiKm: l.leiKm,
            useMarja: l.useMarja, cazare: l.cazare, persoane: l.persoane, bileteAvion: l.bileteAvion, restulRutier: l.restulRutier,
            tipMasa: l.tipMasa, zile: l.zile, diurnaPerPers: l.diurnaPerPers, diurnaFixa: l.diurnaFixa, cazareFixa: l.cazareFixa,
            useAlcool: l.useAlcool, alcool: l.alcool,
            useCag: l.useCag, cagProcent: l.cagProcent, cagSuma: l.cagSuma, cagMod: l.cagMod,
          })),
        })
      })
      if (!rezSalvare.ok) {
        const err = await rezSalvare.json().catch(() => ({}))
        arataToast('Eroare la salvare: ' + (err.error || 'necunoscută'))
        return
      }
      // ofertă salvată cu succes → generez cod nou pentru următoarea (ca să nu se suprascrie)
      setCodOferta('GIGX-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random()*9000)+1000))
    } catch (e) {
      arataToast('Eroare rețea la salvare')
    }
  }

  async function downloadPDF() {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const W = 210, M = 18
    let y = 0
    // Helvetica nu suporta diacritice - le scot
    const noDia = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ș/g,'s').replace(/Ș/g,'S').replace(/ț/g,'t').replace(/Ț/g,'T').replace(/ă/g,'a').replace(/Ă/g,'A').replace(/â/g,'a').replace(/Â/g,'A').replace(/î/g,'i').replace(/Î/g,'I')

    // helper: incarca imagine ca dataURL (logo - fara compresie)
    async function toDataUrl(url: string): Promise<string | null> {
      try {
        const res = await fetch(url)
        const blob = await res.blob()
        return await new Promise(resolve => {
          const r = new FileReader()
          r.onloadend = () => resolve(r.result as string)
          r.readAsDataURL(blob)
        })
      } catch { return null }
    }
    // helper: comprima logo (PNG cu transparenta, resize mic)
    async function toCompressedLogo(url: string): Promise<string | null> {
      try {
        const res = await fetch(url)
        const blob = await res.blob()
        const bitmap = await createImageBitmap(blob)
        const w = 200, h = Math.round(200 * bitmap.height / bitmap.width)
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return null
        ctx.drawImage(bitmap, 0, 0, w, h)
        return canvas.toDataURL('image/png')
      } catch { return null }
    }
    // helper: incarca SI comprima poza artist (resize 160px, JPEG 0.7)
    async function toCompressed(url: string): Promise<string | null> {
      try {
        const res = await fetch(url)
        const blob = await res.blob()
        const bitmap = await createImageBitmap(blob)
        const size = 160
        const canvas = document.createElement('canvas')
        canvas.width = size; canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) return null
        // crop patrat centrat
        const min = Math.min(bitmap.width, bitmap.height)
        const sx = (bitmap.width - min) / 2, sy = (bitmap.height - min) / 2
        ctx.drawImage(bitmap, sx, sy, min, min, 0, 0, size, size)
        return canvas.toDataURL('image/jpeg', 0.7)
      } catch { return null }
    }

    // === HEADER degradeu turcoaz cu diagonala ===
    const steps = 80
    for (let i = 0; i < steps; i++) {
      const t = i / steps
      const r = Math.round(180 + (100 - 180) * t)  // b4->64
      const g = Math.round(247 + (210 - 247) * t)   // f7->d2
      const b = Math.round(249 + (244 - 249) * t)    // f9->f4
      doc.setFillColor(r, g, b)
      doc.rect((W / steps) * i, 0, W / steps + 0.5, 38, 'F')
    }
    // diagonala: triunghi alb decupat jos-dreapta (forma interesanta)
    doc.setFillColor(255, 255, 255)
    doc.triangle(W, 30, W, 42, W - 60, 42, 'F')
    doc.triangle(0, 38, 0, 44, 70, 44, 'F')

    // logo Forward dreapta
    const logo = await toCompressedLogo('/forward-logo.png')
    if (logo) doc.addImage(logo, 'PNG', W - M - 34, 8, 34, 21)

    // text header stanga
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16)
    doc.text('FORWARD AGENCY', M, 16)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
    doc.setFontSize(7.5)
    doc.setFontSize(7.5)
    doc.setTextColor(10, 50, 65)
    doc.text('Your #1 Artist Booking & Advising Agency', M, 22)
    doc.setTextColor(255, 255, 255)

    y = 52

    // === NR OFERTA + validitate (dreapta sus sub header) ===
    const nrOferta = codOferta
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(140,140,140)
    doc.text('Nr. ' + nrOferta, W - M, 48, { align: 'right' })

    // === DETALII DE COLABORARE ===
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(120,120,120)
    doc.text('DETALII DE COLABORARE', M, y)
    y += 9

    // client MAJUSCULE
    if (numeClient) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.setTextColor(28,25,23)
      doc.text(noDia(numeClient.toUpperCase()), M, y)
      y += 8
    }
    // oras + locatie + data
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(100,100,100)
    const sub = [toCity, locatie].filter(Boolean).join(' · ')
    if (sub) { doc.text(noDia(sub), M, y); y += 5 }
    if (dataEveniment) { doc.text(noDia('Eveniment: ' + formatData(dataEveniment)), M, y); y += 5 }
    y += 6

    // === ARTISTI ===
    const activi = linii.filter(l => l.includeExport)
    for (const l of activi) {
      const c = calcLinie(l)
      if (y > 235) { doc.addPage(); y = 20 }

      // foto artist (stanga)
      const imgUrl = 'https://i.scdn.co/image/' // se ia din DB via prom-images
      let photo: string | null = null
      try {
        const pr = await fetch('/api/oferta-poze')
        const imgs = await pr.json()
        if (imgs[l.artist.nume]) photo = await toCompressed(imgs[l.artist.nume])
      } catch {}
      const textX = photo ? M + 24 : M
      if (photo) {
        try { doc.addImage(photo, 'JPEG', M, y, 20, 20) } catch {}
      }

      doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(28,25,23)
      doc.text(noDia(l.artist.nume.toUpperCase()), textX, y + 4)
      let ly = y + 10

      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(60,60,60)
      const rows: string[] = []
      rows.push('Onorariu: ' + l.fee + ' EUR + TVA')
      if (c.transportLei > 0) rows.push('Transport: ' + l.leiKm + ' lei/km x ' + c.kmTotal + ' km = ' + c.transportLei.toLocaleString('ro-RO') + ' lei + TVA')
      if (c.transportEur > 0) rows.push('Transport: ' + l.leiKm + ' EUR/km x ' + c.kmTotal + ' km = ' + c.transportEur.toLocaleString('ro-RO') + ' EUR + TVA' + (c.transportEurInLei > 0 ? ' (aprox ' + c.transportEurInLei.toLocaleString('ro-RO') + ' lei)' : ''))
      if (km !== null && km > 300 && l.bileteAvion > 0) {
        let av = 'Avion: ' + l.bileteAvion + (l.bileteAvion === 1 ? ' bilet' : ' bilete') + ' + transfer de asigurat'
        rows.push(av)
      }
      rows.push(l.cazareFixa > 0 ? 'Cazare: ' + l.cazareFixa.toLocaleString('ro-RO') + ' lei' : 'Cazare: ' + l.cazare + ' (' + l.persoane + ' persoane)')
      if (c.diurnaTotal > 0) rows.push('Diurna: ' + c.diurnaTotal.toLocaleString('ro-RO') + ' lei + TVA')
      if (l.tipMasa === 'alacarte' && l.diurnaFixa === 0 && l.cazareFixa === 0) rows.push('Masa: a la carte ' + l.persoane + ' pers (pranz, cina) + mic dejun la hotel')
      if (c.alcoolTotal > 0) rows.push('Protocol: ' + c.alcoolTotal.toLocaleString('ro-RO') + ' lei + TVA')
      if (l.durata) rows.push('Durata: ' + l.durata)
      for (const rr of rows) { doc.text(noDia(rr), textX, ly); ly += 5 }

      if (destinatar === 'client' && c.discount > 0) {
        doc.setFont('helvetica', 'bold'); doc.setTextColor(5,150,105)
        doc.text('SALVEZI: ' + c.discount + ' EUR' + (c.savingLei > 0 ? ' (aprox ' + c.savingLei.toLocaleString('ro-RO') + ' lei)' : ''), textX, ly)
        ly += 5
      }
      y = Math.max(ly, y + 22) + 12
    }

    // validitate pe randuri (respecta latimea)
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5); doc.setTextColor(150,150,150)
    const valid = doc.splitTextToSize('Oferta valabila 48 de ore de la momentul emiterii. Preturile nu includ TVA.', W - 2*M - 2)
    doc.text(valid, M, y)

    // === FOOTER cu ambii contacte ===
    const fy = 258
    doc.setDrawColor(129, 212, 242); doc.setLineWidth(0.8)
    doc.line(M, fy, W - M, fy)
    doc.setLineWidth(0.2)
    // Bogdan - stanga
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(28,25,23)
    doc.text('Bogdan Nita', M, fy + 6)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(80,80,80)
    doc.text('Managing Partner, Artist Booking & Advisor', M, fy + 10.5)
    doc.text('+40 751 144 109  ·  bogdan@forward.ro', M, fy + 14.5)
    // Alexandra - dreapta
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(28,25,23)
    doc.text('Alexandra Stefan', W/2 + 10, fy + 6)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(80,80,80)
    doc.text('Assistant Contracting, Logistics & Booking Support', W/2 + 10, fy + 10.5)
    doc.text('alexandra.stefan@forward.ro', W/2 + 10, fy + 14.5)
    // linia + generat + GIGx jos
    const now = new Date()
    doc.setFontSize(7.5); doc.setTextColor(150,150,150)
    doc.text('Generat: ' + now.toLocaleDateString('ro-RO') + ' ' + now.toLocaleTimeString('ro-RO', {hour:'2-digit',minute:'2-digit'}), M, fy + 24)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9)
    const gx = W - M - 20
    doc.setTextColor(28,25,23); doc.text('powered by GIG', gx, fy + 24)
    const gw = doc.getTextWidth('powered by GIG')
    doc.setTextColor(5,150,105); doc.text('x', gx + gw, fy + 24)

    const filename = ([numeClient, toCity, locatie].filter(Boolean).join('-') || 'oferta').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') + '.pdf'
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

    if (isMobile && navigator.share) {
      // mobil: share nativ cu PDF atasat
      try {
        const blob = doc.output('blob')
        const file = new File([blob], filename, { type: 'application/pdf' })
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: ([numeClient, toCity, locatie].filter(Boolean).join(' - ') || 'Oferta') })
          return
        }
      } catch { /* daca share esueaza, cad pe descarcare */ }
    }
    // desktop sau fallback: descarcare
    doc.save(filename)
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: UI.radiusSm, border: '1px solid ' + UI.lineStrong, fontSize: '14px', fontFamily: F, boxSizing: 'border-box', color: UI.ink, background: '#fff', transition: 'border-color 0.15s, box-shadow 0.15s', outline: 'none' }
  const label: React.CSSProperties = { fontSize: '10.5px', fontWeight: 700, color: UI.faint, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px', display: 'block' }

  if (checkingAuth) {
    return <div style={{minHeight:'100vh', background:'#f3efff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F, color:'#78716c'}}>Verificare...</div>
  }
  if (!authed) {
    return (
      <div style={{minHeight:'100vh', background:'#f3efff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F, padding:'20px'}}>
        <div style={{background:'white', padding:'40px', borderRadius:'16px', border:'2px solid #e7e5e4', width:'340px'}}>
          <div style={{fontSize:'22px', fontWeight:800, marginBottom:'6px'}}>GIG<span style={{color:'#059669'}}>x</span></div>
          <div style={{fontSize:'13px', color:'#78716c', marginBottom:'20px'}}>Autentificare</div>
          <input type="text" placeholder="Utilizator" value={loginEmail} autoComplete="username"
            onChange={e => setLoginEmail(e.target.value)}
            style={{...inputStyle, marginBottom:'10px'}} />
          <input type="password" placeholder="Parola" value={loginPass} autoComplete="current-password"
            onChange={e => setLoginPass(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') faLogin() }}
            style={inputStyle} />
          {loginErr && <div style={{fontSize:'12px', color:'#dc2626', marginTop:'8px'}}>{loginErr}</div>}
          {resetMsg && <div style={{fontSize:'12px', color:'#1c1917', marginTop:'8px'}}>{resetMsg}</div>}
          <button onClick={faLogin} disabled={loggingIn}
            style={{width:'100%', marginTop:'14px', padding:'13px', background:UI.dark, color:'white', border:'none', borderRadius:UI.radiusSm, fontSize:'14px', fontWeight:700, cursor: loggingIn ? 'wait' : 'pointer', fontFamily:F, opacity: loggingIn ? 0.6 : 1, boxShadow:UI.shadowBtn}}>
            {loggingIn ? 'Se conecteaza...' : 'Intra in cont'}
          </button>
          <button onClick={faReset}
            style={{width:'100%', marginTop:'10px', padding:'8px', background:'none', color:'#78716c', border:'none', fontSize:'12px', cursor:'pointer', fontFamily:F, textDecoration:'underline'}}>
            Am uitat parola
          </button>
        </div>
      </div>
    )
  }

  const filtered = search ? artists.filter(a => a.nume.toLowerCase().includes(search.toLowerCase())) : []

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(160deg, #eceef2 0%, #e8eaf0 45%, #dde1ea 100%)', fontFamily:F, padding: isMobile ? '16px 12px' : '40px 20px', position:'relative'}}>
      <div style={{position:'fixed', inset:0, background:UI.mesh, pointerEvents:'none', zIndex:0}} />
      {toast && (
        <div style={{position:'fixed', bottom:'28px', left:'50%', transform:'translateX(-50%)', zIndex:1000, background:UI.dark, color:'white', padding:'14px 24px', borderRadius:'12px', fontSize:'14px', fontWeight:700, fontFamily:F, boxShadow:'0 8px 30px rgba(0,0,0,0.25)', display:'flex', alignItems:'center', gap:'8px', animation:'slideUp 0.25s ease'}}>
          <span style={{color:'#059669', fontSize:'16px'}}>✓</span> {toast}
        </div>
      )}
      <div style={{maxWidth:'1080px', margin:'0 auto', position:'relative', zIndex:1}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', position:'sticky', top:'12px', zIndex:50, background:'rgba(255,255,255,0.7)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.5)', borderRadius:'16px', padding:'12px 18px', boxShadow:'0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)'}}>
          <div>
            <div style={{fontSize:'27px', fontWeight:800, letterSpacing:'-1px', color:UI.ink}}>GIG<span style={{color:'#059669'}}>x</span></div>
            <div style={{fontSize:'13px', color:'#a8a29e', fontWeight:500, marginTop:'2px'}}>Generator deviz intern</div>
          </div>
          <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
            <button onClick={() => setShowAddArtist(true)} style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', color:'#1c1917', fontWeight:700, background:'white', border:'1.5px solid #ececec', borderRadius:'10px', padding:'9px 14px', cursor:'pointer', fontFamily:F}}><UserPlus size={15} strokeWidth={2.2} /> Adaugă artist</button>
            <a href="/oferta/roster" style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', color:'#1c1917', fontWeight:700, background:'white', border:'1.5px solid #ececec', borderRadius:'10px', padding:'9px 14px', cursor:'pointer', fontFamily:F, textDecoration:'none'}}><Users size={15} strokeWidth={2.2} /> Roster</a>
            <a href="/oferta/istoric" style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', color:'#1c1917', fontWeight:700, background:'white', border:'1.5px solid #ececec', borderRadius:'10px', padding:'9px 14px', cursor:'pointer', fontFamily:F, textDecoration:'none'}}><History size={15} strokeWidth={2.2} /> Istoric</a>
            <button onClick={faLogout} title="Log out" style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', color:'#a8a29e', fontWeight:700, background:'none', border:'1.5px solid #e7e5e4', borderRadius:'10px', padding:'9px 12px', cursor:'pointer', fontFamily:F}}><LogOut size={15} strokeWidth={2.2} /></button>
          </div>
        </div>

        {/* client + eveniment */}
        <div style={{background:UI.card, padding: isMobile ? '20px' : '28px', borderRadius:UI.radius, border:'1px solid '+UI.line, boxShadow:UI.shadow, marginBottom:'20px'}}>
          <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap:'12px', marginBottom:'12px'}}>
            <div><label style={label}>Denumire client / instituție</label>
              <input value={numeClient} onChange={e => setNumeClient(e.target.value)} placeholder="ex: Primăria Focșani" style={inputStyle} /></div>
            <div style={{background: dataEveniment ? UI.okSoft : UI.attentionSoft, border: '1.5px solid ' + (dataEveniment ? UI.ok : UI.attention), borderRadius:UI.radiusSm, padding:'10px 12px', transition:'all 0.15s'}}>
              <label style={{...label, color: dataEveniment ? UI.ok : UI.attention, display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px'}}>
                <Calendar size={13} strokeWidth={2.2} /> Data eveniment {!dataEveniment && <span style={{color:UI.attention, fontWeight:800}}>obligatoriu</span>}
              </label>
              <DatePicker value={dataEveniment} onChange={v => setDataEveniment(v)} placeholder="Alege data" /></div>
          </div>
          <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr auto', gap:'12px', alignItems:'end'}}>
            <div><label style={label}>Oraș plecare</label>
              <input value={fromCity} onChange={e => setFromCity(e.target.value)} style={inputStyle} /></div>
            <div style={{position:'relative'}}><label style={label}>Destinație</label>
              <input value={toCity} onChange={e => cautaOras(e.target.value)} onKeyDown={e => { if (e.key==='Enter') { setShowCitySugg(false); calcTransport() } }} onBlur={() => setTimeout(() => setShowCitySugg(false), 200)} autoComplete="off" style={inputStyle} />
              {showCitySugg && citySuggestions.length > 0 && (
                <div style={{position:'absolute', top:'100%', left:0, right:0, background:'white', border:'1px solid '+UI.line, borderRadius:UI.radiusSm, marginTop:'4px', maxHeight:'200px', overflowY:'auto', zIndex:20, boxShadow:UI.shadowHover}}>
                  {citySuggestions.map((sg, i) => (
                    <div key={i} onClick={() => alegeOras(sg.description)}
                      style={{padding:'9px 12px', cursor:'pointer', fontSize:'13px', borderBottom: i < citySuggestions.length-1 ? '1px solid #f5f5f4' : 'none'}}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f4')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                      {sg.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div><label style={label}>Locație / Client</label>
              <input value={locatie} onChange={e => setLocatie(e.target.value)} placeholder="ex: Club Nish" style={inputStyle} /></div>
            <button onClick={calcTransport} style={{padding:'11px 22px', background:UI.green, color:'white', border:'none', borderRadius:UI.radiusSm, fontWeight:700, cursor:'pointer', fontFamily:F, whiteSpace:'nowrap', boxShadow:'0 1px 3px rgba(5,150,105,0.3)'}}>
              {loadingKm ? '...' : 'Calculează'}
            </button>
          </div>
          {km !== null && <div style={{display:'inline-flex', alignItems:'center', gap:'8px', fontSize:'13px', marginTop:'10px', padding:'7px 12px', background:UI.greenSoft, border:'1px solid '+UI.greenLine, borderRadius:'8px'}}><span style={{color:UI.sub, fontWeight:600}}>Distanță</span> <span style={{color:UI.green, fontWeight:800, fontSize:'14px'}}>{km} km</span> <span style={{color:UI.faint, fontSize:'12px'}}>dus-întors · {(km + Math.round(km*(km>300?0.065:0.115)))*2} km cu marjă</span></div>}
          <div style={{display:'flex', gap:'16px', marginTop:'12px', alignItems:'center'}}>
            <label style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', cursor:'pointer', fontWeight:700}}>
              <input type="checkbox" checked={useAdaos} onChange={e => setUseAdaos(e.target.checked)} style={{width:'16px', height:'16px', accentColor:'#059669'}} />
              Aplică adaos curs BNR
            </label>
            <label style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', cursor:'pointer', fontWeight:700, color:'#1c1917'}}>
              <input type="checkbox" checked={institutiePublica} onChange={e => setInstitutiePublica(e.target.checked)} style={{width:'16px', height:'16px', accentColor:'#059669'}} />
              Instituție publică (ofertă în lei)
            </label>
            {useAdaos && <input type="number" step="0.1" value={adaosProcent} onChange={e => setAdaosProcent(Number(e.target.value))} style={{...inputStyle, width:'80px'}} />}
            {eurRate && <span style={{fontSize:'12px', color:'#78716c'}}>Curs BNR: {eurRate.toFixed(4)} lei/€</span>}
          </div>
        </div>

        {/* search adauga artist */}
        <div style={{background:'white', padding:'20px', borderRadius:'14px', border:'2px solid #e7e5e4', marginBottom:'20px', position:'relative'}}>
          <label style={label}>Adaugă artist</label>
          <input placeholder="Caută și adaugă artist..." value={search}
            onChange={e => setSearch(e.target.value)} style={inputStyle} />
          {filtered.length > 0 && (
            <div style={{position:'absolute', top:'100%', left:'20px', right:'20px', background:'white', border:'1px solid '+UI.line, borderRadius:UI.radiusSm, marginTop:'4px', maxHeight:'240px', overflowY:'auto', zIndex:10, boxShadow:UI.shadowHover}}>
              {filtered.map(a => (
                <div key={a.nume} onClick={() => addArtist(a)}
                  style={{padding:'10px 12px', cursor:'pointer', fontSize:'14px', borderBottom:'1px solid #f5f5f4'}}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f4')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                  {a.nume} <span style={{color:'#a8a29e', fontSize:'12px'}}>· {a.fee_standard}€</span>
                  <span style={{marginLeft:'8px', fontSize:'9px', fontWeight:800, padding:'2px 6px', borderRadius:'4px', background: a.tip === 'intermediere' ? '#f3efff' : '#f3efff', color: a.tip === 'intermediere' ? '#1c1917' : '#1c1917'}}>{a.tip === 'intermediere' ? 'EXTERN' : 'FWD'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* carduri artisti */}
        {linii.map(l => {
          const c = calcLinie(l)
          return (
            <div key={l.key} style={{background:UI.card, padding: isMobile ? '20px' : '24px', borderRadius:UI.radius, border:'1px solid '+UI.line, boxShadow:UI.shadow, marginBottom:'16px'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                  <input type="checkbox" checked={l.includeExport} onChange={e => updateLinie(l.key, { includeExport: e.target.checked })} style={{width:'18px', height:'18px', accentColor:'#059669'}} />
                  <span style={{fontSize:'18px', fontWeight:800}}>{l.artist.nume}</span>
                  <span style={{fontSize:'9px', fontWeight:800, padding:'2px 6px', borderRadius:'4px', background: l.artist.tip === 'intermediere' ? '#f3efff' : '#f3efff', color: l.artist.tip === 'intermediere' ? '#1c1917' : '#1c1917'}}>{l.artist.tip === 'intermediere' ? 'EXTERN' : 'FWD'}</span>
                  <input value={l.durata} onChange={e => updateLinie(l.key, { durata: e.target.value })} placeholder="40 min"
                    style={{marginLeft:'8px', padding:'4px 10px', borderRadius:'8px', border:'1.5px solid #0891b2', color:'#0891b2', fontSize:'12px', fontWeight:700, fontFamily:F, background:'white', width:'90px'}} />
                  {l.artist.formate && l.artist.formate.length > 1 && (
                    <select value={l.formatSelectat} onChange={e => schimbaFormat(l.key, e.target.value)}
                      style={{marginLeft:'10px', padding:'6px 12px', borderRadius:UI.radiusSm, border:'1.5px solid '+UI.purple, color:UI.purple, fontSize:'12px', fontWeight:700, fontFamily:F, cursor:'pointer', background:UI.purpleSoft}}>
                      {l.artist.formate.map(f => <option key={f.nume} value={f.nume}>{f.nume}</option>)}
                    </select>
                  )}
                </div>
                <button onClick={() => removeLinie(l.key)} style={{background:'none', border:'none', color:'#dc2626', cursor:'pointer', fontSize:'13px', fontWeight:600}}>Șterge</button>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'12px', marginBottom:'12px'}}>
                <div>
                  <label style={label}>Tip preț</label>
                  <select value={l.tipPret} onChange={e => updateLinie(l.key, { tipPret: e.target.value })} style={inputStyle}>
                    <option>Standard</option><option>Bal</option><option>Privat</option><option>Corporate</option><option>Revelion</option>
                  </select>
                </div>
                <div><label style={label}>Preț listă (€)</label>
                  <input type="number" value={l.feeLista || ''} onFocus={e => e.target.select()} onChange={e => updateLinie(l.key, { feeLista: Number(e.target.value) })} style={{...inputStyle, color:'#a8a29e'}} /></div>
                <div><label style={label}>Ofertă (€)</label>
                  <input type="number" value={l.fee || ''} onFocus={e => e.target.select()} onChange={e => updateLinie(l.key, { fee: Number(e.target.value) })} style={{...inputStyle, fontWeight:800, fontSize:'15px', color:UI.ink}} /></div>
                <div><label style={label}>Lei/km</label>
                  <input type="number" step="0.1" value={l.leiKm || ''} onFocus={e => e.target.select()} onChange={e => updateLinie(l.key, { leiKm: Number(e.target.value) })} style={inputStyle} /></div>
              </div>

              <div style={{display:'flex', gap:'16px', flexWrap:'wrap', marginBottom:'12px', alignItems:'center'}}>
                <label style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', cursor:'pointer'}}>
                  <input type="checkbox" checked={l.useMarja} onChange={e => updateLinie(l.key, { useMarja: e.target.checked })} style={{width:'16px', height:'16px', accentColor:'#059669'}} />
                  Marjă transport
                </label>
                {c.discount > 0 && <span style={{fontSize:'12px', color:'#1c1917', fontWeight:700}}>Discount {c.discount} € · economie {c.savingLei.toLocaleString('ro-RO')} lei</span>}
              </div>

              {km !== null && km > 300 && (
                <div style={{display:'flex', gap:'16px', flexWrap:'wrap', marginBottom:'12px', alignItems:'center', padding:'12px 14px', background:UI.bg, borderRadius:UI.radiusSm, border:'1px solid '+UI.line}}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                    <label style={{fontSize:'12px', fontWeight:700, color:'#57534e'}}>Bilete avion (câți zboară):</label>
                    <input type="number" value={l.bileteAvion || ''} onFocus={e => e.target.select()} onChange={e => updateLinie(l.key, { bileteAvion: Number(e.target.value) })} style={{width:'60px', padding:'7px 9px', borderRadius:'8px', border:'1px solid '+UI.lineStrong, fontSize:'13px', fontFamily:F, textAlign:'center', outline:'none'}} />
                  </div>
                  <label style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', cursor:'pointer'}}>
                    <input type="checkbox" checked={l.restulRutier} onChange={e => updateLinie(l.key, { restulRutier: e.target.checked })} style={{width:'16px', height:'16px', accentColor:'#059669'}} />
                    Restul echipei rutier
                  </label>
                  <span style={{fontSize:'11px', color:'#a8a29e'}}>{l.restulRutier ? 'transport auto + transfer aeroport' : 'toți zboară + transfer aeroport'}</span>
                </div>
              )}

              {l.cazareFixa > 0 ? (
                <div style={{fontSize:'12px', color:'#78716c', marginBottom:'12px'}}>Cazare cu sumă fixă (editabilă mai jos){km !== null && km > 300 && l.bileteAvion > 0 ? ' · ' + l.bileteAvion + (l.bileteAvion === 1 ? ' bilet avion' : ' bilete avion') : ''}</div>
              ) : (
              <div style={{marginBottom:'12px'}}>
                <label style={label}>Cazare</label>
                <input value={l.cazare} onChange={e => updateLinie(l.key, { cazare: e.target.value })} style={inputStyle} />
                <div style={{fontSize:'12px', color:'#78716c', marginTop:'4px'}}>Protocol: {l.persoane} persoane{km !== null && km > 300 && l.bileteAvion > 0 ? ' · ' + l.bileteAvion + (l.bileteAvion === 1 ? ' bilet avion' : ' bilete avion') : ''}</div>
              </div>
              )}

              {(l.diurnaFixa > 0 || l.cazareFixa > 0) ? (
                <div style={{display:'flex', gap:'8px', marginBottom:'12px', padding:'10px 12px', background:'#f3efff', border:'1.5px solid #1c1917', borderRadius:'8px'}}>
                  <div style={{flex:1}}><label style={{...label, color:'#1c1917'}}>Diurnă fixă (lei)</label><input type="number" value={l.diurnaFixa || ''} onFocus={e => e.target.select()} onChange={e => updateLinie(l.key, { diurnaFixa: Number(e.target.value) })} style={inputStyle} /></div>
                  <div style={{flex:1}}><label style={{...label, color:'#1c1917'}}>Cazare fixă (lei)</label><input type="number" value={l.cazareFixa || ''} onFocus={e => e.target.select()} onChange={e => updateLinie(l.key, { cazareFixa: Number(e.target.value) })} style={inputStyle} /></div>
                </div>
              ) : (<>
              <div style={{display:'flex', gap:'8px', marginBottom:'8px'}}>
                <button onClick={() => updateLinie(l.key, { tipMasa: 'diurna' })} style={{flex:1, padding:'9px', borderRadius:UI.radiusSm, border:'1.5px solid '+(l.tipMasa==='diurna'?UI.dark:UI.lineStrong), background:l.tipMasa==='diurna'?UI.dark:'white', color:l.tipMasa==='diurna'?'white':UI.sub, fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F}}>Diurnă</button>
                <button onClick={() => updateLinie(l.key, { tipMasa: 'alacarte' })} style={{flex:1, padding:'9px', borderRadius:UI.radiusSm, border:'1.5px solid '+(l.tipMasa==='alacarte'?UI.dark:UI.lineStrong), background:l.tipMasa==='alacarte'?UI.dark:'white', color:l.tipMasa==='alacarte'?'white':UI.sub, fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:F}}>À la carte</button>
              </div>
              {l.tipMasa === 'diurna' ? (
                <div style={{display:'flex', gap:'8px', marginBottom:'12px'}}>
                  <div style={{flex:1}}><label style={label}>Lei/pers/zi</label><input type="number" value={l.diurnaPerPers || ''} onFocus={e => e.target.select()} onChange={e => updateLinie(l.key, { diurnaPerPers: Number(e.target.value) })} style={inputStyle} /></div>
                  <div style={{flex:1}}><label style={label}>Zile</label><input type="number" value={l.zile || ''} onFocus={e => e.target.select()} onChange={e => updateLinie(l.key, { zile: Number(e.target.value) })} style={inputStyle} /></div>
                  <div style={{flex:1}}><label style={label}>Total diurnă</label><div style={{padding:'10px 0', fontWeight:700}}>{c.diurnaTotal.toLocaleString('ro-RO')} lei</div></div>
                </div>
              ) : (
                <div style={{fontSize:'13px', color:UI.sub, padding:'12px 14px', background:UI.bg, borderRadius:UI.radiusSm, border:'1px solid '+UI.line, marginBottom:'12px'}}>Masă à la carte {l.persoane} pers (prânz, cină) + mic dejun la hotel</div>
              )}
              </>)}

              <label style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', cursor:'pointer', fontWeight:700}}>
                <input type="checkbox" checked={l.useAlcool} onChange={e => updateLinie(l.key, { useAlcool: e.target.checked })} style={{width:'16px', height:'16px', accentColor:'#059669'}} />
                Protocol
              </label>
              {l.useAlcool && <input type="number" placeholder="Sumă lei" value={l.alcool || ''} onFocus={e => e.target.select()} onChange={e => updateLinie(l.key, { alcool: Number(e.target.value) })} style={{...inputStyle, marginTop:'8px'}} />}

              <div style={{marginTop:'16px', paddingTop:'16px', borderTop:'1px dashed #e7e5e4'}}>
                <label style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', cursor: destinatar==='client'?'not-allowed':'pointer', fontWeight:700, opacity: destinatar==='client'?0.4:1}}>
                  <input type="checkbox" checked={l.useCag} disabled={destinatar==='client'} onChange={e => { updateLinie(l.key, { useCag: e.target.checked }); if (e.target.checked) setDestinatar('intermediar') }} style={{width:'16px', height:'16px', accentColor:'#059669'}} />
                  CAG · comision agenție (doar intermediar)
                </label>
                {destinatar==='client' && <div style={{fontSize:'11px', color:'#a8a29e', marginTop:'4px'}}>La client se dă discount, nu comision.</div>}
                {l.useCag && (
                  <div style={{marginTop:'8px', display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap'}}>
                    <div style={{display:'flex', gap:'4px'}}>
                      <button onClick={() => updateLinie(l.key, { cagMod: 'procent' })} style={{padding:'6px 12px', borderRadius:'6px', border:'1.5px solid '+(l.cagMod==='procent'?'#1c1917':'#e7e5e4'), background:l.cagMod==='procent'?'#1c1917':'white', color:l.cagMod==='procent'?'white':'#78716c', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:F}}>%</button>
                      <button onClick={() => updateLinie(l.key, { cagMod: 'suma' })} style={{padding:'6px 12px', borderRadius:'6px', border:'1.5px solid '+(l.cagMod==='suma'?'#1c1917':'#e7e5e4'), background:l.cagMod==='suma'?'#1c1917':'white', color:l.cagMod==='suma'?'white':'#78716c', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:F}}>€ fix</button>
                    </div>
                    {l.cagMod === 'procent'
                      ? <input type="number" value={l.cagProcent || ''} onFocus={e => e.target.select()} onChange={e => updateLinie(l.key, { cagProcent: Number(e.target.value) })} style={{...inputStyle, width:'90px'}} placeholder="%" />
                      : <input type="number" value={l.cagSuma || ''} onFocus={e => e.target.select()} onChange={e => updateLinie(l.key, { cagSuma: Number(e.target.value) })} style={{...inputStyle, width:'110px'}} placeholder="€" />}
                    <span style={{fontSize:'13px', fontWeight:700, color:'#1c1917'}}>CAG: {c.cag} € {l.cagMod === 'procent' && c.cag === 1000 ? '(plafon)' : ''}</span>
                    <span style={{fontSize:'13px', color:'#78716c'}}>· Net GIGx: <strong>{c.netGigx} €</strong></span>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* cheia de control + export */}
        {linii.length > 0 && (
          <div style={{background:UI.dark, padding: isMobile ? '20px' : '24px', borderRadius:UI.radius, marginTop:'8px', boxShadow:UI.shadowHover}}>
            {/* CHEIA DE CONTROL */}
            <div style={{marginBottom:'16px', padding:'16px', borderRadius:UI.radiusSm, background: destinatar ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.18)', border:'1px solid ' + (destinatar ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.5)')}}>
              <div style={{fontSize:'13px', fontWeight:700, color: destinatar ? '#6ee7b7' : 'rgba(255,255,255,0.7)', marginBottom:'12px', display:'flex', alignItems:'center', gap:'6px'}}>
                Pentru cine este oferta?
              </div>
              <div style={{display:'flex', gap:'8px'}}>
                <button onClick={() => { setDestinatar('client'); setLinii(prev => prev.map(x => ({ ...x, useCag: false }))) }}
                  style={{flex:1, padding:'12px', borderRadius:UI.radiusSm, border:'1.5px solid ' + (destinatar==='client'?UI.green:UI.lineStrong), background: destinatar==='client'?UI.green:'white', color: destinatar==='client'?'white':UI.sub, fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:F, transition:'all 0.15s'}}>
                  Client {destinatar==='client' ? '✓' : ''}
                </button>
                <button onClick={() => setDestinatar('intermediar')}
                  style={{flex:1, padding:'12px', borderRadius:UI.radiusSm, border:'1.5px solid ' + (destinatar==='intermediar'?UI.green:UI.lineStrong), background: destinatar==='intermediar'?UI.green:'white', color: destinatar==='intermediar'?'white':UI.sub, fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:F, transition:'all 0.15s'}}>
                  Intermediar {destinatar==='intermediar' ? '✓' : ''}
                </button>
              </div>
              {destinatar === 'client' && <div style={{fontSize:'12px', color:'#6ee7b7', marginTop:'8px'}}>Se afișează economia (SALVEZI)</div>}
              {destinatar === 'intermediar' && <div style={{fontSize:'12px', color:'#a8a29e', marginTop:'8px'}}>Sumă fără mențiune de comision</div>}
            </div>

            {/* BUTOANE EXPORT - blocate pana selectezi destinatar */}
            <div style={{display:'flex', gap:'8px', flexWrap:'wrap', opacity: destinatar ? 1 : 0.4, pointerEvents: destinatar ? 'auto' : 'none'}}>
              <button onClick={() => { navigator.clipboard.writeText(genText()); salveazaOferta(); arataToast('Deviz copiat și ofertă salvată') }}
                style={{flex:1, minWidth:'120px', display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', padding:'13px', background:UI.green, color:'white', border:'none', borderRadius:UI.radiusSm, fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:F, boxShadow:'0 1px 3px rgba(5,150,105,0.3)'}}><Copy size={16} strokeWidth={2.2} /> Copiază tot</button>
              <button onClick={() => { salveazaOferta(); arataToast('Ofertă salvată'); window.open('https://wa.me/?text=' + encodeURIComponent(genText()), '_blank') }}
                style={{flex:1, minWidth:'120px', display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', padding:'13px', background:'#25D366', color:'white', border:'none', borderRadius:UI.radiusSm, fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:F, boxShadow:'0 1px 3px rgba(37,211,102,0.3)'}}><MessageCircle size={16} strokeWidth={2.2} /> WhatsApp</button>
              <button onClick={() => { salveazaOferta(); arataToast('Ofertă salvată'); window.open('mailto:?subject=' + encodeURIComponent([numeClient, toCity, locatie].filter(Boolean).join(' - ') || 'Oferta') + '&body=' + encodeURIComponent(genText().replace(/\*/g, ''))) }}
                style={{flex:1, minWidth:'120px', display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', padding:'13px', background:'#3b82f6', color:'white', border:'none', borderRadius:UI.radiusSm, fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:F, boxShadow:'0 1px 3px rgba(59,130,246,0.3)'}}><Mail size={16} strokeWidth={2.2} /> Email</button>
              <button onClick={() => { salveazaOferta(); arataToast('Ofertă salvată'); downloadPDF() }}
                style={{flex:1, minWidth:'120px', display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', padding:'13px', background:UI.purple, color:'white', border:'none', borderRadius:UI.radiusSm, fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:F, boxShadow:'0 1px 3px rgba(0,0,0,0.3)'}}><FileDown size={16} strokeWidth={2.2} /> {typeof window !== 'undefined' && window.innerWidth < 768 ? 'Distribuie PDF' : 'Descarcă PDF'}</button>
            </div>
          </div>
        )}

        {/* zona print (ascunsa pe ecran, apare la print) */}
        <div className="print-only" style={{display:'none'}}>
          <div style={{whiteSpace:'pre-wrap', fontSize:'13px', lineHeight:1.6}}>{genText()}</div>
          <div style={{marginTop:'30px', paddingTop:'16px', borderTop:'1px solid #ccc', fontSize:'11px', color:'#555'}}>
            Ofertă generată: {new Date().toLocaleDateString('ro-RO')} {new Date().toLocaleTimeString('ro-RO', {hour:'2-digit', minute:'2-digit'})}<br/>
            <strong>Bogdan Niță</strong> · Managing Partner, Artist Booking &amp; Advisor · +40 751 144 109
          </div>
        </div>
      </div>

      {showAddArtist && (
        <div onClick={() => setShowAddArtist(false)} style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px'}}>
          <div onClick={e => e.stopPropagation()} style={{background:'white', borderRadius:UI.radius, padding: isMobile ? '20px' : '28px', width: isMobile ? '100%' : '480px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px'}}>
              <div style={{fontSize:'18px', fontWeight:800}}>Adaugă artist nou</div>
              <button onClick={() => setShowAddArtist(false)} style={{background:'none', border:'none', fontSize:'22px', cursor:'pointer', color:'#78716c'}}>×</button>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              <div>
                <label style={{fontSize:'11px', fontWeight:700, color:'#78716c', textTransform:'uppercase', display:'block', marginBottom:'4px'}}>Nume artist *</label>
                <input value={newArtist.nume} onChange={e => setNewArtist({...newArtist, nume: e.target.value})} placeholder="ex: Andrei Popescu" style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #e7e5e4', fontSize:'14px', fontFamily:F, boxSizing:'border-box'}} />
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                <div>
                  <label style={{fontSize:'11px', fontWeight:700, color:'#78716c', textTransform:'uppercase', display:'block', marginBottom:'4px'}}>Categorie</label>
                  <select value={newArtist.categorie} onChange={e => setNewArtist({...newArtist, categorie: e.target.value})} style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #e7e5e4', fontSize:'14px', fontFamily:F, background:'white'}}>
                    <option value="pop">Pop</option><option value="balcanic_pop">Balcanic Pop</option><option value="manele">Manele</option><option value="trap">Trap</option><option value="rap">Rap / Hip-Hop</option><option value="dance">Dance / Electronic</option><option value="rock">Rock</option><option value="lautareasca">Lăutărească / Populară</option><option value="petrecere">Petrecere</option><option value="cover">Cover / Party Band</option><option value="altele">Altele</option>
                  </select>
                </div>
                <div>
                  <label style={{fontSize:'11px', fontWeight:700, color:'#78716c', textTransform:'uppercase', display:'block', marginBottom:'4px'}}>Tip</label>
                  <select value={newArtist.tip} onChange={e => setNewArtist({...newArtist, tip: e.target.value})} style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #e7e5e4', fontSize:'14px', fontFamily:F, background:'white'}}>
                    <option value="propriu">FWD</option><option value="intermediere">EXTERN</option>
                  </select>
                </div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                <div>
                  <label style={{fontSize:'11px', fontWeight:700, color:'#78716c', textTransform:'uppercase', display:'block', marginBottom:'4px'}}>Fee (€)</label>
                  <input type="number" value={newArtist.fee} onFocus={e => e.target.select()} onChange={e => setNewArtist({...newArtist, fee: e.target.value})} placeholder="5000" style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #e7e5e4', fontSize:'14px', fontFamily:F, boxSizing:'border-box'}} />
                </div>
                <div>
                  <label style={{fontSize:'11px', fontWeight:700, color:'#78716c', textTransform:'uppercase', display:'block', marginBottom:'4px'}}>Transport /km</label>
                  <div style={{display:'flex', gap:'6px'}}>
                    <input type="number" step="0.1" value={newArtist.leiKm} onFocus={e => e.target.select()} onChange={e => setNewArtist({...newArtist, leiKm: e.target.value})} placeholder="5" style={{flex:1, padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #e7e5e4', fontSize:'14px', fontFamily:F, boxSizing:'border-box', minWidth:0}} />
                    <select value={newArtist.transportMoneda} onChange={e => setNewArtist({...newArtist, transportMoneda: e.target.value})} style={{padding:'10px 8px', borderRadius:'8px', border:'1.5px solid #e7e5e4', fontSize:'13px', fontFamily:F, background:'white'}}>
                      <option value="lei">lei</option><option value="euro">€</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                <div>
                  <label style={{fontSize:'11px', fontWeight:700, color:'#78716c', textTransform:'uppercase', display:'block', marginBottom:'4px'}}>Durată</label>
                  <input value={newArtist.durata} onChange={e => setNewArtist({...newArtist, durata: e.target.value})} placeholder="40 min" style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #e7e5e4', fontSize:'14px', fontFamily:F, background:'white', boxSizing:'border-box'}} />
                </div>
                <div>
                  <label style={{fontSize:'11px', fontWeight:700, color:'#78716c', textTransform:'uppercase', display:'block', marginBottom:'4px'}}>Diurnă fixă (lei, opțional)</label>
                  <input type="number" value={newArtist.diurnaFixa} onFocus={e => e.target.select()} onChange={e => setNewArtist({...newArtist, diurnaFixa: e.target.value})} placeholder="ex: 2500" style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #e7e5e4', fontSize:'14px', fontFamily:F, boxSizing:'border-box'}} />
                </div>
              </div>
              <div>
                <label style={{fontSize:'11px', fontWeight:700, color:'#78716c', textTransform:'uppercase', display:'block', marginBottom:'4px'}}>Cazare (persoanele se calculează automat)</label>
                <input value={newArtist.cazare} onChange={e => setNewArtist({...newArtist, cazare: e.target.value})} placeholder="ex: 2 sng + 3 dbl" style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #e7e5e4', fontSize:'14px', fontFamily:F, boxSizing:'border-box'}} />
              </div>
              <div style={{border:'1px solid #e7e5e4', borderRadius:'10px', padding:'12px', background:'#f3efff'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}>
                  <label style={{fontSize:'11px', fontWeight:700, color:'#1c1917', textTransform:'uppercase'}}>Variante de preț (seturi × durată + fee)</label>
                  <button onClick={addVariantaNou} style={{fontSize:'11px', fontWeight:700, color:'#1c1917', background:'white', border:'1px solid #1c1917', borderRadius:'6px', padding:'3px 8px', cursor:'pointer', fontFamily:F}}>+ Variantă</button>
                </div>
                {(newArtist.variante || []).length === 0 && <div style={{fontSize:'11px', color:'#a8a29e'}}>Fără variante = se folosește fee-ul de sus. Adaugă variante pentru artiști cu prețuri diferite pe seturi (ex: 1 set / 2 seturi).</div>}
                {(newArtist.variante || []).map((v: any, i: number) => (
                  <div key={i} style={{background:'white', borderRadius:'8px', padding:'8px', marginBottom:'6px'}}>
                    <div style={{display:'flex', gap:'6px', marginBottom:'6px'}}>
                      <input value={v.nume} onChange={e => updVariantaNou(i, { nume: e.target.value })} placeholder="ex: 2 seturi" style={{flex:1, padding:'7px 9px', borderRadius:'6px', border:'1px solid #e7e5e4', fontSize:'12px', fontFamily:F, boxSizing:'border-box'}} />
                      <button onClick={() => delVariantaNou(i)} style={{padding:'0 10px', background:'#fef2f2', color:'#dc2626', border:'none', borderRadius:'6px', fontSize:'16px', cursor:'pointer'}}>×</button>
                    </div>
                    <div style={{display:'flex', gap:'6px'}}>
                      <input type="number" value={v.fee} onFocus={e => e.target.select()} onChange={e => updVariantaNou(i, { fee: e.target.value })} placeholder="fee €" style={{flex:1, padding:'7px 9px', borderRadius:'6px', border:'1px solid #e7e5e4', fontSize:'12px', fontFamily:F, boxSizing:'border-box'}} />
                      <input value={v.durata} onChange={e => updVariantaNou(i, { durata: e.target.value })} placeholder="2 × 40 min" style={{flex:1, padding:'7px 9px', borderRadius:'6px', border:'1px solid #e7e5e4', fontSize:'12px', fontFamily:F, boxSizing:'border-box'}} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                <div>
                  <label style={{fontSize:'11px', fontWeight:700, color:'#78716c', textTransform:'uppercase', display:'block', marginBottom:'4px'}}>Bilete avion</label>
                  <input type="number" value={newArtist.bileteAvion} onFocus={e => e.target.select()} onChange={e => setNewArtist({...newArtist, bileteAvion: e.target.value})} placeholder="0" style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #e7e5e4', fontSize:'14px', fontFamily:F, boxSizing:'border-box'}} />
                </div>
                <div>
                  <label style={{fontSize:'11px', fontWeight:700, color:'#78716c', textTransform:'uppercase', display:'block', marginBottom:'4px'}}>Protocol (lei)</label>
                  <input type="number" value={newArtist.alcool} onFocus={e => e.target.select()} onChange={e => setNewArtist({...newArtist, alcool: e.target.value})} placeholder="0" style={{width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #e7e5e4', fontSize:'14px', fontFamily:F, boxSizing:'border-box'}} />
                </div>
              </div>
              <div style={{fontSize:'11px', color:'#a8a29e', marginTop:'-4px'}}>Poza se caută automat pe Chartex după nume.</div>
              <button onClick={salveazaArtistNou} disabled={savingArtist} style={{marginTop:'6px', padding:'13px', background:UI.purple, color:'white', border:'none', borderRadius:UI.radiusSm, fontSize:'14px', fontWeight:700, cursor: savingArtist ? 'wait' : 'pointer', fontFamily:F, opacity: savingArtist ? 0.6 : 1, boxShadow:'0 1px 3px rgba(0,0,0,0.3)'}}>
                {savingArtist ? 'Se salvează...' : 'Salvează artist'}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        input:focus, select:focus, textarea:focus { border-color: #1c1917 !important; box-shadow: 0 0 0 3px rgba(5,150,105,0.1) !important; }
        button { transition: all 0.15s ease; }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @media print {
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
          .print-only { display: block !important; position: absolute; top: 0; left: 0; width: 100%; padding: 40px; }
        }
      `}</style>
    </div>
  )
}
