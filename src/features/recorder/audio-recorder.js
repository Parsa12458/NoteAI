import { saveSession, saveChunk, updateSession } from '../../lib/indexed-db'
import { syncService } from '../sync/sync-service'

/**
 * Detects the best supported audio MIME type for MediaRecorder in the current browser.
 */
export function getSupportedAudioMimeType() {
  if (typeof window === 'undefined' || !window.MediaRecorder) {
    return 'audio/webm'
  }
  const candidateTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
    'audio/aac',
  ]
  for (const type of candidateTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }
  return ''
}

export class LectureAudioRecorder {
  constructor(options = {}) {
    this.sessionId = null
    this.courseId = null
    this.sequence = 0
    this.state = 'inactive' // 'inactive' | 'recording' | 'paused' | 'stopped'
    this.mediaRecorder = null
    this.mediaStream = null
    this.audioContext = null
    this.analyserNode = null
    this.elapsedMs = 0
    this.startTime = null
    this.timerInterval = null
    this.currentMimeType = ''
    this.chunkIntervalMs = options.chunkIntervalMs || 300000 // default 5 minutes
    this.listeners = new Set()
  }

  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  notify(event, payload = {}) {
    this.listeners.forEach((l) => {
      try {
        l({ event, state: this.state, elapsedMs: this.elapsedMs, ...payload })
      } catch (err) {
        console.error('Recorder listener error:', err)
      }
    })
  }

  /**
   * Initializes microphone stream and Web Audio AnalyserNode for real audio visualization.
   */
  async initStream(deviceId = null) {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('مرورگر شما از قابلیت ضبط صدا (getUserMedia) پشتیبانی نمی‌کند.')
    }

