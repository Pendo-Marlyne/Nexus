import SkillsSection from '../components/skillssection'
import { useAuth } from '../context/authcontext'

export default function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <main className="layout-stack">
      <section className="hero page-card">
        <h2>Nexus Operations Dashboard</h2>
        <p>Welcome {user?.email}. Manage leads, tasks, and handoffs in one workspace.</p>
        <button onClick={logout}>Log out</button>
      </section>
      <SkillsSection />
    </main>
  )
}
