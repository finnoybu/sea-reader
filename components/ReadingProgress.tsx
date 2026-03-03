'use client'

import { useEffect, useState } from 'react'
import { useReader } from '@/lib/reader-context'

export default function ReadingProgress() {
  const { preferences } = useReader()
  const [chapters, setChapters] = useState<number>(0)
  const [currentIndex, setCurrentIndex] = useState<number>(-1)

  // Fetch chapter count from API or use a static value
  useEffect(() => {
    // This would ideally come from an API call, but for now we'll use a reasonable estimate
    // In production, this could be a server action or API route
    async function loadChapters() {
      // For now, use hardcoded value (69 chapters from content)
      setChapters(69)

      if (preferences.currentChapter) {
        // Make an API call to get the chapter index
        try {
          const response = await fetch(`/api/chapters?slug=${preferences.currentChapter}`)
          if (response.ok) {
            const data = await response.json()
            setCurrentIndex(data.index)
          }
        } catch (error) {
          console.error('Failed to load chapter index:', error)
        }
      }
    }

    loadChapters()
  }, [preferences.currentChapter])

  if (!preferences.currentChapter || currentIndex === -1) {
    return null
  }

  const progress = ((currentIndex + 1) / chapters) * 100

  return (
    <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Progress
        </span>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {currentIndex + 1} of {chapters}
        </span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
        <div
          className="bg-blue-500 h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
        {Math.round(progress)}% through manuscript
      </p>
    </div>
  )
}
