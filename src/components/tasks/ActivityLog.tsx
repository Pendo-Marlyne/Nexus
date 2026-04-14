import { useRealtimeCollection } from '../../lib/hooks/useRealtimeCollection'
import { Skeleton } from '../ui/skeleton'

interface ActivityEntry {
  id: string
  type: string
  message: string
  actorUid: string
  createdAt: string
}

interface ActivityLogProps {
  taskId: string
}

export function ActivityLog({ taskId }: ActivityLogProps) {
  const { data, loading, error, refetch } = useRealtimeCollection<ActivityEntry>({
    path: `tasks/${taskId}/activity`,
  })

  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold">Activity</h3>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : error ? (
        <div className="text-sm text-red-300">
          Failed to load activity. <button onClick={refetch}>Retry</button>
        </div>
      ) : (
        <ul className="space-y-2">
          {data
            .slice()
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((entry) => (
              <li key={entry.id} className="rounded-lg border border-border p-2 text-sm">
                <p>{entry.message}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.actorUid} · {new Date(entry.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
        </ul>
      )}
    </section>
  )
}

