import { z } from 'zod'

export const PROJECT_STATUSES = ['planning', 'active', 'on_hold', 'completed', 'cancelled'] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

/**
 * Firestore project document.
 */
export interface Project {
  id: string
  agencyId: string
  name: string
  description: string
  status: ProjectStatus
  ownerUid: string
  memberUids: string[]
  startDate: string | null
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

export const projectSchema = z.object({
  id: z.string().min(1),
  agencyId: z.string().min(1),
  name: z.string().min(2),
  description: z.string().default(''),
  status: z.enum(PROJECT_STATUSES),
  ownerUid: z.string().min(1),
  memberUids: z.array(z.string()).default([]),
  startDate: z.string().nullable(),
  dueDate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CreateProject = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateProject = Partial<Omit<Project, 'id' | 'agencyId' | 'createdAt'>> & {
  updatedAt: string
}

