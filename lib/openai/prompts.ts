interface AskPromptParams {
  question: string
  context: string
  history?: { role: string; content: string }[]
}

interface ExtractEAPromptParams {
  text: string
}

export function buildAskPrompt({ question, context, history = [] }: AskPromptParams) {
  return [
    {
      role: 'system' as const,
      content: `You are SmarTax, a Malaysian tax assistant specialising in personal income tax under the Income Tax Act 1967.
Answer questions using only the provided LHDN ruling context. Always be concise, accurate, and cite your sources.
If the context does not contain enough information to answer, say so clearly — never speculate.

Context from LHDN Public Rulings:
${context}`,
    },
    ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: question },
  ]
}

export function buildExtractEAPrompt({ text }: ExtractEAPromptParams) {
  return [
    {
      role: 'system' as const,
      content: `Extract structured data from a Malaysian EA Form (Borang EA). Return JSON only, no markdown.
Always return this shape:
{
  "grossIncome": number,
  "epfEmployee": number,
  "pcb": number,
  "yearOfAssessment": number,
  "socsoEmployee": number | null,
  "eisEmployee": number | null,
  "grossCommission": number | null,
  "grossBonus": number | null,
  "employeeName": string | null,
  "employeeIdentificationNo": string | null,
  "employeeTaxFileNo": string | null,
  "employerName": string | null,
  "employerNo": string | null,
  "employmentPeriod": string | null,
  "keyValueFields": Record<string, string | number | null>
}`,
    },
    { role: 'user' as const, content: text },
  ]
}