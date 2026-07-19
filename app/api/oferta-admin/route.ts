import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function checkAdmin(admin: ReturnType<typeof adminClient>, adminUsername: string) {
  const { data } = await admin.auth.admin.listUsers()
  const u = data?.users?.find(x => x.user_metadata?.username?.toLowerCase() === adminUsername?.trim().toLowerCase())
  return u?.user_metadata?.role === 'oferta_admin'
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const adminUsername = url.searchParams.get('admin') || ''
    const admin = adminClient()
    if (!(await checkAdmin(admin, adminUsername))) {
      return NextResponse.json({ ok: false, error: 'Neautorizat' }, { status: 403 })
    }
    const { data } = await admin.auth.admin.listUsers()
    const users = (data?.users || [])
      .filter(u => u.user_metadata?.username && ['oferta_admin','oferta_user'].includes(u.user_metadata?.role))
      .map(u => ({
        id: u.id,
        email: u.email,
        username: u.user_metadata?.username || '',
        role: u.user_metadata?.role || 'user',
        blocat: u.user_metadata?.blocat || false,
        ultimaLogare: u.last_sign_in_at,
      }))
    return NextResponse.json({ ok: true, users })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { adminUsername, actiune, userId, parolaNoua } = await req.json()
    const admin = adminClient()
    if (!(await checkAdmin(admin, adminUsername))) {
      return NextResponse.json({ ok: false, error: 'Neautorizat' }, { status: 403 })
    }
    const { data: target } = await admin.auth.admin.getUserById(userId)
    if (target?.user?.user_metadata?.role === 'oferta_admin') {
      return NextResponse.json({ ok: false, error: 'Nu poți modifica un cont admin' }, { status: 400 })
    }

    if (actiune === 'block' || actiune === 'unblock') {
      const meta = target?.user?.user_metadata || {}
      await admin.auth.admin.updateUserById(userId, {
        user_metadata: { ...meta, blocat: actiune === 'block' }
      })
      return NextResponse.json({ ok: true })
    }
    if (actiune === 'reset-password') {
      if (!parolaNoua || parolaNoua.length < 6) {
        return NextResponse.json({ ok: false, error: 'Parola trebuie să aibă minim 6 caractere' }, { status: 400 })
      }
      await admin.auth.admin.updateUserById(userId, { password: parolaNoua })
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ ok: false, error: 'Acțiune necunoscută' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
