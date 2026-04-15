import { useState } from 'react'
import { Button } from '../ui/button'

interface GeneratedSummary {
  summary: string
  pendingTasks: string[]
  urgentItems: string[]
  completedTasks: string[]
}

interface GenerateHandoffButtonProps {
  fromUserId: string
  toUserId: string
  shiftStart: string
  shiftEnd: string
  onGenerated: (payload: GeneratedSummary) => void
}

const FUNCTIONS_BASE_URL = import.meta.env.VITE_FUNCTIONS_BASE_URL ?? ''

export function GenerateHandoffButton({
  fromUserId,
  toUserId,
  shiftStart,
  shiftEnd,
  onGenerated,
}: GenerateHandoffButtonProps) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    setPending(true)
    setError(null)
    try {
      const response = await fetch(`${FUNCTIONS_BASE_URL}/summarizeHandoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId, toUserId, shiftStart, shiftEnd }),
      })
      if (!response.ok) throw new Error('Failed to generate handoff summary')
      const data = (await response.json()) as GeneratedSummary
      onGenerated(data)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unexpected generation error')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={() => void generate()} disabled={pending}>
        {pending ? 'Generating...' : 'Generate handoff report'}
      </Button>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  )
}

