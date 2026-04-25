import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateTax } from '@/lib/tax/engine'

export async function POST(req: NextRequest) {
  try {
    const { filingId, epfContribution, lifeInsurance, educationFee } = await req.json()

    const supabase = createClient()
    const { data: filing, error } = await (supabase.from('filings') as any)
      .select('gross_income, ea_chargeable_income, calculated_tax_after_reliefs')
      .eq('id', filingId)
      .single()

    if (error || !filing) {
      return NextResponse.json({ error: 'Filing not found' }, { status: 404 })
    }

    const currentTax = filing.calculated_tax_after_reliefs ?? calculateTax((filing.gross_income ?? 0) - (filing.ea_chargeable_income ?? 0))

    const additionalDeductions = Math.min(epfContribution, 4000)
      + Math.min(lifeInsurance, 3000)
      + Math.min(educationFee, 7000)

    const newChargeableIncome = Math.max(0, (filing.gross_income ?? 0) - (filing.ea_chargeable_income ?? 0) - additionalDeductions)
    const projectedTax = calculateTax(newChargeableIncome)

    return NextResponse.json({
      currentTax,
      projectedTax,
      savings: Math.max(0, currentTax - projectedTax),
    })
  } catch (err) {
    console.error('scenario error:', err)
    return NextResponse.json({ error: 'Scenario calculation failed' }, { status: 500 })
  }
}
