import { supabase } from './supabase'

// fetch care ataseaza automat tokenul sesiunii Supabase.
// De folosit din paginile /oferta pentru orice ruta protejata cu cerAcces.
export async function fetchAuth(input: string, init: RequestInit = {}): Promise<Response> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  const headers = new Headers(init.headers || {})
  if (token) headers.set('authorization', 'Bearer ' + token)
  return fetch(input, { ...init, headers })
}
