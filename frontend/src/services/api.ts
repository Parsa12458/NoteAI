import axios from 'axios'
import type { Classroom, Course, CurrentBell, Note, Session, SessionStatus } from '../types'
import { INITIAL_CLASSROOMS, INITIAL_COURSES, INITIAL_NOTES, INITIAL_SESSIONS } from './mockData'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Local in-memory state fallback when Django server is not actively running
let localClassrooms = [...INITIAL_CLASSROOMS]
let localCourses = [...INITIAL_COURSES]
let localSessions = [...INITIAL_SESSIONS]
const localNotes = { ...INITIAL_NOTES }

export const api = {
  // ---------------- CLASSROOMS ----------------
  async getClassrooms(): Promise<Classroom[]> {
    try {
      const res = await apiClient.get<Classroom[]>('/classrooms/')
      return res.data
    } catch {
      return localClassrooms
    }
  },

  async createClassroom(payload: { name: string; grade: string; academic_year: string }): Promise<Classroom> {
    try {
      const res = await apiClient.post<Classroom>('/classrooms/', payload)
      return res.data
    } catch {
      const newCls: Classroom = {
        id: Date.now(),
        name: payload.name,
        grade: payload.grade,
        academic_year: payload.academic_year || '1403-1404',
        courses_count: 0,
        sessions_count: 0,
      }
      localClassrooms = [newCls, ...localClassrooms]
      return newCls
    }
  },

  // ---------------- COURSES ----------------
  async getCourses(): Promise<Course[]> {
    try {
      const res = await apiClient.get<Course[]>('/courses/')
      return res.data
    } catch {
      return localCourses
    }
  },

  async createCourse(payload: {
    name: string
    classroom: string | number
    color?: string
    description?: string
  }): Promise<Course> {
    try {
      const res = await apiClient.post<Course>('/courses/', payload)
      return res.data
    } catch {
      const targetClassroom = localClassrooms.find((c) => String(c.id) === String(payload.classroom))
      const newCourse: Course = {
        id: Date.now(),
        name: payload.name,
        classroom: payload.classroom,
        classroom_name: targetClassroom?.name || 'کلاس عمومی',
        color: payload.color || '#3B82F6',
        description: payload.description || '',
        sessions_count: 0,
      }
      localCourses = [newCourse, ...localCourses]
      if (targetClassroom) {
        targetClassroom.courses_count = (targetClassroom.courses_count || 0) + 1
      }
      return newCourse
    }
  },

  async getCurrentBell(): Promise<CurrentBell> {
    try {
      const res = await apiClient.get<CurrentBell>('/courses/current_bell/')
      return res.data
    } catch {
      // Return detected bell for testing
      const course = localCourses[0]
      return {
        detected: true,
        course_id: course.id,
        course_name: course.name,
        classroom: course.classroom_name || 'کلاس ۱۰۱',
        start_time: '08:30',
        end_time: '10:00',
      }
    }
  },

  // ---------------- SESSIONS & RECORDING ----------------
  async createSession(payload: { course: string | number; title: string }): Promise<Session> {
    try {
      const res = await apiClient.post<Session>('/sessions/', payload)
      return res.data
    } catch {
      const targetCourse = localCourses.find((c) => String(c.id) === String(payload.course))
      const newSession: Session = {
        id: Date.now(),
        course: payload.course,
        course_name: targetCourse?.name,
        classroom_name: targetCourse?.classroom_name,
        title: payload.title,
        created_at: new Date().toLocaleDateString('fa-IR'),
        status: 'RECORDING',
        duration_seconds: 0,
        has_note: false,
        has_quiz: false,
      }
      localSessions = [newSession, ...localSessions]
      return newSession
    }
  },

  async uploadChunk(sessionId: string | number, formData: FormData): Promise<{ status: string; chunk_index: number }> {
    try {
      const res = await apiClient.post(`/sessions/${sessionId}/chunks/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data
    } catch {
      const chunkIdx = Number(formData.get('chunk_index') || 0)
      return { status: 'acknowledged', chunk_index: chunkIdx }
    }
  },

  async finalizeSession(sessionId: string | number, payload: { sync?: boolean } = { sync: false }): Promise<{ status: string }> {
    try {
      const res = await apiClient.post(`/sessions/${sessionId}/finalize/`, payload)
      return res.data
    } catch {
      const sess = localSessions.find((s) => String(s.id) === String(sessionId))
      if (sess) {
        sess.status = 'TRANSCRIBING'
        setTimeout(() => {
          sess.status = 'COMPLETED'
          sess.has_note = true
          // Seed note
          if (!localNotes[sess.id]) {
            localNotes[sess.id] = {
              id: Date.now(),
              session: sess.id,
              title: `جزوه هوشمند ${sess.title}`,
              executive_summary: `خلاصه اختصاصی جلسه تدریس «${sess.title}». کلیه نکات فرمول‌بندی و کلیدی در این مبحث ساختاریافته شده است.`,
              key_topics: ['تعاریف مقدماتی', 'فرمول‌ها و قضایای اصلی', 'مثال‌های تدریس‌شده'],
              exam_tips: [
                {
                  statement: 'استاد روی حل مسئله نمونه اول تاکید زیادی کردند.',
                  importance: 'بسیار مهم',
                  timestamp: '00:14:20',
                },
              ],
              content_markdown: `# ${sess.title}\n\n## نکات کلیدی تدریس\n\n- این جزوه به طور خودکار توسط موتور هوش مصنوعی تولید شده است.\n- فرمول‌های ریاضی و نکات تدریس شده در زیر ثبت شده است.\n\n$$\\int f(x) dx = F(x) + C$$`,
              transcript: `[00:00:10] استاد: سلام به همگی. مبحث امروز را شروع می‌کنیم.\n[00:15:30] استاد: حتماً این بخش رو برای امتحان مرور کنید.`,
            }
          }
        }, 3500)
      }
      return { status: 'processing_started' }
    }
  },

  async getSessionStatus(sessionId: string | number): Promise<SessionStatus> {
    try {
      const res = await apiClient.get<SessionStatus>(`/sessions/${sessionId}/status/`)
      return res.data
    } catch {
      const sess = localSessions.find((s) => String(s.id) === String(sessionId))
      return {
        status: sess?.status || 'COMPLETED',
        chunks_total: 2,
        chunks_transcribed: sess?.status === 'COMPLETED' ? 2 : 1,
        has_note: Boolean(localNotes[sessionId] || sess?.has_note),
        has_quiz: Boolean(sess?.has_quiz),
      }
    }
  },

  async getCourseSessions(courseId: string | number): Promise<Session[]> {
    try {
      const res = await apiClient.get<Session[]>(`/sessions/?course_id=${courseId}`)
      return res.data
    } catch {
      return localSessions.filter((s) => String(s.course) === String(courseId))
    }
  },

  // ---------------- NOTES ----------------
  async getNoteBySession(sessionId: string | number): Promise<Note> {
    try {
      const res = await apiClient.get<Note>(`/notes/by-session/${sessionId}/`)
      return res.data
    } catch {
      const found = localNotes[sessionId]
      if (found) return found
      // Fallback default note
      return INITIAL_NOTES[1001]
    }
  },

  async downloadNoteMarkdown(noteId: string | number): Promise<Blob> {
    try {
      const res = await apiClient.get(`/notes/${noteId}/download/`, {
        responseType: 'blob',
      })
      return res.data
    } catch {
      const note = Object.values(localNotes).find((n) => String(n.id) === String(noteId)) || INITIAL_NOTES[1001]
      return new Blob([note.content_markdown], { type: 'text/markdown;charset=utf-8' })
    }
  },
}
