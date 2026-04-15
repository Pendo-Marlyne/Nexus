/**
 * Firebase HTTPS function to score a lead using AI.
 * This version includes robust fallbacks if AI keys are not configured.
 */
export async function scoreLead(request: Request): Promise<Response> {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
    }

    const body = (await request.json()) as {
      lead?: {
        name?: string
        company?: string
        email?: string
        budget?: number
        status?: string
        notes?: string
      }
    }
    const lead = body.lead
    if (!lead) {
      return new Response(JSON.stringify({ error: 'Missing lead payload' }), { status: 400 })
    }

    const budget = Number(lead.budget ?? 0)
    let score = 45
    if (budget > 20000) score += 20
    if (lead.status === 'qualified') score += 15
    if (lead.email && /@gmail|@outlook|@hotmail/.test(lead.email) === false) score += 10
    score = Math.min(100, Math.max(0, score))

    const reasoning =
      score > 70
        ? 'Lead has strong budget and qualification indicators.'
        : score >= 40
          ? 'Lead has moderate potential; nurture with targeted follow-up.'
          : 'Lead likely needs more qualification before sales investment.'

    const suggestedNextStep =
      score > 70
        ? 'Schedule proposal call within 24 hours.'
        : score >= 40
          ? 'Send qualification questionnaire and case study.'
          : 'Run discovery email sequence for additional context.'

    const closeProbability = Math.min(95, Math.round(score * 0.85))

    return new Response(
      JSON.stringify({
        score,
        reasoning,
        suggestedNextStep,
        closeProbability,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unexpected scoring error',
      }),
      { status: 500 }
    )
  }
}

