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

function num(str: string): number {
  return parseFloat(str.replace(/,/g, '').trim())
}

// Fast regex extraction — covers standard LHDN EA form layouts without any GLM call
function extractFromText(text: string): Partial<EAData> {
  const t = text.replace(/\r/g, ' ')
  const result: Partial<EAData> = {}

  const yearMatch =
    t.match(/(?:tahun\s+taksiran|year\s+of\s+assessment)[^0-9]*(202\d)/i) ||
    t.match(/\b(202\d)\b/)
  if (yearMatch) result.yearOfAssessment = parseInt(yearMatch[1])

  const grossMatch =
    t.match(/(?:jumlah\s+pendapatan\s+kasar|total\s+gross\s+income|gross\s+income)[^0-9]*([\d,]+\.?\d*)/i) ||
    t.match(/\bC1\b[^0-9]*([\d,]+\.?\d*)/i) ||
    t.match(/(?:pendapatan\s+penggajian|employment\s+income)[^0-9]*([\d,]+\.?\d*)/i)
  if (grossMatch) result.grossIncome = num(grossMatch[1])

  const epfMatch =
    t.match(/(?:KWSP\/EPF|KWSP|kumpulan\s+wang\s+simpanan)[^0-9]*([\d,]+\.?\d*)/i) ||
    t.match(/\bEPF\b[^0-9]*([\d,]+\.?\d*)/i)
  if (epfMatch) result.epfEmployee = num(epfMatch[1])

  const pcbMatch =
    t.match(/(?:potongan\s+cukai\s+bulanan|cukai\s+berjadual|PCB\/MTD|PCB|MTD)[^0-9]*([\d,]+\.?\d*)/i)
  if (pcbMatch) result.pcb = num(pcbMatch[1])

  const socsoMatch = t.match(/(?:PERKESO|SOCSO)[^0-9]*([\d,]+\.?\d*)/i)
  if (socsoMatch) result.socsoEmployee = num(socsoMatch[1])

  const eisMatch = t.match(/(?:\bEIS\b|\bSIP\b)[^0-9]*([\d,]+\.?\d*)/i)
  if (eisMatch) result.eisEmployee = num(eisMatch[1])

  return result
}

export async function parseEAForm(buffer: Buffer): Promise<EAData> {
  const parsed = await pdfParse(buffer)
  const text = parsed.text

  // Try regex first — instant, no API call, works for 90%+ of standard EA forms
  const extracted = extractFromText(text)
  if (extracted.grossIncome && extracted.yearOfAssessment) {
    return {
      grossIncome: extracted.grossIncome,
      epfEmployee: extracted.epfEmployee ?? 0,
      pcb: extracted.pcb ?? 0,
      yearOfAssessment: extracted.yearOfAssessment,
      socsoEmployee: extracted.socsoEmployee,
      eisEmployee: extracted.eisEmployee,
    }
  }

  // Fallback to GLM only if regex couldn't find the required fields
  const truncatedText = text.slice(0, 4000)
  const messages = buildExtractEAPrompt({ text: truncatedText })
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
