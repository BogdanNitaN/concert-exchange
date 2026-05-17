import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get('input')
  if (!input) return NextResponse.json({ error: 'No input' }, { status: 400 })

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&components=country:ro|country:md&types=establishment&key=${apiKey}&language=ro`,
      { next: { revalidate: 0 } }
    )
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
