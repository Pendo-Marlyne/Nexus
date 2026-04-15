import { getFirestore } from 'firebase-admin/firestore'

interface CacheRecord<T> {
  key: string
  value: T
  expiresAt: number
  createdAt: number
}

const COLLECTION = 'functionCache'

export async function getCached<T>(key: string): Promise<T | null> {
  const db = getFirestore()
  const snap = await db.collection(COLLECTION).doc(key).get()
  if (!snap.exists) return null
  const data = snap.data() as CacheRecord<T>
  if (!data || data.expiresAt < Date.now()) return null
  return data.value
}

export async function setCached<T>(key: string, value: T, ttlMs: number) {
  const db = getFirestore()
  const record: CacheRecord<T> = {
    key,
    value,
    createdAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
  }
  await db.collection(COLLECTION).doc(key).set(record)
}

