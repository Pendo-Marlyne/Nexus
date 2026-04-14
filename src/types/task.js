export const TASK_STATES = [
  'Idea',
  'Requested',
  'Backlog',
  'Assigned',
  'In Progress',
  'Blocked',
  'Review',
  'Revision',
  'Done',
  'Archived',
]

export const VALID_TASK_TRANSITIONS = {
  Idea: ['Requested'],
  Requested: ['Backlog'],
  Backlog: ['Assigned'],
  Assigned: ['In Progress'],
  'In Progress': ['Blocked', 'Review'],
  Blocked: ['In Progress'],
  Review: ['Revision', 'Done'],
  Revision: ['Review'],
  Done: ['Archived'],
  Archived: [],
}
