import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { CALENDAR_TO_ROSTER, normNume, extragOrasDinTitlu } from '@/lib/calendar-mapping'
import { createClient } from '@supabase/supabase-js'

function getCal() {
  const o = new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT_URI
  )
  o.setCredentials({ refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN })
  return google.calendar({ version: 'v3', auth: o })
}

async function distanta(a: string, b: string, origin: string): Promise<number | null> {
  if (normNume(a) === normNume(b)) return 0
  try {
    const r = await fetch(origin + '/api/distance?from=' + encodeURIComponent(a) + '&to=' + encodeURIComponent(b))
    const d = await r.json()
    return typeof d.km === 'number' ? d.km : null
  } catch { return null }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const origin = url.origin
    const artist = url.searchParams.get('artist')
    const oras = url.searchParams.get('oras') || ''
    const dataQuery = url.searchParams.get('data') || ''
    if (!artist) return NextResponse.json({ ok: false, error: 'lipsa artist' }, { status: 400 })

    const cal = getCal()
    const lista = await cal.calendarList.list({ maxResults: 250 })
    const calToRosterNorm = new Map<string, string>()
    for (const [k, v] of Object.entries(CALENDAR_TO_ROSTER)) calToRosterNorm.set(normNume(k), v)
    const artistNorm = normNume(artist)
    // matching fuzzy: potrivire exacta intai, apoi "contine"
    const candidati = (lista.data.items || []).filter(c => c.summary).map(c => {
      const rosterNume = calToRosterNorm.get(normNume(c.summary!)) || c.summary!.trim()
      return { cal: c, rosterNume, norm: normNume(rosterNume) }
    })
    let calArtist = candidati.find(x => x.norm === artistNorm)?.cal
    let numeGasit = candidati.find(x => x.norm === artistNorm)?.rosterNume
    if (!calArtist) {
      // contine (Motans -> The Motans, carlas -> Carla's Dreams)
      const potriviri = candidati.filter(x => x.norm.includes(artistNorm) || artistNorm.includes(x.norm))
      if (potriviri.length > 0) { calArtist = potriviri[0].cal; numeGasit = potriviri[0].rosterNume }
    }
    if (!calArtist) return NextResponse.json({ ok: true, gasit: false })

    const acum = new Date()
    const min = new Date(acum.getFullYear(), acum.getMonth() - 3, 1)
    const max = new Date(acum.getFullYear(), 11, 31, 23, 59, 59)
    const ev = await cal.events.list({
      calendarId: calArtist.id!, timeMin: min.toISOString(), timeMax: max.toISOString(),
      singleEvents: true, orderBy: 'startTime', maxResults: 300
    })
    // cuvinte-cheie din numele artistului (ex "irina", "rimes") pt a distinge artist vs echipa
    const cuvinteArtist = (numeGasit || artist).toLowerCase().replace(/[^a-z0-9\u00e0-\u017f ]/gi, '').split(/\s+/).filter(w => w.length >= 3 && !['the','and','feat'].includes(w))
    const despreArtist = (titlu: string) => {
      const t = titlu.toLowerCase()
      return cuvinteArtist.some(w => t.includes(w))
    }
    const evenimente = (ev.data.items || []).flatMap(e => {
      const start = (e.start?.date || e.start?.dateTime || '').slice(0, 10)
      if (!start) return []
      // end: pt all-day Google da end exclusiv (ziua urmatoare), deci scad 1 zi
      let endRaw = (e.end?.date || e.end?.dateTime || '').slice(0, 10)
      const titlu = e.summary || ''
      const descriere = e.description || ''
      const orasEv = extragOrasDinTitlu(titlu)
      const desprEl = despreArtist(titlu)
      const areMarcajConcert = /^\s*\((P|C)/i.test(titlu) || !!orasEv
      const areCuvantBlocaj = /vacan|concediu|liber|off|indisponibil|blocat|nu se ia|zi liber|pauza/i.test(titlu)
      let tip: 'show' | 'indisponibil' | 'echipa' | 'nota' = 'nota'
      if (desprEl && areCuvantBlocaj) tip = 'indisponibil'
      else if (desprEl && areMarcajConcert) tip = 'show'
      else if (!desprEl && (areMarcajConcert || areCuvantBlocaj)) tip = 'echipa'
      else if (desprEl && !areMarcajConcert && !areCuvantBlocaj) tip = 'nota'
      // expandez intervalul: o intrare pentru fiecare zi intre start si end
      const zile: string[] = [start]
      if (e.start?.date && endRaw && endRaw > start) {
        // all-day pe interval: end exclusiv, generez zilele pana la end-1
        let d = new Date(start + 'T12:00:00')
        const dEnd = new Date(endRaw + 'T12:00:00')
        while (true) {
          d.setDate(d.getDate() + 1)
          const ds = d.toISOString().slice(0, 10)
          if (ds >= endRaw) break
          zile.push(ds)
        }
      }
      return zile.map(z => ({ titlu, descriere, data: z, oras: orasEv, created: e.created || null, tip, despreArtist: desprEl }))
    })

    const azi = new Date(); azi.setHours(0, 0, 0, 0)
    const ocupate = evenimente.map(e => ({ ...e, viitor: new Date(e.data + 'T12:00:00') >= azi }))

    let inOrasViitor: any[] = []
    let ultimaInZona: any = null
    if (oras) {
      const orasNorm = normNume(oras)
      for (const e of evenimente) {
        if (!e.oras) continue
        let km: number | null
        if (normNume(e.oras) === orasNorm) km = 0
        else km = await distanta(oras, e.oras, origin)
        if (km === null) continue
        const viitor = new Date(e.data + 'T12:00:00') >= azi
        if (viitor && km <= 50) inOrasViitor.push({ ...e, km })
        if (!viitor && km <= 200) {
          if (!ultimaInZona || e.data > ultimaInZona.data) ultimaInZona = { ...e, km }
        }
      }
    }

    // datele de roster (fee, transport, cazare) pt ofertare
    let rosterData: any = null
    try {
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
      const { data: rd } = await sb.from('oferta_artisti').select('*').ilike('nume', numeGasit || artist).maybeSingle()
      rosterData = rd || null
    } catch {}

    let peData: any = null
    if (dataQuery) {
      const evPeData = ocupate.filter((e: any) => e.data === dataQuery)
      // context: +/- 3 zile in jurul datei
      const dObj = new Date(dataQuery + 'T12:00:00')
      const dMin = new Date(dObj); dMin.setDate(dMin.getDate() - 3)
      const dMax = new Date(dObj); dMax.setDate(dMax.getDate() + 3)
      const iso = (d: Date) => d.toISOString().slice(0, 10)
      const contextZile = ocupate.filter((e: any) => e.data >= iso(dMin) && e.data <= iso(dMax) && e.data !== dataQuery)
      const blocante = evPeData.filter((e: any) => e.tip === 'show' || e.tip === 'indisponibil')
      const echipaEv = evPeData.filter((e: any) => e.tip === 'echipa')
      // status: ocupat daca show/indisponibil; verifica DOAR daca echipa (poate afecta); liber daca doar note
      let status: 'liber' | 'ocupat' | 'verifica' = 'liber'
      if (blocante.length > 0) status = 'ocupat'
      else if (echipaEv.length > 0) status = 'verifica'
      peData = {
        data: dataQuery,
        liber: blocante.length === 0,
        status,
        evenimente: evPeData,
        context: contextZile.sort((a: any, b: any) => a.data.localeCompare(b.data))
      }
    }
    // numar zile libere viitoare (de azi pana final an) - fara show/indisponibil
    const aziISO = new Date().toISOString().slice(0, 10)
    const finalAn = new Date(new Date().getFullYear(), 11, 31).toISOString().slice(0, 10)
    const zileOcupateSet = new Set(ocupate.filter((e: any) => (e.tip === 'show' || e.tip === 'indisponibil') && e.data >= aziISO).map((e: any) => e.data))
    // total zile ramase in an
    let totalZile = 0
    const azic = new Date(aziISO + 'T12:00:00'), fin = new Date(finalAn + 'T12:00:00')
    while (azic <= fin) { totalZile++; azic.setDate(azic.getDate() + 1) }
    const zileLibere = totalZile - zileOcupateSet.size

    return NextResponse.json({
      ok: true, gasit: true, artist: numeGasit || artist,
      ocupate: ocupate.sort((a, b) => a.data.localeCompare(b.data)),
      inOrasViitor, ultimaInZona, peData, rosterData,
      zileLibere, zileOcupate: zileOcupateSet.size, totalZile
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
