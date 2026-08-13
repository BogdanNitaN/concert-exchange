// taxonomia genurilor pentru cataloage (tabelul explicit al lui Bogdan)
const GENURI: Record<string, string[]> = {
  'grasu xxl': ['Hip-Hop'], 'guess who': ['Hip-Hop'], 'killa fonic': ['Hip-Hop', 'Trap'], 'la familia': ['Hip-Hop'],
  'parazitii': ['Hip-Hop'], 'puya': ['Hip-Hop'], 'vescan': ['Hip-Hop'], 'puya & urban symphony orchestra': ['Hip-Hop'],
  'dangerosu': ['Hip-Hop'], 'gojira': ['Hip-Hop'],
  'albwho': ['DJs'], 'andre rizo': ['DJs'], 'andrew dum': ['DJs'], 'manuel riva': ['DJs'], 'speak': ['DJs'],
  'chris hype': ['DJs'], 'moonsound': ['DJs'],
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

export function genuriPentru(nume: string, fallback: string[] = []): string[] {
  const norm = (nume || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  return GENURI[norm] || fallback
}

export const ARTISTI_ASCUNSI = ['gojira', 'puya & urban symphony orchestra', 'alternosfera', 'the motans & symphony orchestra', 'inna', 'dangerosu', 'bruja']
export function esteAscuns(nume: string): boolean {
  const n = (nume || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  return ARTISTI_ASCUNSI.includes(n)
}

const TIER_OVERRIDE: Record<string, string> = { 'andrew dum': 'A+' }
export function tierPentru(nume: string, metaTier: string | null, fee: number): string | null {
  const n = (nume || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  if (TIER_OVERRIDE[n]) return TIER_OVERRIDE[n]
  if (metaTier) return metaTier
  if (fee >= 10000) return 'A++'
  if (fee >= 5000) return 'A+'
  if (fee > 0) return 'A'
  return null
}

// artisti care raman in genul lor, nu urca in sectiunea "Top artisti"
export const FARA_TOP = ['parazitii']
export function esteFaraTop(nume: string): boolean {
  const n = (nume || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  return FARA_TOP.includes(n)
}
