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

  // Search the reliefs_master table for tax context
  const { data, error } = await supabase
    .from('reliefs_master')
    .select('id, name_en, description_en, category, max_amount, lhdn_ref')
    .or(`name_en.ilike.%${query}%,description_en.ilike.%${query}%`)
    .limit(topK)

  if (error) {
    console.error('Relief search error:', error)
    return []
  }

  return (data as any[]).map(d => ({
    id: d.id,
    content: `Relief: ${d.name_en}\nCategory: ${d.category}\nDescription: ${d.description_en}\nMax Amount: RM ${d.max_amount}\nReference: ${d.lhdn_ref}`,
    citation: d.name_en,
    source: d.lhdn_ref,
    similarity: 1
  }))
}
