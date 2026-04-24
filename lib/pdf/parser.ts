import pdfParse from 'pdf-parse'
import { glmClient } from '@/lib/glm/client'
import { buildExtractEAPrompt } from '@/lib/glm/prompts'

type ExtractionMethod = 'pdf-text' | 'pdf-text+ocr-fallback' | 'ocr-image' | 'ocr-pdf'

interface ParseEAOptions {
  mimeType?: string
  fileName?: string
}

type EAFieldValue = string | number | null

export interface EAData {
  grossIncome: number
  epfEmployee: number
  pcb: number
  yearOfAssessment: number
  socsoEmployee?: number
  eisEmployee?: number
  grossCommission?: number
  grossBonus?: number
  employeeName?: string
  employeeIdentificationNo?: string
  employeeTaxFileNo?: string
  employerName?: string
  employerNo?: string
  employmentPeriod?: string
  keyValueFields?: Record<string, EAFieldValue>
  extractionMethod?: ExtractionMethod
  sourceTextLength?: number
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function toNumber(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback
  const num = Number(String(value).replace(/[^0-9.-]/g, ''))
  return Number.isFinite(num) ? num : fallback
}

function toOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return undefined
  const num = toNumber(value, Number.NaN)
  return Number.isFinite(num) ? num : undefined
}

function isImageUpload(mimeType?: string, fileName?: string) {
  if (mimeType?.startsWith('image/')) return true
  const lowerFileName = (fileName || '').toLowerCase()
  return ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tif', '.tiff'].some((ext) =>
    lowerFileName.endsWith(ext)
  )
}

async function runTesseractOnImage(buffer: Buffer): Promise<string> {
  const Tesseract = (await import('tesseract.js')).default
  const result = await Tesseract.recognize(buffer, 'eng')
  return result.data.text || ''
}

async function runTesseractOnPdf(buffer: Buffer, maxPages = 3): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const { createRequire } = await import('node:module')
  const require = createRequire(import.meta.url)
  const canvasLib = require('@napi-rs/canvas') as {
    createCanvas: (width: number, height: number) => {
      getContext: (contextId: '2d') => unknown
      toBuffer: (mimeType?: string) => Buffer
    }
  }

  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) })
  const pdf = await loadingTask.promise
  const pagesToScan = Math.min(pdf.numPages, maxPages)
  let combinedText = ''

  for (let pageNumber = 1; pageNumber <= pagesToScan; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 2 })
    const canvas = canvasLib.createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
    const context = canvas.getContext('2d')

    await page.render({
      canvasContext: context as unknown as CanvasRenderingContext2D,
      viewport,
      canvas: canvas as unknown as HTMLCanvasElement,
    }).promise

    const imageBuffer = canvas.toBuffer('image/png')
    const pageText = await runTesseractOnImage(imageBuffer)
    combinedText += `\n\n[OCR PAGE ${pageNumber}]\n${pageText}`
  }

  return combinedText.trim()
}

function toKeyValueMap(value: unknown): Record<string, EAFieldValue> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, fieldValue]) => {
      if (fieldValue === null || fieldValue === undefined) return [key, null]
      if (typeof fieldValue === 'number') return [key, Number.isFinite(fieldValue) ? fieldValue : null]
      const asString = String(fieldValue).trim()
      if (!asString) return [key, null]

      const maybeNumber = Number(asString.replace(/[^0-9.-]/g, ''))
      if (Number.isFinite(maybeNumber) && /[0-9]/.test(asString)) {
        return [key, maybeNumber]
      }

      return [key, asString]
    })
  )
}

function extractLineAmount(line: string): number | undefined {
  const matches = line.match(/\d[\d,]*(?:\.\d{1,2})?/g)
  if (!matches || matches.length === 0) return undefined

  const values = matches
    .map((match) => toNumber(match, Number.NaN))
    .filter((value) => Number.isFinite(value) && value >= 0)

  if (values.length === 0) return undefined
  return Math.max(...values)
}

function extractAmountByKeywords(text: string, keywords: string[]): number | undefined {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  for (let i = 0; i < lines.length; i += 1) {
    const current = lines[i].toLowerCase()
    const hit = keywords.some((keyword) => current.includes(keyword))
    if (!hit) continue

    const sameLineAmount = extractLineAmount(lines[i])
    if (sameLineAmount !== undefined) return sameLineAmount

    const nextLine = lines[i + 1]
    if (nextLine) {
      const nextLineAmount = extractLineAmount(nextLine)
      if (nextLineAmount !== undefined) return nextLineAmount
    }
  }

  return undefined
}

