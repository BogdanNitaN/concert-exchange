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

// orase romanesti principale: adaug ", Romania" ca sa evit ambiguitatea
// (ex: exista Cluj si in alta parte). Pentru orase din alta tara, userul poate
// scrie "Oras, Tara" si respectam. Chisinau -> Moldova automat.
const RO_CITIES = ['bucuresti','bucurești','cluj','cluj-napoca','timisoara','timișoara','iasi','iași','constanta','constanța','craiova','brasov','brașov','galati','galați','ploiesti','ploiești','oradea','braila','brăila','arad','pitesti','pitești','sibiu','bacau','bacău','targu mures','târgu mureș','baia mare','buzau','buzău','satu mare','botosani','botoșani','suceava','piatra neamt','piatra neamț','focsani','focșani','targu jiu','târgu jiu','deva','alba iulia','resita','reșița','tulcea','slatina','ramnicu valcea','râmnicu vâlcea','targoviste','târgoviște','giurgiu','alexandria','calarasi','călărași','slobozia','zalau','zalău','bistrita','bistrița','vaslui','sfantu gheorghe','sfântu gheorghe','miercurea ciuc','onesti','onești','roman','dej','turda','sighisoara','sighișoara','medias','mediaș']
const MD_CITIES = ['chisinau','chișinău','balti','bălți','tiraspol','cahul','orhei','ungheni','soroca','comrat']

function withCountry(city: string): string {
  const c = city.trim().toLowerCase()
  // daca userul a scris deja tara (are virgula), respectam
  if (city.includes(',')) return city
  if (MD_CITIES.some(m => c === m || c.includes(m))) return city + ', Moldova'
  if (RO_CITIES.some(m => c === m)) return city + ', Romania'
  // orice alt oras (Europa): il lasam asa, Google il gaseste
  return city
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
  // acelasi oras (indiferent de diacritice) => 0 km, fara sa mai chemam Google
  const faraDiac = (x: string) => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')
  if (faraDiac(from) === faraDiac(to)) {
    return NextResponse.json({ km: 0, sameCity: true })
  }

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
      + '?origins=' + encodeURIComponent(withCountry(from))
      + '&destinations=' + encodeURIComponent(withCountry(to))
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
