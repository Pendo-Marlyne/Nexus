import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

interface TaskTrendPoint {
  date: string
  completed: number
}

interface TaskTrendsProps {
  data: TaskTrendPoint[]
}

export function TaskTrends({ data }: TaskTrendsProps) {
  return (
    <section className="h-72 rounded-xl border border-border bg-card p-4">
      <h3 className="mb-2 text-sm font-semibold">Task completion trend</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="completed" stroke="#8b5cf6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </section>
  )
}

