'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface SearchResult {
  id: number
  title: string
  slug: string
  excerpt: string
  chapterIndex: number
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!query.trim()) {
        setResults([])
        return
      }

      setIsLoading(true)
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data)
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
        })
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-500">
        <span className="text-slate-400">🔍</span>
        <input
          type="text"
          placeholder="Search chapters..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
        />
        {isLoading && <span className="text-xs text-slate-400">searching...</span>}
      </div>

      {isOpen && (query.trim() || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {results.map((result) => (
                <Link
                  key={result.slug}
                  href={`/chapters/${result.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">
                    {result.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {result.excerpt}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    Chapter {result.chapterIndex + 1}
                  </div>
                </Link>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No chapters found matching &quot;{query}&quot;
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
