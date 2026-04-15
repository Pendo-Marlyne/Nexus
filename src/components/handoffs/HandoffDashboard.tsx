import { useMemo, useState } from 'react'
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore'
import { useRealtimeCollection } from '../../lib/hooks/useRealtimeCollection'
import { db } from '../../lib/firebase/client'
import { HandoffCard, type HandoffItem } from './HandoffCard'
import { HandoffSummary } from './HandoffSummary'
import { GenerateHandoffButton } from './GenerateHandoffButton'
import { HandoffHistory } from './HandoffHistory'

const CURRENT_USER_ID = 'current-user'

export function HandoffDashboard() {
  const { data, loading, error, refetch } = useRealtimeCollection<HandoffItem>({ path: 'handoffs' })
  const [generated, setGenerated] = useState<{
    summary: string
    pendingTasks: string[]
    urgentItems: string[]
    completedTasks: string[]
  } | null>(null)

  const incoming = useMemo(
    () => data.filter((item) => item.toUserId === CURRENT_USER_ID && item.status === 'pending'),
    [data]
  )
  const outgoing = useMemo(
    () => data.filter((item) => item.fromUserId === CURRENT_USER_ID && item.status === 'pending'),
    [data]
  )
  const history = useMemo(() => data.filter((item) => item.status !== 'pending'), [data])

  const updateStatus = async (id: string, status: 'accepted' | 'rejected') => {
    await updateDoc(doc(db, 'handoffs', id), { status })
  }

  const persistGenerated = async (payload: {
    summary: string
    pendingTasks: string[]
    urgentItems: string[]
    completedTasks: string[]
  }) => {
    setGenerated(payload)
    const shiftEnd = new Date().toISOString()
    const shiftStart = new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
    await addDoc(collection(db, 'handoffs'), {
      fromUserId: CURRENT_USER_ID,
      toUserId: 'next-shift-user',
      shiftStart,
      shiftEnd,
      aiSummary: payload.summary,
      pendingTasks: payload.pendingTasks,
      completedTasks: payload.completedTasks,
      urgentItems: payload.urgentItems,
      status: 'pending',
    })
  }

  if (loading) return <div className="card">Loading handoff dashboard...</div>
  if (error)
    return (
      <div className="card">
        Failed to load handoffs: {error.message} <button onClick={refetch}>Retry</button>
      </div>
    )

  return (
    <div className="space-y-4">
      <GenerateHandoffButton
        fromUserId={CURRENT_USER_ID}
        toUserId="next-shift-user"
        shiftStart={new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()}
        shiftEnd={new Date().toISOString()}
        onGenerated={(payload) => void persistGenerated(payload)}
      />
      {generated ? (
        <HandoffSummary
          summary={generated.summary}
          pendingTasks={generated.pendingTasks}
          urgentItems={generated.urgentItems}
          completedTasks={generated.completedTasks}
        />
      ) : null}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Incoming handoffs</h3>
          {incoming.map((handoff) => (
            <HandoffCard
              key={handoff.id}
              handoff={handoff}
              mode="incoming"
              onAccept={(id) => updateStatus(id, 'accepted')}
              onReject={(id) => updateStatus(id, 'rejected')}
            />
          ))}
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Outgoing handoffs</h3>
          {outgoing.map((handoff) => (
            <HandoffCard key={handoff.id} handoff={handoff} mode="outgoing" />
          ))}
        </div>
      </section>
      <HandoffHistory items={history} />
    </div>
  )
}

