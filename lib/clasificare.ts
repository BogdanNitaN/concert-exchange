// Clasificare evenimente calendar - SURSA UNICA folosita de toate rutele.
// Orice modificare aici se aplica peste tot (artist-liber, disponibilitate).

export type TipEveniment = 'show' | 'indisponibil' | 'echipa' | 'nota' | 'verifica'

// extrage cuvintele semnificative din numele artistului
export function cuvinteArtist(nume: string): string[] {
  return nume.toLowerCase().replace(/[^a-z0-9\u00e0-\u017f ]/gi, '').split(/\s+/)
    .filter((w: string) => w.length >= 3 && !['the', 'and', 'feat'].includes(w))
}

// clasifica un eveniment dupa titlu, cuvintele artistului si orasul extras (daca exista)
export function clasificaEveniment(titlu: string, cuv: string[], orasEv?: string | null): TipEveniment {
  const tl = titlu.toLowerCase()
  let desprEl = cuv.some((w: string) => tl.includes(w))
  // exceptie: "fara/fără [artist]" = nu e despre el
  if (cuv.length && new RegExp('f[ăa]r[ăa]\\s+(' + cuv.map((w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')').test(tl)) desprEl = false
  const marcaj = /^\s*\((P|C)/i.test(titlu) || !!orasEv
  const blocaj = /vacan|concediu|liber|off|indisponibil|blocat|nu se ia|pauza/i.test(tl)
  const adminUsor = /\bpr\b|promo|meeting|\bmeet\b|outfit|team|zi de na|nastere|naștere/i.test(tl)
  const ocupaZi = /filmare|repetiț|repetit|\brep\b|studio|sesiune/i.test(tl)
  const pending = /pending/i.test(tl)
  const eveniment = /turneu|festival|concert|\bshow\b|live|gal[ăa]|spectacol|zboruri/i.test(tl)
  const prezenta = /invitat|1 pies|feat/i.test(tl)
  let tip: TipEveniment = 'nota'
  if (desprEl && marcaj && !ocupaZi) tip = blocaj ? 'indisponibil' : 'show'
  else if (pending) tip = 'verifica'
  else if (desprEl && ocupaZi) tip = 'indisponibil'
  else if (adminUsor) tip = 'nota'
  else if (desprEl && blocaj) tip = 'indisponibil'
  else if ((desprEl && eveniment) || (eveniment && prezenta)) tip = 'show'
  else if (marcaj && !desprEl) tip = 'echipa'
  else if (blocaj && !desprEl) tip = 'echipa'
  return tip
}
