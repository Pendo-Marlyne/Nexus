import { useState } from 'react'

export default function ProjectViewPage() {
  const [messages, setMessages] = useState(['Welcome to Project Bloom chat!'])
  const [draft, setDraft] = useState('')

  const sendMessage = () => {
    if (!draft.trim()) return
    setMessages((current) => [...current, draft.trim()])
    setDraft('')
  }

  return (
    <main className="layout-stack">
      <section className="page-card">
        <h2>Project View</h2>
        <p>One project, one cozy place for tasks + team chat.</p>
      </section>

      <section className="page-card">
        <h3>Project Chat</h3>
        <div className="chat-box">
          {messages.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
        <div className="row-gap">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message" />
          <button onClick={sendMessage}>Send</button>
        </div>
      </section>
    </main>
  )
}
