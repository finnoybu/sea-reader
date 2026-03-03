import { searchChapters } from '@/lib/search'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')

  if (!query || query.trim().length === 0) {
    return NextResponse.json([], { status: 200 })
  }

  const results = searchChapters(query)
  return NextResponse.json(results)
}
