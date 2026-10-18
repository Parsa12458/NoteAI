import { useState, useEffect, useCallback } from 'react'
import { X, BookOpen, Clock, Volume2, Square, Pause, RefreshCw, AlertCircle, Info } from 'lucide-react'
import { fetchSummary } from '../../../services/ai-api'
import { MarkdownRenderer } from '../../notebooks/components/MarkdownRenderer'

export function SummaryModal({ isOpen, onClose, courseId, sessionId }) {
  const [summaryData, setSummaryData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    setIsPaused(false)
  }, [])

  const loadSummary = useCallback(async () => {
    setLoading(true)
    setError(null)
    stopSpeech()
    try {
      const data = await fetchSummary({ courseId, sessionId })
      setSummaryData(data)
    } catch (err) {
      setError(err.message || 'خطا در تولید مرور ۲ دقیقه‌ای درس.')
    } finally {
      setLoading(false)
    }
  }, [courseId, sessionId, stopSpeech])

  useEffect(() => {
    if (isOpen) {
      loadSummary()
    } else {
      stopSpeech()
    }
  }, [isOpen, loadSummary, stopSpeech])

  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause()
      setIsPaused(true)
      return
    }

    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
      return
    }

    const textToRead = `${summaryData?.title || ''}. نکات کلیدی: ${summaryData?.bulletPoints?.join('. ') || ''}. ${summaryData?.fullText || ''}`
    const utterance = new SpeechSynthesisUtterance(textToRead)
    utterance.lang = 'fa-IR'
    utterance.rate = 1.0

    utterance.onend = () => {
      setIsSpeaking(false)
      setIsPaused(false)
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
      setIsPaused(false)
    }

    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
    setIsPaused(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                مرور فوق‌فشرده ۲ دقیقه‌ای
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                جمع‌بندی مهم‌ترین نکات آموزشی جهت مرور سریع پیش از آزمون
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopSpeech()
              onClose()
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
              <p className="text-sm font-medium">در حال خلاصه‌سازی و گزینش نکات کلیدی تدریس...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>عدم امکان تولید مرور درس</span>
              </div>
              <p className="text-xs">{error}</p>
            </div>
          )}

          {!loading && !error && summaryData && (
            <>
              {/* Timing badge & audio bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-200">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>زمان تخمینی مطالعه: {summaryData.estimatedReadingTime || '۲ دقیقه'}</span>
                </div>

                {/* Speech Synthesis / Audio review */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleSpeech}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-2xs"
                  >
                    {isSpeaking && !isPaused ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>توقف موقت</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>شنیدن صوتی</span>
                      </>
                    )}
                  </button>

                  {isSpeaking && (
                    <button
                      onClick={stopSpeech}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                      title="قطع کامل خوانش"
                    >
                      <Square className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Accurate disclaimer about audio synthesis */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-2xs text-slate-500 dark:text-slate-400">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p>
                  قابلیت «شنیدن صوتی» از موتور تبدیل متن به گفتار محلی مرورگر شما (SpeechSynthesis) استفاده می‌کند و یک صدای واقعی ضبط‌شده یا سنتز هوش مصنوعی سرور نیست.
                </p>
              </div>

              {/* Bullet points */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                  نکات کلیدی و سرخط مباحث:
                </h3>
                <ul className="space-y-2.5">
                  {summaryData.bulletPoints?.map((point, idx) => (
                    <li
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 flex items-center justify-center shrink-0 text-2xs font-bold">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <MarkdownRenderer content={point} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Full narrative summary */}
              {summaryData.fullText && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                    متن پیوسته خلاصه درس:
                  </h3>
                  <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    <p className="whitespace-pre-wrap">{summaryData.fullText}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-end">
          <button
            onClick={() => {
              stopSpeech()
              onClose()
            }}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  )
}
