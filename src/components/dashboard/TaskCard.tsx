import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { motion } from 'framer-motion'
import { CalendarDays } from 'lucide-react'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Badge } from '../ui/badge'
import type { Task } from '../../types/task'

interface TaskCardProps {
  task: Task
  onClick: (task: Task) => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.article
      layout
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`rounded-xl border border-border bg-card p-3 shadow-sm ${isDragging ? 'opacity-60' : ''}`}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-sm font-medium">{task.title}</p>
        <Badge variant={task.priority === 'urgent' ? 'warning' : task.priority === 'high' ? 'secondary' : 'default'}>
          {task.priority}
        </Badge>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback>{(task.assigneeUid ?? 'U').slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span>{task.assigneeUid ? `@${task.assigneeUid.slice(0, 8)}` : 'Unassigned'}</span>
        </div>
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due'}
        </span>
      </div>
    </motion.article>
  )
}

