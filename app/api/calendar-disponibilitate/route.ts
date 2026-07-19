import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { CALENDAR_TO_ROSTER, CALENDAR_EXCLUSE } from '@/lib/calendar-mapping'
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

    const cal = getCal()
    const lista = await cal.calendarList.list({ maxResults: 250 })
    const calendare = (lista.data.items || []).filter(c => c.summary && !CALENDAR_EXCLUSE.includes(c.summary))
    const timeMin = data + 'T00:00:00+03:00'
    const timeMax = data + 'T23:59:59+03:00'
    const rezultate = await Promise.all(calendare.map(async c => {
      const artist = CALENDAR_TO_ROSTER[c.summary!] || c.summary!
      const rd: any = roster.get(artist) || null
      try {
        const ev = await cal.events.list({ calendarId: c.id!, timeMin, timeMax, singleEvents: true, maxResults: 10 })
        const evenimente = (ev.data.items || []).map(e => ({ titlu: e.summary || '(fara titlu)', descriere: e.description || '', allDay: !!e.start?.date }))
        return { artist, calendar: c.summary, gen: rd?.categorie || 'altele', rosterData: rd, liber: evenimente.length === 0, evenimente }
      } catch {
        return { artist, calendar: c.summary, gen: rd?.categorie || 'altele', rosterData: rd, liber: null, eroare: true, evenimente: [] }
      }
    }))
    const liberi = rezultate.filter(r => r.liber === true).sort((a,b) => a.artist.localeCompare(b.artist))
    const ocupati = rezultate.filter(r => r.liber === false).sort((a,b) => a.artist.localeCompare(b.artist))
    const erori = rezultate.filter(r => r.liber === null)
    return NextResponse.json({ ok: true, data, totalVerificati: rezultate.length, nrLiberi: liberi.length, nrOcupati: ocupati.length, liberi, ocupati, erori })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