    const audioConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    }
    if (deviceId) {
      audioConstraints.deviceId = { exact: deviceId }
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
      })

      // Setup Web Audio Analyser
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.audioContext = new AudioCtx()
        const source = this.audioContext.createMediaStreamSource(this.mediaStream)
        this.analyserNode = this.audioContext.createAnalyser()
        this.analyserNode.fftSize = 256
        this.analyserNode.smoothingTimeConstant = 0.8
        source.connect(this.analyserNode)
      }

      return this.mediaStream
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('دسترسی به میکروفون رد شد. لطفاً در تنظیمات مرورگر اجازه ضبط صدا را صادر فرمایید.')
      }
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error('هیچ میکروفون یا دستگاه ورودی صوتی متصلی یافت نشد.')
      }
      throw new Error(`خطا در راه‌اندازی میکروفون: ${err.message}`)
    }
  }

  /**
   * Starts a new live recording session.
   */
  async startRecording({
    sessionId,
    courseId,
    courseName,
    title,
    period,
    deviceId = null,
    chunkIntervalMs = 300000,
  }) {
    if (this.state === 'recording') {
      return
    }

    this.sessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    this.courseId = courseId
    this.sequence = 0
    this.elapsedMs = 0
    this.chunkIntervalMs = chunkIntervalMs

    // Ensure audio stream is ready
    if (!this.mediaStream || !this.mediaStream.active) {
      await this.initStream(deviceId)
    }

    this.currentMimeType = getSupportedAudioMimeType()

    // 1. Persist initial session record in IndexedDB
    await saveSession({
      id: this.sessionId,
      courseId,
      courseName,
      title: title || 'جلسه درس ضبط شده',
      period: period || '',
      status: 'recording',
      mimeType: this.currentMimeType,
      durationMs: 0,
      totalChunks: 0,
      uploadedChunks: 0,
      syncStatus: 'local_only',
    })

    // 2. Instantiate MediaRecorder
    const options = this.currentMimeType ? { mimeType: this.currentMimeType } : {}
    this.mediaRecorder = new MediaRecorder(this.mediaStream, options)

    this.mediaRecorder.ondataavailable = async (e) => {
      if (e.data && e.data.size > 0) {
        await this.handleChunkAvailable(e.data)
      }
    }

    this.mediaRecorder.onerror = (e) => {
      console.error('MediaRecorder error:', e)
      this.notify('error', { error: e.error || 'خطای ضبط صدا' })
    }

    this.mediaRecorder.start(this.chunkIntervalMs)
    this.state = 'recording'
    this.startTimer()
    this.notify('started', { sessionId: this.sessionId })
  }

  async handleChunkAvailable(blob) {
    const currentSeq = this.sequence++
    const chunkId = `${this.sessionId}_chunk_${currentSeq}`

    try {
      // Persist in IndexedDB FIRST before any upload attempt!
      await saveChunk({
        id: chunkId,
        sessionId: this.sessionId,
        sequence: currentSeq,
        blob,
        size: blob.size,
        durationMs: this.chunkIntervalMs,
        mimeType: this.currentMimeType,
        createdAt: new Date().toISOString(),
        uploadStatus: 'pending',
      })

      this.notify('chunk_saved', { chunkId, sequence: currentSeq, size: blob.size })

      // Trigger background sync if device is online
      if (typeof navigator === 'undefined' || navigator.onLine) {
        syncService.triggerSync('chunk_emitted')
      }
    } catch (dbErr) {
      console.error('Failed to save audio chunk to IndexedDB:', dbErr)
      this.notify('storage_error', { error: dbErr.message })
    }
  }

  async pauseRecording() {
    if (this.state !== 'recording' || !this.mediaRecorder) return
    this.mediaRecorder.pause()
    this.state = 'paused'
    this.pauseTimer()
    try {
      await updateSession(this.sessionId, { status: 'paused', durationMs: this.elapsedMs })
    } catch (err) {
      console.warn('Failed to update session status to paused:', err)
    }
    this.notify('paused')
  }

  async resumeRecording() {
    if (this.state !== 'paused' || !this.mediaRecorder) return
    this.mediaRecorder.resume()
    this.state = 'recording'
    this.resumeTimer()
    try {
      await updateSession(this.sessionId, { status: 'recording' })
    } catch (err) {
      console.warn('Failed to update session status to recording:', err)
    }
    this.notify('resumed')
  }

  async stopRecording() {
    if (this.state === 'inactive' || this.state === 'stopped') return

    this.pauseTimer()
    this.state = 'stopped'

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      // Calling stop() emits the final ondataavailable event with remaining audio data
      this.mediaRecorder.stop()
    }

    // Finalize session in IndexedDB
    try {
      await updateSession(this.sessionId, {
        status: 'finalized',
        durationMs: this.elapsedMs,
      })
    } catch (err) {
      console.warn('Failed to finalize session in DB:', err)
    }

    this.notify('stopped', { sessionId: this.sessionId, durationMs: this.elapsedMs })

    // Release audio tracks
    this.cleanupStream()

    // Trigger final sync
    syncService.triggerSync('recording_finalized')

    return this.sessionId
  }

  /**
   * Provides frequency amplitude data for the audio waveform visualizer canvas.
   */
  getFrequencyData(targetArray) {
    if (this.analyserNode && (this.state === 'recording' || this.state === 'paused')) {
      this.analyserNode.getByteFrequencyData(targetArray)
      return true
    }
    targetArray.fill(0)
    return false
  }

  startTimer() {
    this.startTime = Date.now() - this.elapsedMs
    this.timerInterval = setInterval(() => {
      this.elapsedMs = Date.now() - this.startTime
      this.notify('time_tick', { elapsedMs: this.elapsedMs })
    }, 250)
  }

  pauseTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  }

  resumeTimer() {
    this.startTimer()
  }

  cleanupStream() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop())
      this.mediaStream = null
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {})
      this.audioContext = null
    }
    this.analyserNode = null
  }
}

// Singleton recorder instance to survive component re-renders
export const audioRecorder = new LectureAudioRecorder()
