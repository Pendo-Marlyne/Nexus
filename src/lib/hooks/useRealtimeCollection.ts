import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  collection,
  onSnapshot,
  query,
  type CollectionReference,
  type DocumentData,
  type FirestoreError,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from '../firebase/client'

interface RealtimeCollectionOptions<T extends DocumentData> {
  path?: string
  ref?: CollectionReference<T>
  constraints?: QueryConstraint[]
}

interface RealtimeCollectionState<T> {
  data: T[]
  loading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Subscribe to a Firestore collection with optional filters.
 *
 * @example
 * const { data: tasks, loading } = useRealtimeCollection<Task>({
 *   path: 'tasks',
 *   constraints: [where('projectId', '==', projectId)],
 * })
 */
export function useRealtimeCollection<T extends DocumentData>({
  path,
  ref,
  constraints = [],
}: RealtimeCollectionOptions<T>): RealtimeCollectionState<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const collectionRef = useMemo(() => {
    if (ref) return ref
    if (path) return collection(db, path) as CollectionReference<T>
    return null
  }, [path, ref])

  const refetch = useCallback(() => {
    setRefreshTick((value) => value + 1)
  }, [])

  useEffect(() => {
    if (!collectionRef) {
      setLoading(false)
      setError(new Error('Missing collection path/reference'))
      return
    }

    setLoading(true)
    setError(null)
    unsubscribeRef.current?.()

    const q = query(collectionRef, ...constraints)
    unsubscribeRef.current = onSnapshot(
      q,
      (snapshot) => {
        setData(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as T))
        setLoading(false)
      },
      (firebaseError: FirestoreError) => {
        setError(firebaseError)
        setLoading(false)
      }
    )

    return () => {
      unsubscribeRef.current?.()
      unsubscribeRef.current = null
    }
  }, [collectionRef, constraints, refreshTick])

  return { data, loading, error, refetch }
}

