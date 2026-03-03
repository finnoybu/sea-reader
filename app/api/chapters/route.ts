import { getChapterIndex, getAllChapters } from '@/lib/chapters'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'slug required' }, { status: 400 })
  }

  const index = getChapterIndex(slug)
  const chapters = getAllChapters()

  return NextResponse.json({
    index,
    total: chapters.length,
  })
}
