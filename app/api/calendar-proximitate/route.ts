import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { extragOrasDinTitlu, normNume } from '@/lib/calendar-mapping'

function getCal() {
  const o = new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT_URI
  )
  o.setCredentials({ refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN })
  return google.calendar({ version: 'v3', auth: o })
}

async function distanta(from: string, to: string, origin: string): Promise<number | null> {
  try {
    const r = await fetch(origin + '/api/distance?from=' + encodeURIComponent(from) + '&to=' + encodeURIComponent(to))
    const d = await r.json()
    return typeof d.km === 'number' ? d.km : null
  } catch { return null }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const calendarId = url.searchParams.get('calendarId')
    const data = url.searchParams.get('data')
    const oras = url.searchParams.get('oras') || ''
    if (!calendarId || !data) return NextResponse.json({ ok: false, error: 'lipsa parametri' }, { status: 400 })

    const origin = url.origin
    const cal = getCal()
    const dataObj = new Date(data + 'T12:00:00')
    // fereastra ±3 luni
    const min = new Date(dataObj); min.setMonth(min.getMonth() - 3)
    const max = new Date(dataObj); max.setMonth(max.getMonth() + 3)

    const ev = await cal.events.list({
      calendarId, timeMin: min.toISOString(), timeMax: max.toISOString(),
      singleEvents: true, orderBy: 'startTime', maxResults: 100,
    })
    const evenimente = (ev.data.items || []).map(e => {
      const start = e.start?.date || e.start?.dateTime?.slice(0,10) || ''
      return { titlu: e.summary || '', data: start, oras: extragOrasDinTitlu(e.summary || ''), created: e.created || null }
    }).filter(e => e.data && e.data !== data) // exclud ziua cautata

    const zileDiff = (d: string) => Math.round((new Date(d + 'T12:00:00').getTime() - dataObj.getTime()) / 86400000)

    // context zi±1
    const ziMinus = evenimente.find(e => zileDiff(e.data) === -1)
    const ziPlus = evenimente.find(e => zileDiff(e.data) === 1)

    // proximitate: evenimente cu oras, calculez distanta fata de orasul cautat
    const proximitati = []
    let ultimaInZona: any = null
    if (oras) {
      const orasNormCautat = normNume(oras)
      for (const e of evenimente) {
        if (!e.oras) continue
        // acelasi oras (nume identice normalizate) -> 0 km, fara apel (Google da 'no route' pt origine=destinatie)
        let km: number | null
        if (normNume(e.oras) === orasNormCautat) {
          km = 0
        } else {
          km = await distanta(oras, e.oras, origin)
        }
        if (km === null) continue
        const zile = zileDiff(e.data)
        if (km <= 200) {
          proximitati.push({ titlu: e.titlu, data: e.data, oras: e.oras, km, zile, created: e.created, tip: km <= 30 ? 'acelasi_oras' : 'aproape' })
        }
        // ultima data in zona (in trecut, <= 60km)
        if (km <= 60 && zile < 0) {
          if (!ultimaInZona || zile > ultimaInZona.zile) ultimaInZona = { titlu: e.titlu, data: e.data, oras: e.oras, km, zile, created: e.created }
        }
      }
    }
    proximitati.sort((a,b) => Math.abs(a.zile) - Math.abs(b.zile))

    return NextResponse.json({ ok: true, ziMinus, ziPlus, proximitati, ultimaInZona })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
