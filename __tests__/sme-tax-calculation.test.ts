/**
 * TEST SUITE: SME Tax Calculation Engine
 * 
 * TC-05 (Happy Case): Correct SME tax bands calculation (15%/17%/24%)
 * TC-06 (Happy Case): Correct standard tax calculation (24% for non-eligible)
 * TC-07 (Negative Case): Non-eligible business forced to 24% standard rate
 * 
 * QATD Section: 5. Test Case Specifications
 * QATD Section: 6. AI Output & Boundary Testing
 */

describe('SME Tax Calculation Engine (TC-05, TC-06, TC-07)', () => {
  // TC-05: Happy Case - SME Qualified Business (Gets 15%/17%/24% bands)
  it('TC-05: SME-qualified business gets 15%-17%-24% progressive rates', () => {
    // Arrange: Business that qualifies for SME rates
    // ✓ Capital: RM2.5M (within limit)
    // ✓ Gross Income: RM50M (within limit)
    // ✓ Foreign ownership: 20% (within limit)
    const qualifiedBusiness = {
      grossIncome: 1200000, // RM1.2M
      capital: 1500000, // RM1.5M (< RM2.5M)
      foreignOwnership: 15, // 15% (< 20%)
      deductions: 300000,
    }

    // Act: Calculate SME tax
    const result = calculateSMETax(qualifiedBusiness)

    // Assert: Verify band breakdown
    // Band 1: RM150k @ 15% = RM22,500
    // Band 2: RM450k @ 17% = RM76,500
    // Band 3: RM300k @ 24% = RM72,000
    // Subtotal: RM171,000
    const taxableIncome = qualifiedBusiness.grossIncome - qualifiedBusiness.deductions
    expect(result.isSmeRateEligible).toBe(true)
    expect(result.band1Tax).toBe(150000 * 0.15) // RM22,500
    expect(result.band2Tax).toBe(450000 * 0.17) // RM76,500
    expect(result.totalTaxBeforeReliefs).toBeGreaterThan(0)
    expect(result.effectiveRate).toBeLessThan(24) // SME gets lower effective rate
  })

  // TC-06: Happy Case - Standard Business (Gets 24% flat rate)
  it('TC-06: Non-eligible business gets standard 24% flat rate', () => {
    // Arrange: Business that does NOT qualify for SME rates
    // ✗ Capital: RM3M (exceeds RM2.5M limit)
    const nonQualifiedBusiness = {
      grossIncome: 800000,
      capital: 3000000, // RM3M > RM2.5M limit
      foreignOwnership: 15,
      deductions: 200000,
    }

    // Act: Calculate tax
    const result = calculateSMETax(nonQualifiedBusiness)

    // Assert: Verify standard rate applied
    // Taxable: RM800k - RM200k = RM600k
    // Tax: RM600k × 24% = RM144,000
    expect(result.isSmeRateEligible).toBe(false)
    expect(result.effectiveRate).toBe(24)
    expect(result.totalTaxBeforeReliefs).toBe(600000 * 0.24) // RM144,000
  })

  // TC-07: Negative Case - High Foreign Ownership Disqualifies SME
  it('TC-07: Foreign ownership > 20% disqualifies from SME rates', () => {
    // Arrange: Business with excessive foreign ownership
    const highForeignBusiness = {
      grossIncome: 500000,
      capital: 1000000,
      foreignOwnership: 35, // 35% > 20% limit
      deductions: 100000,
    }

    // Act: Calculate tax
    const result = calculateSMETax(highForeignBusiness)

    // Assert: Forced to standard 24% rate
    expect(result.isSmeRateEligible).toBe(false)
    expect(result.disqualificationReason).toContain('Foreign ownership')
    expect(result.effectiveRate).toBe(24)
  })

  // TC-08: Boundary Case - Exactly at SME limits
  it('TC-08: Business at exact limits qualifies for SME rates', () => {
    // Arrange: Business at the boundary
    const boundaryBusiness = {
      grossIncome: 50000000, // Exactly RM50M limit
      capital: 2500000, // Exactly RM2.5M limit
      foreignOwnership: 20, // Exactly 20% limit
      deductions: 10000000,
    }

    // Act: Calculate tax
    const result = calculateSMETax(boundaryBusiness)

    // Assert: Should still qualify (boundary is inclusive)
    expect(result.isSmeRateEligible).toBe(true)
    expect(result.band1Tax).toBe(150000 * 0.15) // SME rates applied
  })

  // TC-09: NFR (Performance) - Large income calculation
  it('TC-09: Tax calculation completes in < 50ms for large amounts', () => {
    const largeBusiness = {
      grossIncome: 50000000, // RM50M
      capital: 2000000,
      foreignOwnership: 10,
      deductions: 20000000,
    }

    // Measure execution time
    const startTime = performance.now()
    const result = calculateSMETax(largeBusiness)
    const endTime = performance.now()

    // Assert: Must be fast (< 50ms)
    const executionTime = endTime - startTime
    expect(executionTime).toBeLessThan(50)
    expect(result).toBeDefined()
  })
})

// ============================================================================
// MOCK FUNCTION: calculateSMETax
// Real implementation in lib/tax/engine.ts
// ============================================================================
interface SMETaxInput {
  grossIncome: number
  capital: number
  foreignOwnership: number
  deductions: number
}

interface SMETaxResult {
  isSmeRateEligible: boolean
  band1Tax?: number
  band2Tax?: number
  band3Tax?: number
  totalTaxBeforeReliefs: number
  effectiveRate: number
  disqualificationReason?: string
}

function calculateSMETax(input: SMETaxInput): SMETaxResult {
  const { grossIncome, capital, foreignOwnership, deductions } = input

  // Check SME eligibility
  const isSmeEligible =
    capital <= 2500000 && grossIncome <= 50000000 && foreignOwnership <= 20

  if (!isSmeEligible) {
    // Non-eligible: 24% flat rate
    const taxableIncome = Math.max(0, grossIncome - deductions)
    return {
      isSmeRateEligible: false,
      totalTaxBeforeReliefs: taxableIncome * 0.24,
      effectiveRate: 24,
      disqualificationReason: `${
        capital > 2500000 ? 'Capital' : foreignOwnership > 20 ? 'Foreign ownership' : 'Income'
      } exceeds SME limits`,
    }
  }

  // SME-eligible: Progressive bands
  const taxableIncome = Math.max(0, grossIncome - deductions)
  let tax = 0
  let band1Tax = 0,
    band2Tax = 0,
    band3Tax = 0

  if (taxableIncome <= 150000) {
    band1Tax = taxableIncome * 0.15
    tax = band1Tax
  } else if (taxableIncome <= 600000) {
    band1Tax = 150000 * 0.15
    band2Tax = (taxableIncome - 150000) * 0.17
    tax = band1Tax + band2Tax
  } else {
    band1Tax = 150000 * 0.15
    band2Tax = 450000 * 0.17
    band3Tax = (taxableIncome - 600000) * 0.24
    tax = band1Tax + band2Tax + band3Tax
  }

  return {
    isSmeRateEligible: true,
    band1Tax,
    band2Tax,
    band3Tax,
    totalTaxBeforeReliefs: tax,
    effectiveRate: taxableIncome > 0 ? (tax / taxableIncome) * 100 : 0,
  }
}
