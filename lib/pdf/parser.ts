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

export type FilingMode = 'individual' | 'sme' | 'freelancer'

interface ParseOptions {
  manualTaxYear?: number
}

interface StrictExtractResult extends EAData {
  parser: 'strict-ea' | 'strict-business'
}

function num(str: string): number {
  return parseFloat(str.replace(/,/g, '').trim())
}

function normalizeText(text: string): string {
  return text.replace(/\r/g, '\n').replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ')
}

function normalizeLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function extractYear(text: string): number | undefined {
  const yearCandidates = new Set<number>()
  const addYear = (value: string) => {
    const y = Number.parseInt(value, 10)
    if (Number.isFinite(y) && y >= 2018 && y <= new Date().getFullYear() + 1) {
      yearCandidates.add(y)
    }
  }

  const strongYearPatterns = [
    /(?:tahun\s+taksiran|year\s+of\s+assessment)[^\d]*(20\d{2})/gi,
    /(?:bagi\s+tahun\s+berakhir|year\s+ended)[^\d]*(20\d{2})/gi,
  ]

  for (const pattern of strongYearPatterns) {
    let match: RegExpExecArray | null
    while ((match = pattern.exec(text)) !== null) {
      addYear(match[1])
    }
  }

  if (yearCandidates.size > 0) {
    return Math.max(...Array.from(yearCandidates))
  }

  return undefined
}

function findAmountNearLabel(text: string, labelPattern: RegExp, searchWindow = 260): number | undefined {
  const amountPattern = /\b\d{1,3}(?:,\d{3})*(?:\.\d{2})\b/g
  let best: number | undefined
  let match: RegExpExecArray | null

  while ((match = labelPattern.exec(text)) !== null) {
    const segment = text.slice(match.index, match.index + searchWindow)
    const amounts = Array.from(segment.matchAll(amountPattern))
      .map((m) => num(m[0]))
      .filter((v) => Number.isFinite(v) && v >= 0)

    if (amounts.length === 0) continue

    const candidate = amounts[amounts.length - 1]
    if (best === undefined || candidate > best) best = candidate
  }

  return best
}

function findAmountByLineContext(lines: string[], labelPattern: RegExp, lookahead = 4): number | undefined {
  const amountPattern = /\b\d{1,3}(?:,\d{3})*(?:\.\d{2})\b/g
  let best: number | undefined

  for (let i = 0; i < lines.length; i += 1) {
    if (!labelPattern.test(lines[i])) continue

    const end = Math.min(lines.length - 1, i + lookahead)
    const segment = lines.slice(i, end + 1).join(' ')
    const values = Array.from(segment.matchAll(amountPattern))
      .map((m) => num(m[0]))
      .filter((v) => Number.isFinite(v) && v >= 0)

    if (values.length === 0) continue

    const candidate = Math.max(...values)
    if (best === undefined || candidate > best) best = candidate
  }

  return best
}

function findGrossFromEASectionCode(lines: string[]): number | undefined {
  const sectionCodePattern = /s\.?\s*13\s*\(\s*1\s*\)\s*\(\s*a\s*\)/i
  return findAmountByLineContext(lines, sectionCodePattern, 8)
}

function extractAllAmounts(text: string): number[] {
  const amountPattern = /\b\d{1,3}(?:[,\s]\d{3})*(?:\.\d{2})\b/g
  const values = Array.from(text.matchAll(amountPattern))
    .map((m) => Number.parseFloat(m[0].replace(/[\s,]/g, '')))
    .filter((v) => Number.isFinite(v) && v >= 0)

  // De-duplicate by rounding to cents
  const seen = new Set<number>()
  for (const value of values) {
    seen.add(Math.round(value * 100))
  }

  return Array.from(seen).map((cents) => cents / 100)
}

function includesAmount(values: number[], target: number): boolean {
  const cents = Math.round(target * 100)
  return values.some((value) => Math.abs(Math.round(value * 100) - cents) <= 1)
}

