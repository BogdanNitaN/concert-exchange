import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { genuriPentru, esteAscuns, tierPentru } from '@/lib/genuri-catalog'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
)

export async function GET() {
  try {
    const { data } = await supabase.from('oferta_artisti').select('*')
    const artisti = (data || [])
      .filter((a: any) => !esteAscuns(a.nume))
      .map((a: any, i: number) => {
        const fee = a.fee_standard || 0
        return {
          id: a.id || i + 1,
          name: a.nume,
          genres: genuriPentru(a.nume, []),
          feeMin: fee,
          feeMax: fee,
          tier: tierPentru(a.nume, null, fee),
          cazare: a.cazare || '',
          nrBileteAvion: a.bilete_avion || 0,
          costPerKm: a.lei_km || 0,
          transportMoneda: a.transport_moneda || 'lei',
          setType: a.set_type || 'vocal',
          cityFrom: a.oras_rezidenta || 'Bucuresti',
          tip: a.tip || '',
          nrPersoane: a.nr_persoane || 0,
        }
      })
      .sort((x: any, y: any) => {
        if (x.tip !== y.tip) return x.tip === 'propriu' ? -1 : 1
        return (y.feeMax || 0) - (x.feeMax || 0)
      })
    return NextResponse.json({ ok: true, artisti })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 })
  }
}
