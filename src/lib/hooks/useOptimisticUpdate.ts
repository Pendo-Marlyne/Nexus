import { useCallback, useState } from 'react'
import { toast } from 'sonner'

interface OptimisticUpdateOptions<T> {
  onCommit: (nextValue: T) => Promise<void>
  onRollback?: (previousValue: T) => void
  successMessage?: string
  errorMessage?: string
}

interface OptimisticUpdateState<T> {
  pending: boolean
  applyOptimistic: (nextValue: T, previousValue: T, applyLocal: (value: T) => void) => Promise<void>
}

/**
 * Perform optimistic UI updates with rollback on mutation error.
 *
 * @example
 * const { pending, applyOptimistic } = useOptimisticUpdate<Task>({
 *   onCommit: (next) => updateTask(next),
 * })
 */
export function useOptimisticUpdate<T>({
  onCommit,
  onRollback,
  successMessage,
  errorMessage = 'Update failed. Changes were rolled back.',
}: OptimisticUpdateOptions<T>): OptimisticUpdateState<T> {
  const [pending, setPending] = useState(false)

  const applyOptimistic = useCallback(
    async (nextValue: T, previousValue: T, applyLocal: (value: T) => void) => {
      try {
        setPending(true)
        applyLocal(nextValue)
        await onCommit(nextValue)
        if (successMessage) toast.success(successMessage)
      } catch (error) {
        applyLocal(previousValue)
        onRollback?.(previousValue)
        const message = error instanceof Error ? error.message : errorMessage
        toast.error(message)
      } finally {
        setPending(false)
      }
    },
    [errorMessage, onCommit, onRollback, successMessage]
  )

  return { pending, applyOptimistic }
}

