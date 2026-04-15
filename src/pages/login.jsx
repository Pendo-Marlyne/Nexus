import { useAuth } from '../context/authcontext'

export default function LoginPage() {
  const { login } = useAuth()

  return (
    <section className="page-card">
      <h2>Login</h2>
      <p>Demo login for Nexus app pages.</p>
      <button onClick={() => login('user@nexus.app')}>Login as demo user</button>
    </section>
  )
}
