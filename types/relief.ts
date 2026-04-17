export interface Relief {
  id: string
  code: string
  name: string
  maxAmount: number
  category: ReliefCategory
  ruling_citation: string
  ruling_url: string | null
  description: string
}

export type ReliefCategory =
  | 'personal'
  | 'family'
  | 'education'
  | 'medical'
  | 'insurance'
  | 'retirement'
  | 'lifestyle'
  | 'disability'
  | 'business'
