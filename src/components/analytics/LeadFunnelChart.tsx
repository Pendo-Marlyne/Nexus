import { FunnelChart, Funnel, ResponsiveContainer, Tooltip, LabelList } from 'recharts'

interface FunnelPoint {
  name: string
  value: number
}

interface LeadFunnelChartProps {
  data: FunnelPoint[]
}

export function LeadFunnelChart({ data }: LeadFunnelChartProps) {
  return (
    <section className="h-72 rounded-xl border border-border bg-card p-4">
      <h3 className="mb-2 text-sm font-semibold">Lead funnel conversion</h3>
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart>
          <Tooltip />
          <Funnel data={data} dataKey="value" isAnimationActive fill="#06b6d4">
            <LabelList dataKey="name" position="right" fill="#cbd5e1" />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </section>
  )
}

