import { createClient } from '@supabase/supabase-js'

// Validare pe server a sesiunii Supabase pentru API-urile asistentului.
// Clientul trimite: Authorization: Bearer <access_token>
export async function verificaAcces(req: Request): Promise<{ ok: boolean; motiv?: string }> {
  try {
    const auth = req.headers.get('authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (!token) return { ok: false, motiv: 'lipsa token' }
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) return { ok: false, motiv: 'token invalid' }
    const role = data.user.user_metadata?.role
    const blocat = data.user.user_metadata?.blocat
    if (blocat) return { ok: false, motiv: 'cont blocat' }
    if (role !== 'oferta_admin' && role !== 'oferta_user') return { ok: false, motiv: 'fara rol' }
    return { ok: true }
  } catch {
    return { ok: false, motiv: 'eroare verificare' }
  }
}
