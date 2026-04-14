import { z } from 'zod'

export const TIME_ENTRY_STATUSES = ['draft', 'submitted', 'approved', 'rejected'] as const
export type TimeEntryStatus = (typeof TIME_ENTRY_STATUSES)[number]

export interface TimeEntry {
  id: string
  agencyId: string
  projectId: string
  taskId: string | null
  userUid: string
  minutes: number
  notes: string
  status: TimeEntryStatus
  entryDate: string
  createdAt: string
  updatedAt: string
}

export const timeEntrySchema = z.object({
  id: z.string().min(1),
  agencyId: z.string().min(1),
  projectId: z.string().min(1),
  taskId: z.string().nullable(),
  userUid: z.string().min(1),
  minutes: z.number().int().positive(),
  notes: z.string().default(''),
  status: z.enum(TIME_ENTRY_STATUSES),
  entryDate: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CreateTimeEntry = Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateTimeEntry = Partial<Omit<TimeEntry, 'id' | 'agencyId' | 'createdAt'>> & {
  updatedAt: string
}

