import { NextResponse } from 'next/server'
import { google } from 'googleapis'

function getCalendarClient() {
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT_URI
  )
  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN })
  return google.calendar({ version: 'v3', auth: oauth2 })
}

export async function GET() {
  try {
    const cal = getCalendarClient()
    const res = await cal.calendarList.list({ maxResults: 250 })
    const calendare = (res.data.items || []).map(c => ({
      id: c.id,
      nume: c.summary,
    }))
    return NextResponse.json({ ok: true, total: calendare.length, calendare })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
