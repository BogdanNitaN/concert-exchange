import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { CALENDAR_TO_ROSTER, CALENDAR_EXCLUSE, normNume, ARTISTI_INACTIVI } from '@/lib/calendar-mapping'
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

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const data = url.searchParams.get('data')
    if (!data) return NextResponse.json({ ok: false, error: 'Lipsa data' }, { status: 400 })
    // incarc datele roster (gen + detalii pentru oferta)
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data: rosterData } = await sb.from('oferta_artisti').select('nume, categorie, fee_standard, lei_km, cazare, nr_persoane, bilete_avion, tip')
    const roster = new Map((rosterData || []).map((a: any) => [a.nume, a]))
    // mapare normalizata: nume calendar normalizat -> nume roster
    const calToRosterNorm = new Map<string, string>()
    for (const [k, v] of Object.entries(CALENDAR_TO_ROSTER)) calToRosterNorm.set(normNume(k), v)
    // roster normalizat: nume normalizat -> date
    const rosterNorm = new Map<string, any>()
    for (const a of (rosterData || [])) rosterNorm.set(normNume(a.nume), a)

    const cal = getCal()
    const lista = await cal.calendarList.list({ maxResults: 250 })
    const excluseNorm = CALENDAR_EXCLUSE.map(normNume)
    const calendare = (lista.data.items || []).filter(c => c.summary && !excluseNorm.includes(normNume(c.summary)))
    const timeMin = data + 'T00:00:00+03:00'
    const timeMax = data + 'T23:59:59+03:00'
    const rezultate = await Promise.all(calendare.map(async c => {
      const numeCalNorm = normNume(c.summary!)
      const curatEpicenter = (n: string) => n.replace(/\s*[-x@]?\s*epicentr[u]?\b/gi, '').replace(/\s+/g, ' ').trim()
      const artist = calToRosterNorm.get(numeCalNorm) || curatEpicenter(c.summary!.trim())
      const rd: any = rosterNorm.get(normNume(artist)) || null
      try {
        const ev = await cal.events.list({ calendarId: c.id!, timeMin, timeMax, singleEvents: true, maxResults: 10 })
        const evenimente = (ev.data.items || []).map(e => ({ titlu: e.summary || '(fara titlu)', descriere: e.description || '', allDay: !!e.start?.date }))
        return { artist, calendar: c.summary, calendarId: c.id, gen: rd?.categorie || 'altele', rosterData: rd, liber: evenimente.length === 0, evenimente }
      } catch {
        return { artist, calendar: c.summary, calendarId: c.id, gen: rd?.categorie || 'altele', rosterData: rd, liber: null, eroare: true, evenimente: [] }
      }
    }))
    // deduplic pe artist: daca 2 calendare -> acelasi artist, ocupat are prioritate
    const perArtist = new Map<string, any>()
    for (const r of rezultate) {
      const ex = perArtist.get(r.artist)
      if (!ex) { perArtist.set(r.artist, r); continue }
      // daca noul e ocupat sau are evenimente, il prefer (ocupat > liber)
      if (r.liber === false && ex.liber !== false) perArtist.set(r.artist, r)
      else if (r.liber === false && ex.liber === false) {
        // ambele ocupate: combin evenimentele
        ex.evenimente = [...ex.evenimente, ...r.evenimente]
      }
    }
    const inactiviNorm = ARTISTI_INACTIVI.map(normNume)
    const dedup = Array.from(perArtist.values()).filter((r: any) => !inactiviNorm.includes(normNume(r.artist)))
    const liberi = dedup.filter(r => r.liber === true).sort((a,b) => a.artist.localeCompare(b.artist))
    const ocupati = dedup.filter(r => r.liber === false).sort((a,b) => a.artist.localeCompare(b.artist))
    const erori = dedup.filter(r => r.liber === null)
    return NextResponse.json({ ok: true, data, totalVerificati: rezultate.length, nrLiberi: liberi.length, nrOcupati: ocupati.length, liberi, ocupati, erori })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
