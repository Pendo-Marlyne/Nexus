/**
 * Firebase HTTPS function to summarize handoff context for shift changes.
 *
 * Prompt intent:
 * - summarize last shift work
 * - extract pending tasks
 * - highlight urgent items
 * - list completed tasks
 */
export async function summarizeHandoff(request: Request): Promise<Response> {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
    }

    const body = (await request.json()) as {
      fromUserId?: string
      toUserId?: string
      shiftStart?: string
      shiftEnd?: string
    }

    if (!body.shiftStart || !body.shiftEnd) {
      return new Response(JSON.stringify({ error: 'shiftStart and shiftEnd are required' }), {
        status: 400,
      })
    }

    // In production, query Firestore collections:
    // - tasks where updatedAt in [shiftStart, shiftEnd]
    // - comments in same interval
    // - timeEntries in same interval
    // Here we provide structured fallback payload with GPT-ready prompt shape.
    const mockTasks = [
      { title: 'Finalize Acme hero', status: 'in_progress', priority: 'high' },
      { title: 'Review proposal draft', status: 'review', priority: 'medium' },
      { title: 'Logo revision', status: 'done', priority: 'high' },
    ]
    const mockComments = [
      'Client requested final typography tweaks before sign-off.',
      'Need QA pass on mobile breakpoints.',
    ]
    const mockTimeEntries = [{ minutes: 90 }, { minutes: 120 }, { minutes: 45 }]

    const prompt = `
You are an operations assistant generating a structured handoff report.

Shift metadata:
- fromUserId: ${body.fromUserId ?? 'unknown'}
- toUserId: ${body.toUserId ?? 'unknown'}
- shiftStart: ${body.shiftStart}
- shiftEnd: ${body.shiftEnd}

Tasks:
${JSON.stringify(mockTasks, null, 2)}

Comments:
${JSON.stringify(mockComments, null, 2)}

Time Entries:
${JSON.stringify(mockTimeEntries, null, 2)}

Return strict JSON:
{
  "summary": "string (2-4 sentences)",
  "pendingTasks": ["string"],
  "urgentItems": ["string"],
  "completedTasks": ["string"]
}
`

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          summary:
            'Shift wrapped with key items still in flight. Main focus should be completing in-progress client deliverables and clearing review blockers.',
          pendingTasks: ['Finalize Acme hero', 'Review proposal draft'],
          urgentItems: ['Client requested typography tweaks', 'QA mobile breakpoints before handoff'],
          completedTasks: ['Logo revision'],
          promptUsed: prompt,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You generate concise shift-handoff summaries for creative agencies. Always return valid JSON with the required keys.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    })

    if (!completion.ok) {
      return new Response(JSON.stringify({ error: 'Failed to call GPT for handoff summary' }), {
        status: 502,
      })
    }

    const json = (await completion.json()) as { choices?: Array<{ message?: { content?: string } }> }
    const content = json.choices?.[0]?.message?.content
    if (!content) throw new Error('Empty GPT response')

    const parsed = JSON.parse(content) as {
      summary: string
      pendingTasks: string[]
      urgentItems: string[]
      completedTasks: string[]
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected summarize error' }),
      { status: 500 }
    )
  }
}

