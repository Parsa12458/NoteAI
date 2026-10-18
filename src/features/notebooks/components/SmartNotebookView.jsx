import { useState } from 'react'
import { Copy, Download, Search, Check } from 'lucide-react'
import { MarkdownRenderer } from './MarkdownRenderer'
import { ExamTipsPanel } from '../../exam-tips/components/ExamTipsPanel'

export function SmartNotebookView({
  notesMarkdown = '',
  examTips = [],
  sessionTitle = '',
  onSeekTimestamp,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCopyAll = () => {
    navigator.clipboard.writeText(notesMarkdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportMarkdown = () => {
    const blob = new Blob([notesMarkdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${sessionTitle || 'lecture-notes'}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Top action toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در متن جزوه..."
            className="w-full pr-10 pl-4 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            title="کپی متن کامل جزوه"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600">کپی شد</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>کپی جزوه</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors shadow-2xs"
            title="دانلود فایل مارک‌داون"
          >
            <Download className="w-3.5 h-3.5" />
            <span>خروجی .md</span>
          </button>
        </div>
      </div>

      {/* Prominent Exam Tips Panel */}
      <ExamTipsPanel examTips={examTips} onSeekTimestamp={onSeekTimestamp} />

      {/* Main Study Notes */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xs">
        <MarkdownRenderer content={notesMarkdown} />
      </div>
    </div>
  )
}

