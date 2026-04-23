import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateTax } from '@/lib/tax/engine'
import { getEligibleReliefs } from '@/lib/tax/reliefs'

export async function POST(req: NextRequest) {
  try {
    const { filingId, answers } = await req.json()

    const supabase = createClient()

    const { data: filing, error: filingError } = await (supabase.from('filings') as any)
      .select('*')
      .eq('id', filingId)
      .single()

    if (filingError || !filing) {
      return NextResponse.json({ error: 'Filing not found' }, { status: 404 })
    }

    const eligibleReliefs = getEligibleReliefs(answers, filing)
    const totalReliefs = eligibleReliefs.reduce((sum: number, r: { amount: number }) => sum + r.amount, 0)

    const taxWithout = calculateTax(filing.gross_income - filing.epf_employee)
    const taxWith = calculateTax(filing.gross_income - filing.epf_employee - totalReliefs)

    const { error: updateError } = await (supabase.from('filings') as any)
      .update({
        answers,
        tax_without_reliefs: taxWithout,
        tax_with_reliefs: taxWith,
      })
      .eq('id', filingId)

    if (updateError) throw updateError

    for (const relief of eligibleReliefs) {
      await (supabase.from('filing_reliefs') as any).insert({
        filing_id: filingId,
        relief_id: relief.id,
        amount: relief.amount,
      })
    }

    return NextResponse.json({ filingId, savings: taxWithout - taxWith })
  } catch (err) {
    console.error('find-reliefs error:', err)
    return NextResponse.json({ error: 'Failed to find reliefs' }, { status: 500 })
  }
}
