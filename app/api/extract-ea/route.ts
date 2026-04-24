import { NextRequest, NextResponse } from 'next/server'
import { parseUploadedForm, type FilingMode } from '@/lib/pdf/parser'
import { createAdminClient } from '@/lib/supabase/admin'

function normalizeMode(input: FormDataEntryValue | null): FilingMode {
  const value = typeof input === 'string' ? input.trim().toLowerCase() : ''
  if (value === 'sme' || value === 'freelancer') return value
  return 'individual'
}

function normalizeTaxYear(input: FormDataEntryValue | null): number | undefined {
  if (typeof input !== 'string') return undefined
  const value = Number.parseInt(input.trim(), 10)
  const maxYear = new Date().getFullYear() + 1
  if (!Number.isFinite(value) || value < 2018 || value > maxYear) return undefined
  return value
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const mode = normalizeMode(formData.get('mode'))
    const manualTaxYear = normalizeTaxYear(formData.get('taxYear'))

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const extractedData = await parseUploadedForm(buffer, mode, { manualTaxYear })

    const supabase = createAdminClient()
    const { data: filing, error } = await (supabase.from('filings') as any)
      .insert({
        mode,
        tax_year: extractedData.yearOfAssessment,
        gross_income: extractedData.grossIncome,
        pcb_paid: extractedData.pcb,
        raw_ea_data: extractedData,
        status: 'draft',
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({ filingId: filing.id, data: extractedData })
  } catch (err) {
    console.error('extract-ea error:', err)
    const message = err instanceof Error ? err.message : 'Failed to process uploaded form'
    const status = /could not confidently|does not look like|no extractable text/i.test(message) ? 422 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
