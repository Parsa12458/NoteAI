import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Mic,
  BookOpen,
  Settings,
  Cloud,
  CloudOff,
  RefreshCw,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
} from 'lucide-react'
import { useSync } from '../../features/sync/hooks/use-sync'
import { useRecorder } from '../../features/recorder/hooks/use-recorder'
import { isMockMode } from '../../lib/api-client'

export function AppLayout({ currentTheme, onToggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isOnline, isSyncing, pendingCount, triggerSync } = useSync()
  const { state: recorderState } = useRecorder()
  const location = useLocation()
  const isMock = isMockMode()

  const isRecordingActive = recorderState === 'recording' || recorderState === 'paused'

  const navLinks = [
    {
      to: '/recorder',
      label: 'ضبط کلاس',
      icon: Mic,
      badge: isRecordingActive ? 'در حال ضبط' : null,
      badgeColor: 'bg-rose-500 animate-pulse',
    },
    {
      to: '/notebooks',
      label: 'کتابخانه دروس و جزوات',
      icon: BookOpen,
    },
    {
      to: '/settings',
      label: 'تنظیمات و حافظه',
      icon: Settings,
    },
  ]

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-vazir">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white md:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="منوی ناوبری"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <NavLink to="/notebooks" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight text-slate-900 dark:text-slate-100">
                  NoteAI
                </span>
                <span className="text-2xs font-semibold text-slate-500 dark:text-slate-400 -mt-1">
                  کلاس هوشمند
                </span>
              </div>
            </NavLink>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname.startsWith(link.to)

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>

                  {link.badge && (
                    <span
                      className={`text-2xs text-white px-2 py-0.5 rounded-full font-sans ${link.badgeColor}`}
                    >
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* Status Indicators & Theme */}
          <div className="flex items-center gap-2.5">
            {/* Mock Mode Pill */}
            {isMock && (
              <span
                className="hidden lg:inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                title="داده‌های نمونه آموزشی فعال است"
              >
                شبیه‌ساز توسعه
              </span>
            )}

            {/* Sync Status Button */}
            {pendingCount > 0 ? (
              <button
                onClick={triggerSync}
                disabled={isSyncing || !isOnline}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
                title="کلیک برای همگام‌سازی دستی قطعات صوتی با سرور"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
                <span>{pendingCount} چانک معلق</span>
              </button>
            ) : (
              <span
                className="hidden sm:inline-flex items-center gap-1 text-2xs text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40"
                title="تمام داده‌ها با سرور همگام هستند"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>همگام</span>
              </span>
            )}

            {/* Online / Offline status */}
            {!isOnline && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 animate-pulse">
                <CloudOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">آفلاین</span>
              </span>
            )}

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="تغییر تم"
            >
              {currentTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname.startsWith(link.to)

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>

                  {link.badge && (
                    <span
                      className={`text-2xs text-white px-2 py-0.5 rounded-full ${link.badgeColor}`}
                    >
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}
