import { useState, useEffect, useMemo } from 'react'
import { RouterProvider } from 'react-router-dom'
import { createAppRouter } from './router'

export function App() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('noteai_theme')
      if (saved) return saved
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
    try {
      localStorage.setItem('noteai_theme', theme)
    } catch {
      // Ignore
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const router = useMemo(
    () =>
      createAppRouter({
        currentTheme: theme,
        onThemeChange: setTheme,
        onToggleTheme: toggleTheme,
      }),
    [theme]
  )

  return <RouterProvider router={router} />
}

