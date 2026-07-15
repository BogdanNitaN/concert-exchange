import { NextResponse } from 'next/server'

// cache in memorie pe durata unei zile
let cached: { rate: number; date: string; fetchedAt: number } | null = null

export async function GET() {
  try {
    // refoloseste cache-ul daca e mai nou de 6 ore
    if (cached && Date.now() - cached.fetchedAt < 6 * 60 * 60 * 1000) {
      return NextResponse.json({ rate: cached.rate, date: cached.date })
    }

    const res = await fetch('https://www.bnr.ro/nbrfxrates.xml', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 21600 },
    })
    const xml = await res.text()

    // extrage cursul EUR si data publicarii
    const eurMatch = xml.match(/<Rate currency="EUR">([\d.]+)<\/Rate>/)
    const dateMatch = xml.match(/<Cube date="([\d-]+)">/)

    const rate = eurMatch ? parseFloat(eurMatch[1]) : 5.2
    const date = dateMatch ? dateMatch[1] : new Date().toISOString().slice(0, 10)

    cached = { rate, date, fetchedAt: Date.now() }
    return NextResponse.json({ rate, date })
  } catch {
    return NextResponse.json({ rate: 5.2, date: new Date().toISOString().slice(0, 10) })
  }
}
