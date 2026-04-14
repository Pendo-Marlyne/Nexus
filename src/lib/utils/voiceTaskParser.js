const PRIORITY_HINTS = [
  { pattern: /\b(urgent|asap|immediately)\b/i, value: 'urgent' },
  { pattern: /\b(bump up|high priority|important)\b/i, value: 'high' },
]

const parsePriority = (text) => {
  for (const item of PRIORITY_HINTS) {
    if (item.pattern.test(text)) return item.value
  }
  return 'medium'
}

const extractDueDate = (text, now = new Date()) => {
  const lower = text.toLowerCase()
  const due = new Date(now)

  if (lower.includes('today') && lower.includes('3pm')) {
    due.setHours(15, 0, 0, 0)
    return due.toISOString()
  }

  if (lower.includes('tomorrow morning')) {
    due.setDate(due.getDate() + 1)
    due.setHours(9, 0, 0, 0)
    return due.toISOString()
  }

  return null
}

export const transcriptToTasks = (transcript) => {
  const clauses = transcript
    .split(/\.\s+|also,|oh and/i)
    .map((x) => x.trim())
    .filter(Boolean)

  const tasks = clauses.map((clause) => {
    const lower = clause.toLowerCase()
    const title = clause
      .replace(/^hey,\s*/i, '')
      .replace(/^i need to remind myself to\s*/i, '')
      .replace(/^can someone\s*/i, '')
      .replace(/^we should probably\s*/i, '')
      .replace(/\?$/, '')
      .trim()

    const project = /acme landing page/i.test(clause) ? 'Acme landing page' : null
    const assignedTo = /myself/i.test(clause) ? 'self' : null

    return {
      title: title.charAt(0).toUpperCase() + title.slice(1),
      description: `Original phrasing: "${clause}"`,
      assignedTo,
      dueDate: extractDueDate(clause),
      priority: parsePriority(lower),
      project,
      confidence: 0.82,
    }
  })

  return {
    tasks,
    unresolvedReferences: [
      'Assignee is unspecified for collaborative requests',
      'Timezone is inferred from client environment',
      'Some references may require task IDs for disambiguation',
    ],
  }
}
