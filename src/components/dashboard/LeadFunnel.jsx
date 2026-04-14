const LEADS = [
  { name: 'Acme Redesign', stage: 'Qualified', score: 88 },
  { name: 'Northstar Retainer', stage: 'Proposal', score: 74 },
  { name: 'Bluebird Product Site', stage: 'Won', score: 91 },
]

export function LeadFunnel() {
  return (
    <section className="card">
      <h3>Lead Funnel</h3>
      {LEADS.map((lead) => (
        <article className="layout-row" key={lead.name} style={{ justifyContent: 'space-between' }}>
          <span>{lead.name}</span>
          <span className="pill">{lead.stage}</span>
          <strong>{lead.score}</strong>
        </article>
      ))}
    </section>
  )
}
