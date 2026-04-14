import { useMemo, useState } from 'react'
import { useRealtimeCollection } from '../../lib/hooks/useRealtimeCollection'
import { Skeleton } from '../ui/skeleton'
import { AddCommentForm } from './AddCommentForm'
import { CommentItem } from './CommentItem'
import type { Comment } from '../../types/comment'

interface TaskCommentsProps {
  taskId: string
  agencyId: string
}

export function TaskComments({ taskId, agencyId }: TaskCommentsProps) {
  const [optimistic, setOptimistic] = useState<Comment[]>([])
  const { data, loading, error, refetch } = useRealtimeCollection<Comment>({
    path: `tasks/${taskId}/comments`,
  })

  const comments = useMemo(() => {
    const persistedIds = new Set(data.map((comment) => comment.id))
    const pending = optimistic.filter((comment) => !persistedIds.has(comment.id))
    return [...pending, ...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [data, optimistic])

  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold">Comments</h3>
      <AddCommentForm
        taskId={taskId}
        agencyId={agencyId}
        onOptimisticComment={(comment) => setOptimistic((prev) => [comment, ...prev])}
      />
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : error ? (
        <div className="text-sm text-red-300">
          Failed to load comments. <button onClick={refetch}>Retry</button>
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : null}
        </div>
      )}
    </section>
  )
}

