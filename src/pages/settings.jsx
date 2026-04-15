import { useAuth } from '../context/authcontext'

export default function SettingsPage({ onGoHome }) {
  const { user, logout, deleteAccount } = useAuth()

  return (
    <main className="layout-stack">
      <section className="page-card">
        <h2>Settings</h2>
        <p>Profile: {user?.name} ({user?.email})</p>
      </section>

      <section className="page-card row-gap">
        <button onClick={() => { logout(); onGoHome() }}>Logout</button>
        <button className="danger-btn" onClick={() => { deleteAccount(); onGoHome() }}>
          Delete account
        </button>
      </section>
    </main>
  )
}
