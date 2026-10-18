import { describe, it, expect, beforeEach } from 'vitest'
import {
  saveSession,
  getSession,
  saveChunk,
  getChunksBySession,
  getPendingChunks,
  updateChunkStatus,
  purgeConfirmedChunks,
  getStorageStats,
} from '../lib/indexed-db'

describe('IndexedDB Audio & Session Persistence Layer', () => {
  const sessionId = 'test-session-1'

  beforeEach(async () => {
    // Save fresh session
    await saveSession({
      id: sessionId,
      courseId: 'math-101',
      courseName: 'ریاضی مهندسی',
      title: 'جلسه ۱: سری فوریه',
      status: 'recording',
    })
  })

  it('persists session metadata and updates status correctly', async () => {
    const session = await getSession(sessionId)
    expect(session).toBeDefined()
    expect(session.courseName).toBe('ریاضی مهندسی')
    expect(session.status).toBe('recording')
  })

  it('saves emitted audio chunks sequentially into IndexedDB', async () => {
    const blob1 = new Blob(['sample audio data 1'], { type: 'audio/webm' })
    const blob2 = new Blob(['sample audio data 2'], { type: 'audio/webm' })

    await saveChunk({
      id: `${sessionId}_chunk_0`,
      sessionId,
      sequence: 0,
      blob: blob1,
      size: blob1.size,
      durationMs: 5000,
      mimeType: 'audio/webm',
    })

    await saveChunk({
      id: `${sessionId}_chunk_1`,
      sessionId,
      sequence: 1,
      blob: blob2,
      size: blob2.size,
      durationMs: 5000,
      mimeType: 'audio/webm',
    })

    const chunks = await getChunksBySession(sessionId)
    expect(chunks).toHaveLength(2)
    expect(chunks[0].sequence).toBe(0)
    expect(chunks[1].sequence).toBe(1)
    expect(chunks[0].uploadStatus).toBe('pending')

    const session = await getSession(sessionId)
    expect(session.totalChunks).toBe(2)
    expect(session.uploadedChunks).toBe(0)
  })

  it('retrieves pending chunks and updates chunk upload status', async () => {
    const blob = new Blob(['sample audio bytes'], { type: 'audio/webm' })
    const chunkId = `${sessionId}_chunk_pending_test`

    await saveChunk({
      id: chunkId,
      sessionId,
      sequence: 99,
      blob,
      size: blob.size,
      durationMs: 3000,
      mimeType: 'audio/webm',
    })

    let pending = await getPendingChunks()
    expect(pending.some((c) => c.id === chunkId)).toBe(true)

    // Mark as uploaded
    await updateChunkStatus(chunkId, 'uploaded', { serverChunkId: 'srv-123' })

    pending = await getPendingChunks()
    expect(pending.some((c) => c.id === chunkId)).toBe(false)
  })

  it('NEVER purges unconfirmed chunks, only purged confirmed ones', async () => {
    const blobPending = new Blob(['pending audio'], { type: 'audio/webm' })
    const blobConfirmed = new Blob(['confirmed audio'], { type: 'audio/webm' })

    const chunk1 = `${sessionId}_unconfirmed`
    const chunk2 = `${sessionId}_confirmed`

    await saveChunk({
      id: chunk1,
      sessionId,
      sequence: 10,
      blob: blobPending,
      size: blobPending.size,
      durationMs: 2000,
      mimeType: 'audio/webm',
      uploadStatus: 'pending',
    })

    await saveChunk({
      id: chunk2,
      sessionId,
      sequence: 11,
      blob: blobConfirmed,
      size: blobConfirmed.size,
      durationMs: 2000,
      mimeType: 'audio/webm',
      uploadStatus: 'uploaded',
    })

    const { deletedCount } = await purgeConfirmedChunks()
    expect(deletedCount).toBeGreaterThanOrEqual(1)

    // Unconfirmed chunk MUST still exist in IndexedDB!
    const pendingList = await getPendingChunks()
    expect(pendingList.some((c) => c.id === chunk1)).toBe(true)
  })

  it('provides accurate storage stats', async () => {
    const stats = await getStorageStats()
    expect(stats.totalSessions).toBeGreaterThanOrEqual(1)
    expect(stats.totalAudioBytes).toBeGreaterThanOrEqual(0)
    expect(stats.browserStorage).toBeDefined()
  })
})

