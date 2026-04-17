import { NextRequest, NextResponse } from 'next/server'
import { calculateTax } from '@/lib/tax/engine'

export async function POST(req: NextRequest) {
  try {
    const { chargeableIncome } = await req.json()

    if (typeof chargeableIncome !== 'number' || chargeableIncome < 0) {
      return NextResponse.json({ error: 'Invalid chargeableIncome' }, { status: 400 })
    }

    const tax = calculateTax(chargeableIncome)
    return NextResponse.json({ chargeableIncome, tax })
  } catch (err) {
    console.error('calculate-tax error:', err)
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 })
  }
}
