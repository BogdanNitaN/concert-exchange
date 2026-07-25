import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET: toate regulile active
export async function GET() {
  const { data, error } = await supabase
    .from('asistent_memorie')
    .select('id, regula, created_at')
    .eq('activa', true)
    .order('created_at')
  if (error) return NextResponse.json({ ok: false, reguli: [] })
  return NextResponse.json({ ok: true, reguli: data || [] })
}

// POST: adauga o regula
export async function POST(req: Request) {
  const { regula } = await req.json()
  if (!regula || typeof regula !== 'string' || regula.trim().length < 3) {
    return NextResponse.json({ ok: false, error: 'regula invalida' }, { status: 400 })
  }
  const { error } = await supabase.from('asistent_memorie').insert({ regula: regula.trim() })
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE: dezactiveaza o regula dupa id
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ ok: false, error: 'lipsa id' }, { status: 400 })
  const { error } = await supabase.from('asistent_memorie').update({ activa: false }).eq('id', id)
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
