import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { TaskCard } from './TaskCard'
import type { Task } from '../../types/task'

interface ColumnProps {
  title: string
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onAddTask: () => void
}

export function Column({ title, tasks, onTaskClick, onAddTask }: ColumnProps) {
  return (
    <section className="min-h-[300px] rounded-xl border border-border bg-card/60 p-3">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold">{title}</h4>
        <Button size="sm" variant="outline" onClick={onAddTask}>
          Add task
        </Button>
      </div>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <motion.div layout className="space-y-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </motion.div>
      </SortableContext>
    </section>
  )
}

