import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LectureAudioRecorder, getSupportedAudioMimeType } from '../features/recorder/audio-recorder'
import { getSession } from '../lib/indexed-db'

describe('Classroom Audio Recorder Engine', () => {
  let recorder

  beforeEach(() => {
    recorder = new LectureAudioRecorder({ chunkIntervalMs: 50 })
  })

  it('detects a supported audio MIME type', () => {
    const mime = getSupportedAudioMimeType()
    expect(mime).toContain('audio/')
  })

  it('initializes audio stream and Web Audio analyser node', async () => {
    const stream = await recorder.initStream()
    expect(stream).toBeDefined()
    expect(recorder.audioContext).toBeDefined()
    expect(recorder.analyserNode).toBeDefined()
  })

  it('starts recording and creates a session in IndexedDB', async () => {
    const testSessionId = `test_rec_${Date.now()}`
    await recorder.startRecording({
      sessionId: testSessionId,
      courseId: 'math-101',
      courseName: 'ریاضی مهندسی',
      title: 'جلسه آزمایشی',
      period: '۸ تا ۱۰',
      chunkIntervalMs: 50,
    })

    expect(recorder.state).toBe('recording')

    const dbSession = await getSession(testSessionId)
    expect(dbSession).toBeDefined()
    expect(dbSession.status).toBe('recording')
    expect(dbSession.courseName).toBe('ریاضی مهندسی')

    // Stop recorder
    await recorder.stopRecording()
    expect(recorder.state).toBe('stopped')

    const finalizedSession = await getSession(testSessionId)
    expect(finalizedSession.status).toBe('finalized')
  })

  it('supports pause and resume without losing session integrity', async () => {
    const testSessionId = `test_pause_${Date.now()}`
    await recorder.startRecording({
      sessionId: testSessionId,
      courseId: 'circuits-201',
      courseName: 'مدارها',
      title: 'جلسه مکث',
      chunkIntervalMs: 50,
    })

    await recorder.pauseRecording()
    expect(recorder.state).toBe('paused')

    let dbSession = await getSession(testSessionId)
    expect(dbSession.status).toBe('paused')

    await recorder.resumeRecording()
    expect(recorder.state).toBe('recording')

    dbSession = await getSession(testSessionId)
    expect(dbSession.status).toBe('recording')

    await recorder.stopRecording()
  })

  it('handles microphone permission denial gracefully', async () => {
    const originalGetUserMedia = navigator.mediaDevices.getUserMedia
    navigator.mediaDevices.getUserMedia = vi.fn().mockRejectedValue({
      name: 'NotAllowedError',
      message: 'Permission denied',
    })

    const failRecorder = new LectureAudioRecorder()
    await expect(failRecorder.initStream()).rejects.toThrow('دسترسی به میکروفون رد شد')

    // Restore
    navigator.mediaDevices.getUserMedia = originalGetUserMedia
  })
})
