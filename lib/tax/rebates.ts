export const REBATES = {
  individual: 400,
  spouse: 400,
  zakatMax: Infinity,
}

export function applyRebates(tax: number, zakatPaid: number, hasSpouseRebate: boolean): number {
  let reduced = tax - REBATES.individual
  if (hasSpouseRebate) reduced -= REBATES.spouse
  reduced = Math.max(0, reduced)
  reduced = Math.max(0, reduced - zakatPaid)
  return reduced
}
