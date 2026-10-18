import { useState, useEffect, useCallback } from 'react'
import { X, CheckCircle2, XCircle, Award, RotateCcw, AlertTriangle, RefreshCw, Clock } from 'lucide-react'
import { fetchQuiz } from '../../../services/ai-api'
import { MarkdownRenderer } from '../../notebooks/components/MarkdownRenderer'

export function QuizModal({ isOpen, onClose, courseId, sessionId, onSeekTimestamp }) {
  const [quizData, setQuizData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userAnswers, setUserAnswers] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const loadQuiz = useCallback(async () => {
    setLoading(true)
    setError(null)
    setIsSubmitted(false)
    setUserAnswers({})
    try {
      const data = await fetchQuiz({ courseId, sessionId })
      setQuizData(data)
    } catch (err) {
      setError(err.message || 'خطا در بارگذاری یا تولید آزمونک از محتوای این جلسه.')
    } finally {
      setLoading(false)
    }
  }, [courseId, sessionId])

  useEffect(() => {
    if (isOpen) {
      loadQuiz()
    } else {
      setUserAnswers({})
      setIsSubmitted(false)
      setError(null)
    }
  }, [isOpen, loadQuiz])

  if (!isOpen) return null

  const handleSelect = (questionId, optionIndex) => {
    if (isSubmitted) return
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }))
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
  }

  const handleRetry = () => {
    setUserAnswers({})
    setIsSubmitted(false)
  }

  const questions = quizData?.questions || []
  const answeredCount = Object.keys(userAnswers).length

  // Calculate score
  let correctCount = 0
  if (isSubmitted && questions.length > 0) {
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount++
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              آزمونک یادگیری ۵ سوالی
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              سنجش میزان تسلط بر مفاهیم تدریس شده در جلسه
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
              <p className="text-sm font-medium">هوش مصنوعی در حال تحلیل متن درس و تدوین ۵ سوال آزمایشی است...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>عدم امکان تولید آزمونک</span>
              </div>
              <p className="text-xs">{error}</p>
              <button
                onClick={loadQuiz}
                className="mt-2 text-xs font-semibold text-rose-700 dark:text-rose-300 underline"
              >
                تلاش مجدد
              </button>
            </div>
          )}

          {!loading && !error && quizData && (
            <>
              {/* Score banner if submitted */}
              {isSubmitted && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        نتیجه ارزیابی آزمونک
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        پاسخ‌های صحیح: {correctCount} از {questions.length} سوال ({(correctCount / questions.length) * 100}٪)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>تلاش دوباره</span>
                  </button>
                </div>
              )}

              {/* Questions list */}
              <div className="space-y-6">
                {questions.map((q, qIndex) => {
                  const selectedOpt = userAnswers[q.id]
                  const isCorrect = isSubmitted && selectedOpt === q.correctIndex

                  return (
                    <div
                      key={q.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isSubmitted
                          ? isCorrect
                            ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20'
                            : 'border-rose-300 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          سوال {qIndex + 1}
                        </span>

                        {isSubmitted && (
                          <div className="flex items-center gap-1 text-xs font-semibold">
                            {isCorrect ? (
                              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> پاسخ درست
                              </span>
                            ) : (
                              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                <XCircle className="w-4 h-4" /> نادرست
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 leading-relaxed">
                        <MarkdownRenderer content={q.text} />
                      </div>

                      {/* Options */}
                      <div className="space-y-2">
                        {q.options.map((opt, optIndex) => {
                          const isOptionSelected = selectedOpt === optIndex
                          const isOptionCorrect = isSubmitted && optIndex === q.correctIndex
                          const isOptionSelectedWrong = isSubmitted && isOptionSelected && !isCorrect

                          let optStyles = 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-slate-50/50 dark:bg-slate-800/40'
                          if (isOptionSelected && !isSubmitted) {
                            optStyles = 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-600'
                          } else if (isOptionCorrect) {
                            optStyles = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500 font-semibold'
                          } else if (isOptionSelectedWrong) {
                            optStyles = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 ring-1 ring-rose-500'
                          }

                          return (
                            <button
                              key={optIndex}
                              type="button"
                              onClick={() => handleSelect(q.id, optIndex)}
                              disabled={isSubmitted}
                              className={`w-full text-right p-3 rounded-xl border transition-all text-xs flex items-center justify-between gap-3 ${optStyles}`}
                            >
                              <div className="flex-1">
                                <MarkdownRenderer content={opt} />
                              </div>
                              <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0">
                                {isOptionSelected && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                              </span>
                            </button>
                          )
                        })}
                      </div>

                      {/* Explanation & Source timestamp */}
                      {isSubmitted && q.explanation && (
                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-900/40 p-3 rounded-xl">
                          <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                            توضیح تشریحی استاد:
                          </p>
                          <MarkdownRenderer content={q.explanation} />

                          {q.sourceTimestamp && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-2xs text-slate-500">محل تدریس در صوت:</span>
                              <button
                                onClick={() => {
                                  onClose()
                                  if (onSeekTimestamp) onSeekTimestamp(q.sourceTimestamp)
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-mono font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 transition-colors"
                                dir="ltr"
                              >
                                <Clock className="w-3 h-3" />
                                <span>{q.sourceTimestamp}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {!isSubmitted && questions.length > 0 && (
              <span>
                {answeredCount} از {questions.length} سوال پاسخ داده شده
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
            >
              بستن
            </button>

            {!isSubmitted && questions.length > 0 && (
              <button
                onClick={handleSubmit}
                disabled={answeredCount === 0}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-xs transition-colors"
              >
                ثبت و محاسبه نمره
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
