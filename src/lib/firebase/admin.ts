import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

/**
 * Initializes Firebase Admin SDK for server environments.
 * Uses service account JSON when available, otherwise falls back to ADC.
 */
const adminApp =
  getApps()[0] ??
  initializeApp({
    credential: process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
      : applicationDefault(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  })

export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)
export const adminStorage = getStorage(adminApp)

