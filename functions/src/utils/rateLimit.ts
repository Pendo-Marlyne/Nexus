import { getFirestore } from 'firebase-admin/firestore'

/**
 * Returns true when request is allowed, false when blocked.
 */
export async function checkRateLimit(key: string, limit: number): Promise<boolean> {
  const db = getFirestore()
  const windowKey = `${key}:${new Date().toISOString().slice(0, 13)}`
  const ref = db.collection('functionRateLimits').doc(windowKey)
  const snap = await ref.get()
  const count = (snap.data()?.count as number | undefined) ?? 0
  if (count >= limit) return false
  await ref.set({ count: count + 1, updatedAt: Date.now() }, { merge: true })
  return true
}

