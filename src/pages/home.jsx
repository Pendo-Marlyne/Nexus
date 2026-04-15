export default function HomePage({ onLogin, onSignup }) {
  return (
    <main className="layout-stack">
      <section className="page-card hero-card">
        <h2>Work, together. In pink. ??</h2>
        <p>
          Nexus is a cozy work space for teams: tasks, chats, files, and feel-good momentum all in one place.
        </p>
        <div className="row-gap">
          <button onClick={onLogin}>Login</button>
          <button className="ghost" onClick={onSignup}>Sign Up</button>
        </div>
      </section>
    </main>
  )
}
