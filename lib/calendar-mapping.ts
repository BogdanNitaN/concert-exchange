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
  'Adrian Istrate': 'Adi Istrate',
  'Satra&Ochiu': 'Satra Benz',
}

// Calendare de exclus complet (zgomot / nereprezentati)
export const CALENDAR_EXCLUSE = [
  'Holidays in Romania', 'OCS', 'Forward Booking', 'Forward Team',
  'contact.forward.agency@gmail.com', 'tbackaugust@gmail.com',
  'RATB @ EPICENTRU', 'Bad & Boujee Party', '911', '(🚀) TKS Concerte',
  'Îngeri Şi Corbi - Epicenter', 'Helda', 'Alesta', 'Badd G', 'Chris Hype',
  'Sasha Lopez', 'Sickotoy', 'DJ PROJECT', 'Manuel Riva', 'Nuante Epicenter',
  'NICOLE CHERRY', 'Nicole Cherry',
]

// normalizare pentru potrivire fallback
export function normNume(s: string): string {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')
}
