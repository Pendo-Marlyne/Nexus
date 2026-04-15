import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    q: 'Can I migrate from Asana, Slack, and HubSpot?',
    a: 'Yes. Helix supports staged migration with mapping to unified objects.',
  },
  {
    q: 'How does AI lead scoring work?',
    a: 'It evaluates budget, signals, and engagement to produce a score and rationale.',
  },
  {
    q: 'Can teams work offline?',
    a: 'Yes. Offline queueing syncs updates once connectivity is restored.',
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">FAQ</h2>
      {FAQS.map((item, index) => {
        const expanded = open === index
        return (
          <article key={item.q} className="rounded-xl border border-border bg-card">
            <button
              className="flex w-full items-center justify-between px-4 py-3 text-left"
              onClick={() => setOpen(expanded ? null : index)}
            >
              <span className="text-sm font-medium">{item.q}</span>
              <ChevronDown className={`h-4 w-4 transition ${expanded ? 'rotate-180' : ''}`} />
            </button>
            {expanded ? <p className="px-4 pb-4 text-sm text-muted-foreground">{item.a}</p> : null}
          </article>
        )
      })}
    </section>
  )
}

