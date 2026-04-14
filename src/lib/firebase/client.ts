import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  type Auth,
} from 'firebase/auth'
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  type Firestore,
} from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { getMessaging, isSupported, type Messaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
}

/**
 * Whether all required Firebase env vars are present.
 */
export const isFirebaseConfigured = () =>
  Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId)

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)

let db: Firestore
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentSingleTabManager(),
    }),
  })
} catch {
  db = getFirestore(app)
}

const auth: Auth = getAuth(app)
void setPersistence(auth, browserLocalPersistence).catch(() => undefined)

const storage: FirebaseStorage = getStorage(app)
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

/**
 * Returns FCM messaging when supported by current browser/runtime.
 */
export const getMessagingClient = async (): Promise<Messaging | null> => {
  const supported = await isSupported().catch(() => false)
  if (!supported) return null
  return getMessaging(app)
}

export { app, auth, db, storage, googleProvider }

