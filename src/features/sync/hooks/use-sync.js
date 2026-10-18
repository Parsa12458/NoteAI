import { useState, useEffect } from 'react'
import { syncService } from '../sync-service'
import { getStorageStats } from '../../../lib/indexed-db'

export function useSync() {
  const [syncStatus, setSyncStatus] = useState(syncService.getStatus())
  const [stats, setStats] = useState({
    pendingChunks: 0,
    confirmedChunks: 0,
    totalAudioBytes: 0,
    browserStorage: { quota: null, usage: null },
  })
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const unsubscribe = syncService.subscribe((status) => {
      setSyncStatus(status)
      setRefreshKey((k) => k + 1)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    let isMounted = true
    getStorageStats().then((data) => {
      if (isMounted) setStats(data)
    })
    return () => {
      isMounted = false
    }
  }, [refreshKey, syncStatus.isSyncing])

  const triggerSync = () => {
    syncService.triggerSync('user_manual')
  }

  return {
    ...syncStatus,
    pendingCount: stats.pendingChunks,
    confirmedCount: stats.confirmedChunks,
    totalAudioBytes: stats.totalAudioBytes,
    browserStorage: stats.browserStorage,
    triggerSync,
  }
}

