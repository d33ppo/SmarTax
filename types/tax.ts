export interface Filing {
  id: string
  user_id: string | null
  gross_income: number
  epf_employee: number
  pcb: number
  year_of_assessment: number
  answers: Record<string, unknown> | null
  tax_without_reliefs: number | null
  tax_with_reliefs: number | null
  chargeable_income: number | null
  total_reliefs: number | null
  raw_data: Record<string, unknown> | null
  created_at: string
  reliefs?: FilingRelief[]
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
