import pdfParse from 'pdf-parse'
import { glmClient } from '@/lib/glm/client'
import { buildExtractEAPrompt } from '@/lib/glm/prompts'

export interface EAData {
  grossIncome: number
  epfEmployee: number
  pcb: number
  yearOfAssessment: number
  socsoEmployee?: number
  eisEmployee?: number
}

export async function parseEAForm(buffer: Buffer): Promise<EAData> {
  const parsed = await pdfParse(buffer)
  const text = parsed.text

  const messages = buildExtractEAPrompt({ text })
  const response = await glmClient.chat(messages)

  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Failed to extract structured data from EA Form')

  const data = JSON.parse(jsonMatch[0]) as EAData

  if (!data.grossIncome || !data.yearOfAssessment) {
    throw new Error('Could not read required fields from EA Form. Please ensure the PDF is not scanned/image-only.')
  }

  return {
    grossIncome: Number(data.grossIncome),
    epfEmployee: Number(data.epfEmployee ?? 0),
    pcb: Number(data.pcb ?? 0),
    yearOfAssessment: Number(data.yearOfAssessment),
    socsoEmployee: data.socsoEmployee ? Number(data.socsoEmployee) : undefined,
    eisEmployee: data.eisEmployee ? Number(data.eisEmployee) : undefined,
  }
}
