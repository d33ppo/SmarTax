export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      action_plans: {
        Row: {
          action_description: string | null
          action_title: string
          citation: string | null
          created_at: string | null
          deadline: string | null
          estimated_tax_saving: number | null
          filing_id: string | null
          id: string
          liquidity_required: number | null
          priority_score: number | null
          status: string | null
        }
        Insert: {
          action_description?: string | null
          action_title: string
          citation?: string | null
          created_at?: string | null
          deadline?: string | null
          estimated_tax_saving?: number | null
          filing_id?: string | null
          id?: string
          liquidity_required?: number | null
          priority_score?: number | null
          status?: string | null
        }
        Update: {
          action_description?: string | null
          action_title?: string
          citation?: string | null
          created_at?: string | null
          deadline?: string | null
          estimated_tax_saving?: number | null
          filing_id?: string | null
          id?: string
          liquidity_required?: number | null
          priority_score?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_plans_filing_id_fkey"
            columns: ["filing_id"]
            isOneToOne: false
            referencedRelation: "filings"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_history: {
        Row: {
          assistant_response: string | null
          created_at: string | null
          filing_id: string | null
          id: string
          retrieved_rulings: Json | null
          user_id: string | null
          user_message: string
        }
        Insert: {
          assistant_response?: string | null
          created_at?: string | null
          filing_id?: string | null
          id?: string
          retrieved_rulings?: Json | null
          user_id?: string | null
          user_message: string
        }
        Update: {
          assistant_response?: string | null
          created_at?: string | null
          filing_id?: string | null
          id?: string
          retrieved_rulings?: Json | null
          user_id?: string | null
          user_message?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_history_filing_id_fkey"
            columns: ["filing_id"]
            isOneToOne: false
            referencedRelation: "filings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      filing_reliefs: {
        Row: {
          amount_claimed: number
          amount_max_allowed: number | null
          confidence: string | null
          created_at: string | null
          filing_id: string | null
          glm_reasoning: string | null
          id: string
          relief_id: string | null
          was_claimed_previously: boolean | null
        }
        Insert: {
          amount_claimed: number
          amount_max_allowed?: number | null
          confidence?: string | null
          created_at?: string | null
          filing_id?: string | null
          glm_reasoning?: string | null
          id?: string
          relief_id?: string | null
          was_claimed_previously?: boolean | null
        }
        Update: {
          amount_claimed?: number
          amount_max_allowed?: number | null
          confidence?: string | null
          created_at?: string | null
          filing_id?: string | null
          glm_reasoning?: string | null
          id?: string
          relief_id?: string | null
          was_claimed_previously?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "filing_reliefs_filing_id_fkey"
            columns: ["filing_id"]
            isOneToOne: false
            referencedRelation: "filings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filing_reliefs_relief_id_fkey"
            columns: ["relief_id"]
            isOneToOne: false
            referencedRelation: "reliefs_master"
            referencedColumns: ["id"]
          },
        ]
      }
      filings: {
        Row: {
          answers: Json | null
          calculated_tax_after_reliefs: number | null
          calculated_tax_before_reliefs: number | null
          created_at: string | null
          deducts: Json | null
          ea_chargeable_income: number | null
          gross_income: number | null
          id: string
          missed_reliefs: Json | null
          potential_savings: number | null
          reliefs: Json | null
          status: string | null
          taxable_income_after_reliefs: number | null
          total_deductions: number | null
          total_reliefs: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          answers?: Json | null
          calculated_tax_after_reliefs?: number | null
          calculated_tax_before_reliefs?: number | null
          created_at?: string | null
          deducts?: Json | null
          ea_chargeable_income?: number | null
          gross_income?: number | null
          id?: string
          missed_reliefs?: Json | null
          potential_savings?: number | null
          reliefs?: Json | null
          status?: string | null
          taxable_income_after_reliefs?: number | null
          total_deductions?: number | null
          total_reliefs?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          answers?: Json | null
          calculated_tax_after_reliefs?: number | null
          calculated_tax_before_reliefs?: number | null
          created_at?: string | null
          deducts?: Json | null
          ea_chargeable_income?: number | null
          gross_income?: number | null
          id?: string
          missed_reliefs?: Json | null
          potential_savings?: number | null
          reliefs?: Json | null
          status?: string | null
          taxable_income_after_reliefs?: number | null
          total_deductions?: number | null
          total_reliefs?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "filings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reliefs_master: {
        Row: {
          applies_to: string[]
          category: string
          citation_url: string | null
          code: string
          created_at: string | null
          description_en: string
          description_ms: string
          id: string
          ita_section: string | null
          lhdn_ref: string
          max_amount: number
          name_en: string
          name_ms: string
          per_unit: boolean
          public_ruling: string | null
          requires: string[] | null
          sub_limits: Json | null
          valid_from: number
          valid_until: number | null
        }
        Insert: {
          applies_to?: string[]
          category: string
          citation_url?: string | null
          code: string
          created_at?: string | null
          description_en: string
          description_ms: string
          id?: string
          ita_section?: string | null
          lhdn_ref: string
          max_amount: number
          name_en: string
          name_ms: string
          per_unit?: boolean
          public_ruling?: string | null
          requires?: string[] | null
          sub_limits?: Json | null
          valid_from?: number
          valid_until?: number | null
        }
        Update: {
          applies_to?: string[]
          category?: string
          citation_url?: string | null
          code?: string
          created_at?: string | null
          description_en?: string
          description_ms?: string
          id?: string
          ita_section?: string | null
          lhdn_ref?: string
          max_amount?: number
          name_en?: string
          name_ms?: string
          per_unit?: boolean
          public_ruling?: string | null
          requires?: string[] | null
          sub_limits?: Json | null
          valid_from?: number
          valid_until?: number | null
        }
        Relationships: []
      }
      rulings_vectors: {
        Row: {
          applies_to: string[] | null
          content: string
          content_tokens: number | null
          created_at: string | null
          effective_year: number | null
          embedding: string | null
          id: string
          paragraph: string | null
          ruling_code: string
          ruling_title: string
          section_title: string | null
          source_url: string | null
        }
        Insert: {
          applies_to?: string[] | null
          content: string
          content_tokens?: number | null
          created_at?: string | null
          effective_year?: number | null
          embedding?: string | null
          id?: string
          paragraph?: string | null
          ruling_code: string
          ruling_title: string
          section_title?: string | null
          source_url?: string | null
        }
        Update: {
          applies_to?: string[] | null
          content?: string
          content_tokens?: number | null
          created_at?: string | null
          effective_year?: number | null
          embedding?: string | null
          id?: string
          paragraph?: string | null
          ruling_code?: string
          ruling_title?: string
          section_title?: string | null
          source_url?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_rulings: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          applies_to: string[]
          content: string
          content_tokens: number
          effective_year: number
          embedding: string
          id: string
          paragraph: string
          ruling_code: string
          ruling_title: string
          section_title: string
          similarity: number
          source_url: string
        }[]
      }
      search_rulings: {
        Args: { match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: string
          paragraph: string
          ruling_code: string
          ruling_title: string
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
