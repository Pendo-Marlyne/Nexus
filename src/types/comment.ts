import { z } from 'zod'

export interface Comment {
  id: string
  agencyId: string
  resourceType: 'task' | 'project' | 'lead' | 'handoff'
  resourceId: string
  authorUid: string
  body: string
  mentions: string[]
  createdAt: string
  updatedAt: string
}

export const COMMENT_RESOURCE_TYPES = ['task', 'project', 'lead', 'handoff'] as const

export const commentSchema = z.object({
  id: z.string().min(1),
  agencyId: z.string().min(1),
  resourceType: z.enum(COMMENT_RESOURCE_TYPES),
  resourceId: z.string().min(1),
  authorUid: z.string().min(1),
  body: z.string().min(1),
  mentions: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CreateComment = Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateComment = Partial<Omit<Comment, 'id' | 'agencyId' | 'resourceType' | 'resourceId'>> & {
  updatedAt: string
}

