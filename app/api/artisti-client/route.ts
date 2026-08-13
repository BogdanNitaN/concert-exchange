import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { genuriPentru, esteAscuns, tierPentru } from '@/lib/genuri-catalog'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
)

// Ruta e publica (o consuma /prom si formularul de booking), deci NU iese fee-ul exact.
// Onorariul se transforma intr-un interval; filtrarea pe buget din ArtistStep merge la fel.
//
// Benzi fixe, capat superior inclusiv: un fee de 5000 si unul de 4200 cad amandoua in
// 3000-5000, deci intervalul nu permite deducerea cifrei reale. O grila calculata
// (fee rotunjit la multipli) ar aseza fee-urile rotunde chiar pe marginea intervalului
// si le-ar dezvalui.
const BENZI = [1000, 2000, 3000, 5000, 7500, 10000, 15000, 20000, 30000, 50000, 100000]

function interval(fee: number): { min: number; max: number } {
  if (!fee || fee <= 0) return { min: 0, max: 0 }
  let min = 0
  for (const prag of BENZI) {
    if (fee <= prag) return { min, max: prag }
    min = prag
  }
  return { min, max: min }
}

export async function GET() {
  try {
    const { data } = await supabase.from('oferta_artisti').select('*')
    const artisti = (data || [])
      .filter((a: any) => !esteAscuns(a.nume))
      .sort((x: any, y: any) => {
        // ordinea ramane aceeasi (propriu primii, apoi fee descrescator),
        // dar campul `tip` nu mai pleaca spre client - e informatie de contract.
        if (x.tip !== y.tip) return x.tip === 'propriu' ? -1 : 1
        return (y.fee_standard || 0) - (x.fee_standard || 0)
      })
      .map((a: any, i: number) => {
        const { min, max } = interval(a.fee_standard || 0)
        return {
          id: a.id || i + 1,
          name: a.nume,
          genres: genuriPentru(a.nume, []),
          feeMin: min,
          feeMax: max,
          tier: tierPentru(a.nume, null, a.fee_standard || 0),
          cazare: a.cazare || '',
          nrBileteAvion: a.bilete_avion || 0,
          costPerKm: a.lei_km || 0,
          transportMoneda: a.transport_moneda || 'lei',
          setType: a.set_type || 'vocal',
          cityFrom: a.oras_rezidenta || 'Bucuresti',
          nrPersoane: a.nr_persoane || 0,
        }
      })
    return NextResponse.json({ ok: true, artisti })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 })
  }
}
