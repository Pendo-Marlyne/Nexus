import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

type QueuedMutation = () => Promise<void>

interface OfflineSyncState {
  isOnline: boolean
  pendingCount: number
  enqueueMutation: (mutation: QueuedMutation) => Promise<void>
  flushQueue: () => Promise<void>
}

/**
 * Queue mutations while offline and replay them once connectivity returns.
 *
 * @example
 * const { isOnline, enqueueMutation } = useOfflineSync()
 * await enqueueMutation(() => updateTask(taskId, payload))
 */
export function useOfflineSync(): OfflineSyncState {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)
  const [pendingCount, setPendingCount] = useState(0)
  const queueRef = useRef<QueuedMutation[]>([])
  const flushingRef = useRef(false)

  const flushQueue = useCallback(async () => {
    if (flushingRef.current || !navigator.onLine || queueRef.current.length === 0) return

    flushingRef.current = true
    try {
      while (queueRef.current.length > 0 && navigator.onLine) {
        const mutation = queueRef.current.shift()
        if (!mutation) continue
        await mutation()
      }
      setPendingCount(queueRef.current.length)
      if (queueRef.current.length === 0) toast.success('Offline changes synced')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sync offline updates'
      toast.error(message)
    } finally {
      flushingRef.current = false
    }
  }, [])

  const enqueueMutation = useCallback(
    async (mutation: QueuedMutation) => {
      if (navigator.onLine) {
        await mutation()
        return
      }
      queueRef.current.push(mutation)
      setPendingCount(queueRef.current.length)
      toast.message('Saved offline. Will sync when connection returns.')
    },
    []
  )

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      void flushQueue()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [flushQueue])

  return { isOnline, pendingCount, enqueueMutation, flushQueue }
}

