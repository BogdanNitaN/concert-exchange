import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { CALENDAR_TO_ROSTER, normNume } from '@/lib/calendar-mapping'

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
    const artist = url.searchParams.get('artist')
    const data = url.searchParams.get('data')
    if (!artist || !data) return NextResponse.json({ ok: false, error: 'lipsa parametri' }, { status: 400 })

    const cal = getCal()
    const lista = await cal.calendarList.list({ maxResults: 250 })
    // gasesc calendarul artistului (prin mapare normalizata)
    const calToRosterNorm = new Map<string, string>()
    for (const [k, v] of Object.entries(CALENDAR_TO_ROSTER)) calToRosterNorm.set(normNume(k), v)
    const artistNorm = normNume(artist)
    const calArtist = (lista.data.items || []).find(c => {
      if (!c.summary) return false
      const rosterNume = calToRosterNorm.get(normNume(c.summary)) || c.summary.trim()
      return normNume(rosterNume) === artistNorm
    })
    if (!calArtist) return NextResponse.json({ ok: true, gasit: false, ocupat: false })

    const timeMin = data + 'T00:00:00+03:00'
    const timeMax = data + 'T23:59:59+03:00'
    const ev = await cal.events.list({ calendarId: calArtist.id!, timeMin, timeMax, singleEvents: true, maxResults: 10 })
    const evenimente = (ev.data.items || []).map(e => ({ titlu: e.summary || '(fara titlu)', created: e.created || null }))
    return NextResponse.json({ ok: true, gasit: true, ocupat: evenimente.length > 0, evenimente })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
