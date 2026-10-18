import { useState, useEffect, useCallback } from 'react'
import {
  Settings,
  HardDrive,
  Trash2,
  ShieldCheck,
  Moon,
  Sun,
  RefreshCw,
  CheckCircle2,
  Database,
  Sliders,
} from 'lucide-react'
import {
  getStorageStats,
  purgeConfirmedChunks,
  getSetting,
  setSetting,
} from '../../../lib/indexed-db'
import { isMockMode, setMockMode, checkServerHealth, getApiBaseUrl } from '../../../lib/api-client'
import { formatBytes } from '../../../utils/date-utils'

export function SettingsView({ currentTheme, onThemeChange }) {
  const [stats, setStats] = useState(null)
  const [purging, setPurging] = useState(false)
  const [purgeResult, setPurgeResult] = useState(null)
  const [persistentStatus, setPersistentStatus] = useState(false)
  const [mockModeActive, setMockModeActive] = useState(isMockMode())
  const [serverOnline, setServerOnline] = useState(null)
  const [audioDevices, setAudioDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState('')
  const [chunkIntervalSec, setChunkIntervalSec] = useState(300) // 5 minutes

  const loadStats = useCallback(async () => {
    const s = await getStorageStats()
    setStats(s)
    setPersistentStatus(s.isPersistent)
  }, [])

  const loadPreferences = useCallback(async () => {
    const interval = await getSetting('chunk_interval_sec', 300)
    setChunkIntervalSec(Number(interval))
  }, [])

  const checkHealth = useCallback(async () => {
    const online = await checkServerHealth()
    setServerOnline(online)
  }, [])

  const loadDevices = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const mics = devices.filter((d) => d.kind === 'audioinput')
        setAudioDevices(mics)
        if (mics.length > 0) setSelectedDevice(mics[0].deviceId)
      } catch {
        // Ignore device enumeration issues
      }
    }
  }, [])

  useEffect(() => {
    loadStats()
    loadPreferences()
    checkHealth()
    loadDevices()
  }, [loadStats, loadPreferences, checkHealth, loadDevices])

  const handlePurge = async () => {
    setPurging(true)
    setPurgeResult(null)
    try {
      const result = await purgeConfirmedChunks()
      setPurgeResult(result)
      await loadStats()
    } finally {
      setPurging(false)
    }
  }

  const handleRequestPersistence = async () => {
    if (navigator.storage && navigator.storage.persist) {
      const granted = await navigator.storage.persist()
      setPersistentStatus(granted)
      await loadStats()
    }
  }

  const handleMockToggle = (enabled) => {
    setMockMode(enabled)
    setMockModeActive(enabled)
  }

  const handleIntervalChange = async (e) => {
    const val = Number(e.target.value)
    setChunkIntervalSec(val)
    await setSetting('chunk_interval_sec', val)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
            <Settings className="w-5 h-5" />
          </span>
          <span>تنظیمات و مدیریت حافظه محلی</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          مدیریت پایگاه داده مرورگر (IndexedDB)، زمان‌بندی چانک‌های صوتی و پیکربندی اتصال به سرور
        </p>
      </div>

      {/* Backend Integration & Environment Status */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                وضعیت اتصال به سرور FastAPI و منبع داده
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono" dir="ltr">
                {getApiBaseUrl()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {serverOnline === true ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" /> سرور آنلاین
              </span>
            ) : serverOnline === false ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                عدم پاسخ سرور زنده
              </span>
            ) : null}

            <button
              onClick={checkHealth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              title="بررسی مجدد سرور"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Development Fixtures Toggle */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              حالت داده‌های پیش‌فرض تست توسعه (Development Fixtures)
            </p>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
              در صورت فعال بودن، دروس نمونه (ریاضی مهندسی، مدارها، هوش مصنوعی) به صورت شبیه‌سازی‌شده در دسترس خواهند بود.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={mockModeActive}
              onChange={(e) => handleMockToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>

      {/* Storage Management Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              مدیریت فضای ذخیره‌سازی آفلاین (IndexedDB)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              آمار دقیق حجم چانک‌های صوتی ضبط شده در این مرورگر
            </p>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <span className="text-2xs text-slate-400 block mb-1">کل جلسات محلی</span>
              <span className="text-lg font-black text-slate-900 dark:text-slate-100">
                {stats.totalSessions} جلسه
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <span className="text-2xs text-slate-400 block mb-1">چانک‌های صوتی</span>
              <span className="text-lg font-black text-slate-900 dark:text-slate-100">
                {stats.totalChunks} قطعه
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <span className="text-2xs text-slate-400 block mb-1">در صف ارسال</span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                {stats.pendingChunks} چانک
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <span className="text-2xs text-slate-400 block mb-1">حجم صوت ذخیره‌شده</span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                {formatBytes(stats.totalAudioBytes)}
              </span>
            </div>
          </div>
        )}

        {/* Persistence Protection Alert */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-indigo-950 dark:text-indigo-200">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <p className="font-bold">حفاظت دائمی از دیتابیس محلی (Persistent Storage)</p>
              <p className="text-2xs text-indigo-700/80 dark:text-indigo-300/80 mt-0.5">
                {persistentStatus
                  ? 'مرورگر مجوز نگهداری دائمی داده‌ها بدون پاکسازی خودکار حافظه را تایید کرده است.'
                  : 'درخواست از مرورگر برای تضمین عدم پاکسازی داده‌ها در مواقع کمبود حافظه دیسک.'}
              </p>
            </div>
          </div>

          {!persistentStatus && (
            <button
              onClick={handleRequestPersistence}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs self-end sm:self-auto shrink-0"
            >
              درخواست ماندگاری
            </button>
          )}
        </div>

        {/* Safe Purge Action */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              پاکسازی فایل‌های صوتی تایید شده توسط سرور
            </h3>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
              فقط قطعاتی که دریافت کامل آن‌ها توسط سرور تایید شده حذف می‌شوند. چانک‌های معلق هرگز حذف نخواهند شد.
            </p>
          </div>

          <button
            onClick={handlePurge}
            disabled={purging || (stats?.confirmedChunks || 0) === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 disabled:opacity-40 transition-colors self-start sm:self-auto shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>{purging ? 'در حال آزادسازی...' : 'پاکسازی چانک‌های تاییدشده'}</span>
          </button>
        </div>

        {purgeResult && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs">
            تعداد {purgeResult.deletedCount} چانک صوتی تاییدشده با موفقیت پاکسازی شد ({formatBytes(purgeResult.freedBytes)} فضای دیسک آزاد گردید).
          </div>
        )}
      </div>

      {/* Recording Parameters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              پیکربندی چانک‌های ضبط و ورودی میکروفون
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تنظیم طول برش فایل‌های صوتی و انتخاب دستگاه ورودی صدا
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              بازه هدف تولید قطعات صوتی (Chunk Interval)
            </label>
            <select
              value={chunkIntervalSec}
              onChange={handleIntervalChange}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value={30}>۳۰ ثانیه (تست سریع)</option>
              <option value={60}>۱ دقیقه (تست)</option>
              <option value={300}>۵ دقیقه (پیش‌فرض استاندارد کلاس)</option>
              <option value={600}>۱۰ دقیقه</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              میکروفون انتخابی
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              {audioDevices.length === 0 ? (
                <option value="">میکروفون پیش‌فرض سیستم</option>
              ) : (
                audioDevices.map((dev) => (
                  <option key={dev.deviceId} value={dev.deviceId}>
                    {dev.label || `میکروفون ${dev.deviceId.substring(0, 8)}...`}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            پوسته و ظاهر برنامه
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            انتخاب تم روشن (Warm Light) یا حالت تاریک (Deep Slate)
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => onThemeChange('light')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentTheme === 'light'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>روشن</span>
          </button>

          <button
            onClick={() => onThemeChange('dark')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentTheme === 'dark'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>تاریک</span>
          </button>
        </div>
      </div>
    </div>
  )
}
