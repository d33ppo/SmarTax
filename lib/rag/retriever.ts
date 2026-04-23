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
    .from('rulings_vectors')
    .select('*')
    .ilike('content', `%${query}%`)
    .limit(topK)

  if (error) {
    console.error('Keyword search error:', error)
    return []
  }

  return (data as any[]).map(d => ({
    id: d.id,
    content: d.content,
    citation: d.ruling_title || d.ruling_code, // Use title or code
    source: d.source_url,
    similarity: 1
/ Placeholder for similarity
