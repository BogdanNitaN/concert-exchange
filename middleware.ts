import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Plasa de siguranta peste /api/oferta-*: prin definitie sunt rute interne.
// Verificarea reala se face in fiecare ruta (cerAcces din lib/auth-api).
// Rolul middleware-ului e sa prinda rutele adaugate pe viitor si uitate fara verificare:
// implicit sunt inchise, iar o ruta publica noua trebuie trecuta explicit mai jos.
const PUBLICE = [
  '/api/oferta-login', // gaseste emailul dupa username, se cheama inainte de login
  '/api/oferta-admin', // are verificare proprie de admin
  '/api/oferta-poze',  // doar mapare nume -> poza Spotify, nimic sensibil
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (PUBLICE.some(p => pathname.startsWith(p))) return NextResponse.next()

  const areSesiune = !!request.headers.get('authorization')
  const areCheieInterna = !!request.headers.get('x-internal-key')
  if (!areSesiune && !areCheieInterna) {
    return NextResponse.json({ ok: false, error: 'Acces interzis' }, { status: 401 })
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/api/oferta-:path*',
}
