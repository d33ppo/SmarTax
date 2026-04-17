import type { Relief } from '@/types/relief'

export const RELIEFS_MASTER: Relief[] = [
  { id: 'personal', code: 'PR001', name: 'Personal Relief', maxAmount: 9000, category: 'personal', ruling_citation: 'ITA 1967 S.46(1)(a)', ruling_url: null, description: 'Standard individual relief for every resident taxpayer.' },
  { id: 'epf', code: 'PR002', name: 'EPF Contribution (Employee)', maxAmount: 4000, category: 'retirement', ruling_citation: 'ITA 1967 S.49(1)(b)', ruling_url: null, description: 'Employee mandatory & voluntary EPF contributions, capped at RM 4,000.' },
  { id: 'life_insurance', code: 'PR003', name: 'Life Insurance Premium', maxAmount: 3000, category: 'insurance', ruling_citation: 'ITA 1967 S.49(1)(b)', ruling_url: null, description: 'Life insurance premium combined with EPF, total capped at RM 7,000.' },
  { id: 'medical_parent', code: 'PR004', name: 'Medical Expenses (Parents)', maxAmount: 8000, category: 'medical', ruling_citation: 'ITA 1967 S.46(1)(c)', ruling_url: null, description: 'Medical treatment, special needs, and carer expenses for parents.' },
  { id: 'spouse', code: 'PR005', name: 'Spouse Relief', maxAmount: 4000, category: 'family', ruling_citation: 'ITA 1967 S.45A', ruling_url: null, description: 'For taxpayer with a non-working or low-income spouse.' },
  { id: 'child_basic', code: 'PR006', name: 'Child Relief (Basic)', maxAmount: 2000, category: 'family', ruling_citation: 'ITA 1967 S.48(2)', ruling_url: null, description: 'RM 2,000 per child below 18 or in full-time education.' },
  { id: 'lifestyle', code: 'PR007', name: 'Lifestyle Relief', maxAmount: 2500, category: 'lifestyle', ruling_citation: 'ITA 1967 S.46(1)(p)', ruling_url: null, description: 'Books, sports equipment, gym, internet subscription, PC/smartphone.' },
  { id: 'education_self', code: 'PR008', name: 'Education (Self) Relief', maxAmount: 7000, category: 'education', ruling_citation: 'ITA 1967 S.46(1)(f)', ruling_url: null, description: 'Fees for approved courses at recognised institutions (tertiary/skills).' },
  { id: 'medical_self', code: 'PR009', name: 'Medical & Health Relief', maxAmount: 10000, category: 'medical', ruling_citation: 'ITA 1967 S.46(1)(d)', ruling_url: null, description: 'Serious illness treatment, fertility treatment, dental treatment (excl. cosmetic).' },
  { id: 'disability_self', code: 'PR010', name: 'Disability Relief (Self)', maxAmount: 6000, category: 'disability', ruling_citation: 'ITA 1967 S.46(1)(g)', ruling_url: null, description: 'Additional relief if taxpayer is a registered disabled person.' },
]

export function getEligibleReliefs(
  answers: Record<string, boolean | number>,
  filing: { gross_income: number; epf_employee: number }
): (Relief & { amount: number })[] {
  const eligible: (Relief & { amount: number })[] = []

  for (const relief of RELIEFS_MASTER) {
    let amount = 0

    switch (relief.id) {
      case 'personal':
        amount = 9000
        break
      case 'epf':
        amount = Math.min(filing.epf_employee, 4000)
        break
      case 'spouse':
        if (answers.has_spouse && !answers.spouse_income) amount = 4000
        break
      case 'child_basic':
        if (answers.has_children && answers.child_count) {
          amount = Math.min(Number(answers.child_count), 5) * 2000
        }
        break
      case 'disability_self':
        if (answers.has_disability) amount = 6000
        break
      case 'education_self':
        if (answers.has_education) amount = 7000
        break
      case 'life_insurance':
        if (answers.has_life_insurance) amount = 3000
        break
      case 'medical_parent':
        if (answers.has_medical) amount = 8000
        break
      case 'lifestyle':
        amount = 2500
        break
      case 'medical_self':
        amount = 0
        break
    }

    if (amount > 0) {
      eligible.push({ ...relief, amount: Math.min(amount, relief.maxAmount) })
    }
  }

  return eligible
}
