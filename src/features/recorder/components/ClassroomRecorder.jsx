import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Mic,
  Square,
  Pause,
  Play,
  HardDrive,
  Cloud,
  CloudOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  RefreshCw,
  FileText,
} from 'lucide-react'
import { useRecorder } from '../hooks/use-recorder'
import { useSync } from '../../sync/hooks/use-sync'
import { WaveformCanvas } from './WaveformCanvas'
import { fetchCourses } from '../../../services/courses-api'
import { formatPersianDate, formatDuration } from '../../../utils/date-utils'
import { findSuggestedCourseFromTimetable } from '../../../utils/timetable-utils'

export function ClassroomRecorder() {
  const {
    state: recorderState,
    elapsedMs,
    chunkCount,
    error: recorderError,
    start,
    pause,
    resume,
    stop,
    getFrequencyData,
    clearError,
  } = useRecorder()

  const { isOnline, isSyncing, pendingCount, confirmedCount, triggerSync } = useSync()

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  })

  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [sessionTitle, setSessionTitle] = useState('')
  const [sessionPeriod, setSessionPeriod] = useState('ساعت ۰۸:۰۰ تا ۱۰:۰۰')
  const [suggestedCourseInfo, setSuggestedCourseInfo] = useState(null)
  const [finishedSessionId, setFinishedSessionId] = useState(null)

  // Advise on current course from timetable
  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId && recorderState === 'inactive') {
      const suggestion = findSuggestedCourseFromTimetable(courses)
      if (suggestion) {
        setSuggestedCourseInfo(suggestion)
      } else {
        setSelectedCourseId(courses[0].id)
      }
    }
  }, [courses, selectedCourseId, recorderState])

  const handleApplySuggestion = () => {
    if (suggestedCourseInfo?.course) {
      setSelectedCourseId(suggestedCourseInfo.course.id)
      setSessionPeriod(`${suggestedCourseInfo.slot.startTime} تا ${suggestedCourseInfo.slot.endTime}`)
      setSuggestedCourseInfo(null)
    }
  }

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0]

  const handleStart = async () => {
    if (!selectedCourse) return
    setFinishedSessionId(null)
    clearError()
    const autoTitle = sessionTitle.trim() || `جلسه ضبط‌شده: ${selectedCourse.name} (${formatPersianDate(new Date())})`

    await start({
      courseId: selectedCourse.id,
      courseName: selectedCourse.name,
      title: autoTitle,
      period: sessionPeriod,
    })
  }

  const handleStop = async () => {
    const finalizedId = await stop()
    setFinishedSessionId(finalizedId)
  }

  const isRecording = recorderState === 'recording'
  const isPaused = recorderState === 'paused'
  const isInactive = recorderState === 'inactive' || recorderState === 'stopped'

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-500 text-white shadow-xs">
              <Mic className="w-5 h-5" />
            </span>
            <span>ضبط هوشمند کلاس درس</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ذخیره‌سازی بادوام صوت در حافظه مرورگر با چانک‌های ۵ دقیقه‌ای و تضمین عدم اتلاف داده
          </p>
        </div>

        {/* Connectivity badge */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Cloud className="w-3.5 h-3.5" />
              <span>اتصال برقرار (آنلاین)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <CloudOff className="w-3.5 h-3.5" />
              <span>حالت آفلاین (ذخیره محلی)</span>
            </span>
          )}
        </div>
      </div>

      {/* Advisory Timetable Suggestion Banner */}
      {suggestedCourseInfo && isInactive && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/5 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                پیشنهاد هوشمند برنامه هفتگی: درس «{suggestedCourseInfo.course.name}»
              </p>
              <p className="text-2xs text-indigo-700/80 dark:text-indigo-300/80">
                {suggestedCourseInfo.timeStatus} ({suggestedCourseInfo.dayName}، اتاق {suggestedCourseInfo.slot.room || 'کلاس'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setSuggestedCourseInfo(null)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
            >
              صرف‌نظر
            </button>
            <button
              onClick={handleApplySuggestion}
              className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-2xs"
            >
              انتخاب این درس
            </button>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {recorderError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold">خطا در ضبط صدا</p>
            <p className="mt-0.5">{recorderError}</p>
          </div>
          <button
            onClick={clearError}
            className="text-xs font-semibold text-rose-700 dark:text-rose-300 underline"
          >
            بستن
          </button>
        </div>
      )}

      {/* Setup Form (Active only when inactive) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Course Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              انتخاب درس و سرفصل آموزشی *
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              disabled={!isInactive}
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code}) - {c.instructor}
                </option>
              ))}
            </select>
          </div>

          {/* Session Period Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              بازه زمانی یا زنگ کلاس
            </label>
            <input
              type="text"
              value={sessionPeriod}
              onChange={(e) => setSessionPeriod(e.target.value)}
              disabled={!isInactive}
              placeholder="مثال: ساعت ۰۸:۰۰ تا ۱۰:۰۰"
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            />
          </div>

          {/* Session Title (Full width) */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              عنوان جلسه (اختیاری - در صورت خالی ماندن خودکار نام‌گذاری می‌شود)
            </label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              disabled={!isInactive}
              placeholder="مثال: جلسه ۶: حل تمرینات تبدیل لاپلاس و معادلات با مشتقات جزئی"
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Real Audio Waveform Visualizer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-2xs text-slate-500 font-semibold">
            <span>سیگنال ورودی میکروفون (Web Audio API)</span>
            <span>
              {isRecording ? 'در حال دریافت صوت' : isPaused ? 'مکث ضبط' : 'آماده به کار'}
            </span>
          </div>
          <WaveformCanvas
            getFrequencyData={getFrequencyData}
            isRecording={isRecording}
            isPaused={isPaused}
          />
        </div>

        {/* Center Prominent Elapsed Time & Status */}
        <div className="text-center py-4 space-y-2">
          <div
            className="text-5xl md:text-6xl font-black font-mono tracking-wider text-slate-900 dark:text-slate-100"
            dir="ltr"
          >
            {formatDuration(elapsedMs)}
          </div>

          <div className="flex items-center justify-center gap-2">
            {isRecording && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white" />
                در حال ضبط کلاس
              </span>
            )}
            {isPaused && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white">
                <Pause className="w-3.5 h-3.5" />
                ضبط موقتاً متوقف شده
              </span>
            )}
            {isInactive && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                آماده شروع ضبط
              </span>
            )}
          </div>
        </div>

        {/* Main Recording Actions Bar */}
        <div className="flex items-center justify-center gap-4 pt-2">
          {isInactive ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-black text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Mic className="w-6 h-6 animate-bounce" />
              <span>شروع ضبط کلاس</span>
            </button>
          ) : (
            <>
              {/* Pause / Resume */}
              {isRecording ? (
                <button
                  onClick={pause}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-bold text-amber-900 dark:text-amber-100 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 hover:bg-amber-200 transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  <span>توقف موقت (Pause)</span>
                </button>
              ) : (
                <button
                  onClick={resume}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-bold text-emerald-900 dark:text-emerald-100 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>ادامه ضبط (Resume)</span>
                </button>
              )}

              {/* Stop & Finalize */}
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-bold text-white bg-slate-900 dark:bg-slate-700 hover:bg-black dark:hover:bg-slate-600 transition-colors shadow-xs"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>پایان و ذخیره نهایی جلسه</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Persistence & Sync Metrics Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Local Chunks in IndexedDB */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-2xs">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xs text-slate-400 font-medium">چانک‌های پایدار IndexedDB</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {chunkCount} قطعه محلی
            </p>
          </div>
        </div>

        {/* Sync status */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-2xs">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xs text-slate-400 font-medium">همگام با سرور</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {confirmedCount} چانک تایید شده
            </p>
          </div>
        </div>

        {/* Pending sync */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xs text-slate-400 font-medium">در صف همگام‌سازی</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {pendingCount} قطعه در انتظار
              </p>
            </div>
          </div>

          {pendingCount > 0 && isOnline && (
            <button
              onClick={triggerSync}
              disabled={isSyncing}
              className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
              title="همگام‌سازی دستی"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Finished Session Success Banner */}
      {finishedSessionId && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3 text-right">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                ضبط جلسه با موفقیت نهایی و ذخیره شد
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                تمام فایل‌های صوتی به طور امن در پایگاه داده محلی ذخیره شده و پس از تکمیل رونویسی در میزکار قابل مشاهده‌اند.
              </p>
            </div>
          </div>

          <Link
            to={`/notebooks/${selectedCourse?.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>مشاهده جزوه و رونوشت</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
