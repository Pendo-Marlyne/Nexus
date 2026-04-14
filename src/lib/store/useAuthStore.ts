import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase/client'
import type { UserProfile, UserRole } from '../../types/user'

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error'

interface SignupPayload {
  name: string
  email: string
  password: string
}

interface AuthState {
  firebaseUser: FirebaseUser | null
  userProfile: UserProfile | null
  authUid: string | null
  status: AuthStatus
  initializing: boolean
  loading: boolean
  error: string | null
  initAuthListener: () => () => void
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (payload: SignupPayload) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
  hasRole: (roles: UserRole | UserRole[]) => boolean
  isAdmin: () => boolean
  isOwner: () => boolean
}

const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unknown authentication error'

const nowIso = () => new Date().toISOString()

async function upsertUserProfile(firebaseUser: FirebaseUser, role: UserRole = 'team_member') {
  const userRef = doc(db, 'users', firebaseUser.uid)
  const existing = await getDoc(userRef)
  const timestamp = nowIso()

  if (!existing.exists()) {
    const payload: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      displayName: firebaseUser.displayName ?? 'New User',
      photoURL: firebaseUser.photoURL ?? null,
      role,
      agencyId: null,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastLoginAt: timestamp,
    }
    await setDoc(userRef, payload)
    return payload
  }

  await updateDoc(userRef, {
    email: firebaseUser.email ?? existing.data().email,
    displayName: firebaseUser.displayName ?? existing.data().displayName,
    photoURL: firebaseUser.photoURL ?? existing.data().photoURL ?? null,
    updatedAt: timestamp,
    lastLoginAt: timestamp,
    serverUpdatedAt: serverTimestamp(),
  })

  const merged = (await getDoc(userRef)).data() as UserProfile
  return merged
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      firebaseUser: null,
      userProfile: null,
      authUid: null,
      status: 'idle',
      initializing: true,
      loading: false,
      error: null,

      initAuthListener: () => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          try {
            set({ initializing: true, loading: true, error: null })
            if (!firebaseUser) {
              set({
                firebaseUser: null,
                userProfile: null,
                authUid: null,
                status: 'unauthenticated',
                initializing: false,
                loading: false,
              })
              return
            }

            const profile = await upsertUserProfile(firebaseUser)
            set({
              firebaseUser,
              userProfile: profile,
              authUid: firebaseUser.uid,
              status: 'authenticated',
              initializing: false,
              loading: false,
              error: null,
            })
          } catch (error) {
            set({
              error: toErrorMessage(error),
              status: 'error',
              initializing: false,
              loading: false,
            })
          }
        })
        return unsubscribe
      },

      signInWithEmail: async (email, password) => {
        try {
          set({ loading: true, error: null, status: 'loading' })
          const credential = await signInWithEmailAndPassword(auth, email, password)
          const profile = await upsertUserProfile(credential.user)
          set({
            firebaseUser: credential.user,
            userProfile: profile,
            authUid: credential.user.uid,
            loading: false,
            status: 'authenticated',
          })
        } catch (error) {
          set({ error: toErrorMessage(error), loading: false, status: 'error' })
          throw error
        }
      },

      signUpWithEmail: async ({ name, email, password }) => {
        try {
          set({ loading: true, error: null, status: 'loading' })
          const credential = await createUserWithEmailAndPassword(auth, email, password)
          await updateProfile(credential.user, { displayName: name })
          const profile = await upsertUserProfile(
            { ...credential.user, displayName: name } as FirebaseUser,
            'owner'
          )
          set({
            firebaseUser: credential.user,
            userProfile: profile,
            authUid: credential.user.uid,
            loading: false,
            status: 'authenticated',
          })
        } catch (error) {
          set({ error: toErrorMessage(error), loading: false, status: 'error' })
          throw error
        }
      },

      signInWithGoogle: async () => {
        try {
          set({ loading: true, error: null, status: 'loading' })
          const credential = await signInWithPopup(auth, googleProvider)
          const profile = await upsertUserProfile(credential.user)
          set({
            firebaseUser: credential.user,
            userProfile: profile,
            authUid: credential.user.uid,
            loading: false,
            status: 'authenticated',
          })
        } catch (error) {
          set({ error: toErrorMessage(error), loading: false, status: 'error' })
          throw error
        }
      },

      signOut: async () => {
        try {
          set({ loading: true, error: null })
          await firebaseSignOut(auth)
          set({
            firebaseUser: null,
            userProfile: null,
            authUid: null,
            loading: false,
            status: 'unauthenticated',
          })
        } catch (error) {
          set({ error: toErrorMessage(error), loading: false, status: 'error' })
          throw error
        }
      },

      clearError: () => set({ error: null }),

      hasRole: (roles) => {
        const role = get().userProfile?.role
        if (!role) return false
        return Array.isArray(roles) ? roles.includes(role) : role === roles
      },

      isAdmin: () => {
        const role = get().userProfile?.role
        return role === 'admin' || role === 'owner'
      },

      isOwner: () => get().userProfile?.role === 'owner',
    }),
    {
      name: 'helix-auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ authUid: state.authUid }),
    }
  )
)

export const authSelectors = {
  user: (state: AuthState) => state.userProfile,
  firebaseUser: (state: AuthState) => state.firebaseUser,
  authUid: (state: AuthState) => state.authUid,
  loading: (state: AuthState) => state.loading || state.initializing,
  status: (state: AuthState) => state.status,
  error: (state: AuthState) => state.error,
}

