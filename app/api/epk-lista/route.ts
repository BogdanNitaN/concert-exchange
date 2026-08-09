import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { esteAscuns } from '@/lib/genuri-catalog'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
)

function slugArtist(nume: string): string {
  return (nume || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['\u2018\u2019\u0060]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function GET() {
  try {
    const { data: toti } = await supabase.from('oferta_artisti').select('nume, tip, categorie')
    const { data: imgs } = await supabase.from('artist_images').select('name, image_url')
    const { data: shares } = await supabase.from('artist_share').select('nume, afisabil')
    const imgMap: Record<string, string> = {}
    for (const i of imgs || []) if (i.name) imgMap[i.name] = i.image_url
    const ascunsi = new Set((shares || []).filter(x => x.afisabil === false).map(x => x.nume))
    const artisti = (toti || [])
      .filter(a => a.tip !== 'intermediere' && !esteAscuns(a.nume) && !ascunsi.has(a.nume))
      .map(a => ({ nume: a.nume, slug: slugArtist(a.nume), poza: imgMap[a.nume] || null, categorie: a.categorie || null }))
      .sort((a, b) => a.nume.localeCompare(b.nume, 'ro'))
    return NextResponse.json({ ok: true, artisti })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 })
  }
}
