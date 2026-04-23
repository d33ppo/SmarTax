'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
  citations?: string[]
}

function ChatContent() {
  const searchParams = useSearchParams()
  const filingId = searchParams.get('filingId')

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m SmarTax. Ask me anything about Malaysian personal tax — I\'ll always cite the relevant LHDN ruling.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage, history: messages, filingId }),
      })

      if (!res.ok || !res.body) {
        let errorMessage = 'Sorry, something went wrong. Please try again.'
        try {
          const payload = await res.json()
          if (payload?.error === 'AI provider timeout') {
            errorMessage = payload?.requestId
              ? `SmarTax AI took too long to respond. Please retry. (ref: ${payload.requestId})`
              : 'SmarTax AI took too long to respond. Please retry.'
          } else if (payload?.requestId) {
            errorMessage = `Request failed. Please retry. (ref: ${payload.requestId})`
          }
        } catch {
          // keep default fallback message
        }

        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: errorMessage }
          return updated
        })
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') continue

          try {
            const parsed = JSON.parse(payload)

            if (Array.isArray(parsed.citations)) {
              setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = { ...updated[updated.length - 1], citations: parsed.citations }
                return updated
              })
            } else if (parsed.choices?.[0]?.delta?.content) {
              const token: string = parsed.choices[0].delta.content
              setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: updated[updated.length - 1].content + token,
                }
                return updated
              })
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch (err) {
      console.error('chat error:', err)
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="border-b bg-white px-6 py-4">
        <h1 className="font-semibold text-gray-900">Ask SmarTax</h1>
        <p className="text-xs text-gray-400">Answers grounded in LHDN Public Rulings</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 max-w-3xl mx-auto w-full">
        {messages.map((msg, i) => {
          const isStreamingPlaceholder = msg.role === 'assistant' && msg.content === '' && i === messages.length - 1 && loading

          if (isStreamingPlaceholder) {
            return (
              <div key={i} className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((j) => (
                      <div
                        key={j}
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${j * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-lg rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {msg.citations.map((c, j) => (
                      <span key={j} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      <div className="border-t bg-white px-6 py-4 max-w-3xl mx-auto w-full">
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Can I claim my gym membership as a relief?"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatContent />
    </Suspense>
  )
}
