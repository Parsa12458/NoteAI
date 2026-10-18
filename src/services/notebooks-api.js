import { apiRequest, isMockMode } from '../lib/api-client'
import { MOCK_NOTEBOOKS } from './mock-data'
import { getSession } from '../lib/indexed-db'

export async function fetchNotebook(courseId, sessionId) {
  if (isMockMode()) {
    // If mock data exists for this sessionId, return it
    if (MOCK_NOTEBOOKS[sessionId]) {
      return MOCK_NOTEBOOKS[sessionId]
    }

    // Check if it's a locally recorded session in IndexedDB
    try {
      const localSession = await getSession(sessionId)
      if (localSession) {
        return {
          sessionId: localSession.id,
          courseId: localSession.courseId,
          title: localSession.title || 'جلسه ضبط شده محلی',
          lectureDate: new Date(localSession.createdAt).toLocaleDateString('fa-IR'),
          status: localSession.status === 'finalized' ? 'processing' : 'recording',
          lastProcessed: localSession.updatedAt,
          examTips: [],
          notesMarkdown: `> [!NOTE]
> این جلسه به صورت محلی در مرورگر ضبط شده است (تعداد چانک‌ها: ${localSession.totalChunks || 0}).
> پس از ارسال کامل به سرور و پردازش با موتور هوش مصنوعی، جزوه ساختاریافته، فرمول‌ها و نکات کلیدی در اینجا ظاهر خواهند شد.`,
          transcript: [],
        }
      }
    } catch {
      // Fallback
    }

    // Default fallback to session-math-5 if browsing directly
    return MOCK_NOTEBOOKS['session-math-5']
  }

  return apiRequest(`/courses/${courseId}/sessions/${sessionId}/notebook`)
}

