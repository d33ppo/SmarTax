export interface Ruling {
  id: string
  title: string
  citation: string
  source: string
  url: string | null
  published_date: string | null
}

export interface RulingChunk {
  id: string
  ruling_id: string
  content: string
  citation: string
  source: string
  embedding: number[] | null
  created_at: string
}
