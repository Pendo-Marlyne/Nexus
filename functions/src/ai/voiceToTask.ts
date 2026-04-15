/**
 * Firebase HTTPS function for voice-to-task conversion.
 * Pipeline:
 * 1) Receive base64 audio
 * 2) Transcribe with Whisper API (if configured)
 * 3) Structure with GPT-4 (if configured)
 * 4) Return task object
 */
export async function voiceToTask(request: Request): Promise<Response> {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
    }

    const body = (await request.json()) as { audioBase64?: string }
    if (!body.audioBase64) {
      return new Response(JSON.stringify({ error: 'Missing audioBase64 payload' }), { status: 400 })
    }

    const openAiKey = process.env.OPENAI_API_KEY
    let transcript = 'Voice task captured. Please review extracted details.'

    // Whisper step (optional runtime execution)
    if (openAiKey) {
      try {
        const audioBuffer = Buffer.from(body.audioBase64, 'base64')
        const form = new FormData()
        form.append('model', 'whisper-1')
        form.append('file', new Blob([audioBuffer]), 'audio.webm')

        const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${openAiKey}` },
          body: form,
        })
        if (whisperResponse.ok) {
          const whisperJson = (await whisperResponse.json()) as { text?: string }
          if (whisperJson.text) transcript = whisperJson.text
        }
      } catch {
        // non-fatal: fallback transcript stays in place
      }
    }

    // GPT extraction step
    let extracted = {
      title: 'Follow up on voice note',
      description: transcript,
      priority: 'medium',
      dueDate: null as string | null,
      assignedTo: null as string | null,
    }

    if (openAiKey) {
      try {
        const completionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content:
                  'Extract a single structured task from transcript. Return valid JSON with keys: title, description, priority, dueDate, assignedTo.',
              },
              { role: 'user', content: transcript },
            ],
            response_format: { type: 'json_object' },
          }),
        })

        if (completionResponse.ok) {
          const completionJson = (await completionResponse.json()) as {
            choices?: Array<{ message?: { content?: string } }>
          }
          const text = completionJson.choices?.[0]?.message?.content
          if (text) {
            const parsed = JSON.parse(text) as typeof extracted
            extracted = {
              title: parsed.title || extracted.title,
              description: parsed.description || transcript,
              priority: ['low', 'medium', 'high', 'urgent'].includes(parsed.priority)
                ? parsed.priority
                : extracted.priority,
              dueDate: parsed.dueDate ?? null,
              assignedTo: parsed.assignedTo ?? null,
            }
          }
        }
      } catch {
        // non-fatal fallback extracted object
      }
    }

    return new Response(JSON.stringify(extracted), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected voice parsing error' }),
      { status: 500 }
    )
  }
}

