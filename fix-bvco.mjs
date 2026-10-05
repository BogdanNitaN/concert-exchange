import { createClient } from '@supabase/supabase-js'
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
// BVCOVIA (majuscule) -> 0.60 euro
const { error: e1 } = await s.from('oferta_artisti').update({ eur_km: 0.6, transport_moneda: 'euro' }).eq('nume', 'BVCOVIA')
console.log(e1 ? 'BVCOVIA EROARE: ' + e1.message : 'BVCOVIA -> 0.60 euro/km')
// combo-ul: 0.60 euro (acelasi ca individual - transportul e per km, nu dublat)
const { error: e2 } = await s.from('oferta_artisti').update({ eur_km: 0.6, transport_moneda: 'euro' }).eq('nume', 'MARKO GLASS & BVCOVIA')
console.log(e2 ? 'Combo EROARE: ' + e2.message : 'MARKO GLASS & BVCOVIA -> 0.60 euro/km')
// verific tot
const { data } = await s.from('oferta_artisti').select('nume, eur_km, lei_km, transport_moneda, tier').or('nume.ilike.%marko%,nume.ilike.%bvcovia%')
console.log('\nStare finala:')
data.forEach(a => console.log('  ' + a.nume + ' | eur_km: ' + a.eur_km + ' | moneda: ' + a.transport_moneda + ' | tier: ' + a.tier))
