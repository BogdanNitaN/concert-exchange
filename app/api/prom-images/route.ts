import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// maparea nume artist -> spotify_id (pentru a returna pozele pe nume)
const SPOTIFY_IDS: Record<string, string> = {
  'Albert NBN': '33CSqdyro89aOFiZb5fU5U',
  'MGL': '040gmk9Wd9sKXx199imiSM',
  'Marko Glass': '07nCYoPlXkWlhC2FHm1INS',
  'Bvcovia': '5CqmNRrmp3UP3NGccmlKHR',
  'Blanco': '3aiNFfqqHURbyhzN5tOdp9',
  'Berechet': '50vNYJ9Cj5MfsFqGqI7JXQ',
  'Petre Stefan': '0yjc2FN5zju7xyuJsTfGkh',
  'Killa Fonic': '20SBqzpuFoymhieHTNHUgl',
  'SATRA B.E.N.Z.': '3ZxemCGQmRuqoBPhQP5Gut',
  'IDK': '6nyKhzPeKV9pzpYN0malXP',
  'Erika Isac': '5ZBJ4rLeQx0IEN3ut3O1fC',
  'Oscar': '6dKPNkSEQOrRRvZz63Y47F',
  'Rava': '6ocuMBOl5OFS3AViv3DnG6',
  'Azteca': '5ysOQVQHHU9GJZBKmZMRHv',
  'IAN': '0GoJXmDr5UBG8ValCZe4om',
  'Noua Unspe': '1fYKCWegShlSGe4yATnpdp',
  'Tussin': '5DcOHhTZVih46OXGXHeSGb',
  'Amuly': '03eZ4y8baXNaR68hpkkDoq',
  'Vanilla': '1fofiypUoSWqYH2i4frmHn',
  'Calinacho': '050D4ZE1dXVfLSrQADtEu3',
  'Madatorricelli': '4y2uMVYqHq7SlTTfBQpdsJ',
  'Ursaru': '3bxxzWVZpk4rfuuQUESsAy',
  'Grasu XXL': '4BMSu3GY2lP8sH0nmrdgGG',
  'Puya': '0Dn3AfYwq9cWRhDqtfelNE',
  'Guess Who': '2CIhA8Jh3xrpFrHYMjYzBy',
  'Deliric': '357du2352LkLWerYcY49WY',
  'Vescan': '0UhR3k9bqzUICh76JOCY22',
  'El Nino': '01tCOipZP0bkn0LjSZ5S5i',
  'The Motans': '05qpk4JDcLSFNJSsPIZ8Ye',
  'Mira': '2nMFC7hWK0haX8ilvRpb59',
  'Antonia': '4TLzMoEaUDkcAfIlY3Xhxn',
  'Alina Eremia': '6cpj6MeLF0pLx34Un9Bpj3',
  'Mario': '2vMjgLGSb1lKiHySf3l9lF',
  'AMI': '6ZQhxROkDyYGsijIBDBrhF',
  'Stefania': '3GyTyH3aepWj2Z2wC3FqHy',
  'Holy Molly': '4ljZpmnnnA1ezEdylZuNLK',
  'Florian Rus': '4ovlRg7MIBA10gOriWc3mL',
  'Babasha': '1Iq14y98EVmnXUah4ldJnl',
  'Bogdan DLP': '2MiJmNQKPgwLZMr35cVqtq',
  'Luis Gabriel': '0lD0cnzSrUjThgH9YxBF82',
  'Iuly Neamtu': '5d3bc9MSib3NPeIDxYIIWD',
}

// cache in memorie 24h
let cached: Record<string, string> | null = null
let cacheTime = 0

export async function GET() {
  try {
    if (cached && Date.now() - cacheTime < 86400000) {
      return NextResponse.json(cached)
    }

    // citesc toate pozele din Supabase
    const { data, error } = await supabase
      .from('artist_images')
      .select('spotify_id, image_url')

    if (error || !data) {
      return NextResponse.json(cached || {})
    }

    // construiesc map spotify_id -> url
    const byId: Record<string, string> = {}
    for (const row of data) byId[row.spotify_id] = row.image_url

    // returnez map nume -> url
    const out: Record<string, string> = {}
    for (const [name, id] of Object.entries(SPOTIFY_IDS)) {
      if (byId[id]) out[name] = byId[id]
    }

    cached = out
    cacheTime = Date.now()
    return NextResponse.json(out)
  } catch {
    return NextResponse.json(cached || {})
  }
}
