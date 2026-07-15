import { NextResponse } from 'next/server'

// ID-uri Spotify directe. Un singur request batch, fara search, deci fara rate limit.
const SPOTIFY_IDS: Record<string, string> = {
  'Blanco': '3aiNFfqqHURbyhzN5tOdp9',
  'Bvcovia': '5CqmNRrmp3UP3NGccmlKHR',
  'Marko Glass': '07nCYoPlXkWlhC2FHm1INS',
  'Berechet': '50vNYJ9Cj5MfsFqGqI7JXQ',
  // TRAP
  'Petre Stefan': '0yjc2FN5zju7xyuJsTfGkh',
  'Albert NBN': '33CSqdyro89aOFiZb5fU5U',
  'Killa Fonic': '20SBqzpuFoymhieHTNHUgl',
  'SATRA B.E.N.Z.': '3ZxemCGQmRuqoBPhQP5Gut',
  'IDK': '6nyKhzPeKV9pzpYN0malXP',
  'Erika Isac': '5ZBJ4rLeQx0IEN3ut3O1fC',
  'Oscar': '6dKPNkSEQOrRRvZz63Y47F',
  'Rava': '6ocuMBOl5OFS3AViv3DnG6',
  'Azteca': '5ysOQVQHHU9GJZBKmZMRHv',
  'IAN': '0GoJXmDr5UBG8ValCZe4om',
  'MGL': '040gmk9Wd9sKXx199imiSM',
  'Noua Unspe': '1fYKCWegShlSGe4yATnpdp',
  'Tussin': '5DcOHhTZVih46OXGXHeSGb',
  'Amuly': '03eZ4y8baXNaR68hpkkDoq',
  'Vanilla': '1fofiypUoSWqYH2i4frmHn',
  'Calinacho': '050D4ZE1dXVfLSrQADtEu3',
  'Madatorricelli': '4y2uMVYqHq7SlTTfBQpdsJ',
  'Ursaru': '3bxxzWVZpk4rfuuQUESsAy',
  // URBAN / HIP-HOP
  'Grasu XXL': '4BMSu3GY2lP8sH0nmrdgGG',
  'Puya': '0Dn3AfYwq9cWRhDqtfelNE',
  'Guess Who': '2CIhA8Jh3xrpFrHYMjYzBy',
  'Deliric': '357du2352LkLWerYcY49WY',
  'Vescan': '0UhR3k9bqzUICh76JOCY22',
  'El Nino': '01tCOipZP0bkn0LjSZ5S5i',
  // POP-DANCE
  'The Motans': '05qpk4JDcLSFNJSsPIZ8Ye',
  'Mira': '2nMFC7hWK0haX8ilvRpb59',
  'Antonia': '4TLzMoEaUDkcAfIlY3Xhxn',
  'Alina Eremia': '6cpj6MeLF0pLx34Un9Bpj3',
  'Mario Fresh': '04jpM7EVND9s2HYC2HDLuR',
  'AMI': '6ZQhxROkDyYGsijIBDBrhF',
  'Stefania': '3GyTyH3aepWj2Z2wC3FqHy',
  'Holy Molly': '4ljZpmnnnA1ezEdylZuNLK',
  'Florian Rus': '4ovlRg7MIBA10gOriWc3mL',
  // BALCANIC
  'Babasha': '1Iq14y98EVmnXUah4ldJnl',
  'Bogdan DLP': '2MiJmNQKPgwLZMr35cVqtq',
  'Luis Gabriel': '0lD0cnzSrUjThgH9YxBF82',
  'Iuly Neamtu': '5d3bc9MSib3NPeIDxYIIWD',
}

export const revalidate = 86400

export async function GET() {
  try {
    const names = Object.keys(SPOTIFY_IDS)

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64'),
      },
      body: 'grant_type=client_credentials',
    })
    const tokenData = await tokenRes.json()
    const token = tokenData.access_token
    if (!token) return NextResponse.json({ error: 'no token' }, { status: 500 })

    const headers = { Authorization: 'Bearer ' + token }
    const out: Record<string, string> = {}

    // cereri individuale, in grupuri mici, cu pauza (batch da 403 in dev mode)
    const CHUNK = 5
    for (let i = 0; i < names.length; i += CHUNK) {
      const chunk = names.slice(i, i + CHUNK)
      await Promise.all(chunk.map(async (name) => {
        try {
          const r = await fetch('https://api.spotify.com/v1/artists/' + SPOTIFY_IDS[name], { headers })
          if (!r.ok) return
          const d = await r.json()
          const img = d?.images?.[0]?.url
          if (img) out[name] = img
        } catch {}
      }))
      if (i + CHUNK < names.length) await new Promise(r => setTimeout(r, 250))
    }

    return NextResponse.json(out)
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