function parseJSONObject(text: string): Record<string, unknown> | null {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null

  try {
    return JSON.parse(match[0]) as Record<string, unknown>
  } catch {
    return null
  }
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseFloat(value.replace(/,/g, ''))
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

async function parseEAWithGLMFallback(text: string, options?: ParseOptions): Promise<StrictExtractResult | null> {
  try {
    const truncatedText = text.slice(0, 7000)
    const messages = buildExtractEAPrompt({ text: truncatedText })
    const response = await glmClient.chat(messages, 0.1)
    const parsed = parseJSONObject(response)
    if (!parsed) return null

    const amountsInPdf = extractAllAmounts(text)
    const grossIncome = asNumber(parsed.grossIncome)
    if (!grossIncome || grossIncome < 1000 || !includesAmount(amountsInPdf, grossIncome)) {
      return null
    }

    const modelYear = asNumber(parsed.yearOfAssessment)
    const yearCandidate = options?.manualTaxYear ?? modelYear
    if (!yearCandidate) return null

    const year = Math.trunc(yearCandidate)
    const maxYear = new Date().getFullYear() + 1
    if (year < 2018 || year > maxYear) return null

    const epfRaw = asNumber(parsed.epfEmployee)
    const pcbRaw = asNumber(parsed.pcb)
    const socsoRaw = asNumber(parsed.socsoEmployee)
    const eisRaw = asNumber(parsed.eisEmployee)

    const epf = epfRaw && includesAmount(amountsInPdf, epfRaw) ? epfRaw : 0
    const pcb = pcbRaw && includesAmount(amountsInPdf, pcbRaw) ? pcbRaw : 0
    const socso = socsoRaw && includesAmount(amountsInPdf, socsoRaw) ? socsoRaw : undefined
    const eis = eisRaw && includesAmount(amountsInPdf, eisRaw) ? eisRaw : undefined

    return {
      parser: 'strict-ea',
      yearOfAssessment: year,
      grossIncome,
      epfEmployee: epf,
      pcb,
      socsoEmployee: socso,
      eisEmployee: eis,
    }
  } catch {
    return null
  }
}

async function parseEAFromText(text: string, options?: ParseOptions): Promise<StrictExtractResult> {
  const lower = text.toLowerCase()
  const lines = normalizeLines(text)
  const looksLikeEA =
    lower.includes('borang ea') ||
    lower.includes('penyata gaji pekerja') ||
    lower.includes('c.p.8a')

  if (!looksLikeEA) {
    throw new Error('Uploaded file does not look like a Borang EA document.')
  }

  const year = options?.manualTaxYear ?? extractYear(text)

  const grossPattern = /(?:gaji\s+kasar|gross\s+salary|pendapatan\s+penggajian|jumlah\s+pendapatan\s+penggajian)/i
  const pcbPattern = /(?:potongan\s+cukai\s+bulanan|pcb|mtd|cukai\s+berjadual)/i
  const epfPattern = /(?:kwsp|epf|kumpulan\s+wang\s+simpanan)/i
  const socsoPattern = /(?:perkeso|socso)/i
  const eisPattern = /(?:\beis\b|\bsip\b)/i

  const grossIncome =
    findGrossFromEASectionCode(lines) ??
    findAmountByLineContext(lines, grossPattern, 6) ??
    findAmountNearLabel(text, /(?:gaji\s+kasar|gross\s+salary|pendapatan\s+penggajian|jumlah\s+pendapatan\s+penggajian)/gi, 500)

  const pcb =
    findAmountByLineContext(lines, pcbPattern, 5) ??
    findAmountNearLabel(text, /(?:potongan\s+cukai\s+bulanan|pcb|mtd|cukai\s+berjadual)/gi, 420)

  const epf =
    findAmountByLineContext(lines, epfPattern, 5) ??
    findAmountNearLabel(text, /(?:kwsp|epf|kumpulan\s+wang\s+simpanan)/gi, 420)

  const socso =
    findAmountByLineContext(lines, socsoPattern, 4) ??
    findAmountNearLabel(text, /(?:perkeso|socso)/gi, 300)

  const eis =
    findAmountByLineContext(lines, eisPattern, 4) ??
    findAmountNearLabel(text, /(?:\beis\b|\bsip\b)/gi, 300)

  if (!grossIncome || grossIncome < 1000) {
    const glmFallback = await parseEAWithGLMFallback(text, options)
    if (glmFallback) return glmFallback
    throw new Error('Could not confidently extract EA gross income. Please upload a clearer text-based EA PDF.')
  }

  if (!year) {
    throw new Error('Could not confidently extract EA tax year. Please provide tax year manually.')
  }

  return {
    parser: 'strict-ea',
    yearOfAssessment: year,
    grossIncome,
    pcb: pcb ?? 0,
    epfEmployee: epf ?? 0,
    socsoEmployee: socso,
    eisEmployee: eis,
  }
}

function parseBusinessDocument(text: string, mode: Extract<FilingMode, 'sme' | 'freelancer'>): StrictExtractResult {
  const year = extractYear(text) ?? new Date().getFullYear() - 1
  const grossIncome =
    findAmountNearLabel(
      text,
      /(?:revenue|turnover|sales|hasil\s+jualan|pendapatan\s+perniagaan|business\s+income|jumlah\s+pendapatan)/gi,
      320,
    ) ??
    findAmountNearLabel(
      text,
      /(?:total|jumlah)/gi,
      200,
    )

  if (!grossIncome || grossIncome < 1000) {
    throw new Error(
      mode === 'sme'
        ? 'Could not confidently extract revenue from the P&L statement. Please upload a clear text-based P&L with Revenue/Turnover line.'
        : 'Could not confidently extract total income from invoices/receipts. Please upload a clear text-based statement with a Total amount.'
    )
  }

  return {
    parser: 'strict-business',
    yearOfAssessment: year,
    grossIncome,
    epfEmployee: 0,
    pcb: 0,
  }
}

export async function parseUploadedForm(buffer: Buffer, mode: FilingMode, options?: ParseOptions): Promise<EAData> {
  const parsed = await pdfParse(buffer)
  const text = normalizeText(parsed.text)

  if (!text.trim()) {
    throw new Error('No extractable text found in PDF. Please upload a text-based PDF (not image-only scan).')
  }

  const result =
    mode === 'individual'
      ? await parseEAFromText(text, options)
      : parseBusinessDocument(text, mode)

  return {
    grossIncome: result.grossIncome,
    epfEmployee: result.epfEmployee,
    pcb: result.pcb,
    yearOfAssessment: result.yearOfAssessment,
    socsoEmployee: result.socsoEmployee,
    eisEmployee: result.eisEmployee,
  }
}
