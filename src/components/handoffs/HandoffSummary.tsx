interface HandoffSummaryProps {
  summary: string
  pendingTasks: string[]
  urgentItems: string[]
  completedTasks: string[]
}

export function HandoffSummary({
  summary,
  pendingTasks,
  urgentItems,
  completedTasks,
}: HandoffSummaryProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-2 text-sm font-semibold">AI Shift Summary</h3>
      <p className="mb-3 text-sm">{summary}</p>
      <div className="grid gap-2 md:grid-cols-3">
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Pending</h4>
          <ul className="space-y-1 text-xs">
            {pendingTasks.map((task) => (
              <li key={task}>• {task}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Urgent</h4>
          <ul className="space-y-1 text-xs">
            {urgentItems.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Completed</h4>
          <ul className="space-y-1 text-xs">
            {completedTasks.map((task) => (
              <li key={task}>• {task}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

