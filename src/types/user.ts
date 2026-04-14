import { z } from 'zod'

/**
 * Allowed roles for RBAC across the application.
 */
export const USER_ROLES = [
  'owner',
  'admin',
  'project_manager',
  'team_member',
  'client',
  'viewer',
] as const

export type UserRole = (typeof USER_ROLES)[number]

/**
 * Agency container used to group projects, members, and permissions.
 */
export interface Agency {
  id: string
  name: string
  ownerUid: string
  timezone: string
  plan: 'free' | 'pro' | 'enterprise'
  createdAt: string
  updatedAt: string
}

/**
 * Firestore user document.
 */
export interface User {
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

export const agencySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  ownerUid: z.string().min(1),
  timezone: z.string().min(1).default('UTC'),
  plan: z.enum(['free', 'pro', 'enterprise']).default('free'),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const userSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1),
  photoURL: z.string().nullable(),
  role: z.enum(USER_ROLES),
  agencyId: z.string().nullable(),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastLoginAt: z.string().nullable(),
})

export type CreateAgency = Omit<Agency, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateAgency = Partial<Omit<Agency, 'id' | 'ownerUid' | 'createdAt'>> & {
  updatedAt: string
}
export type CreateUser = Omit<User, 'createdAt' | 'updatedAt' | 'lastLoginAt'>
export type UpdateUser = Partial<Omit<User, 'uid' | 'createdAt'>> & { updatedAt: string }

export type UserProfile = User

