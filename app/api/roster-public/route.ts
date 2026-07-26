import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ARTISTS_DATA } from '@/lib/artists-data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data: toti } = await supabase.from('oferta_artisti').select('nume, tip')
    const { data: imgs } = await supabase.from('artist_images').select('name, image_url')
    const { data: shares } = await supabase.from('artist_share').select('nume, afisabil')
    const imgMap: Record<string, string> = {}
    for (const i of imgs || []) if (i.name) imgMap[i.name] = i.image_url
    const ascunsi = new Set((shares || []).filter(sh => sh.afisabil === false).map(sh => sh.nume))

    const ordineTier: Record<string, number> = { 'A++': 0, 'Premium': 0, 'A+': 1, 'A': 2 }
    const artisti = (toti || [])
      .filter(a => a.tip !== 'intermediere' && !ascunsi.has(a.nume))
      .map(a => {
        const meta = (ARTISTS_DATA as unknown as any[]).find(x => (x.name || '').toLowerCase() === (a.nume || '').toLowerCase())
        return { nume: a.nume, genuri: meta?.genres || [], tier: meta?.tier || null, poza: imgMap[a.nume] || null }
      })
      .sort((a, b) => (ordineTier[a.tier || ''] ?? 3) - (ordineTier[b.tier || ''] ?? 3) || a.nume.localeCompare(b.nume))

    return NextResponse.json({ ok: true, artisti })
  } catch {
    return NextResponse.json({ ok: false, artisti: [] }, { status: 500 })
  }
}