function extractYearOfAssessment(text: string, fileName?: string): number | undefined {
  const lowerText = text.toLowerCase()
  const yearLabelIndex = Math.max(lowerText.indexOf('year of assessment'), lowerText.indexOf('tahun taksiran'))

  if (yearLabelIndex >= 0) {
    const segment = text.slice(yearLabelIndex, yearLabelIndex + 120)
    const segmentYearMatch = segment.match(/20\d{2}/)
    if (segmentYearMatch) {
      return toNumber(segmentYearMatch[0], Number.NaN)
    }
  }

  const anyYearMatch = text.match(/20\d{2}/g)
  if (anyYearMatch?.length) {
    const candidates = anyYearMatch
      .map((value) => toNumber(value, Number.NaN))
      .filter((year) => Number.isFinite(year) && year >= 2010 && year <= 2099)
    if (candidates.length) return candidates[0]
  }

  if (fileName) {
    const fileYearMatch = fileName.match(/20\d{2}/)
    if (fileYearMatch) return toNumber(fileYearMatch[0], Number.NaN)
  }

  return undefined
}

export async function parseEAForm(buffer: Buffer, options: ParseEAOptions = {}): Promise<EAData> {
  let extractionMethod: ExtractionMethod = 'pdf-text'
  let text = ''

  if (isImageUpload(options.mimeType, options.fileName)) {
    text = await runTesseractOnImage(buffer)
    extractionMethod = 'ocr-image'
  } else {
    const parsed = await pdfParse(buffer)
    text = parsed.text || ''

    if (normalizeText(text).length < 150) {
      const ocrText = await runTesseractOnPdf(buffer)
      if (normalizeText(ocrText).length > 0) {
        text = `${text}\n\n${ocrText}`
        extractionMethod = normalizeText(parsed.text || '').length > 0 ? 'pdf-text+ocr-fallback' : 'ocr-pdf'
      }
    }
  }

  if (!normalizeText(text)) {
    throw new Error('Could not read text from the uploaded EA Form. Please upload a clearer PDF or image.')
  }

  const messages = buildExtractEAPrompt({ text })
  const response = await glmClient.chat(messages)

  let data: Partial<EAData> = {}
  const jsonMatch = response.match(/\{[\s\S]*\}/)

  if (jsonMatch) {
    try {
      data = JSON.parse(jsonMatch[0]) as Partial<EAData>
    } catch {
      data = {}
    }
  }

  const fallbackGrossIncome = extractAmountByKeywords(text, [
    'gross income',
    'gross remuneration',
    'jumlah pendapatan kasar',
    'saraan kasar',
    'jumlah pendapatan penggajian',
  ])
  const fallbackEPF = extractAmountByKeywords(text, ['epf', 'kwsp', 'kumpulan wang simpanan pekerja'])
  const fallbackPCB = extractAmountByKeywords(text, [
    'pcb',
    'potongan cukai berjadual',
    'mtd',
    'monthly tax deduction',
  ])
  const fallbackYear = extractYearOfAssessment(text, options.fileName)

  const resolvedGrossIncome = toNumber(data.grossIncome, Number.NaN)
  const resolvedYear = toNumber(data.yearOfAssessment, Number.NaN)
  const finalGrossIncome = Number.isFinite(resolvedGrossIncome) && resolvedGrossIncome > 0
    ? resolvedGrossIncome
    : fallbackGrossIncome
  const finalYear = Number.isFinite(resolvedYear) && resolvedYear >= 2010
    ? resolvedYear
    : fallbackYear

  if (!finalGrossIncome || !finalYear) {
    throw new Error('Could not read required fields from EA Form. Please ensure the upload is complete and legible.')
  }

  return {
    grossIncome: finalGrossIncome,
    epfEmployee: toNumber(data.epfEmployee ?? fallbackEPF ?? 0),
    pcb: toNumber(data.pcb ?? fallbackPCB ?? 0),
    yearOfAssessment: finalYear,
    socsoEmployee: toOptionalNumber(data.socsoEmployee),
    eisEmployee: toOptionalNumber(data.eisEmployee),
    grossCommission: toOptionalNumber(data.grossCommission),
    grossBonus: toOptionalNumber(data.grossBonus),
    employeeName: data.employeeName?.trim() || undefined,
    employeeIdentificationNo: data.employeeIdentificationNo?.trim() || undefined,
    employeeTaxFileNo: data.employeeTaxFileNo?.trim() || undefined,
    employerName: data.employerName?.trim() || undefined,
    employerNo: data.employerNo?.trim() || undefined,
    employmentPeriod: data.employmentPeriod?.trim() || undefined,
    keyValueFields: toKeyValueMap(data.keyValueFields),
    extractionMethod,
    sourceTextLength: normalizeText(text).length,
  }
}
