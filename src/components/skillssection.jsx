export default function SkillsSection({ progress }) {
  const tips = [
    'Breathe, sip water, and tackle one tiny task first.',
    'You are not behind. You are building with care.',
    'Done is lovely. Perfect can wait.',
  ]

  return (
    <section className="page-card">
      <h3>Cheerleader Corner ??</h3>
      <p>You're {progress}% done with this week. Keep sparkling.</p>
      <ul className="skill-list">
        {tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </section>
  )
}
