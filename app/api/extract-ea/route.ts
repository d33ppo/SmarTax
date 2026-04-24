import { NextRequest, NextResponse } from 'next/server'
import { parseEAForm } from '@/lib/pdf/parser'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const eaData = await parseEAForm(buffer, {
      mimeType: file.type,
      fileName: file.name,
    })
    const rawData = JSON.parse(JSON.stringify(eaData)) as Database['public']['Tables']['filings']['Row']['raw_data']

    const filingInsert: Database['public']['Tables']['filings']['Insert'] = {
      user_id: null,
      gross_income: eaData.grossIncome,
      epf_employee: eaData.epfEmployee,
      pcb: eaData.pcb,
      year_of_assessment: eaData.yearOfAssessment,
      answers: null,
      tax_without_reliefs: null,
      tax_with_reliefs: null,
      chargeable_income: null,
      total_reliefs: null,
      raw_data: rawData,
    }

    const supabase = createClient()
    const { data: filing, error } = await supabase
      .from('filings')
      .insert(filingInsert as never)
      .select('id')
      .single()

    if (error) throw error
    const filingId = (filing as { id: string } | null)?.id

    if (!filingId) {
      throw new Error('Failed to create filing record')
    }

    return NextResponse.json({
      filingId,
      employeeName: eaData.employeeName ?? null,
      data: eaData,
    })
  } catch (err) {
    console.error('extract-ea error:', err)
    return NextResponse.json({ error: 'Failed to process EA Form' }, { status: 500 })
  }
}
