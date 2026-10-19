import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  School,
  Calendar,
  Clock,
  Search,
  Download,
  Copy,
  Check,
  Flame,
  Sparkles,
  CheckCircle2,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { api } from '../services/api'
import { MarkdownView } from '../components/MarkdownView'
import { MinimalAudioPlayer } from '../components/MinimalAudioPlayer'
import { appleSpring, appleSnappySpring } from '../utils/cn'

export const ArchiveLibraryPage = ({
  classrooms,
  courses,
  targetSessionId,
  onClearTargetSession,
}) => {
  // Column 1: Classroom selection
  const [selectedClassroomId, setSelectedClassroomId] = useState(
    classrooms[0]?.id || ''
  )
  const [classSearch, setClassSearch] = useState('')

  // Column 2: Course & Session selection
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [sessions, setSessions] = useState([])
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [sessionsLoading, setSessionsLoading] = useState(false)

  // Column 3: Note inspection
  const [currentNote, setCurrentNote] = useState(null)
  const [noteLoading, setNoteLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('notes')
  const [transcriptSearch, setTranscriptSearch] = useState('')
  const [copied, setCopied] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)

  // Set initial selections
  useEffect(() => {
    if (classrooms.length > 0 && !selectedClassroomId) {
      setSelectedClassroomId(classrooms[0].id)
    }
  }, [classrooms, selectedClassroomId])

  const filteredClassrooms = classrooms.filter((c) =>
    c.name.toLowerCase().includes(classSearch.toLowerCase())
  )

  const classroomCourses = courses.filter(
    (c) => String(c.classroom) === String(selectedClassroomId)
  )

  useEffect(() => {
    if (classroomCourses.length > 0) {
      setSelectedCourseId(classroomCourses[0].id)
    } else {
      setSelectedCourseId('')
      setSessions([])
      setSelectedSessionId(null)
    }
  }, [selectedClassroomId])

  // Load course sessions
  useEffect(() => {
    if (selectedCourseId) {
      setSessionsLoading(true)
      api
        .getCourseSessions(selectedCourseId)
        .then((data) => {
          setSessions(data)
          if (data.length > 0 && !selectedSessionId) {
            setSelectedSessionId(data[0].id)
          }
        })
        .finally(() => setSessionsLoading(false))
    }
  }, [selectedCourseId])

  // Handle direct navigation to targetSessionId from live recording
  useEffect(() => {
    if (targetSessionId) {
      setSelectedSessionId(targetSessionId)
      if (onClearTargetSession) onClearTargetSession()
    }
  }, [targetSessionId, onClearTargetSession])

  // Load Note for selected session
  useEffect(() => {
    if (selectedSessionId) {
      setNoteLoading(true)
      api
        .getNoteBySession(selectedSessionId)
        .then((note) => setCurrentNote(note))
        .finally(() => setNoteLoading(false))
    }
  }, [selectedSessionId])

  const activeSession = sessions.find((s) => String(s.id) === String(selectedSessionId))

  const handleCopyMarkdown = () => {
    if (!currentNote) return
    navigator.clipboard.writeText(currentNote.content_markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadMarkdown = async () => {
    if (!currentNote) return
    const blob = await api.downloadNoteMarkdown(currentNote.id || currentNote.session)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentNote.title || 'NoteAi-lecture-note'}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filteredTranscriptLines = (currentNote?.transcript || '')
    .split('\n')
    .filter((line) => line.toLowerCase().includes(transcriptSearch.toLowerCase()))

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* ================= COLUMN 1: CLASSROOMS SIDEBAR ================= */}
        {!isFocusMode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={appleSpring}
            className="w-64 shrink-0 rounded-3xl apple-glass-card p-4 hidden md:flex flex-col gap-3 shadow-lg"
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <School className="w-4 h-4 text-blue-500" strokeWidth={1.5} />
                <span>کلاس‌ها و پایه‌ها</span>
              </span>
              <span className="text-2xs text-zinc-400 font-mono font-bold">
                {classrooms.length}
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
              <input
                type="text"
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
                placeholder="جستجوی کلاس..."
                className="w-full pr-8 pl-3 py-1.5 text-xs rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-zinc-800 dark:text-zinc-200 focus:outline-hidden"
              />
            </div>

            {/* Classrooms List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
              {filteredClassrooms.map((cls) => {
                const isSelected = String(cls.id) === String(selectedClassroomId)
                return (
                  <motion.button
                    key={cls.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedClassroomId(cls.id)}
                    className={`w-full text-right p-3 rounded-2xl transition-all text-xs flex flex-col gap-1 relative ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md font-bold'
                        : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{cls.name}</span>
                      <span
                        className={`text-2xs px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-black/[0.05] dark:bg-white/[0.08] text-zinc-500'
                        }`}
                      >
                        {cls.grade}
                      </span>
                    </div>
                    <span
                      className={`text-2xs ${
                        isSelected ? 'text-blue-100' : 'text-zinc-400'
                      }`}
                    >
                      {cls.courses_count || 0} درس تعریف‌شده
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ================= COLUMN 2: COURSES & SESSIONS LIST ================= */}
        {!isFocusMode && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={appleSpring}
            className="w-80 shrink-0 rounded-3xl apple-glass-card p-4 hidden lg:flex flex-col gap-3 shadow-lg"
          >
            {/* Courses Segmented Pills */}
            <div>
              <span className="text-2xs font-semibold text-zinc-400 block mb-2 px-1">
                دروس این کلاس
              </span>
              <div className="flex flex-wrap gap-1.5">
                {classroomCourses.map((crs) => {
                  const isSelected = String(crs.id) === String(selectedCourseId)
                  return (
                    <button
                      key={crs.id}
                      onClick={() => setSelectedCourseId(crs.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                          : 'bg-black/[0.03] dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: crs.color || '#3B82F6' }}
                      />
                      <span>{crs.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="h-px bg-black/[0.06] dark:bg-white/[0.08] my-1" />

            {/* Sessions List */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between text-2xs font-semibold text-zinc-400 px-1 mb-2">
                <span>جلسات کلاسی ({sessions.length})</span>
                {sessionsLoading && <span className="animate-spin text-blue-500">⏳</span>}
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                {sessions.length === 0 ? (
                  <div className="p-8 text-center text-zinc-400 text-xs">
                    هنوز جلسه‌ای برای این درس ضبط نشده است.
                  </div>
                ) : (
                  sessions.map((sess) => {
                    const isSelected = String(sess.id) === String(selectedSessionId)
                    const isCompleted = sess.status === 'COMPLETED'
                    const isTranscribing = sess.status === 'TRANSCRIBING' || sess.status === 'PENDING'

                    return (
                      <motion.button
                        key={sess.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedSessionId(sess.id)}
                        className={`w-full text-right p-3.5 rounded-2xl transition-all text-xs flex flex-col gap-1.5 ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-500/30 text-blue-950 dark:text-blue-100 shadow-xs ring-1 ring-blue-500/20'
                            : 'border border-black/[0.04] dark:border-white/[0.06] hover:bg-black/[0.02] dark:hover:bg-white/[0.03] text-zinc-800 dark:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold line-clamp-1">{sess.title}</span>
                          {isCompleted ? (
                            <span className="p-0.5 rounded-full text-emerald-500" title="آماده مطالعه">
                              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </span>
                          ) : isTranscribing ? (
                            <span className="text-2xs text-amber-500 font-semibold animate-pulse">
                              در حال پردازش
                            </span>
                          ) : (
                            <span className="text-2xs text-rose-500 font-semibold">
                              خطا
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-2xs text-zinc-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" strokeWidth={1.5} />
                            <span>{sess.created_at || 'تاریخ نامشخص'}</span>
                          </span>
                          {sess.duration_seconds ? (
                            <span className="font-mono" dir="ltr">
                              {Math.floor(sess.duration_seconds / 60)} دقیقه
                            </span>
                          ) : null}
                        </div>
                      </motion.button>
                    )
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= COLUMN 3: MAIN INSPECTION PANEL ================= */}
        <div className="flex-1 flex flex-col rounded-3xl apple-glass-card overflow-hidden shadow-2xl relative">
          {/* Header Action Bar */}
          <div className="p-4 px-6 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-4 bg-white/40 dark:bg-zinc-900/40">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFocusMode(!isFocusMode)}
                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-zinc-500 transition-colors"
                title={isFocusMode ? 'نمایش منوهای کناری' : 'حالت تمرکز (تمام صفحه)'}
              >
                {isFocusMode ? (
                  <Minimize2 className="w-4 h-4" strokeWidth={1.5} />
                ) : (
                  <Maximize2 className="w-4 h-4" strokeWidth={1.5} />
                )}
              </button>

              <div>
                <h1 className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                  {activeSession?.title || 'جلسه‌ای انتخاب نشده است'}
                </h1>
                <p className="text-2xs text-zinc-500 dark:text-zinc-400">
                  {activeSession?.course_name} — {activeSession?.classroom_name}
                </p>
              </div>
            </div>

            {/* Actions: Download & Copy Markdown */}
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyMarkdown}
                disabled={!currentNote}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-zinc-800 dark:text-zinc-200 transition-all active:scale-95 disabled:opacity-40"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} />
                    <span className="text-emerald-600 dark:text-emerald-400">کپی شد</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>کپی جزوه</span>
                  </>
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadMarkdown}
                disabled={!currentNote}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all active:scale-95 disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="hidden sm:inline">دانلود جزوه (.md)</span>
              </motion.button>
            </div>
          </div>

          {/* Minimal Audio Player */}
          {activeSession?.audio_file_url && (
            <div className="px-6 py-3 border-b border-black/[0.05] dark:border-white/[0.06] bg-black/[0.01] dark:bg-white/[0.02]">
              <MinimalAudioPlayer
                audioUrl={activeSession.audio_file_url}
                title={`صوت زنگ کلاس — ${activeSession.title}`}
              />
            </div>
          )}

          {/* Apple Segmented Tabs Control */}
          <div className="px-6 py-2.5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-3 bg-black/[0.015] dark:bg-white/[0.02]">
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/[0.05] dark:bg-white/[0.06]">
              {[
                { id: 'notes', label: '📝 جزوه هوشمند' },
                { id: 'exam_tips', label: '🎯 نکات امتحانی' },
                { id: 'transcript', label: '🗣 متن تدریس' },
                { id: 'summary', label: '⚡️ خلاصه سریع' },
              ].map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      isActive
                        ? 'text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        transition={appleSnappySpring}
                        className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-xl shadow-xs"
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {activeTab === 'transcript' && (
              <div className="relative w-48 hidden sm:block">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                <input
                  type="text"
                  value={transcriptSearch}
                  onChange={(e) => setTranscriptSearch(e.target.value)}
                  placeholder="جستجو در سخنان..."
                  className="w-full pr-8 pl-3 py-1 text-2xs rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08]"
                />
              </div>
            )}
          </div>

          {/* Tab Content Display */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 selectable-text">
            {noteLoading ? (
              <div className="py-24 text-center text-zinc-400 text-xs">
                در حال بارگذاری محتوای جلسه و نکات...
              </div>
            ) : !currentNote ? (
              <div className="py-24 text-center text-zinc-400 text-xs">
                محتوایی برای این جلسه یافت نشد.
              </div>
            ) : activeTab === 'notes' ? (
              <div className="max-w-3xl mx-auto space-y-6">
                <MarkdownView content={currentNote.content_markdown} />
              </div>
            ) : activeTab === 'exam_tips' ? (
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="mb-4">
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-rose-500" strokeWidth={1.5} />
                    <span>شکارچی نکات امتحانی (Exam Tips Hunter)</span>
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    جملات و هشدارهای پرتاکید استاد به همراه پیش‌بینی سوالات احتمالی آزمون
                  </p>
                </div>

                {currentNote.exam_tips && currentNote.exam_tips.length > 0 ? (
                  currentNote.exam_tips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-3xl apple-glass-card border-rose-500/20 bg-rose-500/[0.03] space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-2xs font-bold ${
                            tip.importance === 'بسیار مهم'
                              ? 'bg-rose-500 text-white'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {tip.importance}
                        </span>

                        {tip.timestamp && (
                          <span className="font-mono text-2xs text-zinc-400 flex items-center gap-1" dir="ltr">
                            <Clock className="w-3 h-3" strokeWidth={1.5} />
                            <span>{tip.timestamp}</span>
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-relaxed">
                        {tip.statement}
                      </p>

                      {tip.context && (
                        <p className="text-2xs text-zinc-500 dark:text-zinc-400 bg-black/[0.02] dark:bg-white/[0.04] p-2 rounded-xl">
                          زمینه بحث: {tip.context}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-zinc-400 text-xs">
                    نکته امتحانی ثبت‌شده‌ای وجود ندارد.
                  </div>
                )}
              </div>
            ) : activeTab === 'transcript' ? (
              <div className="max-w-2xl mx-auto space-y-3 font-mono text-xs">
                {filteredTranscriptLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 leading-relaxed"
                  >
                    {line}
                  </div>
                ))}
              </div>
            ) : (
              /* Executive Summary */
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="p-6 rounded-3xl apple-glass-card border-blue-500/20 bg-blue-500/[0.02] space-y-3">
                  <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" strokeWidth={1.5} />
                    <span>خلاصه فشرده ۳ دقیقه‌ای زنگ کلاس</span>
                  </h3>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {currentNote.executive_summary}
                  </p>
                </div>

                {currentNote.key_topics && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      سرفصل‌ها و مفاهیم اصلی بحث‌شده:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentNote.key_topics.map((topic, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2"
                        >
                          <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xs">
                            {i + 1}
                          </span>
                          <span>{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

