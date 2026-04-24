import pdfParse from 'pdf-parse'

export interface EAData {
  grossIncome: number
  epfEmployee: number
  pcb: number
  yearOfAssessment: number
  socsoEmployee?: number
  eisEmployee?: number
}

export type FilingMode = 'individual' | 'sme' | 'freelancer'

interface StrictExtractResult extends EAData {
  parser: 'strict-ea' | 'strict-business'
}

function num(str: string): number {
  return parseFloat(str.replace(/,/g, '').trim())
}

function normalizeText(text: string): string {
  return text.replace(/\r/g, '\n').replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ')
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

function parseEAFromText(text: string): StrictExtractResult {
  const lower = text.toLowerCase()
  const looksLikeEA =
    lower.includes('borang ea') ||
    lower.includes('penyata gaji pekerja') ||
    lower.includes('c.p.8a')

  if (!looksLikeEA) {
    throw new Error('Uploaded file does not look like a Borang EA document.')
  }

  const year = extractYear(text)
  const grossIncome = findAmountNearLabel(
    text,
    /(?:gaji\s+kasar|gross\s+salary|pendapatan\s+penggajian|jumlah\s+pendapatan\s+penggajian)/gi,
  )
  const pcb = findAmountNearLabel(
    text,
    /(?:potongan\s+cukai\s+bulanan|pcb|mtd|cukai\s+berjadual)/gi,
  )
  const epf = findAmountNearLabel(
    text,
    /(?:kwsp|epf|kumpulan\s+wang\s+simpanan)/gi,
  )
  const socso = findAmountNearLabel(text, /(?:perkeso|socso)/gi)
  const eis = findAmountNearLabel(text, /(?:\beis\b|\bsip\b)/gi)

  if (!year || !grossIncome || grossIncome < 1000) {
    throw new Error('Could not confidently extract EA gross income and tax year. Please upload a clearer text-based EA PDF.')
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

export async function parseUploadedForm(buffer: Buffer, mode: FilingMode): Promise<EAData> {
  const parsed = await pdfParse(buffer)
  const text = normalizeText(parsed.text)

  if (!text.trim()) {
    throw new Error('No extractable text found in PDF. Please upload a text-based PDF (not image-only scan).')
  }

  const result =
    mode === 'individual'
      ? parseEAFromText(text)
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
