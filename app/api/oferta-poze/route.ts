import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase.from('artist_images').select('name, image_url')
    if (error || !data) return NextResponse.json({})
    const out: Record<string, string> = {}
    for (const row of data) out[row.name] = row.image_url
    return NextResponse.json(out)
  } catch {
    return NextResponse.json({})
  }
}
