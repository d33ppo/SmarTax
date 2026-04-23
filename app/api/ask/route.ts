import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { glmClient } from '@/lib/glm/client'
import { buildAskPrompt } from '@/lib/glm/prompts'
import { retrieve } from '@/lib/rag/retriever'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { question, history, filingId } = await req.json()

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
          console.error('stream error:', err)
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
            console.error('chat_history save error:', err)
          }
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
