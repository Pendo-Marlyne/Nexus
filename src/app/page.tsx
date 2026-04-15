'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Hero } from '../components/landing/Hero'
import { Features } from '../components/landing/Features'
import { Pricing } from '../components/landing/Pricing'
import { FAQ } from '../components/landing/FAQ'
import { CTA } from '../components/landing/CTA'
import { Button } from '../components/ui/button'

const TOOL_ROWS = [
  ['Asana', 'Slack', 'HubSpot', 'Harvest', 'Notion', 'Monday', 'Zoom'],
  ['Helix'],
]

export default function LandingPage() {
  const [dark, setDark] = useState(true)

  const rootClass = useMemo(
    () =>
      dark
        ? 'min-h-screen bg-[#070a14] text-slate-100'
        : 'min-h-screen bg-slate-50 text-slate-900',
    [dark]
  )

  return (
    <main className={rootClass}>
      <div className="mx-auto flex max-w-6xl justify-end px-4 py-4">
        <Button variant="outline" onClick={() => setDark((prev) => !prev)}>
          {dark ? 'Light mode' : 'Dark mode'}
        </Button>
      </div>
      <div className="mx-auto max-w-6xl space-y-10 px-4 pb-14">
        <Hero />

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">7 tools → 1 platform</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="mb-2 text-sm font-semibold">Before</p>
              <div className="flex flex-wrap gap-2">
                {TOOL_ROWS[0].map((tool) => (
                  <span key={tool} className="rounded-full border border-border px-2 py-1 text-xs">
                    {tool}
                  </span>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-xl border border-primary/50 bg-primary/10 p-4"
            >
              <p className="mb-2 text-sm font-semibold">After</p>
              <div className="flex flex-wrap gap-2">
                {TOOL_ROWS[1].map((tool) => (
                  <span key={tool} className="rounded-full border border-primary/50 px-2 py-1 text-xs">
                    {tool}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <Features />

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              'Connect your team and workflows',
              'Capture work with AI (voice, lead, handoff)',
              'Track delivery and improve with analytics',
            ].map((step, index) => (
              <article key={step} className="rounded-xl border border-border bg-card p-4">
                <p className="mb-1 text-xs text-muted-foreground">Step {index + 1}</p>
                <p className="text-sm font-medium">{step}</p>
              </article>
            ))}
          </div>
        </section>

        <Pricing />

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Testimonials</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <article key={item} className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                “Helix replaced our tool chaos and improved delivery visibility overnight.”
              </article>
            ))}
          </div>
        </section>

        <FAQ />
        <CTA />

        <footer className="rounded-xl border border-border bg-card p-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Helix. Built for high-performance agency teams.
        </footer>
      </div>
    </main>
  )
}

