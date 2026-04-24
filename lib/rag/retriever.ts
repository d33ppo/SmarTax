import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

export interface Chunk {
  id: string
  content: string
  citation: string
  source: string
  similarity: number
}

async function generateEmbedding(query: string): Promise<number[]> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!
  })

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
    dimensions: 1536,
  })

  return response.data[0].embedding
}

export async function retrieve(query: string, topK = 5): Promise<Chunk[]> {
  console.log("Retrieve called with query:", query, "topK:", topK)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  console.log("Supabase client created")

  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query)
  console.log("Query embedding generated")

  // Use vector similarity search via stored function
  const { data, error } = await supabase.rpc('match_rulings', {
    query_embedding: queryEmbedding,
    match_threshold: 0.8,
    match_count: topK
  })

  console.log("Supabase vector search executed")

  if (error) {
    console.error('Vector search error:', error)
    return []
  }

  console.log("Raw data returned:", JSON.stringify(data, null, 2))

  const result = (data as any[]).map(d => ({
    id: d.id,
    content: d.content,
    citation: d.ruling_title || d.citation,
    source: d.ruling_code || d.source,
    similarity: d.similarity
  }))

  console.log("Processed result:", JSON.stringify(result, null, 2))

  return result
}
