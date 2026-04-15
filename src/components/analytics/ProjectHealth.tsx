import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'

interface ProjectHealthPoint {
  project: string
  budget: number
  actual: number
}

interface ProjectHealthProps {
  data: ProjectHealthPoint[]
}

export function ProjectHealth({ data }: ProjectHealthProps) {
  return (
    <section className="h-72 rounded-xl border border-border bg-card p-4">
      <h3 className="mb-2 text-sm font-semibold">Project health (Budget vs Actual)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="project" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="budget" fill="#06b6d4" />
          <Bar dataKey="actual" fill="#8b5cf6" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}

