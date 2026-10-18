import { apiRequest, isMockMode } from '../lib/api-client'
import { MOCK_SESSIONS } from './mock-data'
import { getSessionsByCourse, getSession } from '../lib/indexed-db'

export async function fetchCourseSessions(courseId) {
  // Always query IndexedDB for locally recorded sessions for this course
  let localDbSessions = []
  try {
    localDbSessions = await getSessionsByCourse(courseId)
  } catch (err) {
    console.warn('Failed to read local sessions from IndexedDB:', err)
  }

  if (isMockMode()) {
    const mockList = MOCK_SESSIONS[courseId] || []
    // Combine local sessions with mock sessions (deduplicate by id)
    const existingIds = new Set(localDbSessions.map((s) => s.id))
    const filteredMock = mockList.filter((m) => !existingIds.has(m.id))
    return [...localDbSessions, ...filteredMock]
  }

  // Production mode: fetch from FastAPI and augment with any local pending state
  const remoteSessions = await apiRequest(`/courses/${courseId}/sessions`)
  const remoteMap = new Map(remoteSessions.map((s) => [s.id, s]))

  // Merge local status
  for (const local of localDbSessions) {
    if (!remoteMap.has(local.id)) {
      remoteSessions.unshift(local)
    }
  }

  return remoteSessions
}

export async function fetchSessionById(sessionId) {
  // Check local IndexedDB first
  try {
    const local = await getSession(sessionId)
    if (local) return local
  } catch {
    // Ignore
  }

  if (isMockMode()) {
    for (const list of Object.values(MOCK_SESSIONS)) {
      const found = list.find((s) => s.id === sessionId)
      if (found) return found
    }
    throw new Error(`جلسه با شناسه "${sessionId}" یافت نشد.`)
  }

  return apiRequest(`/sessions/${sessionId}`)
}

export async function registerRemoteSession(sessionPayload) {
  if (isMockMode()) {
    return {
      sessionId: `srv_${sessionPayload.id || Date.now()}`,
      localSessionId: sessionPayload.id,
      status: 'recording',
      createdAt: new Date().toISOString(),
    }
  }

  return apiRequest('/sessions', {
    method: 'POST',
    body: sessionPayload,
  })
}

export async function finalizeRemoteSession(sessionId, metadata) {
  if (isMockMode()) {
    return {
      sessionId,
      status: 'processing',
      finalizedAt: new Date().toISOString(),
      message: 'جلسه پایان یافت و وارد صف تبدیل گفتار به متن شد.',
    }
  }

  return apiRequest(`/sessions/${sessionId}/finalize`, {
    method: 'POST',
    body: metadata,
  })
}

