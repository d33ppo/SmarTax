import { glmClient } from '../glm/client'

export async function embed(text: string): Promise<number[]> {
  const embeddings = await glmClient.embed(text)
  return embeddings[0]
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  return await glmClient.embed(texts)
}
