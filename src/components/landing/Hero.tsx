import { motion } from 'framer-motion'
import { Button } from '../ui/button'

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-14 text-center">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.25),transparent_55%)]"
        animate={{ rotate: [0, 180, 360] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      />
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative mx-auto max-w-3xl text-4xl font-semibold leading-tight md:text-5xl"
      >
        The DNA of high-performance agencies
      </motion.h1>
      <p className="relative mx-auto mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
        Helix unifies lead scoring, delivery, handoffs, and analytics into one intelligence layer.
      </p>
      <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button>Start free trial</Button>
        <Button variant="outline">Watch demo</Button>
      </div>
      <div className="relative mt-7 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border border-border px-3 py-1">Trusted by 250+ agencies</span>
        <span className="rounded-full border border-border px-3 py-1">SOC 2-ready workflows</span>
        <span className="rounded-full border border-border px-3 py-1">AI-first operations</span>
      </div>
    </section>
  )
}

