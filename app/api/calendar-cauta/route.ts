import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { CALENDAR_TO_ROSTER, normNume, extragOrasDinTitlu } from '@/lib/calendar-mapping'

export const maxDuration = 60

function getCalendarClient() {
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT_URI
  )
  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN })
  return google.calendar({ version: 'v3', auth: oauth2 })
}

// Cauta un text in TOATE calendarele artistilor (titluri + descrieri evenimente)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const text = (url.searchParams.get('text') || '').trim()
    if (!text || text.length < 3) return NextResponse.json({ ok: false, error: 'text prea scurt (minim 3 caractere)' }, { status: 400 })

    const cal = getCalendarClient()
    const lista = await cal.calendarList.list({ maxResults: 250 })
    const calendare = (lista.data.items || []).filter(c => c.id && c.summary)

    const acum = new Date()
    const timeMin = new Date(acum.getFullYear() - 1, 0, 1).toISOString()
    const timeMax = new Date(acum.getFullYear() + 1, 11, 31).toISOString()

    // caut in paralel in toate calendarele
    const rezultate = await Promise.all(calendare.map(async (c) => {
      try {
        const ev = await cal.events.list({
          calendarId: c.id!,
          q: text,
          timeMin, timeMax,
          maxResults: 20,
          singleEvents: true,
          orderBy: 'startTime',
        })
        const gasite = (ev.data.items || []).map(e => ({
          artist: c.summary,
          titlu: e.summary || '',
          descriere: (e.description || '').slice(0, 150),
          data: (e.start?.date || e.start?.dateTime || '').slice(0, 10),
          oras: extragOrasDinTitlu(e.summary || '') || null,
          adaugat: (e.created || '').slice(0, 10),
        }))
        return gasite
      } catch { return [] }
    }))

    const toate = rezultate.flat().sort((a, b) => a.data.localeCompare(b.data))
    return NextResponse.json({ ok: true, cautat: text, gasite: toate.length, evenimente: toate })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
