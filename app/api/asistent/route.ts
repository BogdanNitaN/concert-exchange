import { NextResponse } from 'next/server'

export const maxDuration = 60

// Uneltele pe care Claude le poate folosi
const TOOLS = [
  {
    name: 'artisti_liberi_pe_data',
    description: 'Returneaza lista artistilor liberi si ocupati la o data anume. Foloseste pentru intrebari despre disponibilitate: cine e liber, cine canta, ce artisti sunt disponibili pe o data.',
    input_schema: {
      type: 'object',
      properties: {
        data: { type: 'string', description: 'Data in format YYYY-MM-DD, ex 2026-08-14' },
      },
      required: ['data'],
    },
  },
  {
    name: 'calendarul_artistului',
    description: 'Returneaza calendarul unui artist: evenimente ocupate (cu orase si titluri) si contextul din jurul unei date (ziua dinainte, ziua de dupa, proximitate). Foloseste cand se discuta un artist concret la o data concreta, ca sa judeci logistica: unde e cu o zi inainte si dupa.',
    input_schema: {
      type: 'object',
      properties: {
        artist: { type: 'string', description: 'Numele artistului exact ca in roster' },
        data: { type: 'string', description: 'Data discutata, format YYYY-MM-DD' },
        oras: { type: 'string', description: 'Orasul evenimentului discutat (optional, ajuta la proximitate)' },
      },
      required: ['artist', 'data'],
    },
  },
  {
    name: 'trending_muzica',
    description: 'Returneaza sunetele/piesele muzicale in trend pe TikTok Romania (ultimele 7 zile), cu artisti si numar de videouri. Foloseste pentru intrebari despre ce e in trend, ce artisti sunt populari acum, recomandari bazate pe popularitate curenta. Incruciseaza rezultatele cu rosterul: artistii din trend care sunt si in rosterul nostru sunt recomandari de aur.',
    input_schema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Cate rezultate (default 20)' },
      },
    },
  },
  {
    name: 'cauta_artisti_roster',
    description: 'Returneaza artistii din roster cu fee, categorie muzicala, oras de resedinta, numar persoane, tip (propriu FWD sau intermediere). Fara parametru returneaza toti. Foloseste pentru intrebari despre preturi, genuri, cati artisti, ce artisti avem.',
    input_schema: {
      type: 'object',
      properties: {
        cauta: { type: 'string', description: 'Nume artist sau fragment (optional, gol = toti)' },
      },
    },
  },
]

