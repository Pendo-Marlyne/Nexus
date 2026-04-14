const ENTRIES = [
  { who: 'Nina', project: 'Acme', hours: 6.5 },
  { who: 'Kenny', project: 'Acme', hours: 7.2 },
  { who: 'Rika', project: 'Bluebird', hours: 5.8 },
]

export function TimeTracker() {
  const total = ENTRIES.reduce((sum, entry) => sum + entry.hours, 0)
  const utilization = Math.round((total / (ENTRIES.length * 8)) * 100)

  return (
    <section className="card">
      <h3>Time and Utilization</h3>
      <p className={utilization > 80 ? 'success' : 'danger'}>Utilization: {utilization}%</p>
      {ENTRIES.map((entry) => (
        <article className="layout-row" style={{ justifyContent: 'space-between' }} key={entry.who}>
          <span>{entry.who}</span>
          <small>{entry.project}</small>
          <strong>{entry.hours}h</strong>
        </article>
      ))}
    </section>
  )
}
