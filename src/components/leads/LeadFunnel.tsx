import { useMemo, useState } from 'react'
import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { doc, updateDoc } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import { useRealtimeCollection } from '../../lib/hooks/useRealtimeCollection'
import { useOptimisticUpdate } from '../../lib/hooks/useOptimisticUpdate'
import { db } from '../../lib/firebase/client'
import type { Lead, LeadStatus } from '../../types/lead'
import { LeadCard } from './LeadCard'
import { LeadDetailModal } from './LeadDetailModal'
import { AddLeadForm } from './AddLeadForm'
import { LeadFunnelChart } from './LeadFunnelChart'

const STAGES = ['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost'] as const
const STAGE_LABELS: Record<(typeof STAGES)[number], string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal_sent: 'Proposal',
  won: 'Closed Won',
  lost: 'Closed Lost',
}

interface AIScoringResponse {
  score: number
  reasoning: string
  suggestedNextStep: string
  closeProbability: number
}

const functionsBase = import.meta.env.VITE_FUNCTIONS_BASE_URL ?? ''

export function LeadFunnel() {
  const [localLeads, setLocalLeads] = useState<Lead[] | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [scoringLeadId, setScoringLeadId] = useState<string | null>(null)
  const { data, loading, error, refetch } = useRealtimeCollection<Lead>({ path: 'leads' })
  const leads = localLeads ?? data

  const { applyOptimistic } = useOptimisticUpdate<Lead>({
    onCommit: async (nextLead) => {
      await updateDoc(doc(db, 'leads', nextLead.id), {
        status: nextLead.status,
        updatedAt: new Date().toISOString(),
      })
    },
  })

  const grouped = useMemo(
    () =>
      STAGES.reduce<Record<(typeof STAGES)[number], Lead[]>>((acc, stage) => {
        acc[stage] = leads.filter((lead) => lead.status === stage)
        return acc
      }, {} as Record<(typeof STAGES)[number], Lead[]>),
    [leads]
  )

  const scoreLead = async (lead: Lead) => {
    setScoringLeadId(lead.id)
    try {
      const response = await fetch(`${functionsBase}/scoreLead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead }),
      })
      if (!response.ok) throw new Error('Failed to score lead')
      const result = (await response.json()) as AIScoringResponse
      await updateDoc(doc(db, 'leads', lead.id), {
        score: result.score,
        aiReasoning: result.reasoning,
        suggestedNextStep: result.suggestedNextStep,
        closeProbability: result.closeProbability,
        updatedAt: new Date().toISOString(),
      })
    } finally {
      setScoringLeadId(null)
    }
  }

  const onDragEnd = async (event: DragEndEvent) => {
    const leadId = String(event.active.id)
    const overId = event.over?.id ? String(event.over.id) : null
    if (!overId) return
    const lead = leads.find((item) => item.id === leadId)
    if (!lead) return

    const targetStatus = STAGES.find((stage) => stage === overId)
      ? (overId as LeadStatus)
      : leads.find((item) => item.id === overId)?.status
    if (!targetStatus || targetStatus === lead.status) return

    const nextLead: Lead = { ...lead, status: targetStatus, updatedAt: new Date().toISOString() }
    setLocalLeads(leads)
    await applyOptimistic(nextLead, lead, (value) =>
      setLocalLeads((prev) => (prev ?? leads).map((item) => (item.id === value.id ? value : item)))
    )
  }

  if (loading) {
    return (
      <section className="space-y-3">
        <Skeleton className="h-52 w-full" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
          {STAGES.map((stage) => (
            <Skeleton key={stage} className="h-56 w-full" />
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
        Failed to load leads: {error.message}{' '}
        <Button variant="outline" onClick={refetch}>
          Retry
        </Button>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Lead funnel</h3>
        <Button onClick={() => setAddOpen(true)}>Add lead</Button>
      </div>
      <LeadFunnelChart leads={leads} />

      <DndContext collisionDetection={closestCenter} onDragEnd={(event) => void onDragEnd(event)}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
          {STAGES.map((stage) => (
            <motion.section
              key={stage}
              layout
              className="min-h-[260px] rounded-xl border border-border bg-card/60 p-3"
            >
              <h4 className="mb-2 text-sm font-semibold">{STAGE_LABELS[stage]}</h4>
              <SortableContext items={grouped[stage].map((lead) => lead.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {grouped[stage].map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onClick={setSelectedLead}
                      onScore={scoreLead}
                      scoring={scoringLeadId === lead.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </motion.section>
          ))}
        </div>
      </DndContext>

      <LeadDetailModal
        lead={selectedLead}
        open={Boolean(selectedLead)}
        onOpenChange={(open) => {
          if (!open) setSelectedLead(null)
        }}
      />
      <AddLeadForm open={addOpen} onOpenChange={setAddOpen} />
    </section>
  )
}

