// Numara persoanele din textul de cazare (ex: "2 sng + 2 dbl" = 6)
// Sursa unica, folosita si in API (salvare artist) si in generator (editare linie)
export function persoaneDinCazare(c: string): number {
  if (!c) return 0
  c = c.toLowerCase()
  let t = 0
  const m = [...c.matchAll(/(\d+)\s*(sng|single|dbl|dubl[ae]?|duble|twin|matrimonial[ae]?|suit[ae]?|camer[ae]?)/g)]
  for (const x of m) {
    const n = +x[1], tip = x[2]
    if (tip.includes('dbl') || tip.includes('dubl') || tip.includes('twin') || tip.includes('camer')) t += n * 2
    else t += n
  }
  return t
}
