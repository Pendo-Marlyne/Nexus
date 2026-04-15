import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface WorkloadPoint {
  name: string
  value: number
}

interface WorkloadDistributionProps {
  data: WorkloadPoint[]
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

export function WorkloadDistribution({ data }: WorkloadDistributionProps) {
  return (
    <section className="h-72 rounded-xl border border-border bg-card p-4">
      <h3 className="mb-2 text-sm font-semibold">Team workload distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={95}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </section>
  )
}

