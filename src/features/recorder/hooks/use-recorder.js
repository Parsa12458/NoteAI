import { useState, useEffect, useCallback } from 'react'
import { audioRecorder } from '../audio-recorder'
import { getChunksBySession } from '../../../lib/indexed-db'

export function useRecorder() {
  const [recorderState, setRecorderState] = useState(audioRecorder.state)
  const [elapsedMs, setElapsedMs] = useState(audioRecorder.elapsedMs)
  const [sessionId, setSessionId] = useState(audioRecorder.sessionId)
  const [chunkCount, setChunkCount] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = audioRecorder.subscribe((data) => {
      setRecorderState(data.state)
      setElapsedMs(data.elapsedMs)
      if (data.sessionId) setSessionId(data.sessionId)

      if (data.event === 'chunk_saved' && data.sequence !== undefined) {
        setChunkCount(data.sequence + 1)
      } else if (data.event === 'stopped') {
        // Refetch chunk count
        if (data.sessionId) {
          getChunksBySession(data.sessionId).then((chunks) => setChunkCount(chunks.length))
        }
      } else if (data.event === 'error' || data.event === 'storage_error') {
        setError(data.error)
      }
    })

    return unsubscribe
  }, [])

  // Prevent accidental tab close or page navigation while recording
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (recorderState === 'recording' || recorderState === 'paused') {
        e.preventDefault()
        e.returnValue = 'ضبط صدا در حال انجام است. آیا مطمئنید می‌خواهید خارج شوید؟'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [recorderState])

  const start = useCallback(async (params) => {
    setError(null)
    try {
      await audioRecorder.startRecording(params)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const pause = useCallback(() => {
    audioRecorder.pauseRecording()
  }, [])

  const resume = useCallback(() => {
    audioRecorder.resumeRecording()
  }, [])

  const stop = useCallback(async () => {
    try {
      const finalSessionId = await audioRecorder.stopRecording()
      return finalSessionId
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const getFrequencyData = useCallback((targetArray) => {
    return audioRecorder.getFrequencyData(targetArray)
  }, [])

  return {
    state: recorderState,
    elapsedMs,
    sessionId,
    chunkCount,
    error,
    start,
    pause,
    resume,
    stop,
    getFrequencyData,
    clearError: () => setError(null),
  }
}
