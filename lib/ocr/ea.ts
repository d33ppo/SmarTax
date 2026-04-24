type OcrMethod = 'ocr-image' | 'ocr-pdf'

export interface OCRResult {
  text: string
  method: OcrMethod
}

export interface BasicEAData {
  grossIncome: number
  epfEmployee: number
  pcb: number
  yearOfAssessment: number
}

function toNumber(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback
  const num = Number(String(value).replace(/[^0-9.-]/g, ''))
  return Number.isFinite(num) ? num : fallback
}

function isImageUpload(mimeType?: string, fileName?: string) {
  if (mimeType?.startsWith('image/')) return true
  const lowerFileName = (fileName || '').toLowerCase()
  return ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tif', '.tiff'].some((ext) =>
    lowerFileName.endsWith(ext)
  )
}

async function runTesseractOnImage(buffer: Buffer): Promise<string> {
  const tesseractModule = await import('tesseract.js')
  const Tesseract =
    (tesseractModule as {
      recognize?: (image: Buffer, lang: string) => Promise<{ data: { text?: string } }>
      default?: {
        recognize?: (image: Buffer, lang: string) => Promise<{ data: { text?: string } }>
      }
    }).recognize
      ? (tesseractModule as {
          recognize: (image: Buffer, lang: string) => Promise<{ data: { text?: string } }>
        })
      : (tesseractModule as {
          default?: {
            recognize?: (image: Buffer, lang: string) => Promise<{ data: { text?: string } }>
          }
        }).default

  if (!Tesseract?.recognize) {
    throw new Error('Failed to initialize tesseract.js OCR runtime')
  }

  const result = await Tesseract.recognize(buffer, 'eng')
  return (result.data.text || '').trim()
}

async function runTesseractOnPdf(buffer: Buffer, maxPages = 3): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const canvasModule = await import('@napi-rs/canvas')
  const createCanvas =
    (canvasModule as {
      createCanvas?: (width: number, height: number) => {
        getContext: (contextId: '2d') => unknown
        toBuffer: (mimeType?: string) => Buffer
      }
      default?: {
        createCanvas?: (width: number, height: number) => {
          getContext: (contextId: '2d') => unknown
          toBuffer: (mimeType?: string) => Buffer
        }
      }
    }).createCanvas ??
    (canvasModule as {
      default?: {
        createCanvas?: (width: number, height: number) => {
          getContext: (contextId: '2d') => unknown
          toBuffer: (mimeType?: string) => Buffer
        }
      }
    }).default?.createCanvas

  if (!createCanvas) {
    throw new Error('Failed to initialize @napi-rs/canvas for PDF OCR')
  }

  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) })
  const pdf = await loadingTask.promise
  const pagesToScan = Math.min(pdf.numPages, maxPages)
  let combinedText = ''

  for (let pageNumber = 1; pageNumber <= pagesToScan; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 2 })
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
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

export async function extractOCRTextFromEAUpload(
  buffer: Buffer,
  options: { mimeType?: string; fileName?: string } = {}
): Promise<OCRResult> {
  if (isImageUpload(options.mimeType, options.fileName)) {
    return {
      text: await runTesseractOnImage(buffer),
      method: 'ocr-image',
    }
  }

  return {
    text: await runTesseractOnPdf(buffer),
    method: 'ocr-pdf',
  }
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

function extractYear(text: string, fileName?: string): number {
  const lowerText = text.toLowerCase()
  const yearLabelIndex = Math.max(lowerText.indexOf('year of assessment'), lowerText.indexOf('tahun taksiran'))

  if (yearLabelIndex >= 0) {
    const segment = text.slice(yearLabelIndex, yearLabelIndex + 120)
    const segmentYearMatch = segment.match(/20\d{2}/)
    if (segmentYearMatch) return toNumber(segmentYearMatch[0], new Date().getFullYear() - 1)
  }

  const anyYearMatch = text.match(/20\d{2}/)
  if (anyYearMatch) return toNumber(anyYearMatch[0], new Date().getFullYear() - 1)

  if (fileName) {
    const fileYearMatch = fileName.match(/20\d{2}/)
    if (fileYearMatch) return toNumber(fileYearMatch[0], new Date().getFullYear() - 1)
  }

  return new Date().getFullYear() - 1
}

export function extractBasicEADataFromText(text: string, fileName?: string): BasicEAData {
  return {
    grossIncome: toNumber(
      extractAmountByKeywords(text, [
        'gross income',
        'gross remuneration',
        'jumlah pendapatan kasar',
        'saraan kasar',
        'jumlah pendapatan penggajian',
      ]) ?? 0
    ),
    epfEmployee: toNumber(
      extractAmountByKeywords(text, ['epf', 'kwsp', 'kumpulan wang simpanan pekerja']) ?? 0
    ),
    pcb: toNumber(
      extractAmountByKeywords(text, ['pcb', 'potongan cukai berjadual', 'mtd', 'monthly tax deduction']) ?? 0
    ),
    yearOfAssessment: extractYear(text, fileName),
  }
}
