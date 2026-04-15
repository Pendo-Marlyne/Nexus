import { ResponsiveContainer, FunnelChart, Funnel, Tooltip, LabelList } from 'recharts'
import type { Lead } from '../../types/lead'

const LABELS = [
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'proposal_sent', label: 'Proposal' },
  { key: 'won', label: 'Closed Won' },
  { key: 'lost', label: 'Closed Lost' },
] as const

interface LeadFunnelChartProps {
  leads: Lead[]
}

export function LeadFunnelChart({ leads }: LeadFunnelChartProps) {
  const data = LABELS.map(({ key, label }) => ({
    name: label,
    value: leads.filter((lead) => lead.status === key).length,
  }))

  return (
    <div className="h-64 w-full rounded-xl border border-border bg-card p-3">
      <h4 className="mb-2 text-sm font-semibold">Funnel visualization</h4>
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart>
          <Tooltip />
          <Funnel dataKey="value" data={data} isAnimationActive fill="#8b5cf6">
            <LabelList position="right" fill="#cbd5e1" stroke="none" dataKey="name" />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  )
}

