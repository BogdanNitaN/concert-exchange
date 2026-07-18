import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: Request) {
  try {
    const { username } = await req.json()
    if (!username) return NextResponse.json({ email: null })
    const { data } = await admin.auth.admin.listUsers()
    const u = data?.users?.find(x =>
      x.user_metadata?.username?.toLowerCase() === username.trim().toLowerCase()
    )
    if (!u) return NextResponse.json({ email: null })
    return NextResponse.json({ email: u.email, blocat: u.user_metadata?.blocat || false })
  } catch {
    return NextResponse.json({ email: null })
  }
}
