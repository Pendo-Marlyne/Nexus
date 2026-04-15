import { motion } from 'framer-motion'

const FEATURES = [
  { title: 'AI Lead Scoring', desc: 'Predict win likelihood and prioritize pipeline work.' },
  { title: 'Voice-to-Task', desc: 'Capture spoken updates and convert to structured tasks.' },
  { title: 'Smart Handoffs', desc: 'AI shift summaries with pending/urgent extraction.' },
  { title: 'Real-time Collaboration', desc: 'Realtime task, comment, and activity updates.' },
]

export function Features() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Everything your agency needs in one core</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {FEATURES.map((feature, index) => (
          <motion.article
            key={feature.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <h3 className="mb-1 text-sm font-semibold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.desc}</p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

