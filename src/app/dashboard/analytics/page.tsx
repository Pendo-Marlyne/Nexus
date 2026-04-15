'use client'

import { useMemo, useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../../../lib/firebase/client'
import { Button } from '../../../../components/ui/button'
import { UtilizationChart } from '../../../../components/analytics/UtilizationChart'
import { TaskTrends } from '../../../../components/analytics/TaskTrends'
import { LeadFunnelChart } from '../../../../components/analytics/LeadFunnelChart'
import { WorkloadDistribution } from '../../../../components/analytics/WorkloadDistribution'
import { ProjectHealth } from '../../../../components/analytics/ProjectHealth'
import { ExportReportButton } from '../../../../components/analytics/ExportReportButton'

const queryClient = new QueryClient()

interface AnalyticsPayload {
  utilization: Array<{ member: string; billable: number; nonBillable: number }>
  trends: Array<{ date: string; completed: number }>
  funnel: Array<{ name: string; value: number }>
  workload: Array<{ name: string; value: number }>
  projectHealth: Array<{ project: string; budget: number; actual: number }>
}

async function fetchAnalytics(): Promise<AnalyticsPayload> {
  const [tasksSnap, leadsSnap, timeSnap, projectsSnap] = await Promise.all([
    getDocs(collection(db, 'tasks')),
    getDocs(collection(db, 'leads')),
    getDocs(collection(db, 'timeEntries')),
    getDocs(collection(db, 'projects')),
  ])

  const tasks = tasksSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
  const leads = leadsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
  const timeEntries = timeSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
  const projects = projectsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))

  const byMember = new Map<string, { billable: number; nonBillable: number }>()
  timeEntries.forEach((entry) => {
    const key = String((entry as { userUid?: string }).userUid ?? 'unknown')
    const current = byMember.get(key) ?? { billable: 0, nonBillable: 0 }
    const minutes = Number((entry as { minutes?: number }).minutes ?? 0)
    if (String((entry as { status?: string }).status) === 'approved') current.billable += minutes
    else current.nonBillable += minutes
    byMember.set(key, current)
  })

  const utilization = Array.from(byMember.entries()).map(([member, value]) => ({
    member,
    billable: Math.round(value.billable / 60),
    nonBillable: Math.round(value.nonBillable / 60),
  }))

  const trendMap = new Map<string, number>()
  tasks
    .filter((task) => String((task as { status?: string }).status) === 'done')
    .forEach((task) => {
      const date = String((task as { updatedAt?: string }).updatedAt ?? '').slice(0, 10)
      trendMap.set(date, (trendMap.get(date) ?? 0) + 1)
    })
  const trends = Array.from(trendMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, completed]) => ({ date, completed }))

  const funnelStages = [
    { key: 'new', name: 'New' },
    { key: 'contacted', name: 'Contacted' },
    { key: 'qualified', name: 'Qualified' },
    { key: 'proposal_sent', name: 'Proposal' },
    { key: 'won', name: 'Won' },
    { key: 'lost', name: 'Lost' },
  ]
  const funnel = funnelStages.map((stage) => ({
    name: stage.name,
    value: leads.filter((lead) => String((lead as { status?: string }).status) === stage.key).length,
  }))

  const workloadMap = new Map<string, number>()
  tasks.forEach((task) => {
    const assignee = String((task as { assigneeUid?: string }).assigneeUid ?? 'unassigned')
    workloadMap.set(assignee, (workloadMap.get(assignee) ?? 0) + 1)
  })
  const workload = Array.from(workloadMap.entries()).map(([name, value]) => ({ name, value }))

  const projectHealth = projects.map((project) => {
    const budget = Number((project as { budget?: number }).budget ?? 0)
    const projectId = String((project as { id?: string }).id ?? '')
    const actualMinutes = timeEntries
      .filter((entry) => String((entry as { projectId?: string }).projectId) === projectId)
      .reduce((sum, entry) => sum + Number((entry as { minutes?: number }).minutes ?? 0), 0)
    const actual = Math.round((actualMinutes / 60) * 60)
    return {
      project: String((project as { name?: string }).name ?? projectId).slice(0, 16),
      budget,
      actual,
    }
  })

  return { utilization, trends, funnel, workload, projectHealth }
}

function AnalyticsContent() {
  const [realtime, setRealtime] = useState(false)
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['analytics-dashboard', realtime],
    queryFn: fetchAnalytics,
    refetchInterval: realtime ? 20_000 : false,
  })

  const exportSections = useMemo(
    () =>
      data
        ? [
            {
              heading: 'Utilization',
              lines: data.utilization.map((row) => `${row.member}: billable ${row.billable}h, non-billable ${row.nonBillable}h`),
            },
            {
              heading: 'Task Trends',
              lines: data.trends.map((row) => `${row.date}: ${row.completed} completed`),
            },
            {
              heading: 'Lead Funnel',
              lines: data.funnel.map((row) => `${row.name}: ${row.value}`),
            },
            {
              heading: 'Project Health',
              lines: data.projectHealth.map((row) => `${row.project}: budget ${row.budget}, actual ${row.actual}`),
            },
          ]
        : [],
    [data]
  )

  if (isLoading) return <div className="card">Loading analytics...</div>
  if (error) {
    return (
      <div className="card">
        Failed to load analytics: {(error as Error).message}{' '}
        <Button variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    )
  }
  if (!data) return null

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Analytics Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setRealtime((prev) => !prev)}>
            Real-time: {realtime ? 'On' : 'Off'}
          </Button>
          <ExportReportButton title="Helix Analytics Report" sections={exportSections} />
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <UtilizationChart data={data.utilization} />
        <TaskTrends data={data.trends} />
        <LeadFunnelChart data={data.funnel} />
        <WorkloadDistribution data={data.workload} />
      </div>
      <ProjectHealth data={data.projectHealth} />
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AnalyticsContent />
    </QueryClientProvider>
  )
}

