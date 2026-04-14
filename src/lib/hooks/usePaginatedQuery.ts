import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  type CollectionReference,
  type DocumentData,
  type DocumentSnapshot,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from '../firebase/client'

interface PaginatedQueryOptions<T extends DocumentData> {
  path?: string
  ref?: CollectionReference<T>
  pageSize?: number
  orderByField: string
  constraints?: QueryConstraint[]
}

interface PaginatedQueryState<T> {
  data: T[]
  loading: boolean
  loadingMore: boolean
  error: Error | null
  hasMore: boolean
  fetchNextPage: () => Promise<void>
  reset: () => void
}

/**
 * Cursor-based Firestore pagination hook.
 *
 * @example
 * const { data, fetchNextPage, hasMore } = usePaginatedQuery<Task>({
 *   path: 'tasks',
 *   orderByField: 'createdAt',
 *   pageSize: 20,
 * })
 */
export function usePaginatedQuery<T extends DocumentData>({
  path,
  ref,
  pageSize = 20,
  orderByField,
  constraints = [],
}: PaginatedQueryOptions<T>): PaginatedQueryState<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<DocumentSnapshot | null>(null)

  const collectionRef = useMemo(() => {
    if (ref) return ref
    if (path) return collection(db, path) as CollectionReference<T>
    return null
  }, [path, ref])

  const fetchPage = useCallback(
    async (loadMore: boolean) => {
      if (!collectionRef) {
        setError(new Error('Missing collection path/reference'))
        setLoading(false)
        return
      }

      try {
        setError(null)
        if (loadMore) setLoadingMore(true)
        else setLoading(true)

        const pageConstraints: QueryConstraint[] = [...constraints, orderBy(orderByField), limit(pageSize)]
        if (loadMore && cursor) pageConstraints.push(startAfter(cursor))

        const snapshot = await getDocs(query(collectionRef, ...pageConstraints))
        const pageData = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as T)

        setData((prev) => (loadMore ? [...prev, ...pageData] : pageData))
        setCursor(snapshot.docs.at(-1) ?? null)
        setHasMore(snapshot.docs.length === pageSize)
      } catch (caught) {
        setError(caught instanceof Error ? caught : new Error('Failed to load page'))
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [collectionRef, constraints, cursor, orderByField, pageSize]
  )

  useEffect(() => {
    void fetchPage(false)
  }, [fetchPage])

  const fetchNextPage = useCallback(async () => {
    if (loadingMore || !hasMore) return
    await fetchPage(true)
  }, [fetchPage, hasMore, loadingMore])

  const reset = useCallback(() => {
    setData([])
    setCursor(null)
    setHasMore(true)
    void fetchPage(false)
  }, [fetchPage])

  return { data, loading, loadingMore, error, hasMore, fetchNextPage, reset }
}

