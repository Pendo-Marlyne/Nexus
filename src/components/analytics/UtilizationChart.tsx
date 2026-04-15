import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'

interface UtilizationDataPoint {
  member: string
  billable: number
  nonBillable: number
}

interface UtilizationChartProps {
  data: UtilizationDataPoint[]
}

export function UtilizationChart({ data }: UtilizationChartProps) {
  return (
    <section className="h-72 rounded-xl border border-border bg-card p-4">
      <h3 className="mb-2 text-sm font-semibold">Utilization (Billable vs Non-billable)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="member" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="billable" fill="#10b981" />
          <Bar dataKey="nonBillable" fill="#f59e0b" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}

