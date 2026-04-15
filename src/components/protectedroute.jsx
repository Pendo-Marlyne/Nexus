import { useAuth } from '../context/authcontext'

export default function ProtectedRoute({ children }) {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="page-card">
        <h2>Access restricted</h2>
        <p>Please sign in to view Nexus dashboard features.</p>
      </div>
    )
  }

  return children
}
