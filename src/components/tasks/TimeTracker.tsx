import { useEffect, useMemo, useState } from 'react'
import { addDoc, collection } from 'firebase/firestore'
import { Button } from '../ui/button'
import { db } from '../../lib/firebase/client'
import { useRealtimeCollection } from '../../lib/hooks/useRealtimeCollection'
import type { TimeEntry } from '../../types/timeEntry'

interface TimeTrackerProps {
  taskId: string
  projectId: string
  agencyId: string
  userUid?: string
}

export function TimeTracker({
  taskId,
  projectId,
  agencyId,
  userUid = 'current-user',
}: TimeTrackerProps) {
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const { data } = useRealtimeCollection<TimeEntry>({
    path: 'timeEntries',
  })

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setSeconds((prev) => prev + 1), 1000)
    return () => window.clearInterval(id)
  }, [running])

  const totalMinutes = useMemo(
    () =>
      data
        .filter((entry) => entry.taskId === taskId)
        .reduce((sum, entry) => sum + entry.minutes, 0),
    [data, taskId]
  )

  const stopAndSave = async () => {
    const minutes = Math.max(1, Math.round(seconds / 60))
    const now = new Date().toISOString()
    await addDoc(collection(db, 'timeEntries'), {
      agencyId,
      projectId,
      taskId,
      userUid,
      minutes,
      notes: 'Tracked from task detail',
      status: 'submitted',
      entryDate: now,
      createdAt: now,
      updatedAt: now,
    })
    await addDoc(collection(db, `tasks/${taskId}/activity`), {
      type: 'time_logged',
      message: `Logged ${minutes} minutes`,
      actorUid: userUid,
      createdAt: now,
    })
    setRunning(false)
    setSeconds(0)
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-2 text-sm font-semibold">Time Tracking</h3>
      <p className="mb-2 text-sm text-muted-foreground">
        Current timer: {Math.floor(seconds / 60)}m {seconds % 60}s
      </p>
      <p className="mb-3 text-sm text-muted-foreground">Total logged: {totalMinutes} minutes</p>
      <div className="flex gap-2">
        {!running ? (
          <Button onClick={() => setRunning(true)}>Start</Button>
        ) : (
          <Button onClick={() => void stopAndSave()}>Stop & Save</Button>
        )}
      </div>
    </section>
  )
}

