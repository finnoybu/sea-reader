'use client'

import { useEffect, useRef } from 'react'
import { useReader } from '@/lib/reader-context'

interface ReadingProgressTrackerProps {
  chapterSlug: string
}

export default function ReadingProgressTracker({ chapterSlug }: ReadingProgressTrackerProps) {
  const { preferences, updateReadingPosition } = useReader()
  const containerRef = useRef<HTMLDivElement>(null)
  const isRestoringRef = useRef(true)

  // Restore scroll position on mount
  useEffect(() => {
    if (preferences.currentChapter === chapterSlug && typeof preferences.scrollPosition === 'number') {
      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        window.scrollTo(0, preferences.scrollPosition!)
        isRestoringRef.current = false
      }, 100)
      return () => clearTimeout(timer)
    }
    isRestoringRef.current = false
  }, [chapterSlug, preferences.currentChapter, preferences.scrollPosition])

  // Track scroll position changes
  useEffect(() => {
    if (isRestoringRef.current) return

    const handleScroll = () => {
      updateReadingPosition(chapterSlug, window.scrollY)
    }

    const throttledScroll = (() => {
      let lastCall = 0
      return () => {
        const now = Date.now()
        if (now - lastCall >= 500) {
          handleScroll()
          lastCall = now
        }
      }
    })()

    window.addEventListener('scroll', throttledScroll, { passive: true })
    return () => window.removeEventListener('scroll', throttledScroll)
  }, [chapterSlug, updateReadingPosition])

  return <div ref={containerRef} />
}
