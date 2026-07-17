import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim().toLowerCase()

  try {
    const { data, error } = await supabase
      .from('oferta_artisti')
      .select('*')
      .order('nume')

    if (error || !data) return NextResponse.json({ artists: [] })

    // daca e query, filtrez; altfel returnez toti
    const filtered = q
      ? data.filter(a => a.nume.toLowerCase().includes(q))
      : data

    return NextResponse.json({ artists: filtered })
  } catch {
    return NextResponse.json({ artists: [] })
  }
}
