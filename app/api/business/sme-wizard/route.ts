import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type WizardAnswers = Record<string, boolean | number>

type BandBreakdown = {
  label: string
  ratePct: number
  taxableAmount: number
  taxAmount: number
}

type FilingRow = {
  id: string
  mode: string | null
  gross_income: number | null
  total_deductions: number | null
  answers: unknown
  deducts: unknown
}

type FilingUpdate = Database['public']['Tables']['filings']['Update']

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function calculateSmeTax(chargeableIncome: number, isSmeRateEligible: boolean): { totalTax: number; bands: BandBreakdown[] } {
  if (chargeableIncome <= 0) {
    return { totalTax: 0, bands: [] }
  }

  if (!isSmeRateEligible) {
    const flatTax = round2(chargeableIncome * 0.24)
    return {
      totalTax: flatTax,
      bands: [
        {
          label: 'Standard corporate rate',
          ratePct: 24,
          taxableAmount: round2(chargeableIncome),
          taxAmount: flatTax,
        },
      ],
    }
  }

  let remaining = chargeableIncome
  const bands: BandBreakdown[] = []

  const band1Taxable = Math.min(remaining, 150000)
  if (band1Taxable > 0) {
    bands.push({
      label: 'First RM150,000 (PR 8/2025)',
      ratePct: 15,
      taxableAmount: round2(band1Taxable),
      taxAmount: round2(band1Taxable * 0.15),
    })
    remaining -= band1Taxable
  }

  const band2Taxable = Math.min(Math.max(remaining, 0), 450000)
  if (band2Taxable > 0) {
    bands.push({
      label: 'RM150,001 - RM600,000 (PR 8/2025)',
      ratePct: 17,
      taxableAmount: round2(band2Taxable),
      taxAmount: round2(band2Taxable * 0.17),
    })
    remaining -= band2Taxable
  }

  const band3Taxable = Math.max(remaining, 0)
  if (band3Taxable > 0) {
    bands.push({
      label: 'Above RM600,000 (standard rate)',
      ratePct: 24,
      taxableAmount: round2(band3Taxable),
      taxAmount: round2(band3Taxable * 0.24),
    })
  }

  return {
    totalTax: round2(bands.reduce((sum, b) => sum + b.taxAmount, 0)),
    bands,
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { filingId?: string; answers?: WizardAnswers }
    const filingId = body?.filingId
    const answers = body?.answers ?? {}

    if (!filingId) {
      return NextResponse.json({ error: 'filingId is required' }, { status: 400 })
    }

    const supabase = createClient()
    const { data, error: filingError } = await supabase
      .from('filings')
      .select('id, mode, gross_income, total_deductions, answers, deducts')
      .eq('id', filingId)
      .single()

    const filing = (data ?? null) as FilingRow | null

    if (filingError || !filing) {
      return NextResponse.json({ error: 'Filing not found' }, { status: 404 })
    }

    const paidUpCapital = toNumber(answers.paid_up_capital)
    const foreignOwnershipPct = toNumber(answers.foreign_ownership_pct)

    const entertainmentBusiness = toNumber(answers.entertainment_business_amount)
    const entertainmentEmployee = toNumber(answers.entertainment_employee_amount)
    const promoMerchandise = toNumber(answers.promo_merchandise_amount)
    const smallValueAssets = toNumber(answers.small_value_assets_amount)
    const trainingDoubleDeduction = toNumber(answers.training_double_deduction_amount)
    const rdDoubleDeduction = toNumber(answers.rd_double_deduction_amount)
    const exportDoubleDeduction = toNumber(answers.export_double_deduction_amount)
    const nonDeductibleExpenses = toNumber(answers.non_deductible_expenses_amount)

    const grossIncome = toNumber(filing.gross_income)
    const existingDeductions = toNumber(filing.total_deductions)
    const baseChargeableIncome = Math.max(0, grossIncome - existingDeductions)

    const isSmeRateEligible =
      paidUpCapital <= 2_500_000 && grossIncome <= 50_000_000 && foreignOwnershipPct <= 20

    // Add-backs and extra deductions for the simplified hackathon SME wizard.
    const addBacks = nonDeductibleExpenses + entertainmentBusiness * 0.5
    const extraDeductions =
      smallValueAssets +
      trainingDoubleDeduction +
      rdDoubleDeduction +
      exportDoubleDeduction

    const adjustedChargeableIncome = Math.max(0, baseChargeableIncome + addBacks - extraDeductions)

    const baselineTax = calculateSmeTax(baseChargeableIncome, isSmeRateEligible)
    const postAdjustmentTax = calculateSmeTax(adjustedChargeableIncome, isSmeRateEligible)

    const isNewCompanyRebateEligible = answers.new_company_rebate === true
    const newCompanyRebate = isNewCompanyRebateEligible
      ? Math.min(20000, postAdjustmentTax.totalTax)
      : 0

    const finalTax = round2(Math.max(0, postAdjustmentTax.totalTax - newCompanyRebate))
    const potentialSavings = round2(Math.max(0, baselineTax.totalTax - finalTax))

    const deductibleItems = [
      {
        code: 'SME-SMALL-ASSET',
        name_en: 'Small value assets (<= RM2,000 each)',
        amount: round2(smallValueAssets),
        description: '100% deductible in year 1 for SMEs.',
        citation: {
          itaSection: 'PR 8/2025',
          url: 'https://www.hasil.gov.my/media/fo1ptejq/pr-8-2025-tax-treatment-for-micro-small-and-medium-companies.pdf',
        },
      },
      {
        code: 'SME-TRAINING-DD',
        name_en: 'Double deduction - approved employee training',
        amount: round2(trainingDoubleDeduction),
        description: 'Additional 100% deduction on approved training expenses.',
        citation: {
          itaSection: 'S.34(6)',
          url: 'https://www.hasil.gov.my/en/legislation/public-rulings/',
        },
      },
      {
        code: 'SME-RND-DD',
        name_en: 'Double deduction - qualifying R&D',
        amount: round2(rdDoubleDeduction),
        description: 'Additional 100% deduction on qualifying R&D expenses.',
        citation: {
          itaSection: 'S.34A',
          url: 'https://www.hasil.gov.my/en/legislation/public-rulings/',
        },
      },
      {
        code: 'SME-EXPORT-DD',
        name_en: 'Double deduction - export promotion',
        amount: round2(exportDoubleDeduction),
        description: 'Additional 100% deduction on qualifying overseas marketing expenses.',
        citation: {
          itaSection: 'S.34(6)',
          url: 'https://www.hasil.gov.my/en/legislation/public-rulings/',
        },
      },
      {
        code: 'SME-EMP-ENT',
        name_en: 'Entertainment for employees',
        amount: round2(entertainmentEmployee),
        description: 'Fully deductible exception for staff entertainment.',
        citation: {
          itaSection: 'PR 4/2015',
          url: 'https://www.hasil.gov.my/en/legislation/public-rulings/',
        },
      },
      {
        code: 'SME-PROMO-100',
        name_en: 'Branded promotional merchandise',
        amount: round2(promoMerchandise),
        description: 'Fully deductible exception for branded promotional items.',
        citation: {
          itaSection: 'PR 4/2015',
          url: 'https://www.hasil.gov.my/en/legislation/public-rulings/',
        },
      },
    ]
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    const missedItems = [
      trainingDoubleDeduction === 0
        ? {
            code: 'MISSED-TRAINING-DD',
            description: 'No approved training double deduction was claimed.',
            maxAmount: null,
          }
        : null,
      rdDoubleDeduction === 0
        ? {
            code: 'MISSED-RND-DD',
            description: 'No qualifying R&D double deduction was claimed.',
            maxAmount: null,
          }
        : null,
      exportDoubleDeduction === 0
        ? {
            code: 'MISSED-EXPORT-DD',
            description: 'No export promotion double deduction was claimed.',
            maxAmount: null,
          }
        : null,
      smallValueAssets === 0
        ? {
            code: 'MISSED-SMALL-ASSET',
            description: 'No small-value asset write-off was claimed.',
            maxAmount: null,
          }
        : null,
    ].filter(Boolean)

    const existingAnswers = typeof filing.answers === 'object' && filing.answers ? filing.answers : {}
    const existingDeducts = typeof filing.deducts === 'object' && filing.deducts ? filing.deducts : {}

    const filingUpdatePayload: FilingUpdate = {
        mode: 'sme',
        status: 'completed',
        answers: {
          ...existingAnswers,
          smeWizard: answers,
          smeQualification: {
            paidUpCapital,
            foreignOwnershipPct,
            grossIncome,
            isSmeRateEligible,
            reference: 'LHDN PR 8/2025',
          },
          smeTaxBandBreakdown: postAdjustmentTax.bands,
          smeTaxReferences: {
            taxRateSource:
              'https://www.hasil.gov.my/media/fo1ptejq/pr-8-2025-tax-treatment-for-micro-small-and-medium-companies.pdf',
            deductionSources: [
              'https://www.hasil.gov.my/en/legislation/public-rulings/',
              'https://taxsummaries.pwc.com/malaysia/corporate/deductions',
            ],
          },
        },
        deducts: {
          ...existingDeducts,
          smeAdjustments: {
            addBacks: round2(addBacks),
            extraDeductions: round2(extraDeductions),
          },
        },
        taxable_income_after_reliefs: round2(adjustedChargeableIncome),
        calculated_tax_before_reliefs: round2(baselineTax.totalTax),
        calculated_tax_after_reliefs: finalTax,
        total_reliefs: round2(extraDeductions),
        total_deductions: round2(Math.max(0, existingDeductions + extraDeductions - addBacks)),
        potential_savings: potentialSavings,
        reliefs: deductibleItems,
        missed_reliefs: missedItems,
      }

    const filingsUpdate = supabase.from('filings') as unknown as {
      update: (values: FilingUpdate) => {
        eq: (column: string, value: string) => Promise<{ error: unknown }>
      }
    }

    const { error: updateError } = await filingsUpdate
      .update(filingUpdatePayload)
      .eq('id', filingId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      filingId,
      isSmeRateEligible,
      baseChargeableIncome: round2(baseChargeableIncome),
      adjustedChargeableIncome: round2(adjustedChargeableIncome),
      baselineTax: round2(baselineTax.totalTax),
      finalTax,
      potentialSavings,
      newCompanyRebate: round2(newCompanyRebate),
    })
  } catch (err) {
    console.error('business sme wizard error:', err)
    return NextResponse.json({ error: 'Failed to process SME wizard' }, { status: 500 })
  }
}
