import { useState } from 'react'
import { useAuth } from '../context/authcontext'

export default function SignupPage({ onSuccess }) {
  const { signup } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!name || !email || !password) return
    signup(email, name)
    onSuccess()
  }

  return (
    <section className="page-card form-card">
      <h2>Create account in 30 seconds ??</h2>
      <form onSubmit={handleSubmit} className="layout-stack">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
        <button type="submit">Create account</button>
      </form>
    </section>
  )
}
