import { createClient } from '@supabase/supabase-js'

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

  // Use keyword search since we don't have an embedding model
  const { data, error } = await supabase
    .from('ruling_chunks')
    .select('*')
    .ilike('content', `%${query}%`)
    .limit(topK)

  if (error) {
    console.error('Keyword search error:', error)
    return []
  }

  return (data as any[]).map(d => ({
    ...d,
    similarity: 1 // Placeholder for similarity
  }))
}
