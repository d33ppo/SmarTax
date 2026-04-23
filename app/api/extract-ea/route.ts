import { NextRequest, NextResponse } from 'next/server'
import { parseEAForm } from '@/lib/pdf/parser'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const eaData = await parseEAForm(buffer)

    const supabase = createClient()
    const { data: filing, error } = await (supabase.from('filings') as any)
      .insert({
        gross_income: eaData.grossIncome,
        epf_employee: eaData.epfEmployee,
        pcb: eaData.pcb,
        year_of_assessment: eaData.yearOfAssessment,
        raw_data: eaData,
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({ filingId: filing.id, data: eaData })
  } catch (err) {
    console.error('extract-ea error:', err)
    return NextResponse.json({ error: 'Failed to process EA Form' }, { status: 500 })
  }
}
