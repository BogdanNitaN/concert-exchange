// Formateaza o data ISO (2026-10-10) in format romanesc citibil: "10 OCTOMBRIE 2026"
// Folosit peste tot: emailuri (prom), text oferta, PDF. Sursa unica.
const LUNI = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie']

export function formatDataRo(data: string | null | undefined): string {
  if (!data) return ''
  // acceptam "2026-10-10" sau "2026-10-10T..."
  const m = data.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return data  // daca nu e ISO, returnez cum e (nu stric alt format)
  const an = m[1]
  const luna = parseInt(m[2], 10)
  const zi = parseInt(m[3], 10)
  if (luna < 1 || luna > 12) return data
  return zi + ' ' + LUNI[luna - 1] + ' ' + an
}
