import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateTax } from '@/lib/tax/engine'
import { getEligibleReliefs, RELIEFS_MASTER } from '@/lib/tax/reliefs'

export async function POST(req: NextRequest) {
  const start = Date.now()
  try {
    const { filingId, answers } = await req.json()
    console.log(`[POST /api/find-reliefs] Incoming request`, { filingId })

    const supabase = createClient()

    // Fetch filing
    const { data: filing, error: filingError } = await (supabase
      .from('filings') as any)
      .select('*')
      .eq('id', filingId)
      .maybeSingle()

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
    const eligibleReliefs = getEligibleReliefs(answers, filing)
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
    const { error: updateError } = await (supabase
      .from('filings') as any)
      .update({
        answers,
        total_reliefs: totalReliefs,
        taxable_income_after_reliefs: filing.gross_income - totalReliefs,
        calculated_tax_after_reliefs: taxWith,
        potential_savings: potentialSavings,
        missed_reliefs: missedReliefs,
        reliefs: eligibleReliefs,
      })
      .eq('id', filingId)

    if (updateError) {
      console.error(`[POST /api/find-reliefs] Update error`, updateError)
      throw updateError
    }
    console.log(`[POST /api/find-reliefs] Filing updated successfully`)

    const eligibleCodes = eligibleReliefs.map(r => r.code)
    console.log('[POST /api/find-reliefs] Eligible codes:', eligibleCodes)

    // Query relief IDs
    const { data: reliefDefs, error: reliefError } = await (supabase
      .from('reliefs_master') as any)
      .select('id, code')
      .in('code', eligibleCodes)

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
    const reliefRows = eligibleReliefs.map(r => ({
      filing_id: filingId,
      relief_id: reliefIdMap[r.code],
      amount_claimed: r.amount,
      amount_max_allowed: r.maxAmount,
      confidence: r.confidence,
    }))
    const { error: insertError } = await (supabase
      .from('filing_reliefs') as any)
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
