import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const rateLimit = new Map<string, { count: number; reset: number }>()
function checkRate(ip: string): boolean {
  const now = Date.now()
  const e = rateLimit.get(ip)
  if (!e || now > e.reset) { rateLimit.set(ip, { count: 1, reset: now + 10 * 60 * 1000 }); return true }
  if (e.count >= 35) return false
  e.count++
  return true
}

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  if (!checkRate(ip)) return NextResponse.json({ error: 'too many requests' }, { status: 429 })

  const { searchParams } = new URL(req.url)
  const to = (searchParams.get('to') || '').trim().slice(0, 80)
  const from = (searchParams.get('from') || 'Bucuresti').trim().slice(0, 80)

  if (!to) return NextResponse.json({ error: 'no city' }, { status: 400 })

  const fromKey = from.toLowerCase()
  const toKey = to.toLowerCase()

  // 1. verifica cache-ul din Supabase
  try {
    const { data } = await supabase
      .from('distance_cache')
      .select('km')
      .eq('city_from', fromKey)
      .eq('city_to', toKey)
      .maybeSingle()
    if (data?.km) {
      return NextResponse.json({ km: data.km, cached: true })
    }
  } catch {}

  // 2. cheama Google Distance Matrix
  try {
    const key = process.env.GOOGLE_PLACES_SERVER_KEY
    const url = 'https://maps.googleapis.com/maps/api/distancematrix/json'
      + '?origins=' + encodeURIComponent(from + ', Romania')
      + '&destinations=' + encodeURIComponent(to + ', Romania')
      + '&mode=driving&units=metric&key=' + key

    const res = await fetch(url)
    const d = await res.json()
    const meters = d?.rows?.[0]?.elements?.[0]?.distance?.value

    if (!meters) return NextResponse.json({ error: 'no route' }, { status: 404 })

    const km = Math.round(meters / 1000)

    // 3. salveaza in cache
    try {
      await supabase.from('distance_cache').insert({ city_from: fromKey, city_to: toKey, km })
    } catch {}

    return NextResponse.json({ km, cached: false })
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
