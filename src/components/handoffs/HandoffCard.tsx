import { Button } from '../ui/button'

export interface HandoffItem {
  id: string
  fromUserId: string
  toUserId: string
  shiftStart: string
  shiftEnd: string
  aiSummary: string
  pendingTasks: string[]
  completedTasks: string[]
  urgentItems?: string[]
  status: 'pending' | 'accepted' | 'rejected'
}

interface HandoffCardProps {
  handoff: HandoffItem
  mode: 'incoming' | 'outgoing'
  onAccept?: (id: string) => Promise<void>
  onReject?: (id: string) => Promise<void>
}

export function HandoffCard({ handoff, mode, onAccept, onReject }: HandoffCardProps) {
  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold">
          {mode === 'incoming' ? `From ${handoff.fromUserId}` : `To ${handoff.toUserId}`}
        </h4>
        <span className="text-xs text-muted-foreground">{handoff.status}</span>
      </div>
      <p className="mb-2 text-xs text-muted-foreground">
        {new Date(handoff.shiftStart).toLocaleString()} - {new Date(handoff.shiftEnd).toLocaleString()}
      </p>
      <p className="mb-3 text-sm">{handoff.aiSummary}</p>
      <div className="mb-3 grid gap-1 text-xs">
        <p>Pending: {handoff.pendingTasks.length}</p>
        <p>Completed: {handoff.completedTasks.length}</p>
        <p>Urgent: {handoff.urgentItems?.length ?? 0}</p>
      </div>
      {mode === 'incoming' && handoff.status === 'pending' ? (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => void onAccept?.(handoff.id)}>
            Accept
          </Button>
          <Button size="sm" variant="outline" onClick={() => void onReject?.(handoff.id)}>
            Reject
          </Button>
        </div>
      ) : null}
    </article>
  )
}

