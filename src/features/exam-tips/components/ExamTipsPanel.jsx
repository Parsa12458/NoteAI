import { useState } from 'react'
import { Flame, Mic, Sparkles, Clock, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'

export function ExamTipsPanel({ examTips = [], onSeekTimestamp }) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (!examTips || examTips.length === 0) {
    return (
      <div className="mb-6 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
        <span>در این جلسه نکته امتحانی صریح یا پرتاکیدی ثبت نشده است.</span>
      </div>
    )
  }

  const explicitCount = examTips.filter((t) => t.type === 'explicit_teacher_statement').length
  const aiCount = examTips.filter((t) => t.type === 'ai_inferred').length

  return (
    <div className="mb-8 rounded-2xl border-2 border-rose-200 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/90 to-amber-50/50 dark:from-rose-950/40 dark:to-slate-900/60 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-rose-100 dark:border-rose-900/40 bg-white/40 dark:bg-rose-950/20 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500 text-white shadow-xs">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-rose-950 dark:text-rose-100">
                شکارچی نکات امتحانی
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-rose-100 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200">
                {explicitCount} صریح استاد • {aiCount} تشخیص هوش مصنوعی
              </span>
            </div>
            <p className="text-xs text-rose-800/80 dark:text-rose-300/80 mt-0.5">
              تفکیک صریح هشدارهای امتحانی استاد از نکات استنتاجی هوش مصنوعی
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg text-rose-700 dark:text-rose-300 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 transition-colors"
          aria-label={isExpanded ? 'بستن پنل نکات امتحانی' : 'باز کردن پنل نکات امتحانی'}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Content list */}
      {isExpanded && (
        <div className="p-4 space-y-3">
          {examTips.map((tip) => {
            const isExplicit = tip.type === 'explicit_teacher_statement'

            return (
              <div
                key={tip.id}
                className={`p-4 rounded-xl border transition-all ${
                  isExplicit
                    ? 'bg-white dark:bg-slate-900/90 border-rose-300 dark:border-rose-800/70 shadow-xs'
                    : 'bg-white/80 dark:bg-slate-900/70 border-amber-200 dark:border-amber-800/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {isExplicit ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500 text-white shadow-2xs">
                        <Mic className="w-3.5 h-3.5" />
                        بیان صریح استاد
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500 text-white shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5" />
                        تشخیص هوش مصنوعی
                      </span>
                    )}

                    {tip.speaker && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {tip.speaker}
                      </span>
                    )}
                  </div>

                  {tip.timestamp && (
                    <button
                      onClick={() => onSeekTimestamp && onSeekTimestamp(tip.timestampSeconds || 0)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-colors"
                      title="پرش به این بخش در صوت و متن تدریس"
                      dir="ltr"
                    >
                      <Clock className="w-3 h-3" />
                      <span>{tip.timestamp}</span>
                    </button>
                  )}
                </div>

                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                  {tip.statement}
                </p>

                {tip.context && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">زمینه بحث: </span>
                    {tip.context}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
