import { NextRequest } from 'next/server'
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

    const prompt = buildAskPrompt({ question, context, history })
    const glmRes = await glmClient.chatStream(prompt)

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ citations })}\n\n`))

        const reader = glmRes.body!.getReader()
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            controller.enqueue(value)
          }
        } catch (err) {
          console.error('stream error:', err)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('ask error:', err)
    return new Response(JSON.stringify({ error: 'Failed to get answer' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
