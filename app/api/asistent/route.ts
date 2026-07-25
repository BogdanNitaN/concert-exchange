import { NextResponse } from 'next/server'
import { calcLinieOferta } from '@/lib/calc-oferta'
import { areZborIntern } from '@/lib/zbor-intern'

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
    name: 'tine_minte',
    description: 'Salveaza o regula permanenta in memoria asistentului, valabila in toate conversatiile viitoare. Foloseste DOAR cand utilizatorul cere explicit (tine minte, retine, de acum incolo). Nu salva din proprie initiativa.',
    input_schema: {
      type: 'object',
      properties: {
        regula: { type: 'string', description: 'Regula de salvat, scurt si clar' },
      },
      required: ['regula'],
    },
  },
  {
    name: 'cauta_in_calendar',
    description: 'Cauta un text (nume festival, club, oras, eveniment) in TOATE calendarele artistilor si returneaza cine are evenimente care contin acel text, cu date. Foloseste pentru intrebari gen: cine canta la festivalul X, ce artisti avem la clubul Y, ce evenimente avem in orasul Z. Cautarea acopera anul trecut si urmatorul.',
    input_schema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Textul cautat (minim 3 caractere), ex: young, nish, bacau' },
      },
      required: ['text'],
    },
  },
  {
    name: 'raport_oferte',
    description: 'Returneaza ofertele generate/salvate in sistem intr-o perioada: cod, client, oras, data eveniment, artisti cu fee-uri, status. Foloseste pentru rapoarte: cate oferte am dat, ce valoare totala, ce artisti am ofertat cel mai des, oferte pe saptamana/luna/an.',
    input_schema: {
      type: 'object',
      properties: {
        dataStart: { type: 'string', description: 'Inceputul perioadei YYYY-MM-DD (optional)' },
        dataEnd: { type: 'string', description: 'Sfarsitul perioadei YYYY-MM-DD (optional)' },
        includeTeste: { type: 'boolean', description: 'Include si ofertele marcate test (implicit false - testele sunt excluse din rapoarte)' },
      },
    },
  },
  {
    name: 'creeaza_oferta',
    description: 'Creeaza si salveaza o oferta DRAFT in sistem (vizibila in Istoric, editabila in generator). Foloseste DOAR dupa ce utilizatorul a confirmat explicit rezumatul ofertei (intreaba intai: artist, fee, oras, data, client). Oferta se salveaza cu status draft-asistent si trebuie verificata de om inainte de trimitere.',
    input_schema: {
      type: 'object',
      properties: {
        artistNume: { type: 'string', description: 'Numele artistului exact ca in roster' },
        fee: { type: 'number', description: 'Fee-ul ofertat in EUR' },
        feeLista: { type: 'number', description: 'Fee-ul de lista daca e discount (optional, altfel egal cu fee)' },
        oras: { type: 'string', description: 'Orasul evenimentului' },
        dataEveniment: { type: 'string', description: 'Data evenimentului YYYY-MM-DD (optional)' },
        client: { type: 'string', description: 'Numele clientului (optional)' },
        mentiuni: { type: 'string', description: 'Mentiuni: landed/transport inclus, camere, masa, etc (optional)' },
      },
      required: ['artistNume', 'fee', 'oras'],
    },
  },
  {
    name: 'calculeaza_deviz',
    description: 'Calculeaza devizul complet pentru un artist la un eveniment, cu ACEEASI logica ca generatorul de oferte: transport cu marja pe km, regula 300km/zbor, cazare, diurna/masa, discount, CAG. Foloseste cand se cere estimare de cost total, deviz, sau "cat ar costa X la orasul Y".',
    input_schema: {
      type: 'object',
      properties: {
        artistNume: { type: 'string', description: 'Numele artistului exact ca in roster' },
        oras: { type: 'string', description: 'Orasul evenimentului' },
        fee: { type: 'number', description: 'Fee-ul ofertat EUR (optional, implicit fee-ul standard din roster)' },
        feeLista: { type: 'number', description: 'Fee-ul de lista daca e discount (optional)' },
        cuCag: { type: 'boolean', description: 'Include CAG 10% (optional, implicit false)' },
      },
      required: ['artistNume', 'oras'],
    },
  },
  {
    name: 'calcul_landed',
    description: 'Calcul invers pentru pret LANDED (tot inclus): din suma landed scade transportul real (km cu marja din resedinta artistului) si arata fee-ul net ramas artistului, comparat cu fee-ul lui standard din roster. Foloseste cand utilizatorul spune "am X euro landed pentru artistul Y la orasul Z" si vrea sa vada daca merita / ce marja ramane.',
    input_schema: {
      type: 'object',
      properties: {
        artistNume: { type: 'string', description: 'Numele artistului exact ca in roster' },
        sumaLanded: { type: 'number', description: 'Suma totala landed in EUR (transport inclus)' },
        oras: { type: 'string', description: 'Orasul evenimentului' },
      },
      required: ['artistNume', 'sumaLanded', 'oras'],
    },
  },
  {
    name: 'top_spotify_roster',
    description: 'Construieste topul artistilor din rosterul nostru dupa statistici reale Spotify/social (Chartex): streams, followers, ascultatori lunari, TikTok. Foloseste pentru intrebari gen: topul artistilor trap dupa Spotify, cine e cel mai ascultat din roster, compara artisti dupa streamuri. Filtreaza optional pe gen muzical.',
    input_schema: {
      type: 'object',
      properties: {
        gen: { type: 'string', description: 'Genul muzical pentru filtrare (ex: trap, pop, rock) - optional, fara filtru = tot rosterul' },
        artisti: { type: 'array', items: { type: 'string' }, description: 'Lista specifica de artisti de comparat (optional, alternativa la gen)' },
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
    if (nume === 'tine_minte') {
      const r = await fetch(baseUrl + '/api/asistent-memorie', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regula: input.regula }),
      })
      const d = await r.json()
      return JSON.stringify(d.ok ? { salvat: true, regula: input.regula } : { eroare: 'nu s-a salvat' })
    }
    if (nume === 'cauta_in_calendar') {
      const r = await fetch(baseUrl + '/api/calendar-cauta?text=' + encodeURIComponent(input.text), { cache: 'no-store' })
      const d = await r.json()
      if (!d.ok) return JSON.stringify({ eroare: d.error || 'eroare cautare' })
      return JSON.stringify({ cautat: d.cautat, gasite: d.gasite, evenimente: (d.evenimente || []).slice(0, 40) })
    }
    if (nume === 'raport_oferte') {
      const r = await fetch(baseUrl + '/api/oferta-save', { cache: 'no-store' })
      const d = await r.json()
      let lista = d.oferte || d.data || []
      const nrTeste = lista.filter((o: any) => o.test).length
      if (!input.includeTeste) lista = lista.filter((o: any) => !o.test)
      if (input.dataStart) lista = lista.filter((o: any) => (o.created_at || '').slice(0, 10) >= input.dataStart)
      if (input.dataEnd) lista = lista.filter((o: any) => (o.created_at || '').slice(0, 10) <= input.dataEnd)
      const rez = lista.slice(0, 100).map((o: any) => ({
        cod: o.cod, client: o.client || o.nume_client || null, oras: o.oras || null,
        dataEveniment: o.data_eveniment || null, creata: (o.created_at || '').slice(0, 10),
        status: o.status || null, artisti: o.artisti || null,
      }))
      return JSON.stringify({ total: rez.length, oferteTestExcluse: input.includeTeste ? 0 : nrTeste, oferte: rez })
    }
    if (nume === 'creeaza_oferta') {
      // iau datele artistului din roster pt linia completa
      const ra = await fetch(baseUrl + '/api/oferta-artist?q=' + encodeURIComponent(input.artistNume), { cache: 'no-store' })
      const rd = await ra.json()
      const art = (rd.artists || []).find((a: any) => a.nume.toLowerCase() === input.artistNume.toLowerCase()) || (rd.artists || [])[0]
      if (!art) return JSON.stringify({ eroare: 'artistul nu exista in roster: ' + input.artistNume })
      const cod = 'GIGX-' + new Date().getFullYear() + '-A' + String(Math.floor(Math.random() * 9000) + 1000)
      const linie = {
        artistNume: art.nume, formatSelectat: '', durata: art.durata_default || '40 min',
        tipPret: 'Standard', feeLista: input.feeLista || input.fee, fee: input.fee,
        leiKm: art.lei_km || 0, useMarja: true, cazare: art.cazare || '', persoane: art.nr_persoane || 0,
        bileteAvion: art.bilete_avion || 0, restulRutier: true, tipMasa: 'alacarte', zile: 1,
        diurnaPerPers: 180, diurnaFixa: art.diurna_fixa || 0, cazareFixa: art.cazare_fixa || 0,
        useAlcool: false, alcool: 0, useCag: false, cagProcent: 10, cagSuma: 0, cagMod: 'procent',
      }
      const oferta = {
        cod, status: 'draft-asistent', client: input.client || null, oras: input.oras,
        data_eveniment: input.dataEveniment || null, nota: input.mentiuni || null,
        artisti: [{ nume: art.nume, fee: input.fee, feeLista: input.feeLista || input.fee, tipPret: 'Standard', tip: art.tip, format: '' }],
        linii_complete: [linie],
      }
      const sv = await fetch(baseUrl + '/api/oferta-save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(oferta),
      })
      const dsv = await sv.json()
      if (!dsv.ok) return JSON.stringify({ eroare: 'nu s-a salvat oferta' })
      return JSON.stringify({ salvat: true, cod, mesaj: 'Oferta draft salvata. O gasesti in Istoric (gigx.ro/oferta/istoric), o deschizi cu Editeaza, verifici si o trimiti.' })
    }
    if (nume === 'calculeaza_deviz') {
      const ra = await fetch(baseUrl + '/api/oferta-artist?q=' + encodeURIComponent(input.artistNume), { cache: 'no-store' })
      const rd = await ra.json()
      const art = (rd.artists || []).find((a: any) => a.nume.toLowerCase() === input.artistNume.toLowerCase()) || (rd.artists || [])[0]
      if (!art) return JSON.stringify({ eroare: 'artistul nu exista in roster: ' + input.artistNume })
      // km din orasul de resedinta al artistului spre orasul evenimentului
      const fromCity = art.oras_rezidenta || 'Bucuresti'
      let km: number | null = null
      try {
        const rk = await fetch(baseUrl + '/api/distance?to=' + encodeURIComponent(input.oras) + '&from=' + encodeURIComponent(fromCity), { cache: 'no-store' })
        const dk = await rk.json()
        if (dk?.km) km = dk.km
      } catch {}
      // curs BNR
      let eurRate: number | null = null
      try {
        const rc = await fetch(baseUrl + '/api/bnr-rate', { cache: 'no-store' })
        const dc = await rc.json()
        eurRate = dc?.rate || dc?.eur || null
      } catch {}
      // local: artist Bucuresti + eveniment Buc/Ilfov (aproximare pe nume oras)
      const orasNorm = (input.oras || '').toLowerCase()
      const local = (fromCity || '').toLowerCase().includes('bucuresti') && (orasNorm.includes('bucuresti') || orasNorm.includes('ilfov') || orasNorm.includes('otopeni') || orasNorm.includes('voluntari'))
      const fee = input.fee || art.fee_standard || 0
      const linie = {
        artist: { transport_moneda: art.transport_moneda || null },
        fee, feeLista: input.feeLista || fee,
        leiKm: art.lei_km || 0, useMarja: true, persoane: art.nr_persoane || 0,
        restulRutier: true, tipMasa: 'alacarte' as const, zile: 1,
        diurnaPerPers: 180, diurnaFixa: art.diurna_fixa || 0, cazareFixa: art.cazare_fixa || 0,
        useAlcool: false, alcool: 0,
        useCag: !!input.cuCag, cagProcent: 10, cagSuma: 0, cagMod: 'procent' as const,
      }
      const c = calcLinieOferta(linie, { km, eurRate, useAdaos: false, adaosProcent: 1, local })
      return JSON.stringify({
        artist: art.nume, fee, feeLista: input.feeLista || fee, oras: input.oras, plecareDin: fromCity,
        km, kmTotalCuMarja: c.kmTotal, local: c.local,
        transportLei: c.transportLei, transportEur: c.transportEur,
        bileteAvion: art.bilete_avion || 0, necesitaZbor: km !== null && km > 300 && (art.bilete_avion || 0) > 0 && areZborIntern(input.oras),
        cazare: art.cazare || null, persoane: art.nr_persoane || 0,
        diurnaTotal: c.diurnaTotal, discount: c.discount, savingLei: c.savingLei,
        cag: c.cag, netGigx: c.netGigx, feeLeiConv: c.feeLeiConv, cursEur: eurRate,
      })
    }
    if (nume === 'calcul_landed') {
      const ra = await fetch(baseUrl + '/api/oferta-artist?q=' + encodeURIComponent(input.artistNume), { cache: 'no-store' })
      const rd = await ra.json()
      const art = (rd.artists || []).find((a: any) => a.nume.toLowerCase() === input.artistNume.toLowerCase()) || (rd.artists || [])[0]
      if (!art) return JSON.stringify({ eroare: 'artistul nu exista in roster: ' + input.artistNume })
      const fromCity = art.oras_rezidenta || 'Bucuresti'
      let km: number | null = null
      try {
        const rk = await fetch(baseUrl + '/api/distance?to=' + encodeURIComponent(input.oras) + '&from=' + encodeURIComponent(fromCity), { cache: 'no-store' })
        const dk = await rk.json()
        if (dk?.km) km = dk.km
      } catch {}
      let eurRate: number | null = null
      try {
        const rc = await fetch(baseUrl + '/api/bnr-rate', { cache: 'no-store' })
        const dc = await rc.json()
        eurRate = dc?.rate || dc?.eur || null
      } catch {}
      const marjaProc = km !== null && km > 300 ? 0.065 : 0.115
      const kmTotal = km !== null ? (km + Math.round(km * marjaProc)) * 2 : 0
      const transportLei = kmTotal > 0 && (art.lei_km || 0) > 0 ? Math.round(kmTotal * art.lei_km / 10) * 10 : 0
      const transportEur = eurRate && transportLei > 0 ? Math.round(transportLei / eurRate) : 0
      const feeNet = input.sumaLanded - transportEur
      const feeStandard = art.fee_standard || 0
      const zborPosibil = km !== null && km > 300 && (art.bilete_avion || 0) > 0 && areZborIntern(input.oras)
      return JSON.stringify({
        artist: art.nume, sumaLanded: input.sumaLanded, oras: input.oras, plecareDin: fromCity,
        km, kmTotalCuMarja: kmTotal, transportLei, transportEurEchiv: transportEur,
        feeNetRamasArtistului: feeNet, feeStandardRoster: feeStandard,
        diferentaFataDeStandard: feeNet - feeStandard,
        zborPosibil, bileteAvion: art.bilete_avion || 0,
        cazare: art.cazare || null, persoane: art.nr_persoane || 0, cursEur: eurRate,
        nota: 'cazarea si masa NU sunt scazute - de negociat separat sau incluse in landed',
      })
    }
    if (nume === 'top_spotify_roster') {
      const ra = await fetch(baseUrl + '/api/oferta-artist', { cache: 'no-store' })
      const rd = await ra.json()
      let artisti = rd.artists || []
      if (input.gen) {
        const g = input.gen.toLowerCase()
        artisti = artisti.filter((a: any) => (a.gen || '').toLowerCase().includes(g))
      }
      if (input.artisti && input.artisti.length) {
        const cautati = input.artisti.map((n: string) => n.toLowerCase())
        artisti = artisti.filter((a: any) => cautati.some((c: string) => a.nume.toLowerCase().includes(c)))
      }
      artisti = artisti.slice(0, 15)
      const statistici = await Promise.all(artisti.map(async (a: any) => {
        try {
          const rc = await fetch(baseUrl + '/api/chartex?action=artist_full&artist=' + encodeURIComponent(a.nume), { cache: 'no-store' })
          const dc = await rc.json()
          return {
            artist: a.nume, gen: a.gen || null, fee: a.fee_standard || null,
            spotifyStreams: dc.spotifyStreams || 0,
            spotifyMonthlyListeners: dc.spotifyMonthlyListeners || 0,
            spotifyFollowers: dc.spotifyFollowers || 0,
            tiktokFollowers: dc.tiktokFollowers || 0,
            youtubeViews: dc.youtubeViews || 0,
            hypeStatus: dc.hypeStatus || null,
          }
        } catch { return { artist: a.nume, gen: a.gen || null, fee: a.fee_standard || null, eroare: 'fara date' } }
      }))
      statistici.sort((a: any, b: any) => (b.spotifyMonthlyListeners || b.spotifyStreams || 0) - (a.spotifyMonthlyListeners || a.spotifyStreams || 0))
      return JSON.stringify({ total: statistici.length, criteriu: 'spotify monthly listeners (fallback streams)', top: statistici })
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

  let reguliMemorie = ''
  try {
    const rm = await fetch(baseUrl + '/api/asistent-memorie', { cache: 'no-store' })
    const dm = await rm.json()
    if (dm.ok && dm.reguli?.length) {
      reguliMemorie = '\n\nMEMORIE PERSISTENTA (reguli salvate de echipa - respecta-le, dar aplica regulile LITERAL, exact cum sunt scrise: o regula despre majorate se aplica DOAR la majorate, nu la nunti/botezuri/alte evenimente. Nu extinde regulile prin analogie):\n' + dm.reguli.map((r: any) => '- ' + r.regula).join('\n')
    }
  } catch {}

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
- In descrierea evenimentelor din calendar, echipa noteaza adesea agentul care a adaugat evenimentul (nume sau initiale). Pentru intrebari gen "ce a pus agentul X", cauta numele agentului cu cauta_in_calendar si filtreaza dupa campul "adaugat" (data crearii) pentru perioada ceruta.

FII CONSILIER, NU DOAR EXECUTANT:
- Cand un artist cerut e ocupat, propune automat 2-3 alternative din acelasi gen si buget similar, alegand cu prioritate artisti FWD liberi.
- Cand bugetul pare mic pentru cererea data, spune sincer si sugereaza optiuni realiste (alt artist, format redus).
- Cand vezi un risc (data foarte ceruta, artist des blocat, distanta mare), semnaleaza-l scurt.
- Cand intrebarea e ambigua, intreaba o singura clarificare scurta, nu ghici.
- In cererile de oferta, formulari gen "club X", "la Y", numele dupa oras sunt de regula clubul sau locatia evenimentului, NU artisti. Ex: "motans club iasi nish" = artistul The Motans, orasul Iasi, locatia club Nish.
- La uneltele cu parametrul oras (calculeaza_deviz, calcul_landed, creeaza_oferta): pentru distante foloseste ORASUL real, niciodata numele clubului/locatiei. Ex: "Nibiru Costinesti" = orasul Costinesti (clubul Nibiru e doar locatia). Daca primesti un nume de club/locatie fara oras sau necunoscut: intai cauta clubul in calendar cu cauta_in_calendar (evenimentele trecute contin orasul in titlu, ex \"NIBIRU Costinesti\") si extrage orasul de acolo. Doar daca nu-l gasesti nici in calendar, intreaba utilizatorul.
- La liste lungi, ordoneaza util: FWD primii, apoi pret descrescator.
- Cand se discuta un artist concret la o data concreta, verifica-i calendarul (ziua dinainte si de dupa) si comenteaza logistica: daca e in zona cu o zi inainte = avantaj (transport redus), daca are orase indepartate consecutive = risc logistic. Mentioneaza distantele doar cand conteaza.
REGULI STRICTE:
- ORICE cifra (fee, numar persoane, data) o citezi EXACT din rezultatul unei unelte chemate in conversatia curenta. Zero exceptii.
- Daca un artist e mentionat din nou dupa mai multe mesaje, RE-CHEAMA unealta inainte sa-i citezi fee-ul. Nu te baza pe ce ai spus anterior in conversatie.
- Daca o unealta nu returneaza o informatie, spui "nu am gasit in date" - nu estimezi, nu aproximezi, nu completezi din cunostinte generale.
- Cand citezi un fee, mentioneaza-l exact cum e in date (6500, nu "aproximativ 6000-7000").
- NU folosi termenul landed decat daca utilizatorul l-a folosit explicit in cerere. Landed inseamna transport INCLUS in suma - daca spui landed cand nu e cazul, cifra e falsa si se pierd banii de transport. Implicit, fee-ul si transportul sunt SEPARATE: fee X EUR + transport Y (calculat sau de calculat).
- Poti crea oferte DRAFT cu unealta creeaza_oferta, dar OBLIGATORIU: inainte sa creezi o oferta, arata rezumatul complet (artist, fee, oras, data, client, mentiuni) si asteapta confirmarea explicita a utilizatorului (da/confirm). Nu crea niciodata fara confirmare. Ofertele draft trebuie verificate de om in generator inainte de trimitere. In rest, NU poti bloca date sau modifica nimic altceva - citesti si consiliezi. Nu promite si nu sugera actiuni pe care nu le poti face (ex "blochez pentru oferta", "verific cu echipa", "revin cu raspuns"). Tu nu poti verifica nimic in afara uneltelor si nu poti comunica cu nimeni. In schimb, indruma concret: "poti face oferta din gigx.ro/oferta", "intreaba echipa despre blocare".
Raspunde scurt: liste clare, fara introduceri lungi.` + reguliMemorie

  // bucla agentica: Claude poate chema unelte de mai multe ori
  let convo = [...messages]
  let inTok = 0, outTok = 0
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
    inTok += data.usage?.input_tokens || 0
    outTok += data.usage?.output_tokens || 0
    if (data.error) return NextResponse.json({ error: data.error.message || 'eroare API' }, { status: 500 })

    // daca Claude vrea unelte, le rulez si continui bucla
    const toolUses = (data.content || []).filter((c: any) => c.type === 'tool_use')
    if (toolUses.length === 0 || data.stop_reason !== 'tool_use') {
      const text = (data.content || []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('\n')
      const totalCostUSD = (inTok * 3 + outTok * 15) / 1000000
      return NextResponse.json({ raspuns: text, cost: totalCostUSD })
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
