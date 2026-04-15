import * as logger from 'firebase-functions/logger'
import { onRequest } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { LEAD_SCORING_PROMPT, HANDOFF_SUMMARY_PROMPT, VOICE_TO_TASK_PROMPT, PROJECT_SCOPE_PROMPT } from './ai/prompts'
import { checkRateLimit } from './utils/rateLimit'
import { getCached, setCached } from './utils/cache'

initializeApp()
const db = getFirestore()

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const RESEND_API_KEY = process.env.RESEND_API_KEY
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 700): Promise<T> {
  let error: unknown
  for (let i = 0; i <= retries; i += 1) {
    try {
      return await fn()
    } catch (caught) {
      error = caught
      if (i < retries) await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)))
    }
  }
  throw error
}

async function openAiJson(prompt: string, input: unknown) {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is missing')
  const response = await withRetry(() =>
    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: JSON.stringify(input) },
        ],
      }),
    })
  )
  if (!response.ok) throw new Error(`OpenAI error: ${response.status}`)
  const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> }
  const content = json.choices?.[0]?.message?.content
  if (!content) throw new Error('OpenAI empty response')
  return JSON.parse(content) as Record<string, unknown>
}

export const scoreLead = onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const caller = req.ip ?? 'unknown'
    const allowed = await checkRateLimit(`scoreLead:${caller}`, 10)
    if (!allowed) return res.status(429).json({ error: 'Rate limit exceeded (10/hour)' })

    const lead = req.body?.lead
    if (!lead) return res.status(400).json({ error: 'Missing lead payload' })
    const cacheKey = `scoreLead:${JSON.stringify(lead)}`
    const cached = await getCached(cacheKey)
    if (cached) return res.status(200).json({ ...cached, cacheHit: true })

    const result = await openAiJson(LEAD_SCORING_PROMPT, lead)
    await setCached(cacheKey, result, 2 * 60 * 60 * 1000)
    return res.status(200).json(result)
  } catch (error) {
    logger.error('scoreLead failed', error)
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

export const summarizeHandoff = onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const { fromUserId, toUserId } = req.body ?? {}
    const shiftEnd = new Date()
    const shiftStart = new Date(Date.now() - 8 * 60 * 60 * 1000)

    const [tasksSnap, commentsSnap, timeSnap] = await Promise.all([
      db.collection('tasks').where('updatedAt', '>=', shiftStart.toISOString()).get(),
      db.collectionGroup('comments').where('createdAt', '>=', shiftStart.toISOString()).get(),
      db.collection('timeEntries').where('createdAt', '>=', shiftStart.toISOString()).get(),
    ])

    const payload = {
      fromUserId,
      toUserId,
      shiftStart: shiftStart.toISOString(),
      shiftEnd: shiftEnd.toISOString(),
      tasks: tasksSnap.docs.map((d) => d.data()),
      comments: commentsSnap.docs.map((d) => d.data()),
      timeEntries: timeSnap.docs.map((d) => d.data()),
    }

    const result = await openAiJson(HANDOFF_SUMMARY_PROMPT, payload)
    return res.status(200).json(result)
  } catch (error) {
    logger.error('summarizeHandoff failed', error)
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

export const voiceToTask = onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const { audioBase64 } = req.body ?? {}
    if (!audioBase64) return res.status(400).json({ error: 'Missing audioBase64' })
    if (!OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY is missing' })

    const transcription = await withRetry(async () => {
      const form = new FormData()
      form.append('model', 'whisper-1')
      form.append('file', new Blob([Buffer.from(audioBase64, 'base64')]), 'audio.webm')
      const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: form,
      })
      if (!resp.ok) throw new Error(`Whisper error ${resp.status}`)
      return (await resp.json()) as { text: string }
    })

    const extracted = await openAiJson(VOICE_TO_TASK_PROMPT, { transcript: transcription.text })
    return res.status(200).json(extracted)
  } catch (error) {
    logger.error('voiceToTask failed', error)
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

export const generateProjectScope = onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const { projectDescription } = req.body ?? {}
    if (!projectDescription) return res.status(400).json({ error: 'Missing projectDescription' })
    const result = await openAiJson(PROJECT_SCOPE_PROMPT, { projectDescription })
    return res.status(200).json(result)
  } catch (error) {
    logger.error('generateProjectScope failed', error)
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

export const weeklyDigest = onSchedule('0 9 * * 1', async () => {
  try {
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const [tasks, leads, entries] = await Promise.all([
      db.collection('tasks').where('updatedAt', '>=', weekStart).get(),
      db.collection('leads').where('updatedAt', '>=', weekStart).get(),
      db.collection('timeEntries').where('createdAt', '>=', weekStart).get(),
    ])

    const digest = {
      weekStart,
      generatedAt: Timestamp.now(),
      metrics: {
        tasksCompleted: tasks.docs.filter((d) => d.data().status === 'done').length,
        leadsWon: leads.docs.filter((d) => d.data().status === 'won').length,
        loggedHours: entries.docs.reduce((sum, d) => sum + ((d.data().minutes ?? 0) as number), 0) / 60,
      },
    }
    await db.collection('weeklyDigests').add(digest)

    if (RESEND_API_KEY) {
      await withRetry(() =>
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Helix <noreply@helix.app>',
            to: ['owner@helix.app'],
            subject: 'Weekly Helix Digest',
            html: `<p>Tasks completed: ${digest.metrics.tasksCompleted}</p>
                   <p>Leads won: ${digest.metrics.leadsWon}</p>
                   <p>Logged hours: ${digest.metrics.loggedHours.toFixed(1)}</p>`,
          }),
        })
      )
    }
    logger.info('weeklyDigest completed')
  } catch (error) {
    logger.error('weeklyDigest failed', error)
    throw error
  }
})

