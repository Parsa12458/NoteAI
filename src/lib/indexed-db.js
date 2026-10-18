import { openDB } from 'idb'

const DB_NAME = 'noteai_db'
const DB_VERSION = 1

/**
 * Initializes and returns the IndexedDB instance.
 */
export async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Sessions store
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' })
        sessionStore.createIndex('by_course', 'courseId', { unique: false })
        sessionStore.createIndex('by_status', 'status', { unique: false })
        sessionStore.createIndex('by_created', 'createdAt', { unique: false })
      }

      // Chunks store
      if (!db.objectStoreNames.contains('chunks')) {
        const chunkStore = db.createObjectStore('chunks', { keyPath: 'id' })
        chunkStore.createIndex('by_session', 'sessionId', { unique: false })
        chunkStore.createIndex('by_status', 'uploadStatus', { unique: false })
        chunkStore.createIndex('by_session_seq', ['sessionId', 'sequence'], { unique: true })
      }

      // Settings & Timetable store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' })
      }
    },
  })
}

// ----------------- SESSIONS OPERATIONS -----------------

export async function saveSession(session) {
  const db = await getDb()
  const now = new Date().toISOString()
  const record = {
    ...session,
    updatedAt: now,
    createdAt: session.createdAt || now,
    totalChunks: session.totalChunks ?? 0,
    uploadedChunks: session.uploadedChunks ?? 0,
    syncStatus: session.syncStatus || 'local_only', // 'local_only' | 'syncing' | 'synced' | 'failed'
  }
  await db.put('sessions', record)
  return record
}

export async function getSession(sessionId) {
  const db = await getDb()
  return db.get('sessions', sessionId)
}

