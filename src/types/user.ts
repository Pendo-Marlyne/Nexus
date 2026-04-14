/**
 * Agency role used for access control in Helix.
 */
export type UserRole =
  | 'owner'
  | 'admin'
  | 'project_manager'
  | 'team_member'
  | 'client'
  | 'viewer'

/**
 * Firestore-backed user profile.
 */
export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL: string | null
  role: UserRole
  agencyId: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}

