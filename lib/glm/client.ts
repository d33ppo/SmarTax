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

  constructor() {
    this.apiKey = process.env.GLM_API_KEY!
    this.baseUrl = process.env.GLM_BASE_URL ?? 'https://open.bigmodel.cn/api/paas/v4'
    this.model = 'glm-4-flash'
  }

  async chat(messages: ChatMessage[], temperature = 0.3): Promise<string> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: this.model, messages, temperature }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`GLM API error ${res.status}: ${err}`)
    }

    const data: GLMResponse = await res.json()
    return data.choices[0].message.content
  }

  async embed(input: string | string[]): Promise<number[][]> {
    const res = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: 'embedding-3', input }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`GLM Embed API error ${res.status}: ${err}`)
    }

    const data = await res.json()
    return data.data.map((d: any) => d.embedding)
  }
}

export const glmClient = new GLMClient()
