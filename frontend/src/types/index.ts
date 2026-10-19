export interface Classroom {
  id: string | number
  name: string
  grade: string
  academic_year: string
  courses_count?: number
  sessions_count?: number
}

export interface Course {
  id: string | number
  name: string
  classroom: string | number
  classroom_name?: string
  color: string
  description: string
  sessions_count?: number
}

export interface CurrentBell {
  detected: boolean
  course_id?: string | number
  course_name?: string
  classroom?: string
  start_time?: string
  end_time?: string
}

export interface Session {
  id: string | number
  course: string | number
  course_name?: string
  classroom_name?: string
  title: string
  created_at?: string
  status: 'RECORDING' | 'PENDING' | 'TRANSCRIBING' | 'COMPLETED' | 'FAILED'
  duration_seconds?: number
  audio_file_url?: string
  has_note?: boolean
  has_quiz?: boolean
}

export interface SessionStatus {
  status: 'RECORDING' | 'PENDING' | 'TRANSCRIBING' | 'COMPLETED' | 'FAILED'
  chunks_total: number
  chunks_transcribed: number
  has_note: boolean
  has_quiz: boolean
}

export interface ExamTip {
  statement: string
  importance: 'بسیار مهم' | 'تاکید مکرر' | 'احتمال آزمون'
  timestamp?: string
  context?: string
}

export interface Note {
  id?: string | number
  session: string | number
  title: string
  content_markdown: string
  executive_summary: string
  key_topics: string[]
  exam_tips: ExamTip[]
  transcript?: string
}

