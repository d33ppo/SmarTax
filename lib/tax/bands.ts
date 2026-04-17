export interface TaxBand {
  min: number
  max: number
  rate: number
  cumulative: number
}

export const TAX_BANDS_2026: TaxBand[] = [
  { min: 0, max: 5000, rate: 0, cumulative: 0 },
  { min: 5001, max: 20000, rate: 0.01, cumulative: 0 },
  { min: 20001, max: 35000, rate: 0.03, cumulative: 150 },
  { min: 35001, max: 50000, rate: 0.08, cumulative: 600 },
  { min: 50001, max: 70000, rate: 0.13, cumulative: 1800 },
  { min: 70001, max: 100000, rate: 0.21, cumulative: 4400 },
  { min: 100001, max: 250000, rate: 0.24, cumulative: 10700 },
  { min: 250001, max: 400000, rate: 0.245, cumulative: 46700 },
  { min: 400001, max: 600000, rate: 0.25, cumulative: 83450 },
  { min: 600001, max: 1000000, rate: 0.26, cumulative: 133450 },
  { min: 1000001, max: 2000000, rate: 0.28, cumulative: 237450 },
  { min: 2000001, max: Infinity, rate: 0.30, cumulative: 517450 },
]
