import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, BookOpen, Sun, Moon, Sparkles } from 'lucide-react'
import type { Classroom, Course } from './types'
import { api } from './services/api'
import { LiveStudioPage } from './pages/LiveStudioPage'
import { ArchiveLibraryPage } from './pages/ArchiveLibraryPage'
import { appleSnappySpring } from './utils/cn'

export default function App() {
  const [activeView, setActiveView] = useState<'studio' | 'archive'>('studio')
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [targetSessionId, setTargetSessionId] = useState<string | number | null>(null)

  // Theme support
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('noteai_apple_theme')
      if (saved === 'dark' || saved === 'light') return saved
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('noteai_apple_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  // Load Classrooms and Courses
  const loadData = async () => {
    const [cls, crs] = await Promise.all([api.getClassrooms(), api.getCourses()])
    setClassrooms(cls)
    setCourses(crs)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleNavigateToSession = (sessionId: string | number) => {
    setTargetSessionId(sessionId)
    setActiveView('archive')
  }

  return (
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7] flex flex-col font-vazir antialiased">
      {/* Apple Translucent Top Bar */}
      <header className="sticky top-0 z-40 apple-glass h-16 px-4 md:px-8 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08]">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-bold tracking-tight">NoteAi</span>
        </div>

        {/* Apple Segmented Control Navigation */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/[0.05] dark:bg-white/[0.08] border border-black/[0.04] dark:border-white/[0.06]">
          <button
            onClick={() => setActiveView('studio')}
            className={`relative px-4 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeView === 'studio'
                ? 'text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            {activeView === 'studio' && (
              <motion.div
                layoutId="mainNavIndicator"
                transition={appleSnappySpring}
                className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-xl shadow-xs"
              />
            )}
            <Mic className="w-3.5 h-3.5 relative z-10" strokeWidth={1.5} />
            <span className="relative z-10">استودیو ضبط زنگ کلاسی</span>
          </button>

          <button
            onClick={() => setActiveView('archive')}
            className={`relative px-4 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeView === 'archive'
                ? 'text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            {activeView === 'archive' && (
              <motion.div
                layoutId="mainNavIndicator"
                transition={appleSnappySpring}
                className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-xl shadow-xs"
              />
            )}
            <BookOpen className="w-3.5 h-3.5 relative z-10" strokeWidth={1.5} />
            <span className="relative z-10">آرشیو کلاس‌ها و جلسات</span>
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-full apple-glass flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
          aria-label="تغییر حالت شب و روز"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
          ) : (
            <Moon className="w-4 h-4" strokeWidth={1.5} />
          )}
        </button>
      </header>

      {/* Main View Router with Spring Animations */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {activeView === 'studio' ? (
            <motion.div
              key="studio"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col justify-center"
            >
              <LiveStudioPage
                classrooms={classrooms}
                courses={courses}
                onRefreshData={loadData}
                onNavigateToSession={handleNavigateToSession}
              />
            </motion.div>
          ) : (
            <motion.div
              key="archive"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              <ArchiveLibraryPage
                classrooms={classrooms}
                courses={courses}
                targetSessionId={targetSessionId}
                onClearTargetSession={() => setTargetSessionId(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
