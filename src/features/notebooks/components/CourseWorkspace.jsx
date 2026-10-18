import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FileText,
  AlignLeft,
  ChevronRight,
  BookOpen,
  Award,
  PanelRightClose,
  PanelRightOpen,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { fetchCourseById } from '../../../services/courses-api'
import { fetchCourseSessions } from '../../../services/sessions-api'
import { fetchNotebook } from '../../../services/notebooks-api'
import { SessionsSidebar } from './SessionsSidebar'
import { SmartNotebookView } from './SmartNotebookView'
import { TranscriptView } from './TranscriptView'
import { ChatPanel } from '../../chat/components/ChatPanel'
import { QuizModal } from '../../quizzes/components/QuizModal'
import { SummaryModal } from '../../summary/components/SummaryModal'

export function CourseWorkspace() {
  const { courseId } = useParams()

  const [activeTab, setActiveTab] = useState('notes') // 'notes' | 'transcript'
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [seekTargetTimestamp, setSeekTargetTimestamp] = useState(null)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
  const [isLeftAssistantOpen, setIsLeftAssistantOpen] = useState(true)

  // Modals state
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)

  // Fetch Course details
  const { data: course, isLoading: courseLoading, error: courseError } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => fetchCourseById(courseId),
  })

  // Fetch Course Sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions', courseId],
    queryFn: () => fetchCourseSessions(courseId),
  })

  // Determine current active session
  const currentSessionId = selectedSessionId || (sessions.length > 0 ? sessions[0].id : null)

  // Fetch Notebook & Transcript for the selected session
  const { data: notebook, isLoading: notebookLoading } = useQuery({
    queryKey: ['notebook', courseId, currentSessionId],
    queryFn: () => fetchNotebook(courseId, currentSessionId),
    enabled: Boolean(courseId && currentSessionId),
  })

  const handleSeek = (timestampSeconds) => {
    setSeekTargetTimestamp(timestampSeconds)
  }

  if (courseLoading || sessionsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24 text-slate-500">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
          <p className="text-sm font-medium">در حال بارگذاری میزکار و محتوای درس...</p>
        </div>
      </div>
    )
  }

  if (courseError) {
    return (
      <div className="p-8 max-w-lg mx-auto my-12 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-800 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">درس مورد نظر یافت نشد</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{courseError.message}</p>
        <Link
          to="/notebooks"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white"
        >
          بازگشت به کتابخانه دروس
        </Link>
      </div>
    )
  }

  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0]

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] overflow-hidden">
      {/* Top Workspace Bar */}
      <div className="px-6 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/notebooks"
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
          >
            <span>کتابخانه دروس</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {course?.name}
          </span>
          <span className="text-xs text-slate-400">/</span>
          <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 max-w-[280px]">
            {currentSession?.title || 'بدون جلسه'}
          </span>
        </div>

        {/* Panel toggle shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              isRightSidebarOpen
                ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600'
            }`}
            title="نمایش/عدم نمایش ستون جلسات"
          >
            {isRightSidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            <span className="hidden md:inline text-2xs">جلسات</span>
          </button>

          <button
            onClick={() => setIsLeftAssistantOpen(!isLeftAssistantOpen)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              isLeftAssistantOpen
                ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600'
            }`}
            title="نمایش/عدم نمایش دستیار هوش مصنوعی"
          >
            {isLeftAssistantOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            <span className="hidden md:inline text-2xs">دستیار هوشمند</span>
          </button>
        </div>
      </div>

      {/* 3-Column Desktop Workspace */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* Right Column: Sources & Sessions (collapsible) */}
        {isRightSidebarOpen && (
          <div className="w-80 shrink-0 h-full hidden lg:block transition-all">
            <SessionsSidebar
              course={course}
              sessions={sessions}
              selectedSessionId={currentSessionId}
              onSelectSession={(id) => setSelectedSessionId(id)}
              seekTargetTimestamp={seekTargetTimestamp}
            />
          </div>
        )}

        {/* Center Column: Smart Notebook & Transcripts (Widest & Most Comfortable) */}
        <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
          {/* Notebook Navigation Tabs */}
          <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'notes'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>جزوه هوشمند درس</span>
              </button>

              <button
                onClick={() => setActiveTab('transcript')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'transcript'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
                <span>متن کامل تدریس (Transcription)</span>
              </button>
            </div>

            {/* Quick Action Pills for Quiz and Summary */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsQuizOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs transition-colors"
                title="تولید آزمونک ۵ سوالی از این جلسه"
              >
                <Award className="w-3.5 h-3.5" />
                <span>آزمونک ۵ سوالی</span>
              </button>

              <button
                onClick={() => setIsSummaryOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/70 hover:bg-amber-200 border border-amber-300 dark:border-amber-800 transition-colors"
                title="خلاصه ۲ دقیقه‌ای درس"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>مرور ۲ دقیقه‌ای</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {notebookLoading ? (
              <div className="py-20 text-center text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                <p className="text-xs font-medium mt-3">در حال بارگذاری محتوای جلسه و نکات امتحانی...</p>
              </div>
            ) : activeTab === 'notes' ? (
              <SmartNotebookView
                notesMarkdown={notebook?.notesMarkdown}
                examTips={notebook?.examTips}
                sessionTitle={currentSession?.title}
                onSeekTimestamp={handleSeek}
              />
            ) : (
              <TranscriptView
                transcript={notebook?.transcript || []}
                activeTimestamp={seekTargetTimestamp}
                onSeekTimestamp={handleSeek}
              />
            )}
          </div>
        </div>

        {/* Left Column: AI Study Assistant (collapsible) */}
        {isLeftAssistantOpen && (
          <div className="w-88 shrink-0 h-full hidden xl:block transition-all">
            <ChatPanel
              courseId={courseId}
              sessionId={currentSessionId}
              courseName={course?.name}
              sessionTitle={currentSession?.title}
              onSeekTimestamp={handleSeek}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        courseId={courseId}
        sessionId={currentSessionId}
        onSeekTimestamp={handleSeek}
      />

      <SummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        courseId={courseId}
        sessionId={currentSessionId}
      />
    </div>
  )
}
