import { z } from 'zod'

export const LEAD_STATUSES = [
  'new',
  'qualified',
  'proposal_sent',
  'negotiation',
  'won',
  'lost',
] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]

export interface Lead {
  id: string
  agencyId: string
  name: string
  company: string
  email: string
  status: LeadStatus
  score: number
  notes: string
  ownerUid: string | null
  createdAt: string
  updatedAt: string
}

export const leadSchema = z.object({
  id: z.string().min(1),
  agencyId: z.string().min(1),
  name: z.string().min(1),
  company: z.string().default(''),
  email: z.string().email(),
  status: z.enum(LEAD_STATUSES),
  score: z.number().min(0).max(100).default(0),
  notes: z.string().default(''),
  ownerUid: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CreateLead = Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateLead = Partial<Omit<Lead, 'id' | 'agencyId' | 'createdAt'>> & { updatedAt: string }

