import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateTax } from '@/lib/tax/engine'
import { getEligibleReliefs, RELIEFS_MASTER } from '@/lib/tax/reliefs'
import type { Database } from '@/lib/supabase/types'

type FilingRow = {
  id: string
  gross_income: number
  total_deductions: number
  epf_employee?: number
  socso?: number
}

type FilingUpdate = Database['public']['Tables']['filings']['Update']
type ReliefDefRow = { id: string; code: string }
type FilingReliefInsert = Database['public']['Tables']['filing_reliefs']['Insert']

export async function POST(req: NextRequest) {
  const start = Date.now()
  try {
    const { filingId, answers } = await req.json()
    console.log(`[POST /api/find-reliefs] Incoming request`, { filingId })

    const supabase = createClient()

    // Fetch filing
    const { data, error: filingError } = await supabase
      .from('filings')
      .select('*')
      .eq('id', filingId)
      .maybeSingle()

    const filing = (data ?? null) as FilingRow | null

    if (filingError) {
      console.error(`[POST /api/find-reliefs] Database error fetching filing`, filingError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    if (!filing) {
      console.warn(`[POST /api/find-reliefs] Filing not found`, { filingId })
      return NextResponse.json({ error: 'Filing not found' }, { status: 404 })
    }
    console.log(`[POST /api/find-reliefs] Filing loaded`, filing)

    // Reliefs
    const filingForReliefs = {
      gross_income: Number(filing.gross_income || 0),
      epf_employee: Number(filing.epf_employee || 0),
      socso: Number(filing.socso || 0),
    }

    const eligibleReliefs = getEligibleReliefs(answers, filingForReliefs)
    const totalReliefs = eligibleReliefs.reduce((sum, r) => sum + r.amount, 0)
    console.log(`[POST /api/find-reliefs] Eligible reliefs`, eligibleReliefs)
    console.log(`[POST /api/find-reliefs] Total reliefs`, totalReliefs)

    // Tax calculations
    const taxWithout = calculateTax(filing.gross_income) - filing.total_deductions
    const taxWith = calculateTax(filing.gross_income - totalReliefs) - filing.total_deductions
    const potentialSavings = taxWithout - taxWith
    console.log(`[POST /api/find-reliefs] Tax calculations`, { taxWithout, taxWith, potentialSavings })

    // Missed reliefs
    const missedReliefs = RELIEFS_MASTER
      .filter(relief => !eligibleReliefs.some(r => r.code === relief.code))
      .map(relief => ({
        code: relief.code,
        description: relief.eligibilityRules.description_en,
        maxAmount: relief.maxAmount,
      }))
    console.log(`[POST /api/find-reliefs] Missed reliefs`, missedReliefs)

    // Update filing
    const filingUpdatePayload: FilingUpdate = {
      answers: answers as unknown as Database['public']['Tables']['filings']['Update']['answers'],
      total_reliefs: totalReliefs,
      taxable_income_after_reliefs: filing.gross_income - totalReliefs,
      calculated_tax_after_reliefs: taxWith,
      potential_savings: potentialSavings,
      missed_reliefs: missedReliefs as unknown as Database['public']['Tables']['filings']['Update']['missed_reliefs'],
      reliefs: eligibleReliefs as unknown as Database['public']['Tables']['filings']['Update']['reliefs'],
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
      console.error(`[POST /api/find-reliefs] Update error`, updateError)
      throw updateError
    }
    console.log(`[POST /api/find-reliefs] Filing updated successfully`)

    const eligibleCodes = eligibleReliefs.map(r => r.code)
    console.log('[POST /api/find-reliefs] Eligible codes:', eligibleCodes)

    // Query relief IDs
    const { data: reliefDefsData, error: reliefError } = await supabase
      .from('reliefs_master')
      .select('id, code')
      .in('code', eligibleCodes)

    const reliefDefs = (reliefDefsData ?? []) as ReliefDefRow[]

    if (reliefError) {
      console.error(`[POST /api/find-reliefs] Error fetching relief IDs`, reliefError)
      throw reliefError
    }
    console.log(`[POST /api/find-reliefs] Relief IDs fetched`, reliefDefs)

    const reliefIdMap: Record<string, string> = {}
    for (const r of reliefDefs) {
      reliefIdMap[r.code] = r.id
    }

    // Insert reliefs
    const reliefRows: FilingReliefInsert[] = eligibleReliefs.map((r) => ({
      filing_id: filingId,
      relief_id: reliefIdMap[r.code] ?? null,
      amount_claimed: r.amount,
      amount_max_allowed: r.maxAmount,
      confidence: r.confidence,
    }))
    const filingReliefsTable = supabase.from('filing_reliefs') as unknown as {
      insert: (values: FilingReliefInsert[]) => Promise<{ error: unknown }>
    }

    const { error: insertError } = await filingReliefsTable
      .insert(reliefRows)
    if (insertError) {
      console.error(`[POST /api/find-reliefs] Relief insert error`, insertError)
      throw insertError
    }
    console.log(`[POST /api/find-reliefs] Reliefs inserted`, reliefRows)

    const duration = Date.now() - start
    console.log(`[POST /api/find-reliefs] Completed successfully in ${duration}ms`)
    return NextResponse.json({ filingId, savings: potentialSavings })
  } catch (err) {
    const duration = Date.now() - start
    console.error(`[POST /api/find-reliefs] 500 ERROR in ${duration}ms`, err)
    return NextResponse.json({ error: 'Failed to find reliefs' }, { status: 500 })
  }
}
