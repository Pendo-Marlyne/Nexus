import { useAuth } from '../context/authcontext'

export default function ProtectedRoute({ children, onNeedLogin }) {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="page-card soft-center">
        <h2>Sign in first, bestie ??</h2>
        <p>Your workspace is ready whenever you are.</p>
        <button onClick={onNeedLogin}>Go to Login</button>
      </div>
    )
  }

  return children
}
