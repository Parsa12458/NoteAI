import { getApiBaseUrl, isMockMode, ApiError } from '../lib/api-client'

/**
 * Uploads a single recorded audio chunk to the backend.
 * Uses multipart/form-data as specified in the FastAPI backend contract.
 *
 * @param {Object} params
 * @param {string} params.sessionId
 * @param {string} params.chunkId
 * @param {number} params.sequence
 * @param {Blob} params.blob
 * @param {number} params.durationMs
 * @param {boolean} [params.isFinal=false]
 * @returns {Promise<{serverChunkId: string, sequence: number, acknowledgedAt: string}>}
 */
export async function uploadAudioChunk({
  sessionId,
  chunkId,
  sequence,
  blob,
  durationMs = 0,
  isFinal = false,
}) {
  if (!sessionId) throw new Error('sessionId is required for audio chunk upload.')
  if (!chunkId) throw new Error('chunkId is required for audio chunk upload.')
  if (typeof sequence !== 'number') throw new Error('sequence number is required.')
  if (!blob) throw new Error('Audio blob is missing.')

  // Mock Mode: simulate upload latency & acknowledgement
  if (isMockMode()) {
    // Artificial latency between 200ms and 600ms
    await new Promise((resolve) => setTimeout(resolve, 300))

    return {
      serverChunkId: `srv_chk_${Date.now()}_seq_${sequence}`,
      chunkId,
      sequence,
      size: blob.size,
      status: 'acknowledged',
      acknowledgedAt: new Date().toISOString(),
    }
  }

  // Production Mode: Live FastAPI endpoint
  const formData = new FormData()
  formData.append('chunkId', chunkId)
  formData.append('sequence', String(sequence))
  formData.append('durationMs', String(durationMs))
  formData.append('isFinal', String(isFinal))
  formData.append('audio', blob, `${chunkId}.webm`)

  const url = `${getApiBaseUrl()}/sessions/${sessionId}/chunks`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 45000) // 45 seconds upload timeout

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      let errText = ''
      try {
        const errorJson = await response.json()
        errText = errorJson.detail || errorJson.message
      } catch {
        errText = await response.text()
      }
      throw new ApiError(errText || `خطا در آپلود چانک صوتی (${response.status})`, response.status)
    }

    return await response.json()
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new ApiError('مهلت ارسال قطعه صوتی به پایان رسید.', 408)
    }
    throw err
  }
}

