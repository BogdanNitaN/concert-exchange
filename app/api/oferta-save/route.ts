import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { error } = await supabase.from('oferte_generate').upsert(body, { onConflict: 'cod' })
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { cod, status } = await req.json()
    const { error } = await supabase.from('oferte_generate').update({ status }).eq('cod', cod)
    if (error) return NextResponse.json({ ok: false }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cod = searchParams.get('cod')
  try {
    let query = supabase.from('oferte_generate').select('*').order('created_at', { ascending: false })
    if (cod) query = supabase.from('oferte_generate').select('*').eq('cod', cod)
    const { data, error } = await query.limit(cod ? 1 : 50)
    if (error) return NextResponse.json({ oferte: [] })
    return NextResponse.json({ oferte: data || [] })
  } catch {
    return NextResponse.json({ oferte: [] })
  }
}
