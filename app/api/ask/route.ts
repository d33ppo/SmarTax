import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { glmClient } from '@/lib/glm/client'
import { buildAskPrompt } from '@/lib/glm/prompts'
import { retrieve } from '@/lib/rag/retriever'
import { createClient } from '@/lib/supabase/server'

function buildFilingContextSummary(filing: any): string {
  const reliefs = Array.isArray(filing?.reliefs) ? filing.reliefs : []
  const missed = Array.isArray(filing?.missed_reliefs) ? filing.missed_reliefs : []

  const topReliefs = reliefs
    .slice()
    .sort((a: any, b: any) => (Number(b?.amount || 0) - Number(a?.amount || 0)))
    .slice(0, 5)
    .map((r: any) => `${r?.name_en || r?.code || 'Unknown'}: RM ${Number(r?.amount || 0).toLocaleString()}`)

  return [
    'Current Filing Context:',
    `- Filing ID: ${filing?.id || '-'}`,
    `- Mode: ${filing?.mode || '-'}`,
    `- Gross Income: RM ${Number(filing?.gross_income || 0).toLocaleString()}`,
    `- Total Deductions: RM ${Number(filing?.total_deductions || 0).toLocaleString()}`,
    `- Total Reliefs: RM ${Number(filing?.total_reliefs || 0).toLocaleString()}`,
    `- Chargeable Income: RM ${Number(filing?.taxable_income_after_reliefs || 0).toLocaleString()}`,
    `- Tax Before: RM ${Number(filing?.calculated_tax_before_reliefs || 0).toLocaleString()}`,
    `- Tax After: RM ${Number(filing?.calculated_tax_after_reliefs || 0).toLocaleString()}`,
    `- Potential Savings: RM ${Number(filing?.potential_savings || 0).toLocaleString()}`,
    `- Top Claimed Deductions: ${topReliefs.length > 0 ? topReliefs.join('; ') : 'None'}`,
    `- Missed Opportunities Count: ${missed.length}`,
  ].join('\n')
}

export async function POST(req: NextRequest) {
  try {
    const { question, history, filingId } = await req.json()

    let filingContext = ''
    if (filingId) {
      const supabase = createClient()
      const { data: filing } = await (supabase.from('filings') as any)
        .select('id, mode, gross_income, total_deductions, total_reliefs, taxable_income_after_reliefs, calculated_tax_before_reliefs, calculated_tax_after_reliefs, potential_savings, reliefs, missed_reliefs')
        .eq('id', filingId)
        .maybeSingle()

      if (filing) {
        filingContext = buildFilingContextSummary(filing)
      }
    }

    const chunks = await retrieve(question, 5)
    const rulingsContext = chunks.map((c: { content: string }) => c.content).join('\n\n')
    const context = [filingContext, rulingsContext].filter(Boolean).join('\n\n')
    const citations = chunks.map((c: { citation: string }) => c.citation).filter(Boolean)

    console.log("Chunks:", JSON.stringify(chunks, null, 2))
    console.log("Context:", context)
    console.log("Citations:", citations)

    const prompt = buildAskPrompt({ question, context, history })

    console.log("Prompt:", JSON.stringify(prompt, null, 2))

    const answer = await glmClient.chat(prompt)

    return NextResponse.json({ answer, citations, filingId: filingId || null })
  } catch (err) {
    console.error('ask error:', err)
    return NextResponse.json({ error: 'Failed to get answer' }, { status: 500 })
  }
}
