import { NextResponse } from 'next/server'
import { verificaAcces } from './auth-asistent'

// Poarta de acces pentru rutele interne (panoul /oferta si datele de roster).
// Trei cai valide, in ordinea in care sunt verificate:
//   1. INTERNAL_API_KEY  - apeluri server-to-server (asistentul isi cheama singur uneltele)
//   2. sesiune Supabase  - echipa logata in /oferta, rol oferta_admin / oferta_user
//   3. CRON_SECRET       - doar pe rutele de cron, prin cerAccesCron
//
// Rutele publice (roster-public, epk-lista, artisti-client, share/[token]) NU trec pe aici.

export function areCheieInterna(req: Request): boolean {
  const cheie = process.env.INTERNAL_API_KEY
  if (!cheie) return false
  return req.headers.get('x-internal-key') === cheie
}

// Headerele pe care le pune un apel server-to-server din interiorul aplicatiei.
export function headereInterne(): Record<string, string> {
  const cheie = process.env.INTERNAL_API_KEY
  return cheie ? { 'x-internal-key': cheie } : {}
}

// Returneaza un raspuns 401 daca apelul nu are acces, sau null daca e in regula.
// Folosire:  const blocat = await cerAcces(req); if (blocat) return blocat
export async function cerAcces(req: Request): Promise<NextResponse | null> {
  if (areCheieInterna(req)) return null
  const a = await verificaAcces(req)
  if (a.ok) return null
  return NextResponse.json({ ok: false, error: 'Acces interzis: ' + (a.motiv || 'neautentificat') }, { status: 401 })
}

// Pentru joburile Vercel Cron. Vercel trimite automat Authorization: Bearer <CRON_SECRET>
// daca variabila CRON_SECRET e definita in proiect. Fara ea, ruta ramane inchisa.
export async function cerAccesCron(req: Request): Promise<NextResponse | null> {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') === 'Bearer ' + secret) return null
  return cerAcces(req)
}
