interface ChatMessage {
    role: 'system' | 'user' | 'assistant'
    content: string
}

interface OpenAIResponse {
    choices: { message: { content: string } }[]
}

class OpenAIClient {
    private apiKey: string
    private baseUrl: string
    private model: string

    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY!
        this.baseUrl = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1'
        this.model = process.env.OPENAI_MODEL ?? 'gpt-4'
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
            throw new Error(`OpenAI API error ${res.status}: ${err}`)
        }

        const data: OpenAIResponse = await res.json()
        return data.choices[0].message.content
    }
}

export const openaiClient = new OpenAIClient()