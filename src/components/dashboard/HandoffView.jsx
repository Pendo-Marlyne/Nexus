const HANDOFFS = [
  { from: 'Design', to: 'Frontend', item: 'Acme hero assets', status: 'Ready' },
  { from: 'Frontend', to: 'QA', item: 'Landing page build', status: 'Waiting review' },
]

export function HandoffView() {
  return (
    <section className="card">
      <h3>Handoffs</h3>
      {HANDOFFS.map((handoff) => (
        <article className="card" key={`${handoff.item}-${handoff.to}`}>
          <p>
            <strong>{handoff.from}</strong> to <strong>{handoff.to}</strong>
          </p>
          <p>{handoff.item}</p>
          <span className="pill">{handoff.status}</span>
        </article>
      ))}
    </section>
  )
}
