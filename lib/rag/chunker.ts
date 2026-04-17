export interface Chunk {
  content: string
  citation: string
  source: string
}

export function chunkText(
  text: string,
  source: string,
  citation: string,
  chunkSize = 500,
  overlap = 50
): Chunk[] {
  const words = text.split(/\s+/)
  const chunks: Chunk[] = []

  let i = 0
  while (i < words.length) {
    const chunkWords = words.slice(i, i + chunkSize)
    const content = chunkWords.join(' ')

    if (content.trim().length > 50) {
      chunks.push({ content, citation, source })
    }

    i += chunkSize - overlap
  }

  return chunks
}
