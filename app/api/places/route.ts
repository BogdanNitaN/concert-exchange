import { NextRequest, NextResponse } from 'next/server'
export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get('input')
  const placesType = request.nextUrl.searchParams.get('type') || 'establishment'
  if (!input) return NextResponse.json({ error: 'No input' }, { status: 400 })
  const apiKey = process.env.GOOGLE_PLACES_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY
  // Mapping: cities -> (cities), venue/establishment -> establishment, search -> nu trimitem types
  const typesParam = placesType === 'cities' ? '(cities)' : (placesType === 'search' ? '' : 'establishment')
  const typesQuery = typesParam ? `&types=${encodeURIComponent(typesParam)}` : ''
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&components=country:ro|country:md${typesQuery}&key=${apiKey}&language=ro`,
      { next: { revalidate: 0 } }
    )
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
