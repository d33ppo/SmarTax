export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      filings: {
        Row: {
          id: string
          user_id: string | null
          gross_income: number
          epf_employee: number
          pcb: number
          year_of_assessment: number
          answers: Json | null
          tax_without_reliefs: number | null
          tax_with_reliefs: number | null
          chargeable_income: number | null
          total_reliefs: number | null
          raw_data: Json | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['filings']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['filings']['Insert']>
      }
      reliefs_master: {
        Row: {
          id: string
          code: string
          name: string
          name_ms: string
          description: string
          max_amount: number
          category: string
          ruling_citation: string
          ruling_url: string | null
          active: boolean
        }
        Insert: Omit<Database['public']['Tables']['reliefs_master']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['reliefs_master']['Insert']>
      }
      filing_reliefs: {
        Row: {
          id: string
          filing_id: string
          relief_id: string
          amount: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['filing_reliefs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['filing_reliefs']['Insert']>
      }
      ruling_chunks: {
        Row: {
          id: string
          source: string
          citation: string
          content: string
          embedding: number[] | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['ruling_chunks']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['ruling_chunks']['Insert']>
      }
    }
  }
}
