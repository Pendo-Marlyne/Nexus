import { useState } from 'react'
import { addDoc, collection } from 'firebase/firestore'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { db } from '../../lib/firebase/client'
import type { TaskPriority, TaskStatus } from '../../types/task'

interface CreateTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialStatus: TaskStatus
  projectId?: string
  agencyId?: string
}

export function CreateTaskModal({
  open,
  onOpenChange,
  initialStatus,
  projectId = 'general',
  agencyId = 'default-agency',
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [pending, setPending] = useState(false)

  const createTask = async () => {
    if (!title.trim()) return
    setPending(true)
    try {
      const now = new Date().toISOString()
      await addDoc(collection(db, 'tasks'), {
        agencyId,
        projectId,
        title: title.trim(),
        description: '',
        status: initialStatus,
        priority,
        assigneeUid: null,
        reviewerUid: null,
        dueDate: null,
        blockedReason: null,
        createdAt: now,
        updatedAt: now,
      })
      setTitle('')
      setPriority('medium')
      onOpenChange(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>
          <DialogDescription>Add a new task to {initialStatus.replace('_', ' ')}.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="create-task-title">Title</Label>
            <Input id="create-task-title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void createTask()} disabled={pending || !title.trim()}>
            {pending ? 'Creating...' : 'Create task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

