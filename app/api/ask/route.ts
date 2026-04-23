import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { glmClient } from '@/lib/glm/client'
import { buildAskPrompt } from '@/lib/glm/prompts'
import { retrieve } from '@/lib/rag/retriever'
import { createClient } from '@/lib/supabase/server'

function makeRequestId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timeoutHandle = setTimeout(() => resolve(fallback), timeoutMs)
      }),
    ])
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle)
  }
}

export const runtime = 'nodejs'
export const maxDuration = 60
export async function POST(req: NextRequest) {
  const requestId = makeRequestId()
  const startedAt = Date.now()
  try {
    const { question, history, filingId } = await req.json()

    const retrieveStartedAt = Date.now()
    const chunks = await withTimeout(retrieve(question, 5), 2500, [])
    const retrieveMs = Date.now() - retrieveStartedAt

    const context = chunks.map((c: { content: string }) => c.content).join('\n\n')
    const citations = chunks.map((c: { citation: string }) => c.citation).filter(Boolean)

    const prompt = buildAskPrompt({ question, context, history })
    const glmStartedAt = Date.now()
    const glmRes = await glmClient.chatStream(prompt)
    const glmConnectMs = Date.now() - glmStartedAt

    console.info(`[ask][${requestId}] retrieveMs=${retrieveMs} glmConnectMs=${glmConnectMs} chunks=${chunks.length}`)

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ citations })}\n\n`))

        const reader = glmRes.body!.getReader()
        const decoder = new TextDecoder()
        let fullResponse = ''
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            controller.enqueue(value)

            // Collect assembled response for chat_history
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const payload = line.slice(6).trim()
              if (payload === '[DONE]') continue
              try {
                const parsed = JSON.parse(payload)
                if (parsed.choices?.[0]?.delta?.content) {
                  fullResponse += parsed.choices[0].delta.content
                }
              } catch { /* skip malformed chunks */ }
            }
          }
        } catch (err) {
          console.error(`[ask][${requestId}] stream error:`, err)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`))
        } finally {
          controller.close()

          // Save to chat_history after stream completes — fire and forget
          try {
            const supabase = createClient()
            await (supabase.from('chat_history') as any).insert({
              ...(filingId ? { filing_id: filingId } : {}),
              user_message: question,
              assistant_response: fullResponse,
              retrieved_rulings: chunks,
            })
          } catch (err) {
            console.error(`[ask][${requestId}] chat_history save error:`, err)
          }

          const totalMs = Date.now() - startedAt
          console.info(`[ask][${requestId}] completed totalMs=${totalMs}`)
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
    console.error(`[ask][${requestId}] ask error:`, err)
    return new Response(JSON.stringify({ error: 'Failed to get answer', requestId }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