export async function getAllSessions() {
  const db = await getDb()
  const sessions = await db.getAll('sessions')
  return sessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function getSessionsByCourse(courseId) {
  const db = await getDb()
  const sessions = await db.getAllFromIndex('sessions', 'by_course', courseId)
  return sessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function updateSession(sessionId, updates) {
  const db = await getDb()
  const session = await db.get('sessions', sessionId)
  if (!session) {
    throw new Error(`Session with ID "${sessionId}" not found.`)
  }
  const updated = {
    ...session,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  await db.put('sessions', updated)
  return updated
}

// ----------------- CHUNKS OPERATIONS -----------------

export async function saveChunk(chunk) {
  if (!chunk.id) {
    throw new Error('Chunk must have a unique id.')
  }
  if (!chunk.sessionId) {
    throw new Error('Chunk must reference a sessionId.')
  }
  if (typeof chunk.sequence !== 'number') {
    throw new Error('Chunk must have a numerical sequence number.')
  }

  const db = await getDb()
  const record = {
    ...chunk,
    createdAt: chunk.createdAt || new Date().toISOString(),
    uploadStatus: chunk.uploadStatus || 'pending', // 'pending' | 'uploading' | 'uploaded' | 'failed'
    uploadAttempts: chunk.uploadAttempts ?? 0,
    size: chunk.blob ? chunk.blob.size : (chunk.size || 0),
  }

  await db.put('chunks', record)

  // Update session totalChunks counter atomically
  const session = await db.get('sessions', chunk.sessionId)
  if (session) {
    const allSessionChunks = await db.getAllFromIndex('chunks', 'by_session', chunk.sessionId)
    const uploadedCount = allSessionChunks.filter((c) => c.uploadStatus === 'uploaded').length
    session.totalChunks = allSessionChunks.length
    session.uploadedChunks = uploadedCount
    session.updatedAt = new Date().toISOString()
    if (session.totalChunks > 0 && session.uploadedChunks === session.totalChunks && session.status === 'finalized') {
      session.syncStatus = 'synced'
    }
    await db.put('sessions', session)
  }

  return record
}

export async function getChunk(chunkId) {
  const db = await getDb()
  return db.get('chunks', chunkId)
}

export async function getChunksBySession(sessionId) {
  const db = await getDb()
  const chunks = await db.getAllFromIndex('chunks', 'by_session', sessionId)
  return chunks.sort((a, b) => a.sequence - b.sequence)
}

export async function getPendingChunks() {
  const db = await getDb()
  const all = await db.getAll('chunks')
  return all
    .filter((c) => c.uploadStatus === 'pending' || c.uploadStatus === 'failed')
    .sort((a, b) => a.sequence - b.sequence)
}

export async function updateChunkStatus(chunkId, uploadStatus, metadata = {}) {
  const db = await getDb()
  const chunk = await db.get('chunks', chunkId)
  if (!chunk) {
    throw new Error(`Chunk "${chunkId}" not found.`)
  }

  const updatedChunk = {
    ...chunk,
    uploadStatus,
    uploadAttempts: uploadStatus === 'uploading' ? (chunk.uploadAttempts || 0) + 1 : chunk.uploadAttempts,
    serverChunkId: metadata.serverChunkId ?? chunk.serverChunkId,
    lastError: metadata.lastError !== undefined ? metadata.lastError : chunk.lastError,
    confirmedAt: uploadStatus === 'uploaded' ? new Date().toISOString() : chunk.confirmedAt,
  }

  await db.put('chunks', updatedChunk)

  // Update parent session's count
  const session = await db.get('sessions', chunk.sessionId)
  if (session) {
    const allSessionChunks = await db.getAllFromIndex('chunks', 'by_session', chunk.sessionId)
    const uploadedCount = allSessionChunks.filter((c) => c.uploadStatus === 'uploaded').length
    session.uploadedChunks = uploadedCount
    if (session.status === 'finalized') {
      if (uploadedCount === allSessionChunks.length && allSessionChunks.length > 0) {
        session.syncStatus = 'synced'
      } else if (allSessionChunks.some((c) => c.uploadStatus === 'failed')) {
        session.syncStatus = 'failed'
      } else {
        session.syncStatus = 'syncing'
      }
    }
    session.updatedAt = new Date().toISOString()
    await db.put('sessions', session)
  }

  return updatedChunk
}

/**
 * Safely purges ONLY server-acknowledged chunks to free local storage.
 * Unacknowledged/pending/failed chunks are NEVER touched.
 */
export async function purgeConfirmedChunks() {
  const db = await getDb()
  const allChunks = await db.getAll('chunks')
  const confirmedChunks = allChunks.filter((c) => c.uploadStatus === 'uploaded')
  let deletedCount = 0
  let freedBytes = 0

  const tx = db.transaction('chunks', 'readwrite')
  for (const chunk of confirmedChunks) {
    freedBytes += chunk.size || (chunk.blob ? chunk.blob.size : 0)
    await tx.store.delete(chunk.id)
    deletedCount++
  }
  await tx.done

  return { deletedCount, freedBytes }
}

export async function getStorageStats() {
  const db = await getDb()
  const allSessions = await db.getAll('sessions')
  const allChunks = await db.getAll('chunks')

  let totalAudioBytes = 0
  let pendingChunksCount = 0
  let confirmedChunksCount = 0

  for (const chunk of allChunks) {
    const size = chunk.size || (chunk.blob ? chunk.blob.size : 0)
    totalAudioBytes += size
    if (chunk.uploadStatus === 'uploaded') {
      confirmedChunksCount++
    } else {
      pendingChunksCount++
    }
  }

  let browserStorage = { quota: null, usage: null }
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate()
      browserStorage = {
        quota: estimate.quota || null,
        usage: estimate.usage || null,
      }
    } catch {
      // Ignore estimation errors in restricted contexts
    }
  }

  let isPersistent = false
  if (navigator.storage && navigator.storage.persisted) {
    try {
      isPersistent = await navigator.storage.persisted()
    } catch {
      // Ignore
    }
  }

  return {
    totalSessions: allSessions.length,
    totalChunks: allChunks.length,
    pendingChunks: pendingChunksCount,
    confirmedChunks: confirmedChunksCount,
    totalAudioBytes,
    browserStorage,
    isPersistent,
  }
}

// ----------------- SETTINGS OPERATIONS -----------------

export async function getSetting(key, defaultValue = null) {
  try {
    const db = await getDb()
    const record = await db.get('settings', key)
    return record ? record.value : defaultValue
  } catch {
    return defaultValue
  }
}

export async function setSetting(key, value) {
  const db = await getDb()
  await db.put('settings', { key, value, updatedAt: new Date().toISOString() })
  return value
}
