import { z } from 'zod'

export const HANDOFF_STATUSES = ['draft', 'ready', 'in_review', 'accepted', 'rejected'] as const
export type HandoffStatus = (typeof HANDOFF_STATUSES)[number]

export interface Handoff {
  id: string
  agencyId: string
  projectId: string
  taskId: string | null
  fromTeam: string
  toTeam: string
  summary: string
  checklist: string[]
  status: HandoffStatus
  createdBy: string
  createdAt: string
  updatedAt: string
}

export const handoffSchema = z.object({
  id: z.string().min(1),
  agencyId: z.string().min(1),
  projectId: z.string().min(1),
  taskId: z.string().nullable(),
  fromTeam: z.string().min(1),
  toTeam: z.string().min(1),
  summary: z.string().default(''),
  checklist: z.array(z.string()).default([]),
  status: z.enum(HANDOFF_STATUSES),
  createdBy: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CreateHandoff = Omit<Handoff, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateHandoff = Partial<Omit<Handoff, 'id' | 'agencyId' | 'createdAt'>> & {
  updatedAt: string
}

