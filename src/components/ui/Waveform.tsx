import { motion } from 'framer-motion'

interface WaveformProps {
  active: boolean
  level?: number
}

export function Waveform({ active, level = 0.2 }: WaveformProps) {
  const bars = Array.from({ length: 20 })
  return (
    <div className="flex h-12 items-end gap-1 rounded-md border border-border bg-card px-2 py-1">
      {bars.map((_, index) => {
        const height = active ? Math.max(8, Math.round((Math.sin(index + Date.now() / 400) * 0.5 + 0.5) * 36 * (0.4 + level))) : 8
        return (
          <motion.span
            key={index}
            animate={{ height }}
            transition={{ duration: 0.2 }}
            className="w-1 rounded-sm bg-primary"
          />
        )
      })}
    </div>
  )
}

