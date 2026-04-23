import { createClient } from '@supabase/supabase-js'
import { embed } from './embedder'

export interface Chunk {
  id: string
  content: string
  citation: string
  source: string
  similarity: number
}

export async function retrieve(query: string, topK = 5): Promise<Chunk[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const queryEmbedding = await embed(query)

  const { data, error } = await supabase.rpc('match_ruling_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: topK,
  })

  if (error) throw error

  return data as Chunk[]
}
