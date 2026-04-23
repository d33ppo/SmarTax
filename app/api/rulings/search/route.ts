import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { retrieve } from '@/lib/rag/retriever'

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get('q')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '5')

    if (!query) {
      return NextResponse.json({ error: 'Missing query parameter q' }, { status: 400 })
    }

    const results = await retrieve(query, Math.min(limit, 20))

    return NextResponse.json({ results })
  } catch (err) {
    console.error('rulings search error:', err)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
