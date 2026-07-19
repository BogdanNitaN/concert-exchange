import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const noDia = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ș/g,'s').replace(/ț/g,'t').replace(/ă/g,'a').replace(/â/g,'a').replace(/î/g,'i').toLowerCase()

function persoane(c: string): number {
  if (!c) return 0
  c = c.toLowerCase()
  let t = 0
  const m = [...c.matchAll(/(\d+)\s*(sng|single|dbl|dubl[ae]?|duble|twin|matrimonial[ae]?|suit[ae]?|camer[ae]?)/g)]
  for (const x of m) {
    const n = +x[1], tip = x[2]
    if (tip.includes('dbl') || tip.includes('dubl') || tip.includes('twin') || tip.includes('camer')) t += n * 2
    else t += n
  }
  return t
}

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const b = await req.json()
    if (!b.nume) return NextResponse.json({ ok: false, error: 'Nume lipsa' }, { status: 400 })

    const artist = {
      nume: b.nume.trim(),
      fee_standard: Number(b.fee) || 0,
      lei_km: Number(b.leiKm) || 0,
      cazare: b.cazare || '',
      nr_persoane: persoane(b.cazare || ''),
      bilete_avion: Number(b.bileteAvion) || 0,
      alcool_default: Number(b.alcool) || 0,
      categorie: b.categorie || 'pop',
      tip: b.tip || 'propriu',
      durata_default: b.durata || '40 min',
      transport_moneda: b.transportMoneda || 'lei',
      diurna_fixa: b.diurnaFixa ? Number(b.diurnaFixa) : null,
      formate: (b.variante && b.variante.length > 0) ? b.variante.filter((v: any) => v.nume || v.fee).map((v: any) => ({
        nume: v.nume || 'Variantă',
        fee: Number(v.fee) || 0,
        leiKm: Number(b.leiKm) || 0,
        cazare: b.cazare || '',
        persoane: persoane(b.cazare || ''),
        bilete: Number(b.bileteAvion) || 0,
        durata: v.durata || '',
      })) : null,
    }

    const { error } = await supabase.from('oferta_artisti').upsert(artist, { onConflict: 'nume' })
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })

    // caut poza pe Chartex (best effort)
    try {
      const term = noDia(b.nume.replace(/\(.*?\)/g, '').replace(/&.*/, '').trim())
      const url = 'https://api.chartex.com/external/v1/artists/?sort_platform=tiktok-creates&sort_column=all_time&search=' + encodeURIComponent(term)
      const res = await fetch(url, { headers: { 'X-APP-ID': process.env.CHARTEX_APP_ID!, 'X-APP-TOKEN': process.env.CHARTEX_APP_TOKEN! } })
      const data = await res.json()
      const items = data?.data?.items || []
      const first = term.split(' ')[0]
      let match = items.find((a: any) => a.artist_image_url && noDia(a.artist_name).includes(first))
      if (!match) match = items.find((a: any) => a.artist_image_url)
      if (match?.artist_image_url) {
        await supabase.from('artist_images').upsert({ spotify_id: match.spotify_id + '-' + noDia(b.nume).slice(0,6), name: b.nume.trim(), image_url: match.artist_image_url, updated_at: new Date().toISOString() }, { onConflict: 'spotify_id' })
      }
    } catch {}

    return NextResponse.json({ ok: true, artist })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
