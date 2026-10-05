import { createClient } from '@supabase/supabase-js'
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
for (const q of ['%lass%','%vcov%','IDK']) {
  const { data } = await s.from('oferta_artisti').select('nume, tier, fee_standard').ilike('nume', q)
  data.forEach(a => console.log('"' + a.nume + '" | tier: ' + a.tier + ' | fee: ' + a.fee_standard))
}
