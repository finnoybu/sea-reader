import { getAllChapters, getChapterBySlug } from './chapters'

export interface SearchResult {
  id: number
  title: string
  slug: string
  excerpt: string
  chapterIndex: number
}

export function searchChapters(query: string): SearchResult[] {
  if (!query.trim()) {
    return []
  }

  const lowerQuery = query.toLowerCase()
  const chapters = getAllChapters()
  const results: SearchResult[] = []

  for (const chapter of chapters) {
    const chapterData = getChapterBySlug(chapter.slug)
    if (!chapterData) continue

    // Search in title
    if (chapter.title.toLowerCase().includes(lowerQuery)) {
      results.push({
        id: chapter.id,
        title: chapter.title,
        slug: chapter.slug,
        excerpt: chapter.title,
        chapterIndex: chapters.indexOf(chapter),
      })
      continue
    }

    // Search in content (match whole sentence containing the query)
    const lines = chapterData.content.split('\n')
    for (const line of lines) {
      if (line.toLowerCase().includes(lowerQuery)) {
        // Strip HTML tags and truncate
        const cleanLine = line.replace(/<[^>]*>/g, '').trim()
        if (cleanLine.length > 0) {
          // Check if we already added this chapter (avoid duplicates)
          const existing = results.find((r) => r.slug === chapter.slug)
          if (!existing) {
            results.push({
              id: chapter.id,
              title: chapter.title,
              slug: chapter.slug,
              excerpt: cleanLine.substring(0, 100) + (cleanLine.length > 100 ? '...' : ''),
              chapterIndex: chapters.indexOf(chapter),
            })
            break // Only one result per chapter
          }
        }
      }
    }
  }

  return results.slice(0, 20) // Limit to 20 results
}
