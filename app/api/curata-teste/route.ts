import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cerAccesCron } from '@/lib/auth-api'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Sterge automat ofertele marcate ca test. Chemat de Vercel Cron la 18:00 si 23:59 (ora RO).
export async function GET(req: Request) {
  const blocat = await cerAccesCron(req)
  if (blocat) return blocat
  try {
    const { data, error } = await supabase
      .from('oferte_generate')
      .delete()
      .eq('test', true)
      .select('cod')
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, sterse: (data || []).length })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
