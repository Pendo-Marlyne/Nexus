'use client'

import { useMemo, useState } from 'react'
import { doc, updateDoc, where } from 'firebase/firestore'
import { Input } from '../../../../../../components/ui/input'
import { Button } from '../../../../../../components/ui/button'
import { Badge } from '../../../../../../components/ui/badge'
import { useRealtimeDocument } from '../../../../../../lib/hooks/useRealtimeDocument'
import { useRealtimeCollection } from '../../../../../../lib/hooks/useRealtimeCollection'
import { db } from '../../../../../../lib/firebase/client'
import type { Task } from '../../../../../../types/task'
import { TaskComments } from '../../../../../../components/tasks/TaskComments'
import { ActivityLog } from '../../../../../../components/tasks/ActivityLog'
import { TimeTracker } from '../../../../../../components/tasks/TimeTracker'
import { FileAttachment } from '../../../../../../components/tasks/FileAttachment'
import { EditTaskModal } from '../../../../../../components/dashboard/EditTaskModal'

interface TaskPageProps {
  params?: {
    projectId?: string
    taskId?: string
  }
}

interface TaskWithSubtasks extends Task {
  parentTaskId?: string | null
}

export default function TaskDetailPage({ params }: TaskPageProps) {
  const projectId = params?.projectId ?? 'general'
  const taskId = params?.taskId ?? 'task-id'
  const [editOpen, setEditOpen] = useState(false)
  const [inlineTitle, setInlineTitle] = useState('')
  const [inlineDescription, setInlineDescription] = useState('')

  const { data: task, loading } = useRealtimeDocument<Task>({
    path: 'tasks',
    id: taskId,
  })

  const { data: subtasks } = useRealtimeCollection<TaskWithSubtasks>({
    path: 'tasks',
    constraints: [where('parentTaskId', '==', taskId)],
  })

  const taskValue = useMemo(() => {
    if (!task) return null
    return task
  }, [task])

  const updateInline = async () => {
    if (!taskValue) return
    await updateDoc(doc(db, 'tasks', taskValue.id), {
      title: inlineTitle || taskValue.title,
      description: inlineDescription || taskValue.description,
      updatedAt: new Date().toISOString(),
    })
  }

  if (loading) return <div className="p-6">Loading task...</div>
  if (!taskValue) return <div className="p-6">Task not found.</div>

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">{taskValue.title}</h1>
            <p className="text-sm text-muted-foreground">{taskValue.description || 'No description'}</p>
          </div>
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            Edit task
          </Button>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          <Badge>{taskValue.status}</Badge>
          <Badge variant={taskValue.priority === 'urgent' ? 'warning' : 'secondary'}>
            {taskValue.priority}
          </Badge>
          <Badge variant="outline">{taskValue.assigneeUid ?? 'Unassigned'}</Badge>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <Input
            value={inlineTitle}
            onChange={(event) => setInlineTitle(event.target.value)}
            placeholder="Inline edit title"
          />
          <Input
            value={inlineDescription}
            onChange={(event) => setInlineDescription(event.target.value)}
            placeholder="Inline edit description"
          />
          <Button onClick={() => void updateInline()}>Save inline changes</Button>
        </div>

        <section className="rounded-lg border border-border p-3">
          <h3 className="mb-2 text-sm font-semibold">Subtasks</h3>
          <ul className="space-y-2">
            {subtasks.map((subtask) => (
              <li key={subtask.id} className="rounded border border-border px-3 py-2 text-sm">
                {subtask.title}
              </li>
            ))}
            {subtasks.length === 0 ? (
              <li className="text-sm text-muted-foreground">No subtasks linked.</li>
            ) : null}
          </ul>
        </section>

        <TaskComments taskId={taskValue.id} agencyId={taskValue.agencyId} />
      </section>

      <aside className="space-y-4">
        <ActivityLog taskId={taskValue.id} />
        <TimeTracker taskId={taskValue.id} projectId={projectId} agencyId={taskValue.agencyId} />
        <FileAttachment taskId={taskValue.id} />
      </aside>

      <EditTaskModal open={editOpen} onOpenChange={setEditOpen} task={taskValue} />
    </div>
  )
}

