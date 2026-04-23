import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import pdfParse from 'pdf-parse'
import { chunkText } from '../lib/rag/chunker'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RULINGS_DIR = path.join(process.cwd(), 'data', 'rulings')

async function ingestRulings() {
  if (!fs.existsSync(RULINGS_DIR)) {
    console.error(`Rulings directory not found: ${RULINGS_DIR}`)
    console.log('Create a data/rulings/ folder and place LHDN Public Ruling PDFs inside.')
    process.exit(1)
  }

  const files = fs.readdirSync(RULINGS_DIR).filter((f) => f.endsWith('.pdf'))
  console.log(`Found ${files.length} ruling PDFs to ingest.`)

  for (const file of files) {
    const filePath = path.join(RULINGS_DIR, file)
    const citation = path.basename(file, '.pdf')

    console.log(`Processing: ${file}`)

    const buffer = fs.readFileSync(filePath)
    const parsed = await pdfParse(buffer)
    const chunks = chunkText(parsed.text, file, citation)

    console.log(`  ${chunks.length} chunks created`)

    const batchSize = 20
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize)

      const rows = batch.map((chunk) => ({
        source: chunk.source,
        citation: chunk.citation,
        content: chunk.content,
        // Embedding is skipped as only ilmu-glm-5.1 is available
      }))

      const { error } = await supabase.from('rulings_vectors').insert(rows)
      if (error) console.error(`  Batch error:`, error.message)
      else console.log(`  Inserted batch ${Math.floor(i / batchSize) + 1}`)
    }
  }

  console.log('Ingestion complete.')
}

ingestRulings()
