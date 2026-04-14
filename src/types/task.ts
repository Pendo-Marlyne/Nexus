import { z } from 'zod'

export const TASK_STATUSES = [
  'idea',
  'requested',
  'backlog',
  'assigned',
  'in_progress',
  'blocked',
  'review',
  'revision',
  'done',
  'archived',
] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

/**
 * Deterministic workflow transitions.
 */
export const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  idea: ['requested'],
  requested: ['backlog'],
  backlog: ['assigned'],
  assigned: ['in_progress'],
  in_progress: ['blocked', 'review'],
  blocked: ['in_progress'],
  review: ['revision', 'done'],
  revision: ['review'],
  done: ['archived'],
  archived: [],
}

/**
 * Firestore task document.
 */
export interface Task {
  id: string
  agencyId: string
  projectId: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeUid: string | null
  reviewerUid: string | null
  dueDate: string | null
  blockedReason: string | null
  createdAt: string
  updatedAt: string
}

export const taskSchema = z.object({
  id: z.string().min(1),
  agencyId: z.string().min(1),
  projectId: z.string().min(1),
  title: z.string().min(2),
  description: z.string().default(''),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  assigneeUid: z.string().nullable(),
  reviewerUid: z.string().nullable(),
  dueDate: z.string().nullable(),
  blockedReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CreateTask = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateTask = Partial<Omit<Task, 'id' | 'agencyId' | 'projectId' | 'createdAt'>> & {
  updatedAt: string
}

export const TASK_STATES = TASK_STATUSES.map((status) =>
  status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
)

const toDisplay = (status: TaskStatus) =>
  status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

export const VALID_TASK_TRANSITIONS = Object.fromEntries(
  Object.entries(VALID_TRANSITIONS).map(([from, to]) => [
    toDisplay(from as TaskStatus),
    to.map((status) => toDisplay(status)),
  ])
) as Record<string, string[]>

