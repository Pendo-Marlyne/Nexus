import { useEffect, useMemo, useRef, useState } from 'react'
import {
  doc,
  onSnapshot,
  type DocumentData,
  type FirestoreError,
  type DocumentReference,
} from 'firebase/firestore'
import { db } from '../firebase/client'

interface RealtimeDocumentOptions<T extends DocumentData> {
  path?: string
  id?: string
  ref?: DocumentReference<T>
}

interface RealtimeDocumentState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

/**
 * Subscribe to a single Firestore document.
 *
 * @example
 * const { data: project, loading } = useRealtimeDocument<Project>({
 *   path: 'projects',
 *   id: projectId,
 * })
 */
export function useRealtimeDocument<T extends DocumentData>({
  path,
  id,
  ref,
}: RealtimeDocumentOptions<T>): RealtimeDocumentState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const documentRef = useMemo(() => {
    if (ref) return ref
    if (!path || !id) return null
    return doc(db, path, id) as DocumentReference<T>
  }, [id, path, ref])

  useEffect(() => {
    if (!documentRef) {
      setLoading(false)
      setError(new Error('Missing document path/id/reference'))
      return
    }

    setLoading(true)
    setError(null)
    unsubscribeRef.current?.()

    unsubscribeRef.current = onSnapshot(
      documentRef,
      (snapshot) => {
        setData(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as T) : null)
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
  }, [documentRef])

  return { data, loading, error }
}

