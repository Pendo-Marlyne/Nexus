const SKILLS = [
  'Lead capture and qualification',
  'Task tracking and ownership',
  'AI-powered handoff summaries',
  'Project health and analytics',
]

export default function SkillsSection() {
  return (
    <section className="page-card">
      <h2>Nexus Skills</h2>
      <ul className="skill-list">
        {SKILLS.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>
    </section>
  )
}
