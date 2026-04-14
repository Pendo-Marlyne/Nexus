import type { UserProfile, UserRole } from './user'

export interface AgencyDocument {
  id: string
  name: string
  ownerUid: string
  createdAt: string
  updatedAt: string
}

export interface ProjectDocument {
  id: string
  agencyId: string
  name: string
  status: 'active' | 'on_hold' | 'completed'
  createdAt: string
  updatedAt: string
}

export interface TaskDocument {
  id: string
  agencyId: string
  projectId: string
  title: string
  state: string
  assigneeUid: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthAuditDocument {
  id: string
  uid: string
  role: UserRole
  event: 'login' | 'logout' | 'signup'
  createdAt: string
}

export type FirestoreUserDocument = UserProfile