async function ruleazaUnealta(nume: string, input: any, baseUrl: string): Promise<string> {
  try {
    if (nume === 'artisti_liberi_pe_data') {
      const r = await fetch(baseUrl + '/api/calendar-disponibilitate?data=' + encodeURIComponent(input.data), { cache: 'no-store' })
      const d = await r.json()
      if (!d.ok) return JSON.stringify({ eroare: d.error || 'eroare calendar' })
      const mapArtist = (x: any) => ({
        artist: x.artist, gen: x.gen,
        fee: x.rosterData?.fee_standard ?? null,
        oras: x.rosterData?.oras_rezidenta ?? null,
        evenimente: (x.evenimente || []).map((e: any) => (e.titlu || '') + (e.descriere ? ' - ' + e.descriere.slice(0, 100) : '')).slice(0, 3),
      })
      return JSON.stringify({
        data: input.data,
        liberi: (d.liberi || []).map(mapArtist),
        ocupati: (d.ocupati || []).map(mapArtist),
      })
    }
    if (nume === 'calendarul_artistului') {
      const params = 'artist=' + encodeURIComponent(input.artist) + '&data=' + encodeURIComponent(input.data) + (input.oras ? '&oras=' + encodeURIComponent(input.oras) : '')
      const r = await fetch(baseUrl + '/api/calendar-artist-liber?' + params, { cache: 'no-store' })
      const d = await r.json()
      if (!d.ok) return JSON.stringify({ eroare: d.error || 'artist negasit in calendar' })
      return JSON.stringify({
        artist: input.artist,
        peData: d.peData || null,
        ocupateViitoare: (d.ocupate || []).filter((e: any) => e.viitor).slice(0, 15).map((e: any) => ({ data: e.data, titlu: e.titlu, oras: e.oras || null })),
      })
    }
    if (nume === 'trending_muzica') {
      const r = await fetch(baseUrl + '/api/chartex?action=trending&limit=' + (input.limit || 20), { cache: 'no-store' })
      const d = await r.json()
      const lista = (d?.results || d?.data || d?.sounds || (Array.isArray(d) ? d : [])).slice(0, input.limit || 20)
      const rez = lista.map((x: any) => ({
        piesa: x.title || x.name || x.sound_name || null,
        artist: x.artist_name || x.artist || x.author || null,
        videouri7zile: x.tiktok_last_7_days_video_count ?? x.video_count ?? null,
      }))
      return JSON.stringify({ trending_tiktok_ro: rez })
    }
    if (nume === 'cauta_artisti_roster') {
      const r = await fetch(baseUrl + '/api/oferta-artist' + (input.cauta ? '?q=' + encodeURIComponent(input.cauta) : ''), { cache: 'no-store' })
      const d = await r.json()
      const rez = (d.artists || []).map((a: any) => ({
        nume: a.nume, fee: a.fee_standard, categorie: a.categorie, tip: a.tip,
        oras: a.oras_rezidenta, persoane: a.nr_persoane, formate: a.formate,
      }))
      return JSON.stringify({ artisti: rez })
    }
    return JSON.stringify({ eroare: 'unealta necunoscuta' })
  } catch (e: any) {
    return JSON.stringify({ eroare: e?.message || 'eroare unealta' })
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY lipseste din env' }, { status: 500 })

  const { messages } = await req.json()
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages lipseste' }, { status: 400 })
  }

  const url = new URL(req.url)
  const baseUrl = url.origin

  const system = `Esti asistentul intern al Forward Agency (agentie de booking artistic din Romania, una din cele mai mari din SE Europa, 1600+ evenimente pe an).
Raspunzi in romana, concis si la obiect, pentru Bogdan (managing partner) si echipa.
Ai acces la calendar (disponibilitati artisti) si roster (preturi, categorii).
Data de azi: ${new Date().toISOString().slice(0, 10)}.
Cand ti se cere o data fara an, presupune anul curent sau urmatorul daca data a trecut.
Preturile (fee) sunt in EUR si sunt interne - nu le rotunji, nu le ascunde.

LOGICA DE BUSINESS (aplic-o in judecati):
- Artistii tip "propriu" sunt FWD (rosterul propriu, marja mai buna, prioritate in propuneri). Tip "intermediere" = externi.
- Transport: artistii pleaca de regula din orasul de resedinta (majoritatea Bucuresti). Peste 300 km se ia in calcul zbor pentru artistii cu bilete_avion > 0.
- Eveniment in Bucuresti/Ilfov cu artist rezident in Bucuresti = fara transport/cazare/diurna (local).
- Pe 15 august (Sf. Maria), 1 Mai, Revelion, weekendurile de vara = cerere mare, artistii se ocupa repede.

FII CONSILIER, NU DOAR EXECUTANT:
- Cand un artist cerut e ocupat, propune automat 2-3 alternative din acelasi gen si buget similar, alegand cu prioritate artisti FWD liberi.
- Cand bugetul pare mic pentru cererea data, spune sincer si sugereaza optiuni realiste (alt artist, format redus).
- Cand vezi un risc (data foarte ceruta, artist des blocat, distanta mare), semnaleaza-l scurt.
- Cand intrebarea e ambigua, intreaba o singura clarificare scurta, nu ghici.
- La liste lungi, ordoneaza util: FWD primii, apoi pret descrescator.
- Cand se discuta un artist concret la o data concreta, verifica-i calendarul (ziua dinainte si de dupa) si comenteaza logistica: daca e in zona cu o zi inainte = avantaj (transport redus), daca are orase indepartate consecutive = risc logistic. Mentioneaza distantele doar cand conteaza.
REGULI STRICTE:
- Preturile si datele le iei EXCLUSIV din unelte, in conversatia curenta. Nu cita niciodata un pret din memorie sau dintr-un mesaj anterior fara sa-l reverifici daca exista dubii.
- NU poti crea oferte, bloca date sau modifica nimic - doar citesti si consiliezi. Nu promite si nu sugera actiuni pe care nu le poti face (ex "blochez pentru oferta", "verific cu echipa", "revin cu raspuns"). Tu nu poti verifica nimic in afara uneltelor si nu poti comunica cu nimeni. In schimb, indruma concret: "poti face oferta din gigx.ro/oferta", "intreaba echipa despre blocare".
Raspunde scurt: liste clare, fara introduceri lungi.`

  // bucla agentica: Claude poate chema unelte de mai multe ori
  let convo = [...messages]
  for (let pas = 0; pas < 5; pas++) {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2000,
        system,
        tools: TOOLS,
        messages: convo,
      }),
    })
    const data = await resp.json()
    if (data.error) return NextResponse.json({ error: data.error.message || 'eroare API' }, { status: 500 })

    // daca Claude vrea unelte, le rulez si continui bucla
    const toolUses = (data.content || []).filter((c: any) => c.type === 'tool_use')
    if (toolUses.length === 0 || data.stop_reason !== 'tool_use') {
      const text = (data.content || []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('\n')
      return NextResponse.json({ raspuns: text })
    }

    convo.push({ role: 'assistant', content: data.content })
    const results = []
    for (const tu of toolUses) {
      const rezultat = await ruleazaUnealta(tu.name, tu.input, baseUrl)
      results.push({ type: 'tool_result', tool_use_id: tu.id, content: rezultat })
    }
    convo.push({ role: 'user', content: results })
  }

  return NextResponse.json({ raspuns: 'Nu am reusit sa termin analiza (prea multe apeluri). Incearca o intrebare mai simpla.' })
}
