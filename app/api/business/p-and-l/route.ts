import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type BusinessPLPayload = {
  basicInfo?: {
    nama?: string
    namaPerniagaan?: string
    tahunTaksiran?: string
    tempohMula?: string
    tempohTamat?: string
  }
  lhdnInfo?: {
    noCukai?: string
    noReg?: string
    kodBiz?: string
  }
  income?: {
    jualanKasar?: number
    pulanganJualan?: number
    jualanBersih?: number
    komisen?: number
    diskaun?: number
  }
  cogs?: {
    stokAwal?: number
    belian?: number
    pulanganBelian?: number
    kosPenghantaran?: number
    stokAkhir?: number
    kosBarangJualan?: number
    untungKasar?: number
  }
  expenses?: Array<{
    id?: string
    category?: string
    amount?: number
  }>
  totals?: {
    jumlahPerbelanjaan?: number
    untungBersih?: number
  }
}

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BusinessPLPayload

    const income = body?.income ?? {}
    const cogs = body?.cogs ?? {}
    const totals = body?.totals ?? {}
    const expenses = Array.isArray(body?.expenses) ? body.expenses : []

    const jualanBersih = toNumber(income.jualanBersih)
    const komisen = toNumber(income.komisen)
    const diskaun = toNumber(income.diskaun)
    const jumlahPendapatan = jualanBersih + komisen + diskaun

    const kosBarangJualan = toNumber(cogs.kosBarangJualan)
    const jumlahPerbelanjaan = toNumber(totals.jumlahPerbelanjaan)
    const untungBersih = toNumber(totals.untungBersih)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const filingPayload = {
      user_id: null,
      status: 'draft',
      mode: 'sme',
      gross_income: jumlahPendapatan,
      total_deductions: Math.max(0, kosBarangJualan + jumlahPerbelanjaan),
      taxable_income_after_reliefs: Math.max(0, untungBersih),
      answers: {
        formType: 'business_p_and_l',
        mode: 'sme',
        basicInfo: body.basicInfo ?? {},
        lhdnInfo: body.lhdnInfo ?? {},
        income,
        cogs,
        totals,
      },
      deducts: {
        expenses,
      },
    }

    const { data, error } = await (supabase.from('filings') as any)
      .insert(filingPayload)
      .select('id')
      .single()

    if (error) {
      const errorMessage = String(error?.message || '')
      if (errorMessage.includes("Could not find the 'mode' column")) {
        return NextResponse.json(
          {
            error: "Column 'mode' not found in filings. Please add it in Supabase, then retry.",
          },
          { status: 400 }
        )
      }

      throw error
    }

    return NextResponse.json({ filingId: data.id })
  } catch (err) {
    console.error('business p-and-l save error:', err)
    return NextResponse.json({ error: 'Failed to save P&L data' }, { status: 500 })
  }
}
