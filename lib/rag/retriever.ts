import { createClient } from '@supabase/supabase-js'

export interface Chunk {
  id: string
  content: string
  citation: string
  source: string
  similarity: number
}

type RulingRow = {
  id?: string | number
  content?: string
  citation?: string
  source?: string
}

export async function retrieve(query: string, topK = 5): Promise<Chunk[]> {
  console.log("Retrieve called with query:", query, "topK:", topK)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  console.log("Supabase client created")

  // Use keyword search since we don't have an embedding model
  const { data, error } = await supabase
    .from('rulings_vectors')
    .select('*')
    .ilike('content', `%${query}%`)
    .limit(topK)

  console.log("Supabase query executed")

  if (error) {
    console.error('Keyword search error:', error)
    return []
  }

  console.log("Raw data returned:", JSON.stringify(data, null, 2))

  const rows = Array.isArray(data) ? (data as RulingRow[]) : []
  const result: Chunk[] = rows.map((d) => ({
    id: String(d.id ?? ''),
    content: String(d.content ?? ''),
    citation: String(d.citation ?? ''),
    source: String(d.source ?? ''),
    similarity: 1,
  }))

  console.log("Processed result:", JSON.stringify(result, null, 2))

  return result
}
