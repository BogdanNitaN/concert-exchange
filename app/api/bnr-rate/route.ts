import { NextResponse } from 'next/server'

// cache in memorie pe durata unei zile
let cached: { rate: number; date: string; fetchedAt: number } | null = null

export async function GET() {
  try {
    // refoloseste cache-ul daca e mai nou de 6 ore
    if (cached && Date.now() - cached.fetchedAt < 6 * 60 * 60 * 1000) {
      return NextResponse.json({ rate: cached.rate, date: cached.date })
    }

    // adresa veche www.bnr.ro/nbrfxrates.xml e respinsa de BNR; subdomeniul curs.bnr.ro raspunde
    let xml = ''
    for (const u of ['https://curs.bnr.ro/nbrfxrates.xml', 'https://www.bnr.ro/nbrfxrates.xml']) {
      try {
        const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 21600 } })
        const t = await r.text()
        if (t.includes('<Rate currency="EUR"')) { xml = t; break }
      } catch {}
    }

    // extrage cursul EUR si data publicarii
    const eurMatch = xml.match(/<Rate currency="EUR">([\d.]+)<\/Rate>/)
    const dateMatch = xml.match(/<Cube date="([\d-]+)">/)

    const rate = eurMatch ? parseFloat(eurMatch[1]) : 5.2
    const real = !!eurMatch
    const date = dateMatch ? dateMatch[1] : new Date().toISOString().slice(0, 10)

    if (real) cached = { rate, date, fetchedAt: Date.now() }
    return NextResponse.json({ rate, date, real })
  } catch {
    return NextResponse.json({ rate: 5.2, date: new Date().toISOString().slice(0, 10) })
  }
}
