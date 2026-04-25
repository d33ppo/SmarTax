export interface Filing {
  id: string
  user_id: string | null
  gross_income: number | null
  total_reliefs: number
  total_deductions: number | null
  ea_chargeable_income: number | null   // looks truncated, probably ea_chargeable_income
  taxable_income_after_reliefs: number           // truncated, likely taxable_income_before_reliefs
  calculated_tax_before_reliefs: number         // truncated, likely calculated_tax_before_reliefs
  calculated_tax_after_reliefs: number | null  // truncated, likely calculated_tax_after_reliefs
  deducts: Record<string, any> | null
  reliefs: Record<string, any> | null
  answers: Record<string, any> | null
  potential_savings: number | null
  missed_reliefs: Record<string, any> | null
  status: string
  created_at: string
  updated_at: string
}

export interface FilingRelief {
  id: string
  filing_id: string
  relief_id: string
  amount: number
  name: string
  description: string
  ruling_citation: string
  ruling_url: string | null
}