export const sendTaskReminders = onSchedule('0 * * * *', async () => {
  try {
    const now = Date.now()
    const inTwoHours = new Date(now + 2 * 60 * 60 * 1000).toISOString()
    const tasksSnap = await db.collection('tasks').where('dueDate', '<=', inTwoHours).where('status', '!=', 'done').get()
    const messaging = getMessaging()

    for (const task of tasksSnap.docs) {
      const data = task.data()
      const token = data.fcmToken as string | undefined
      if (!token) continue
      await withRetry(() =>
        messaging.send({
          token,
          notification: {
            title: 'Task due soon',
            body: `${data.title} is due within 2 hours`,
          },
          data: { taskId: task.id },
        })
      )
    }
    logger.info('sendTaskReminders complete', { count: tasksSnap.size })
  } catch (error) {
    logger.error('sendTaskReminders failed', error)
    throw error
  }
})

export const syncStripeWebhook = onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const signature = req.headers['stripe-signature']
    if (!signature || !STRIPE_WEBHOOK_SECRET) {
      return res.status(400).json({ error: 'Missing Stripe signature/secret' })
    }

    const event = req.body as { type?: string; data?: { object?: Record<string, unknown> } }
    const object = event.data?.object ?? {}
    const agencyId = String(object.metadata?.agencyId ?? '')
    if (!agencyId) return res.status(200).json({ ok: true, ignored: true })

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
      const priceId = String(object.items?.data?.[0]?.price?.id ?? '')
      const tier = priceId.includes('enterprise') ? 'enterprise' : priceId.includes('pro') ? 'pro' : 'free'
      await db.collection('agencies').doc(agencyId).set(
        {
          subscriptionTier: tier,
          subscriptionUpdatedAt: Timestamp.now(),
        },
        { merge: true }
      )
    }

    if (event.type === 'customer.subscription.deleted') {
      await db.collection('agencies').doc(agencyId).set(
        {
          subscriptionTier: 'free',
          subscriptionUpdatedAt: Timestamp.now(),
        },
        { merge: true }
      )
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    logger.error('syncStripeWebhook failed', error)
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

