import { useState, useRef, useEffect } from 'react'
import {
  Calendar,
  Clock,
  Play,
  Pause,
  Volume2,
  CheckCircle2,
  CloudUpload,
  Search,
  Flame,
} from 'lucide-react'
import { formatPersianDate, formatDuration } from '../../../utils/date-utils'

export function SessionsSidebar({
  course,
  sessions = [],
  selectedSessionId,
  onSelectSession,
  seekTargetTimestamp = null,
}) {
  const [search, setSearch] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  const activeSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0]

  // Handle external seek requests (from exam tips, transcript, quiz timestamps)
  useEffect(() => {
    if (seekTargetTimestamp !== null && audioRef.current) {
      audioRef.current.currentTime = seekTargetTimestamp
      audioRef.current.play().catch(() => {})
      setIsPlaying(true)
    }
  }, [seekTargetTimestamp])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch(() => {})
      setIsPlaying(true)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e) => {
    const target = Number(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = target
      setCurrentTime(target)
    }
  }

  const filteredSessions = sessions.filter((s) =>
    (s.title || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      {/* Course Info Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: course?.color || '#4f46e5' }}
          />
          <span className="text-2xs font-bold text-slate-500 uppercase font-mono" dir="ltr">
            {course?.code}
          </span>
        </div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
          {course?.name}
        </h2>
        <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
          مدرس: {course?.instructor}
        </p>
      </div>

      {/* Audio Player for Selected Session */}
      <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5" />
            پخش صوت تدریس کلاس
          </span>
          <span className="text-2xs font-mono text-indigo-700 dark:text-indigo-300" dir="ltr">
            {formatDuration(currentTime, true)} / {formatDuration(duration || activeSession?.durationSeconds || 0, true)}
          </span>
        </div>

        {/* Hidden Audio element for playback */}
        <audio
          ref={audioRef}
          src={activeSession?.audioUrl || 'https://actions.google.com/sounds/v1/ambiences/outdoor_water_fountain.ogg'}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />

        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-colors shrink-0"
            title={isPlaying ? 'مکث' : 'پخش'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <input
            type="range"
            min={0}
            max={duration || activeSession?.durationSeconds || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-indigo-200 dark:bg-indigo-900 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>
      </div>

      {/* Sessions Filter Search */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی جلسه..."
            className="w-full pr-8 pl-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="flex items-center justify-between text-2xs font-bold text-slate-400 px-1 mb-1">
          <span>فهرست جلسات ضبط‌شده</span>
          <span>{sessions.length} جلسه</span>
        </div>

        {filteredSessions.map((session) => {
          const isSelected = session.id === activeSession?.id
          const hasExamTips = (session.examTipsCount || 0) > 0

          return (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`w-full text-right p-3 rounded-xl border transition-all text-xs flex flex-col gap-1.5 ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/90 dark:bg-indigo-950/70 text-indigo-950 dark:text-indigo-100 ring-1 ring-indigo-600'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold line-clamp-1">{session.title}</span>
                {hasExamTips && (
                  <span className="p-1 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300" title="دارای نکات امتحانی">
                    <Flame className="w-3 h-3" />
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-2xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatPersianDate(session.date || session.createdAt)}</span>
                </div>

                <div className="flex items-center gap-1 font-mono" dir="ltr">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(session.durationSeconds || session.durationMs || 0, !session.durationMs)}</span>
                </div>
              </div>

              {/* Status tags */}
              <div className="flex items-center gap-1.5 mt-0.5">
                {session.syncStatus === 'synced' ? (
                  <span className="inline-flex items-center gap-1 text-2xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> همگام با سرور
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-2xs text-amber-600 dark:text-amber-400">
                    <CloudUpload className="w-3 h-3" /> حافظه محلی
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
