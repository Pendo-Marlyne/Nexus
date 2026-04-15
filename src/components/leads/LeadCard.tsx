import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { Badge } from '../ui/badge'
import type { Lead } from '../../types/lead'

interface LeadCardProps {
  lead: Lead
  onClick: (lead: Lead) => void
  onScore: (lead: Lead) => Promise<void>
  scoring: boolean
}

const scoreVariant = (score: number) => {
  if (score < 40) return 'outline'
  if (score <= 70) return 'warning'
  return 'success'
}

export function LeadCard({ lead, onClick, onScore, scoring }: LeadCardProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { type: 'lead', lead },
  })

  return (
    <motion.article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-xl border border-border bg-card p-3 ${isDragging ? 'opacity-60' : ''}`}
      whileHover={{ y: -2 }}
      {...attributes}
      {...listeners}
      onClick={() => onClick(lead)}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h5 className="text-sm font-semibold">{lead.company || lead.name}</h5>
          <p className="text-xs text-muted-foreground">{lead.email}</p>
        </div>
        <Badge
          variant={scoreVariant(lead.score) as never}
          className={lead.score < 40 ? 'border-red-500 text-red-300' : undefined}
        >
          AI {lead.score}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">Budget: ${Number((lead as Lead & { budget?: number }).budget ?? 0).toLocaleString()}</p>
      <button
        className="mt-2 text-xs text-cyan-foreground underline"
        onClick={(event) => {
          event.stopPropagation()
          void onScore(lead)
        }}
        disabled={scoring}
      >
        {scoring ? 'Scoring...' : 'Run AI scoring'}
      </button>
    </motion.article>
  )
}

