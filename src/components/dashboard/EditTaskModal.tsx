import { useEffect, useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { db } from '../../lib/firebase/client'
import type { Task, TaskPriority, TaskStatus } from '../../types/task'

interface EditTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
}

export function EditTaskModal({ open, onOpenChange, task }: EditTaskModalProps) {
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<TaskStatus>('backlog')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!task) return
    setTitle(task.title)
    setStatus(task.status)
    setPriority(task.priority)
  }, [task])

  const saveTask = async () => {
    if (!task) return
    setPending(true)
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        title: title.trim(),
        status,
        priority,
        updatedAt: new Date().toISOString(),
      })
      onOpenChange(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>Update task details and workflow status.</DialogDescription>
        </DialogHeader>
        {task ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="edit-task-title">Title</Label>
              <Input id="edit-task-title" value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {['backlog', 'assigned', 'in_progress', 'review', 'done'].map((statusOption) => (
                    <SelectItem key={statusOption} value={statusOption}>
                      {statusOption.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void saveTask()} disabled={pending || !task}>
            {pending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

