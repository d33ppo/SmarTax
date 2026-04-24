import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import fs from 'fs'
import path from 'path'
import pdfParse from 'pdf-parse'
import OpenAI from 'openai'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

import { log } from '../lib/log'
import { chunkText, type Chunk } from '../lib/rag/chunker'

interface RulingMetadata {
  ruling_code: string
  ruling_title: string
  source_url: string | null
  effective_year: number | null
  applies_to: string[]
}

interface EmbeddingRow {
  ruling_code: string
  ruling_title: string
  section_title: string
  paragraph: string
  content: string
  content_tokens: number
  embedding: number[]
  source_url: string | null
  effective_year: number | null
  applies_to: string[]
}

// ============================================================
// CONFIG
// ============================================================

const CONFIG = {
  /** Folder containing the PDF files */
  rulingsPdfDir: process.env.RULINGS_DIR ?? path.join(process.cwd(), 'data', 'rulings'),

  /** OpenAI model — text-embedding-3-small outputs 1536-dim by default */
  embeddingModel: 'text-embedding-3-small' as const,

  /** Dimensions must match your pgvector column: vector(1536) */
  embeddingDimensions: 1536,

  /** How many chunks to embed in one OpenAI API call (max 2048 inputs per call) */
  embeddingBatchSize: 20,

  /** How many rows to upsert to Supabase in one call */
  dbBatchSize: 50,

  /** Delay (ms) between consecutive embedding API calls to respect rate limits */
  delayBetweenBatchesMs: 500,

  /** Max retry attempts per embedding batch */
  maxRetries: 3,

  /** Base delay (ms) for exponential back-off on retry */
  retryBaseDelayMs: 1000,

  /** Taxpayer types this script tags all rulings with (override per file if needed) */
  defaultAppliesTo: ['individual', 'freelancer'] as string[],
}

function buildClients(): { openai: OpenAI; supabase: SupabaseClient } {
  const openaiKey = process.env.OPENAI_API_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!openaiKey) throw new Error('Missing env: OPENAI_API_KEY')
  if (!supabaseUrl) throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseKey) throw new Error('Missing env: SUPABASE_SERVICE_ROLE_KEY')

  const openai = new OpenAI({ apiKey: openaiKey })
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })

  return { openai, supabase }
}

/**
 * Parses a filename like "PR_9_2017_Income_Tax_Treatment.pdf" into structured metadata.
 *
 * Pattern: PR_{number}_{year}_{Title_Words}.pdf
 *   → ruling_code:  "PR_9_2017"
 *   → ruling_title: "Income Tax Treatment"
 *   → effective_year: 2017
 */
function extractMetadataFromFilename(filename: string): RulingMetadata {
  const base = path.basename(filename, '.pdf')

  // Match PR_{num}_{year}_{...rest}
  const match = base.match(/^(PR_\d+_(\d{4}))_(.+)$/)

  if (match) {
    const [, ruling_code, yearStr, titleSlug] = match
    return {
      ruling_code,
      ruling_title: titleSlug.replace(/_/g, ' '),
      effective_year: parseInt(yearStr, 10),
      source_url: null,
      applies_to: CONFIG.defaultAppliesTo,
    }
  }

  // Fallback: use full filename as code
  log.warn(`Could not parse metadata from filename "${filename}" — using raw slug.`)
  return {
    ruling_code: base.replace(/\s+/g, '_').toUpperCase(),
    ruling_title: base.replace(/_/g, ' '),
    effective_year: null,
    source_url: null,
    applies_to: CONFIG.defaultAppliesTo,
  }
}

/**
 * Fast token count approximation — 1 token ≈ 4 characters (OpenAI rule of thumb).
 * Accurate enough for storage; no need to run a full tokeniser here.
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Sleep helper for rate-limit back-off.
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Generates embeddings for an array of strings using OpenAI.
 * Retries up to CONFIG.maxRetries times with exponential back-off.
 *
 * @returns Array of float32 vectors (one per input string)
 */
