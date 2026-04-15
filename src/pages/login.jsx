import { useState } from 'react'
import { useAuth } from '../context/authcontext'

export default function LoginPage({ onSuccess, onSignup }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!email || !password) return
    login(email)
    onSuccess()
  }

  return (
    <section className="page-card form-card">
      <h2>Welcome back ?</h2>
      <form onSubmit={handleSubmit} className="layout-stack">
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>
      <button className="ghost" onClick={() => { login('google@nexus.app', 'Google User'); onSuccess() }}>
        Continue with Google
      </button>
      <p>No account yet? <button className="link-btn" onClick={onSignup}>Sign up</button></p>
    </section>
  )
}
