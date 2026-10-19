import { useState, useEffect, useRef, useCallback, type FC } from 'react'
import { motion } from 'framer-motion'
import {
  Mic,
  Pause,
  Play,
  Square,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  School,
  BookOpen,
} from 'lucide-react'
import type { Classroom, Course, CurrentBell, SessionStatus } from '../types'
import { api } from '../services/api'
import { AudioVisualizer } from '../components/AudioVisualizer'
import { QuickCreateClassroomModal } from '../components/QuickCreateClassroomModal'
import { QuickCreateCourseModal } from '../components/QuickCreateCourseModal'
import { appleSpring } from '../utils/cn'

interface LiveStudioPageProps {
  classrooms: Classroom[]
  courses: Course[]
  onRefreshData: () => void
  onNavigateToSession: (sessionId: string | number) => void
}

type RecordState = 'IDLE' | 'RECORDING' | 'PAUSED' | 'FINALIZING' | 'COMPLETED'

export const LiveStudioPage: FC<LiveStudioPageProps> = ({
  classrooms,
  courses,
  onRefreshData,
  onNavigateToSession,
}) => {
  // Selection states
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | number>('')
  const [selectedCourseId, setSelectedCourseId] = useState<string | number>('')
  const [sessionTitle, setSessionTitle] = useState('')

  // Modals
  const [isClassModalOpen, setIsClassModalOpen] = useState(false)
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false)

  // Current Bell Auto-detect
  const [currentBell, setCurrentBell] = useState<CurrentBell | null>(null)
  const [bellDismissed, setBellDismissed] = useState(false)

  // Audio Recording states
  const [recordState, setRecordState] = useState<RecordState>('IDLE')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [activeSessionId, setActiveSessionId] = useState<string | number | null>(null)
  const [chunkIndex, setChunkIndex] = useState(0)
  const [processingStatus, setProcessingStatus] = useState<SessionStatus | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Web Audio & MediaRecorder refs
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const timerIntervalRef = useRef<number | null>(null)
  const pollingIntervalRef = useRef<number | null>(null)

  // Initial defaults
  useEffect(() => {
    if (classrooms.length > 0 && !selectedClassroomId) {
      setSelectedClassroomId(classrooms[0].id)
    }
  }, [classrooms, selectedClassroomId])

  const filteredCourses = courses.filter(
    (c) => String(c.classroom) === String(selectedClassroomId)
  )

  useEffect(() => {
    if (filteredCourses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(filteredCourses[0].id)
    } else if (filteredCourses.length > 0 && !filteredCourses.some((c) => String(c.id) === String(selectedCourseId))) {
      setSelectedCourseId(filteredCourses[0].id)
    }
  }, [filteredCourses, selectedCourseId])

  // Fetch current bell
  useEffect(() => {
    api.getCurrentBell().then((bell) => {
      if (bell.detected) {
        setCurrentBell(bell)
      }
    })
  }, [])

  // Auto-generate a sensible Persian default title
  useEffect(() => {
    if (recordState === 'IDLE' && !sessionTitle) {
      const today = new Intl.DateTimeFormat('fa-IR', {
        day: 'numeric',
        month: 'long',
      }).format(new Date())
      const targetCourse = courses.find((c) => String(c.id) === String(selectedCourseId))
      setSessionTitle(`جلسه ${today} — ${targetCourse?.name || 'کلاس درس'}`)
    }
  }, [selectedCourseId, courses, recordState, sessionTitle])

  const handleApplyCurrentBell = () => {
    if (!currentBell || !currentBell.course_id) return
    const course = courses.find((c) => String(c.id) === String(currentBell.course_id))
    if (course) {
      setSelectedClassroomId(course.classroom)
      setSelectedCourseId(course.id)
      setSessionTitle(`زنگ جاری (${currentBell.start_time} تا ${currentBell.end_time}) — ${course.name}`)
      setBellDismissed(true)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio()
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
    }
  }, [])

  const cleanupAudio = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch {
        // Ignore
      }
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    analyserRef.current = null
  }

  // Timer controls
  const startTimer = () => {
    timerIntervalRef.current = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
  }

  const pauseTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
  }

  // Start Recording
  const handleStartRecording = async () => {
    if (!selectedCourseId) {
      setErrorMsg('لطفاً ابتدا یک درس را انتخاب کنید.')
      return
    }

    setErrorMsg(null)
    setElapsedSeconds(0)
    setChunkIndex(0)
    setProcessingStatus(null)

    try {
      // 1. Create session on backend
      const session = await api.createSession({
        course: selectedCourseId,
        title: sessionTitle.trim() || 'جلسه کلاسی ضبط‌شده',
      })
      setActiveSessionId(session.id)

      // 2. Request microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      mediaStreamRef.current = stream

      // 3. Web Audio API AnalyserNode for real frequency waveform
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        const ctx = new AudioCtx()
        audioContextRef.current = ctx
        const source = ctx.createMediaStreamSource(stream)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 128
        analyser.smoothingTimeConstant = 0.8
        source.connect(analyser)
        analyserRef.current = analyser
      }

      // 4. MediaRecorder with 30s chunking interval
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder

      let localSeq = 0
      recorder.ondataavailable = async (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          const currentSeq = localSeq++
          setChunkIndex(currentSeq + 1)
          const formData = new FormData()
          formData.append('audio_file', e.data, `chunk_${currentSeq}.webm`)
          formData.append('chunk_index', String(currentSeq))
          formData.append('duration_seconds', '30')

          try {
            await api.uploadChunk(session.id, formData)
          } catch (err) {
            console.warn(`Chunk ${currentSeq} upload failed:`, err)
          }
        }
      }

      // Start recorder with 30,000ms (30s) timeslice
      recorder.start(30000)
      setRecordState('RECORDING')
      startTimer()
    } catch (err) {
      console.error('Failed to start recording:', err)
      setErrorMsg(
        err instanceof Error ? err.message : 'دسترسی به میکروفون امکان‌پذیر نیست یا رد شد.'
      )
      cleanupAudio()
      setRecordState('IDLE')
    }
  }

  // Pause
  const handlePause = () => {
    if (mediaRecorderRef.current && recordState === 'RECORDING') {
      mediaRecorderRef.current.pause()
      setRecordState('PAUSED')
      pauseTimer()
    }
  }

  // Resume
  const handleResume = () => {
    if (mediaRecorderRef.current && recordState === 'PAUSED') {
      mediaRecorderRef.current.resume()
      setRecordState('RECORDING')
      startTimer()
    }
  }

  // Stop & Finalize
  const handleStop = async () => {
    if (!activeSessionId) return

    pauseTimer()
    setRecordState('FINALIZING')

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch {
        // Ignore
      }
    }

    cleanupAudio()

    // Call finalize
    try {
      await api.finalizeSession(activeSessionId, { sync: false })

      // Start live polling until COMPLETED
      pollStatus(activeSessionId)
    } catch (err) {
      console.error('Finalize error:', err)
      setErrorMsg('خطا در آغاز پردازش هوش مصنوعی.')
      setRecordState('IDLE')
    }
  }

  const pollStatus = useCallback((sessionId: string | number) => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)

    pollingIntervalRef.current = window.setInterval(async () => {
      try {
        const status = await api.getSessionStatus(sessionId)
        setProcessingStatus(status)

        if (status.status === 'COMPLETED') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
          setRecordState('COMPLETED')
          onRefreshData()
        } else if (status.status === 'FAILED') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
          setErrorMsg('پردازش جلسه با خطا مواجه شد.')
          setRecordState('IDLE')
        }
      } catch {
        // Ignore network polling blips
      }
    }, 2000)
  }, [onRefreshData])

  const formatElapsedTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600)
    const mins = Math.floor((totalSecs % 3600) / 60)
    const secs = totalSecs % 60
    const pad = (n: number) => String(n).padStart(2, '0')
    if (hours > 0) return `${pad(hours)}:${pad(mins)}:${pad(secs)}`
    return `${pad(mins)}:${pad(secs)}`
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-4xl mx-auto w-full">
      {/* Auto-Detect Bell Pill Banner */}
      {currentBell && !bellDismissed && recordState === 'IDLE' && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={appleSpring}
          className="mb-8 p-3 px-4.5 rounded-full apple-glass-card flex items-center justify-between gap-4 w-full max-w-lg border-blue-500/20 bg-blue-500/[0.04]"
        >
          <div className="flex items-center gap-2.5 text-xs text-blue-900 dark:text-blue-300">
            <span className="p-1 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
            </span>
            <span className="font-semibold">
              زنگ جاری: {currentBell.course_name} — {currentBell.classroom} ({currentBell.start_time})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setBellDismissed(true)}
              className="text-2xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              رد
            </button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleApplyCurrentBell}
              className="px-3 py-1 rounded-full text-2xs font-bold bg-blue-600 text-white shadow-xs active:scale-95 hover:bg-blue-700 transition-all"
            >
              انتخاب و آماده‌سازی
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Error alert */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5 max-w-md w-full">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" strokeWidth={1.5} />
          <span className="flex-1">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-2xs font-bold underline">
            بستن
          </button>
        </div>
      )}

      {/* Main Studio Card */}
      <motion.div
        layout
        transition={appleSpring}
        className="w-full max-w-xl rounded-3xl apple-glass-card p-6 md:p-8 flex flex-col items-center gap-6 relative overflow-hidden shadow-2xl"
      >
        {/* Context Pickers (Classroom & Course) */}
        {recordState === 'IDLE' && (
          <div className="w-full space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Classroom Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <span className="text-2xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <School className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>کلاس</span>
                  </span>
                  <button
                    onClick={() => setIsClassModalOpen(true)}
                    className="text-2xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                    title="افزودن کلاس جدید"
                  >
                    <Plus className="w-3 h-3" strokeWidth={1.5} />
                    <span>کلاس جدید</span>
                  </button>
                </div>

                <select
                  value={selectedClassroomId}
                  onChange={(e) => setSelectedClassroomId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.07] dark:border-white/[0.08] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                >
                  {classrooms.map((cls) => (
                    <option key={cls.id} value={cls.id} className="dark:bg-zinc-900">
                      {cls.name} ({cls.grade})
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <span className="text-2xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>درس</span>
                  </span>
                  <button
                    onClick={() => setIsCourseModalOpen(true)}
                    className="text-2xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                    title="افزودن درس جدید"
                  >
                    <Plus className="w-3 h-3" strokeWidth={1.5} />
                    <span>درس جدید</span>
                  </button>
                </div>

                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.07] dark:border-white/[0.08] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                >
                  {filteredCourses.map((crs) => (
                    <option key={crs.id} value={crs.id} className="dark:bg-zinc-900">
                      {crs.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Session Title Input */}
            <div>
              <label className="block text-2xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 px-1">
                عنوان جلسه کلاسی
              </label>
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="مثال: جلسه ۴ — حل معادلات درجه دوم"
                className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.07] dark:border-white/[0.08] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        )}

        {/* Real-time Frequency Soundwave Visualizer */}
        <div className="w-full">
          <AudioVisualizer
            analyser={analyserRef.current}
            isRecording={recordState === 'RECORDING'}
            isPaused={recordState === 'PAUSED'}
          />
        </div>

        {/* Elapsed Timer / State Label */}
        <div className="text-center">
          <div className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-zinc-900 dark:text-zinc-100" dir="ltr">
            {formatElapsedTime(elapsedSeconds)}
          </div>
          <div className="mt-2 flex items-center justify-center gap-2">
            {recordState === 'RECORDING' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                در حال ضبط زنگ کلاس ({chunkIndex} قطعه ۳۰ ثانیه‌ای)
              </span>
            )}
            {recordState === 'PAUSED' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Pause className="w-3 h-3" strokeWidth={1.5} />
                توقف موقت ضبط
              </span>
            )}
            {recordState === 'FINALIZING' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Clock className="w-3 h-3 animate-spin" strokeWidth={1.5} />
                در حال نهایی‌سازی و ارسال به موتور هوش مصنوعی...
              </span>
            )}
            {recordState === 'COMPLETED' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                پردازش کامل شد و جزوه آماده است!
              </span>
            )}
            {recordState === 'IDLE' && (
              <span className="text-2xs text-zinc-400 font-medium">
                برای شروع ضبط روی دکمه میکروفون کلیک کنید
              </span>
            )}
          </div>
        </div>

        {/* Minimalist Apple Record Button & Controls */}
        <div className="flex items-center justify-center gap-5 pt-2">
          {recordState === 'IDLE' && (
            <motion.button
              whileTap={{ scale: 0.94 }}
              transition={appleSpring}
              onClick={handleStartRecording}
              className="group relative w-24 h-24 rounded-full bg-white dark:bg-zinc-800 border-4 border-zinc-200 dark:border-zinc-700 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            >
              <span className="w-16 h-16 rounded-full bg-rose-500 shadow-md flex items-center justify-center text-white transition-transform group-hover:scale-95">
                <Mic className="w-7 h-7" strokeWidth={1.8} />
              </span>
            </motion.button>
          )}

          {(recordState === 'RECORDING' || recordState === 'PAUSED') && (
            <div className="flex items-center gap-4">
              {/* Pause / Resume */}
              {recordState === 'RECORDING' ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePause}
                  className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center shadow-md border border-black/[0.06] dark:border-white/[0.08]"
                  title="توقف موقت"
                >
                  <Pause className="w-5 h-5 fill-current" strokeWidth={1.5} />
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleResume}
                  className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md"
                  title="ادامه ضبط"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" strokeWidth={1.5} />
                </motion.button>
              )}

              {/* Stop & Finalize Button */}
              <motion.button
                whileTap={{ scale: 0.94 }}
                transition={appleSpring}
                onClick={handleStop}
                className="w-16 h-16 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center shadow-xl active:scale-95"
                title="اتمام و تولید جزوه"
              >
                <Square className="w-6 h-6 fill-current" strokeWidth={1.5} />
              </motion.button>
            </div>
          )}

          {recordState === 'FINALIZING' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-600 animate-spin" />
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                در حال پردازش گفتار به متن و تدوین جزوه ({processingStatus?.chunks_transcribed || 0} از {processingStatus?.chunks_total || chunkIndex})
              </p>
            </div>
          )}

          {recordState === 'COMPLETED' && (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (activeSessionId) onNavigateToSession(activeSessionId)
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-95 transition-all"
              >
                <span>مشاهده جزوه و نکات امتحانی</span>
                <ArrowRight className="w-4 h-4 rotate-180" strokeWidth={1.5} />
              </motion.button>

              <button
                onClick={() => {
                  setRecordState('IDLE')
                  setSessionTitle('')
                  setActiveSessionId(null)
                }}
                className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                ضبط جلسه جدید
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Modals for Quick Create */}
      <QuickCreateClassroomModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        createAction={api.createClassroom}
        onSuccess={(newCls) => {
          onRefreshData()
          setSelectedClassroomId(newCls.id)
        }}
      />

      <QuickCreateCourseModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        classrooms={classrooms}
        defaultClassroomId={selectedClassroomId}
        createAction={api.createCourse}
        onSuccess={(newCrs) => {
          onRefreshData()
          setSelectedCourseId(newCrs.id)
        }}
      />
    </div>
  )
}
