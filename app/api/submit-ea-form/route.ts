import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Create a new filing
        const { data, error } = await supabase
            .from('filings')
            .insert({
                gross_income: body.grossIncome,
                total_reliefs: body.totalRelief,
                total_deductions: body.totalDeductions,
                ea_chargeable_income: body.eaChargeableIncome,
                calculated_tax_before_reliefs: body.calculatedTaxBeforeDeductions,
                calculated_tax_after_reliefs: body.calculatedTaxAfterDeductions,
                reliefs: body.reliefs,
                deducts: body.deducts,
                status: 'draft',
            })
            .select('id')
            .single()

        if (error) throw error

        return NextResponse.json({ filingId: data.id })
    } catch (err) {
        console.error('submit-ea-form error:', err)
        return NextResponse.json({ error: 'Failed to submit EA form' }, { status: 500 })
    }
}