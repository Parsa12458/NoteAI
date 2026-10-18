import { describe, it, expect, beforeEach, vi } from 'vitest'
import { syncService } from '../features/sync/sync-service'
import { saveSession, saveChunk, getChunk, getPendingChunks } from '../lib/indexed-db'
import * as audioApi from '../services/audio-api'

describe('Offline Synchronization Service', () => {
  const sessionId = 'sync_test_session'

  beforeEach(async () => {
    await saveSession({
      id: sessionId,
      courseId: 'ai-101',
      courseName: 'هوش مصنوعی',
      status: 'finalized',
    })
  })

  it('uploads pending chunks and marks them as uploaded', async () => {
    const chunkId = `chk_sync_${Date.now()}`
    const blob = new Blob(['sample audio chunk content'], { type: 'audio/webm' })

    await saveChunk({
      id: chunkId,
      sessionId,
      sequence: 0,
      blob,
      size: blob.size,
      durationMs: 5000,
      uploadStatus: 'pending',
    })

    await syncService.triggerSync('test')

    const updated = await getChunk(chunkId)
    expect(updated.uploadStatus).toBe('uploaded')
    expect(updated.serverChunkId).toBeDefined()
  })

  it('keeps chunk in pending/failed status if upload throws and NEVER deletes it', async () => {
    const chunkId = `chk_fail_${Date.now()}`
    const blob = new Blob(['sample fail chunk'], { type: 'audio/webm' })

    await saveChunk({
      id: chunkId,
      sessionId,
      sequence: 1,
      blob,
      size: blob.size,
      durationMs: 5000,
      uploadStatus: 'pending',
    })

    const uploadSpy = vi.spyOn(audioApi, 'uploadAudioChunk').mockRejectedValueOnce(
      new Error('خطای موقت در اتصال به سرور')
    )

    await syncService.triggerSync('test_failure')

    const failedChunk = await getChunk(chunkId)
    expect(failedChunk).toBeDefined()
    expect(failedChunk.uploadStatus).toBe('failed')
    expect(failedChunk.lastError).toContain('خطای موقت')

    // Local audio chunk still exists!
    const pendingList = await getPendingChunks()
    expect(pendingList.some((c) => c.id === chunkId)).toBe(true)

    uploadSpy.mockRestore()
  })
})

