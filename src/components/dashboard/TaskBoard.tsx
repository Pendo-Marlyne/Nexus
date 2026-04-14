import { useMemo, useState } from 'react'
import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core'
import { updateDoc, doc } from 'firebase/firestore'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import { useRealtimeCollection } from '../../lib/hooks/useRealtimeCollection'
import { useOptimisticUpdate } from '../../lib/hooks/useOptimisticUpdate'
import { db } from '../../lib/firebase/client'
import type { Task, TaskStatus } from '../../types/task'
import { Column } from './Column'
import { CreateTaskModal } from './CreateTaskModal'
import { EditTaskModal } from './EditTaskModal'

const BOARD_COLUMNS = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'] as const
type BoardColumn = (typeof BOARD_COLUMNS)[number]

const COLUMN_STATUS_MAP: Record<BoardColumn, TaskStatus[]> = {
  Backlog: ['idea', 'requested', 'backlog'],
  'To Do': ['assigned'],
  'In Progress': ['in_progress', 'blocked'],
  Review: ['review', 'revision'],
  Done: ['done', 'archived'],
}

const PRIMARY_COLUMN_STATUS: Record<BoardColumn, TaskStatus> = {
  Backlog: 'backlog',
  'To Do': 'assigned',
  'In Progress': 'in_progress',
  Review: 'review',
  Done: 'done',
}

const getColumnByStatus = (status: TaskStatus): BoardColumn =>
  (Object.keys(COLUMN_STATUS_MAP) as BoardColumn[]).find((column) =>
    COLUMN_STATUS_MAP[column].includes(status)
  ) ?? 'Backlog'

export function TaskBoard() {
  const [localTasks, setLocalTasks] = useState<Task[] | null>(null)
  const [createModal, setCreateModal] = useState<{ open: boolean; status: TaskStatus }>({
    open: false,
    status: 'backlog',
  })
  const [editModal, setEditModal] = useState<{ open: boolean; task: Task | null }>({
    open: false,
    task: null,
  })

  const {
    data: realtimeTasks,
    loading,
    error,
    refetch,
  } = useRealtimeCollection<Task>({
    path: 'tasks',
  })

  const tasks = localTasks ?? realtimeTasks

  const { pending, applyOptimistic } = useOptimisticUpdate<Task>({
    onCommit: async (nextTask) => {
      await updateDoc(doc(db, 'tasks', nextTask.id), {
        status: nextTask.status,
        updatedAt: new Date().toISOString(),
      })
    },
    errorMessage: 'Task move failed, reverted to previous state.',
  })

  const grouped = useMemo(() => {
    return BOARD_COLUMNS.reduce<Record<BoardColumn, Task[]>>((acc, column) => {
      acc[column] = tasks.filter((task) => COLUMN_STATUS_MAP[column].includes(task.status))
      return acc
    }, {} as Record<BoardColumn, Task[]>)
  }, [tasks])

  const handleDragEnd = async (event: DragEndEvent) => {
    const taskId = String(event.active.id)
    const overId = event.over?.id
    if (!overId) return

    const sourceTask = tasks.find((task) => task.id === taskId)
    if (!sourceTask) return

    let destinationColumn: BoardColumn | null = null
    if (BOARD_COLUMNS.includes(String(overId) as BoardColumn)) {
      destinationColumn = String(overId) as BoardColumn
    } else {
      const overTask = tasks.find((task) => task.id === String(overId))
      if (overTask) destinationColumn = getColumnByStatus(overTask.status)
    }
    if (!destinationColumn) return

    const nextStatus = PRIMARY_COLUMN_STATUS[destinationColumn]
    if (nextStatus === sourceTask.status) return

    const nextTask: Task = { ...sourceTask, status: nextStatus, updatedAt: new Date().toISOString() }
    setLocalTasks(tasks)
    await applyOptimistic(nextTask, sourceTask, (value) => {
      setLocalTasks((prev) => (prev ?? tasks).map((task) => (task.id === value.id ? value : task)))
    })
  }

  if (loading) {
    return (
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        {BOARD_COLUMNS.map((column) => (
          <div key={column} className="rounded-xl border border-border p-3">
            <Skeleton className="mb-2 h-5 w-24" />
            <Skeleton className="mb-2 h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </section>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4">
        <p className="mb-2 inline-flex items-center gap-2 text-sm text-red-200">
          <AlertTriangle className="h-4 w-4" />
          Failed to load tasks: {error.message}
        </p>
        <Button variant="outline" onClick={refetch}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <>
      <DndContext collisionDetection={closestCenter} onDragEnd={(event) => void handleDragEnd(event)}>
        <motion.section
          layout
          className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5"
          aria-busy={pending}
        >
          {BOARD_COLUMNS.map((column) => (
            <AnimatePresence key={column}>
              <motion.div key={column} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Column
                  title={column}
                  tasks={grouped[column]}
                  onTaskClick={(task) => setEditModal({ open: true, task })}
                  onAddTask={() =>
                    setCreateModal({ open: true, status: PRIMARY_COLUMN_STATUS[column] })
                  }
                />
              </motion.div>
            </AnimatePresence>
          ))}
        </motion.section>
      </DndContext>

      <CreateTaskModal
        open={createModal.open}
        onOpenChange={(open) => setCreateModal((prev) => ({ ...prev, open }))}
        initialStatus={createModal.status}
      />
      <EditTaskModal
        open={editModal.open}
        onOpenChange={(open) => setEditModal((prev) => ({ ...prev, open }))}
        task={editModal.task}
      />
    </>
  )
}

