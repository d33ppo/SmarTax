import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractBasicEADataFromText, extractOCRTextFromEAUpload } from '@/lib/ocr/ea'

type FilingInsertPayload = Record<string, unknown>

function getMissingColumnFromSupabaseError(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null
  const message = 'message' in error ? String(error.message || '') : ''
  const match = message.match(/Could not find the '([^']+)' column/i)
  return match?.[1] ?? null
}

async function insertFilingWithSchemaFallback(
  supabase: ReturnType<typeof createClient>,
  payload: FilingInsertPayload
) {
  const maxAttempts = 6
  const workingPayload: FilingInsertPayload = { ...payload }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const { data, error } = await supabase
      .from('filings')
      .insert(workingPayload as never)
      .select('id')
      .single()

    if (!error) {
      return { data, error: null }
    }

    const missingColumn = getMissingColumnFromSupabaseError(error)
    if (!missingColumn || !(missingColumn in workingPayload)) {
      return { data: null, error }
    }

    delete workingPayload[missingColumn]
    console.warn(`extract-ea: removed missing filings column '${missingColumn}' and retrying insert`)
  }

  return { data: null, error: new Error('Failed to insert filing after schema fallback retries') }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ocrResult = await extractOCRTextFromEAUpload(buffer, {
      mimeType: file.type,
      fileName: file.name,
    })
    const eaData = extractBasicEADataFromText(ocrResult.text, file.name)

    console.log(`\n========== EA OCR RESULT START (${file.name}) ==========`)
    console.log(ocrResult.text || '[EMPTY OCR OUTPUT]')
    console.log('========== EA OCR RESULT END ==========')

    const rawData = JSON.parse(
      JSON.stringify({
        ...eaData,
        extractionMethod: ocrResult.method,
        ocrText: ocrResult.text,
      })
    )

    const filingInsert: FilingInsertPayload = {
      user_id: null,
      gross_income: eaData.grossIncome,
      chargeable_income: null,
      total_reliefs: null,
    }

    const supabase = createClient()
    const { data: filing, error } = await insertFilingWithSchemaFallback(supabase, filingInsert)

    if (error) throw error
    const filingId = (filing as { id: string } | null)?.id

    if (!filingId) {
      throw new Error('Failed to create filing record')
    }

    return NextResponse.json({
      filingId,
      employeeName: null,
      data: eaData,
      ocrText: ocrResult.text,
    })
  } catch (err) {
    console.error('extract-ea error:', err)
    return NextResponse.json({ error: 'Failed to process EA Form' }, { status: 500 })
  }
}
