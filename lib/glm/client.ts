interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface GLMResponse {
  choices: { message: { content: string } }[]
}

class GLMClient {
  private apiKey: string
  private baseUrl: string
  private model: string
  private streamTimeoutMs: number

  constructor() {
    this.apiKey = process.env.GLM_API_KEY!
    this.baseUrl = process.env.GLM_BASE_URL ?? 'https://api.ilmu.ai/v1'
    this.model = process.env.GLM_MODEL ?? 'ilmu-glm-5.1'
    this.streamTimeoutMs = Number(process.env.GLM_STREAM_TIMEOUT_MS ?? 50000)
  }

  async chat(messages: ChatMessage[], temperature = 0.3): Promise<string> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: this.model, messages, temperature }),
      signal: AbortSignal.timeout(25000),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`GLM API error ${res.status}: ${err}`)
    }

    const data: GLMResponse = await res.json()
    return data.choices[0].message.content
  }

  async chatStream(messages: ChatMessage[], temperature = 0.3): Promise<Response> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: this.model, messages, temperature, stream: true }),
      signal: AbortSignal.timeout(this.streamTimeoutMs),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`GLM API error ${res.status}: ${err}`)
    }

    return res
  }
}

export const glmClient = new GLMClient()
