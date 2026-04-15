import type { HandoffItem } from './HandoffCard'

interface HandoffHistoryProps {
  items: HandoffItem[]
}

export function HandoffHistory({ items }: HandoffHistoryProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-2 text-sm font-semibold">Handoff history</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg border border-border p-2 text-xs">
            <p>
              {item.fromUserId} → {item.toUserId}
            </p>
            <p className="text-muted-foreground">
              {new Date(item.shiftEnd).toLocaleString()} · {item.status}
            </p>
          </li>
        ))}
        {items.length === 0 ? <li className="text-xs text-muted-foreground">No handoff history yet.</li> : null}
      </ul>
    </section>
  )
}

