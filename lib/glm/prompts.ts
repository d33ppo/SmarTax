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
      content: `You are TaxPilot, a Malaysian tax assistant specialising in personal income tax under the Income Tax Act 1967.
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
      content: `Extract structured data from a Malaysian EA Form (Borang EA). Return JSON only.
Required fields: grossIncome (number), epfEmployee (number), pcb (number), yearOfAssessment (number).
Optional: socsoEmployee, eisEmployee, grossCommission, grossBonus.`,
    },
    {
      role: 'user' as const,
      content: `Extract the tax data from this EA Form text:\n\n${text}`,
    },
  ]
}

export function buildReliefCheckPrompt(reliefName: string, context: string, answers: Record<string, unknown>) {
  return [
    {
      role: 'system' as const,
      content: `You are a Malaysian tax eligibility checker. Based on the taxpayer's profile and the provided LHDN ruling, determine if they qualify for the relief and the maximum claimable amount.
Return JSON: { eligible: boolean, amount: number, reason: string }`,
    },
    {
      role: 'user' as const,
      content: `Relief: ${reliefName}
LHDN Context: ${context}
Taxpayer Profile: ${JSON.stringify(answers)}`,
    },
  ]
}
