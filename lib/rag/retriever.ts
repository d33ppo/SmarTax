import { createClient } from '@supabase/supabase-js'

export interface Chunk {
  id: string
  content: string
  citation: string
  source: string
  similarity: number
}

export async function retrieve(query: string, topK = 5): Promise<Chunk[]> {
  console.log("Retrieve called with query:", query, "topK:", topK)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  console.log("Supabase client created")

  // Search the reliefs_master table for tax context
  const { data, error } = await supabase
    .from('reliefs_master')
    .select('id, name_en, description_en, category, max_amount, lhdn_ref')
    .or(`name_en.ilike.%${query}%,description_en.ilike.%${query}%`)
    .limit(topK)

  console.log("Supabase query executed")

  if (error) {
    console.error('Relief search error:', error)
    return []
  }

<<<<<<< HEAD
  return (data as any[]).map(d => ({
    id: d.id,
    content: `Relief: ${d.name_en}\nCategory: ${d.category}\nDescription: ${d.description_en}\nMax Amount: RM ${d.max_amount}\nReference: ${d.lhdn_ref}`,
    citation: d.name_en,
    source: d.lhdn_ref,
    similarity: 1
=======
  console.log("Raw data returned:", JSON.stringify(data, null, 2))

  const result = (data as any[]).map(d => ({
    ...d,
    similarity: 1 // Placeholder for similarity
>>>>>>> 22fa6b4ef87a8497d5e9892a0bd9de0623dbbceb
  }))

  console.log("Processed result:", JSON.stringify(result, null, 2))

  return result
}