async function generateEmbeddings(
  openai: OpenAI,
  texts: string[],
  attempt = 1
): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: CONFIG.embeddingModel,
      input: texts,
      dimensions: CONFIG.embeddingDimensions, // explicit — future-proofs against model defaults
    })

    // Sort by index to guarantee order (OpenAI guarantees order, but be defensive)
    return response.data
      .sort((a, b) => a.index - b.index)
      .map((d) => d.embedding)
  } catch (err: unknown) {
    if (attempt > CONFIG.maxRetries) {
      log.error(`Embedding failed after ${CONFIG.maxRetries} retries.`, err)
      throw err
    }

    const backoff = CONFIG.retryBaseDelayMs * Math.pow(2, attempt - 1)
    log.warn(`Embedding attempt ${attempt} failed — retrying in ${backoff}ms…`)
    await sleep(backoff)
    return generateEmbeddings(openai, texts, attempt + 1)
  }
}

/**
 * Upserts rows into rulings_vectors. Uses conflict on (ruling_code, content)
 * so re-running the script is safe — it won't duplicate existing chunks.
 */
async function upsertRows(
  supabase: SupabaseClient,
  rows: EmbeddingRow[]
): Promise<void> {
  const { error } = await supabase
    .from('rulings_vectors')
    .upsert(rows, { onConflict: 'ruling_code,content' })

  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`)
  }
}

async function processPdf(
  filePath: string,
  openai: OpenAI,
  supabase: SupabaseClient
): Promise<{ chunksProcessed: number; chunksSkipped: number }> {
  const filename = path.basename(filePath)
  log.step(`Processing: ${filename}`)

  // 1. Parse PDF
  const buffer = fs.readFileSync(filePath)
  const parsed = await pdfParse(buffer)
  log.dim(`Pages: ${parsed.numpages} | Raw chars: ${parsed.text.length.toLocaleString()}`)

  // 2. Extract metadata first — needed as chunkText arguments
  const meta = extractMetadataFromFilename(filename)

  // 3. Chunk — pass ruling_code as source, ruling_title as citation
  //    chunkText(text, source, citation, chunkSize?, overlap?)
  const chunks: Chunk[] = chunkText(
    parsed.text,
    meta.ruling_code,   // source  → stored in rulings_vectors.paragraph
    meta.ruling_title,  // citation → stored in rulings_vectors.section_title
  )
  log.dim(`Chunks produced: ${chunks.length}`)

  if (chunks.length === 0) {
    log.warn(`No chunks produced — skipping file.`)
    return { chunksProcessed: 0, chunksSkipped: 0 }
  }
  log.dim(`Ruling code: ${meta.ruling_code} | Title: ${meta.ruling_title} | Year: ${meta.effective_year ?? 'n/a'}`)

  // 4. Process chunks in embedding batches
  let chunksProcessed = 0
  let chunksSkipped = 0
  const pendingRows: EmbeddingRow[] = []

  for (let i = 0; i < chunks.length; i += CONFIG.embeddingBatchSize) {
    const batch: Chunk[] = chunks.slice(i, i + CONFIG.embeddingBatchSize)
    const batchNum = Math.floor(i / CONFIG.embeddingBatchSize) + 1
    const totalBatches = Math.ceil(chunks.length / CONFIG.embeddingBatchSize)

    process.stdout.write(
      `\r   Embedding batch ${batchNum}/${totalBatches} (chunks ${i + 1}–${Math.min(i + CONFIG.embeddingBatchSize, chunks.length)})…`
    )

    // Filter out empty content before sending to API
    const validBatch = batch.filter((c) => c.content.trim().length > 0)
    const skipped = batch.length - validBatch.length
    chunksSkipped += skipped

    if (validBatch.length === 0) continue

    // Generate embeddings (with retry)
    const vectors = await generateEmbeddings(
      openai,
      validBatch.map((c) => c.content)
    )

    // Build rows
    validBatch.forEach((chunk, idx) => {
      pendingRows.push({
        ruling_code: meta.ruling_code,
        ruling_title: meta.ruling_title,
        section_title: chunk.citation ?? '',
        paragraph: chunk.source ?? '',
        content: chunk.content,
        content_tokens: estimateTokens(chunk.content),
        embedding: vectors[idx],
        source_url: meta.source_url,
        effective_year: meta.effective_year,
        applies_to: meta.applies_to,
      })
    })

    chunksProcessed += validBatch.length

    // Flush to DB once we have enough pending rows
    if (pendingRows.length >= CONFIG.dbBatchSize) {
      await upsertRows(supabase, pendingRows.splice(0, CONFIG.dbBatchSize))
    }

    // Rate-limit delay between embedding batches
    if (i + CONFIG.embeddingBatchSize < chunks.length) {
      await sleep(CONFIG.delayBetweenBatchesMs)
    }
  }

  // Flush any remaining rows
  if (pendingRows.length > 0) {
    await upsertRows(supabase, pendingRows)
  }

  process.stdout.write('\n')
  log.info(`Inserted ${chunksProcessed} chunks | Skipped ${chunksSkipped} empty chunks`)

  return { chunksProcessed, chunksSkipped }
}

async function main(): Promise<void> {
  console.log('\n════════════════════════════════════════')
  console.log('  TaxPilot — LHDN Ruling Ingestion')
  console.log('════════════════════════════════════════')

  const { openai, supabase } = buildClients()

  // Discover PDF files
  if (!fs.existsSync(CONFIG.rulingsPdfDir)) {
    throw new Error(`Rulings directory not found: ${CONFIG.rulingsPdfDir}`)
  }

  const pdfFiles = fs
    .readdirSync(CONFIG.rulingsPdfDir)
    .filter((f) => f.toLowerCase().endsWith('.pdf'))
    .map((f) => path.join(CONFIG.rulingsPdfDir, f))

  if (pdfFiles.length === 0) {
    log.warn(`No PDF files found in ${CONFIG.rulingsPdfDir}`)
    return
  }

  log.info(`Found ${pdfFiles.length} PDF file(s) to process`)
  log.dim(`Embedding model : ${CONFIG.embeddingModel} (${CONFIG.embeddingDimensions}d)`)
  log.dim(`Embedding batch : ${CONFIG.embeddingBatchSize} chunks/call`)
  log.dim(`DB batch        : ${CONFIG.dbBatchSize} rows/upsert`)
  log.dim(`Batch delay     : ${CONFIG.delayBetweenBatchesMs}ms`)

  // Process each PDF sequentially (safer for rate limits)
  let totalProcessed = 0
  let totalSkipped = 0
  const failed: string[] = []

  for (const filePath of pdfFiles) {
    try {
      const { chunksProcessed, chunksSkipped } = await processPdf(filePath, openai, supabase)
      totalProcessed += chunksProcessed
      totalSkipped += chunksSkipped
    } catch (err) {
      log.error(`Failed to process ${path.basename(filePath)}:`, err)
      failed.push(path.basename(filePath))
    }
  }

  // Summary
  console.log('\n════════════════════════════════════════')
  console.log('  Ingestion Complete')
  console.log('════════════════════════════════════════')
  log.info(`Files processed  : ${pdfFiles.length - failed.length} / ${pdfFiles.length}`)
  log.info(`Chunks inserted  : ${totalProcessed.toLocaleString()}`)
  log.info(`Chunks skipped   : ${totalSkipped.toLocaleString()}`)

  if (failed.length > 0) {
    log.warn(`Failed files (${failed.length}):`)
    failed.forEach((f) => log.dim(`  • ${f}`))
    process.exit(1)
  }

  console.log('\n  Run the verify query in Supabase:')
  console.log('  SELECT ruling_code, COUNT(*) FROM rulings_vectors GROUP BY ruling_code ORDER BY ruling_code;\n')
}

main().catch((err) => {
  console.error('\nFatal error:', err)
  process.exit(1)
})