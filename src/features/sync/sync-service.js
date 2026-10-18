import { getPendingChunks, updateChunkStatus } from '../../lib/indexed-db'
import { uploadAudioChunk } from '../../services/audio-api'

const MAX_RETRY_ATTEMPTS = 5

class SyncService {
  constructor() {
    this.isSyncing = false
    this.listeners = new Set()
    this.activeChunkId = null
    this.lastSyncError = null

    // Listen for browser connectivity changes
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.triggerSync('online_event')
      })
    }
  }

  subscribe(listener) {
    this.listeners.add(listener)
    // Send initial status
    listener(this.getStatus())
    return () => this.listeners.delete(listener)
  }

  notifyListeners() {
    const status = this.getStatus()
    this.listeners.forEach((listener) => {
      try {
        listener(status)
      } catch (err) {
        console.error('Error in sync listener:', err)
      }
    })
  }

  getStatus() {
    return {
      isSyncing: this.isSyncing,
      activeChunkId: this.activeChunkId,
      lastSyncError: this.lastSyncError,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    }
  }

  /**
   * Triggers a sync cycle for all pending audio chunks in IndexedDB.
   */
  async triggerSync(_triggerSource = 'manual') {
    if (this.isSyncing) {
      return
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.lastSyncError = 'دستگاه آفلاین است. به محض اتصال به اینترنت، همگام‌سازی آغاز خواهد شد.'
      this.notifyListeners()
      return
    }

    this.isSyncing = true
    this.lastSyncError = null
    this.notifyListeners()

    try {
      const pendingChunks = await getPendingChunks()

      if (pendingChunks.length === 0) {
        this.isSyncing = false
        this.activeChunkId = null
        this.notifyListeners()
        return
      }

      for (const chunk of pendingChunks) {
        // Stop if device went offline midway
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          break
        }

        // Skip chunks that have failed too many times
        if (chunk.uploadAttempts >= MAX_RETRY_ATTEMPTS) {
          continue
        }

        this.activeChunkId = chunk.id
        this.notifyListeners()

        try {
          await updateChunkStatus(chunk.id, 'uploading')

          const result = await uploadAudioChunk({
            sessionId: chunk.sessionId,
            chunkId: chunk.id,
            sequence: chunk.sequence,
            blob: chunk.blob,
            durationMs: chunk.durationMs,
          })

          await updateChunkStatus(chunk.id, 'uploaded', {
            serverChunkId: result.serverChunkId,
            lastError: null,
          })
        } catch (err) {
          console.warn(`Sync failed for chunk ${chunk.id}:`, err)
          await updateChunkStatus(chunk.id, 'failed', {
            lastError: err.message,
          })
          this.lastSyncError = err.message
        }
      }
    } catch (globalErr) {
      this.lastSyncError = globalErr.message
    } finally {
      this.isSyncing = false
      this.activeChunkId = null
      this.notifyListeners()
    }
  }
}

export const syncService = new SyncService()
