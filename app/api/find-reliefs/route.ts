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

    // EPF is stored in raw_ea_data, not as a direct column
    const epfEmployee: number = (filing.raw_ea_data as any)?.epfEmployee ?? 0

    const eligibleReliefs = getEligibleReliefs(answers, { gross_income: filing.gross_income, epf_employee: epfEmployee })
    const totalReliefs = eligibleReliefs.reduce((sum: number, r: { amount: number }) => sum + r.amount, 0)

    const taxWithout = calculateTax(filing.gross_income - epfEmployee)
    const taxWith = calculateTax(filing.gross_income - epfEmployee - totalReliefs)
    const chargeableIncome = Math.max(0, filing.gross_income - epfEmployee - totalReliefs)

    const { error: updateError } = await (supabase.from('filings') as any)
      .update({
        user_profile: { answers, reliefs: eligibleReliefs },
        total_reliefs: totalReliefs,
        chargeable_income: chargeableIncome,
        tax_before_rebate: taxWithout,
        final_tax_owed: taxWith,
        tax_saved_vs_default: taxWithout - taxWith,
        status: 'completed',
      })
      .eq('id', filingId)

    if (updateError) throw updateError

    return NextResponse.json({ filingId, savings: taxWithout - taxWith })
  } catch (err) {
    console.error('find-reliefs error:', err)
    return NextResponse.json({ error: 'Failed to find reliefs' }, { status: 500 })
  }
}
