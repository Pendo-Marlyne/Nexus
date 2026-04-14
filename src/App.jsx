import { useMemo, useState } from 'react'
import { AISidebar } from './components/dashboard/AISidebar'
import { HandoffView } from './components/dashboard/HandoffView'
import { LeadFunnel } from './components/dashboard/LeadFunnel'
import { TaskBoard } from './components/dashboard/TaskBoard'
import { TimeTracker } from './components/dashboard/TimeTracker'
import { VoiceTaskInput } from './components/forms/VoiceTaskInput'
import { ExportButton } from './components/shared/ExportButton'
import { Footer } from './components/shared/Footer'
import { Navbar } from './components/shared/Navbar'
import { TASK_STATES } from './types/task'

const TABS = ['dashboard', 'projects', 'tasks', 'leads', 'handoffs', 'analytics']

const SAMPLE_TASKS = [
  { id: 'T-101', title: 'Finalize Acme hero section', state: 'In Progress', assignee: 'Nina' },
  { id: 'T-102', title: 'Logo revision v2', state: 'Review', assignee: 'Kenny' },
  { id: 'T-103', title: 'Proposal draft review', state: 'Backlog', assignee: null },
  { id: 'T-104', title: 'Homepage QA sweep', state: 'Blocked', assignee: 'Rika' },
]

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [tasks, setTasks] = useState(SAMPLE_TASKS)

  const stats = useMemo(() => {
    const blocked = tasks.filter((task) => task.state === 'Blocked').length
    const done = tasks.filter((task) => task.state === 'Done').length
    return { active: tasks.length, blocked, done }
  }, [tasks])

  const moveTask = (id, nextState) => {
    if (!TASK_STATES.includes(nextState)) return
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, state: nextState } : task)))
  }

  return (
    <div className="page-wrap">
      <Navbar activeTab={activeTab} tabs={TABS} onTabChange={setActiveTab} />
      <section className="hero">
        <div className="hero-copy">
          <span className="pill brand-pill">Nexus Platform</span>
          <h1>From idea to delivery in one connected flow.</h1>
          <p>
            Nexus unifies your agency execution: leads, project scope, task ownership,
            reviews, handoffs, and utilization insights in a single command center.
          </p>
          <div className="layout-row hero-actions">
            <button className="btn">Start Free</button>
            <button className="btn ghost">Watch Tour</button>
          </div>
          <div className="kpi-row">
            <div className="kpi">
              <strong>42%</strong>
              <small>faster handoffs</small>
            </div>
            <div className="kpi">
              <strong>89%</strong>
              <small>on-time delivery</small>
            </div>
            <div className="kpi">
              <strong>3.6x</strong>
              <small>workflow visibility</small>
            </div>
          </div>
        </div>
        <div className="hero-preview card">
          <h3>Live Operations Snapshot</h3>
          <div className="preview-line">
            <span>Active tasks</span>
            <strong>{stats.active}</strong>
          </div>
          <div className="preview-line">
            <span>Blocked</span>
            <strong className="danger">{stats.blocked}</strong>
          </div>
          <div className="preview-line">
            <span>Delivered</span>
            <strong className="success">{stats.done}</strong>
          </div>
          <div className="preview-graph" />
        </div>
      </section>
      <div className="app-shell">
        <main className="content">
          <header className="topbar">
          <div>
            <h2>{activeTab}</h2>
            <span>{stats.active} tasks / {stats.blocked} blocked / {stats.done} done</span>
          </div>
          <ExportButton fileName="nexus-dashboard.json" payload={{ tasks }} />
        </header>

        {(activeTab === 'dashboard' || activeTab === 'tasks') && (
          <TaskBoard tasks={tasks} onMoveTask={moveTask} />
        )}

        {(activeTab === 'dashboard' || activeTab === 'leads') && <LeadFunnel />}
        {(activeTab === 'dashboard' || activeTab === 'handoffs') && <HandoffView />}
        {(activeTab === 'dashboard' || activeTab === 'analytics') && <TimeTracker />}
        {(activeTab === 'dashboard' || activeTab === 'projects') && <VoiceTaskInput />}
        </main>

        <AISidebar />
      </div>
      <Footer />
    </div>
  )
}

export default App
