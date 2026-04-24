import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { glmClient } from '@/lib/glm/client'
import { buildAskPrompt } from '@/lib/glm/prompts'
import { retrieve } from '@/lib/rag/retriever'

export async function POST(req: NextRequest) {
  try {
    const { question, history } = await req.json()

    const chunks = await retrieve(question, 5)
    const context = chunks.map((c: { content: string }) => c.content).join('\n\n')
    const citations = chunks.map((c: { citation: string }) => c.citation).filter(Boolean)

    console.log("Chunks:", JSON.stringify(chunks, null, 2))
    console.log("Context:", context)
    console.log("Citations:", citations)

    const prompt = buildAskPrompt({ question, context, history })

    console.log("Prompt:", JSON.stringify(prompt, null, 2))

    const answer = await glmClient.chat(prompt)

    return NextResponse.json({ answer, citations })
  } catch (err) {
    console.error('ask error:', err)
    return NextResponse.json({ error: 'Failed to get answer' }, { status: 500 })
  }
}
