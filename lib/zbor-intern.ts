// Orase fara curse aeriene interne - transportul ramane rutier indiferent de km.
// Sursa unica: folosita de /prom, asistent, si viitor generator.
export const ORASE_FARA_ZBOR = ['bacau', 'bacău', 'sibiu']

export function areZborIntern(oras: string): boolean {
  return !ORASE_FARA_ZBOR.includes((oras || '').toLowerCase().trim())
}
