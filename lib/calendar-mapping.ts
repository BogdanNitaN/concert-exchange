// Mapare calendar Google -> nume artist din roster (oferta_artisti)
// Cheia: numele calendarului din Google (exact). Valoarea: numele artistului din roster.
// Construita si verificata manual pentru precizie.

export const CALENDAR_TO_ROSTER: Record<string, string> = {
  'bob ramanka': 'Bob Ramanka',
  'Irina Rimes': 'Irina Rimes',
  'AMI': 'Ami',
  'ALINA EREMIA': 'Alina Eremia',
  'AlbWho': 'Albwho',
  'Albert NBN': 'Albert NBN',
  'Andrei Ursu (WRS)': 'Andrei Ursu',
  'Andre Rizo': 'Andre Rizo',
  'Babasha': 'Babasha',
  'ANTONIA': 'Antonia',
  'Andrew Dum': 'Andrew Dum',
  'Bruja': 'Bruja',
  'Erika Isac': 'Erika Isac',
  'EMAA': 'Emaa',
  'Dara': 'Dara',
  'Dangerosu': 'Dangerosu',
  'CONCERTE MARIO': 'Mario',
  'FELI': 'Feli',
  'Events Feli': 'Feli',
  'Florian Rus': 'Florian Rus',
  'Grasu XXL': 'Grasu XXL',
  'Guess Who': 'Guess Who',
  'HOLY MOLLY': 'Holy Molly',
  'HVNDS': 'HVNDS',
  'IDK': 'IDK',
  'KILLA FONIC': 'Killa Fonic',
  'La Familia': 'La Familia',
  'LAZY ED': 'Lazy Ed',
  'MINELLI': 'Minelli',
  'MIRA': 'Mira',
  'Parazitii': 'Parazitii',
  'Petre Stefan': 'Petre Stefan',
  'Puya': 'Puya',
  'Randi': 'Randi',
  'Rares Maris': 'Rares',
  'Speak': 'Speak',
  'Stefania': 'Stefania',
  'Tania Turtureanu': 'Tania Turtureanu',
  'THE MOTANS': 'The Motans',
  'Tobi Ibitoye': 'Tobi Ibitoye',
  'Tussin': 'Tussin',
  'Vlad Corb x Epicenter': 'Vlad Corb',
  'White Mahala': 'White Mahala',
  "Carla's Dreams": "Carla's Dreams",
  'Eva Timush': 'Eva Timush',
  'Vescan Evenimente': 'Vescan',
  'VESCAN FWD': 'Vescan',
  'Adrian Istrate': 'Adi Istrate',
  'Satra&Ochiu': 'Satra Benz',
}

// Calendare de exclus complet (zgomot / nereprezentati)
export const CALENDAR_EXCLUSE = [
  'Holidays in Romania', 'OCS', 'Forward Booking', 'Forward Team',
  'contact.forward.agency@gmail.com', 'tbackaugust@gmail.com',
  'RATB @ EPICENTRU', 'Bad & Boujee Party', '911', '(🚀) TKS Concerte',
  'Helda', 'Alesta', 'Badd G', 'Chris Hype',
  'Sasha Lopez', 'Sickotoy', 'DJ PROJECT', 'Manuel Riva', 'Nuante Epicenter',
  'NICOLE CHERRY', 'Nicole Cherry',
  'Îngeri Şi Corbi - Epicenter', 'Bruja', 'Dangerosu',
]

export const ARTISTI_INACTIVI = ['Dara']

// normalizare pentru potrivire fallback
export function normNume(s: string): string {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')
}

// orase RO cunoscute pentru validarea extragerii din titluri
const RO_CITIES_ORAS = ['bucuresti','cluj','cluj-napoca','timisoara','iasi','constanta','craiova','brasov','galati','ploiesti','oradea','braila','arad','pitesti','sibiu','bacau','targu mures','baia mare','baia sprie','buzau','satu mare','ardud','botosani','suceava','piatra neamt','focsani','targu jiu','deva','alba iulia','resita','tulcea','slatina','ramnicu valcea','targoviste','giurgiu','alexandria','calarasi','slobozia','zalau','bistrita','vaslui','sfantu gheorghe','miercurea ciuc','onesti','roman','dej','turda','sighisoara','medias','costinesti','mamaia','vama veche','sinaia','predeal','busteni','tasnad','baia sprie']


// festivaluri cunoscute -> oras (nu au orasul in titlu)
const FESTIVAL_ORAS: Record<string, string> = {
  'untold': 'Cluj-Napoca',
  'neversea': 'Constanta',
  'electric castle': 'Cluj-Napoca',
  'electric castel': 'Cluj-Napoca',
  'summer well': 'Buftea',
  'summerwell': 'Buftea',
  'saga': 'Bucuresti',
  'beach please': 'Costinesti',
  'sunwaves': 'Mamaia',
  'afterhills': 'Iasi',
  'wine village': 'Alba Iulia',
  'jazz in the park': 'Cluj-Napoca',
  'padina fest': 'Padina',
  'meci': 'Bucuresti',
  'untold universe': 'Cluj-Napoca',
}

// extrage orasul dintr-un titlu de eveniment. null daca nu-i un show cu locatie.
export function extragOrasDinTitlu(titlu: string): string | null {
  if (!titlu) return null
  if (/\bblocat\b/i.test(titlu)) return null
  // verific festival cunoscut (nu are oras in titlu)
  const tLow = titlu.toLowerCase()
  for (const [fest, oras] of Object.entries(FESTIVAL_ORAS)) {
    if (tLow.includes(fest)) return oras
  }
  let t = titlu.replace(/^\([^)]*\)\s*/, '').trim()
  t = t.replace(/\([^)]*\)/g, '').trim()
  const areVirgula = t.includes(',')
  const segmente = t.split(',').map(s => s.trim()).filter(Boolean)
  if (segmente.length === 0) return null
  let oras = segmente[segmente.length - 1]
  oras = oras.replace(/\b(open air|aer liber|plaja|festival|fest|corporate|nunta|privat|venue)\b/gi, '').trim()
  const orasNorm = normNume(oras)
  const eOras = RO_CITIES_ORAS.map(normNume).includes(orasNorm)
  if (!eOras && !areVirgula) return null
  if (!eOras && oras.split(' ').length > 2) return null
  return oras || null
}
