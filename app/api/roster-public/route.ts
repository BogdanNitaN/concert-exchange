import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ARTISTS_DATA } from '@/lib/artists-data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data: toti } = await supabase.from('oferta_artisti').select('nume, tip, fee_standard')
    const { data: imgs } = await supabase.from('artist_images').select('name, image_url')
    const { data: shares } = await supabase.from('artist_share').select('nume, afisabil')
    const imgMap: Record<string, string> = {}
    for (const i of imgs || []) if (i.name) imgMap[i.name] = i.image_url
    const ascunsi = new Set((shares || []).filter(sh => sh.afisabil === false).map(sh => sh.nume))

    const ordineTier: Record<string, number> = { 'A++': 0, 'Premium': 0, 'A+': 1, 'A': 2 }
    const artisti = (toti || [])
      .filter(a => a.tip !== 'intermediere' && !ascunsi.has(a.nume) && !['gojira', 'puya & urban symphony orchestra', 'alternosfera'].includes((a.nume || '').toLowerCase().trim()))
      .map(a => {
        const meta = (ARTISTS_DATA as unknown as any[]).find(x => (x.name || '').toLowerCase() === (a.nume || '').toLowerCase())
        const GENURI: Record<string, string[]> = {
          'grasu xxl': ['Hip-Hop'], 'guess who': ['Hip-Hop'], 'killa fonic': ['Hip-Hop', 'Trap'], 'la familia': ['Hip-Hop'],
          'parazitii': ['Hip-Hop'], 'puya': ['Hip-Hop'], 'vescan': ['Hip-Hop'], 'puya & urban symphony orchestra': ['Hip-Hop'],
          'dangerosu': ['Hip-Hop'], 'gojira': ['Hip-Hop'],
          'albwho': ['DJs'], 'andre rizo': ['DJs'], 'andrew dum': ['DJs'], 'manuel riva': ['DJs'], 'speak': ['DJs'],
          'babasha': ['Balkanic Pop'], 'feli & taraful fratii cazanoi': ['Balkanic Pop'], 'white mahala': ['Balkanic Pop'],
          'adi istrate': ['Pop-Dance'], 'andrei ursu': ['Pop-Dance'], 'tobi ibitoye': ['Pop-Dance'], 'erika isac': ['Pop-Dance', 'Trap'],
          'lazy ed': ['Pop-Dance'], 'zodier': ['Pop-Dance'], 'feli': ['Pop-Dance'], 'irina rimes': ['Pop-Dance'],
          'the motans': ['Pop-Dance'], 'the motans & symphony orchestra': ['Pop-Dance'], "carla's dreams": ['Pop-Dance'],
          'alina eremia': ['Pop-Dance'], 'mira': ['Pop-Dance'], 'ami': ['Pop-Dance'], 'antonia': ['Pop-Dance'],
          'emaa': ['Pop-Dance'], 'minelli': ['Pop-Dance'], 'rares': ['Pop-Dance', 'Balkanic Pop'], 'mario': ['Pop-Dance'],
          'randi': ['Pop-Dance'], 'stefania': ['Pop-Dance'], 'holy molly': ['Pop-Dance'], 'eva timush': ['Pop-Dance'],
          'dara': ['Pop-Dance'], 'florian rus': ['Pop-Dance'], 'tania turtureanu': ['Pop-Dance'],
          'petre stefan': ['Trap'], 'idk': ['Trap'], 'bruja': ['Trap'], 'satra benz': ['Trap'],
          'albert nbn': ['Trap'], 'noua unspe': ['Trap'], 'tussin': ['Trap'],
          'hvnds': ['Rock / Alternativ'], 'nuante': ['Rock / Alternativ'], 'omul cu sobolani': ['Rock / Alternativ'],
          'robin and the backstabbers': ['Rock / Alternativ'], 'the kryptonite sparks': ['Rock / Alternativ'],
          'bob ramanka': ['Rock / Alternativ'], 'vlad corb': ['Rock / Alternativ'], 'alternosfera': ['Rock / Alternativ'],
        }
        const norm = (a.nume || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
        const genuri: string[] = GENURI[norm] || (meta?.genres || [])
        return { nume: a.nume, genuri, tier: meta?.tier || null, poza: imgMap[a.nume] || null, _fee: a.fee_standard || 0 }
      })
      .sort((a, b) => (ordineTier[a.tier || ''] ?? 3) - (ordineTier[b.tier || ''] ?? 3) || (b._fee || 0) - (a._fee || 0))
      .map(({ _fee, ...rest }) => rest)

    return NextResponse.json({ ok: true, artisti })
  } catch {
    return NextResponse.json({ ok: false, artisti: [] }, { status: 500 })
  }
}
