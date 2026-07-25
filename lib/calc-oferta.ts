// Calculul unei linii de oferta - sursa unica, folosita de generator si asistent.
// ATENTIE: orice modificare aici schimba devizele peste tot. Logica identica cu fostul calcLinie din oferta/page.tsx.

export type LinieCalc = {
  artist: { transport_moneda?: string | null }
  fee: number
  feeLista: number
  leiKm: number
  useMarja: boolean
  persoane: number
  restulRutier: boolean
  tipMasa: 'diurna' | 'alacarte'
  zile: number
  diurnaPerPers: number
  diurnaFixa: number
  cazareFixa: number
  useAlcool: boolean
  alcool: number
  useCag: boolean
  cagProcent: number
  cagSuma: number
  cagMod: 'procent' | 'suma'
}

export type ContextCalc = {
  km: number | null
  eurRate: number | null
  useAdaos: boolean
  adaosProcent: number
  local: boolean  // eveniment Buc/Ilfov cu artist rezident Bucuresti
}

export function calcLinieOferta(l: LinieCalc, ctx: ContextCalc) {
  const { km, eurRate, useAdaos, adaosProcent, local } = ctx
  const marjaProc = km !== null && km > 300 ? 0.065 : 0.115
  const kmTotal = km !== null ? (l.useMarja ? (km + Math.round(km * marjaProc)) * 2 : km * 2) : 0
  const totiZboara = km !== null && km > 300 && !l.restulRutier
  const transportEuro = l.artist.transport_moneda === 'euro'
  const transportRaw = local ? 0 : ((kmTotal > 0 && l.leiKm > 0 && !totiZboara) ? kmTotal * l.leiKm : 0)
  const transportLei = transportEuro ? 0 : Math.round(transportRaw / 10) * 10
  const transportEur = transportEuro ? Math.round(transportRaw) : 0
  const transportEurInLei = transportEuro && eurRate ? Math.round(transportEur * eurRate) : 0
  const diurnaTotal = l.diurnaFixa > 0 ? l.diurnaFixa : (l.tipMasa === 'diurna' ? l.persoane * l.diurnaPerPers * l.zile : 0)
  const alcoolTotal = l.useAlcool ? l.alcool : 0
  const discount = l.feeLista > l.fee ? l.feeLista - l.fee : 0
  const cursAdaos = eurRate ? eurRate * (1 + (useAdaos ? adaosProcent : 0) / 100) : 0
  const savingLei = discount > 0 && eurRate ? Math.round(discount * eurRate) : 0
  let cag = 0
  if (l.useCag) {
    if (l.cagMod === 'suma') cag = l.cagSuma
    else { cag = Math.round(l.fee * l.cagProcent / 100); if (cag > 1000) cag = 1000 }
  }
  const netGigx = l.fee - cag
  const feeLeiConv = eurRate ? Math.round(l.fee * (cursAdaos || eurRate)) : 0
  return { kmTotal, transportLei, transportEur, transportEurInLei, transportEuro, diurnaTotal, alcoolTotal, discount, cursAdaos, savingLei, cag, netGigx, feeLeiConv, local }
}
