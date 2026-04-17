import { TAX_BANDS_2026 } from './bands'
import { REBATES } from './rebates'

export function calculateTax(chargeableIncome: number): number {
  if (chargeableIncome <= 0) return 0

  for (const band of TAX_BANDS_2026) {
    if (chargeableIncome <= band.max) {
      const taxInBand = (chargeableIncome - band.min) * band.rate
      return Math.max(0, band.cumulative + taxInBand - REBATES.individual)
    }
  }

  return 0
}

export function calculateEffectiveRate(chargeableIncome: number): number {
  if (chargeableIncome <= 0) return 0
  const tax = calculateTax(chargeableIncome)
  return tax / chargeableIncome
}

export function calculateMarginalRate(chargeableIncome: number): number {
  for (const band of TAX_BANDS_2026) {
    if (chargeableIncome <= band.max) return band.rate
  }
  return 0.30
}
