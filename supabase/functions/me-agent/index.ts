import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const authHeader = req.headers.get('Authorization')
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader! } } }
  )

  const { project_id, period_start, period_end, user_id } = await req.json()

  const [{ data: project }, { data: indicators }, { data: activities }, { data: risks }] = await Promise.all([
    supabase.from('projects').select('*').eq('id', project_id).single(),
    supabase.from('indicators').select('*').eq('project_id', project_id),
    supabase.from('activities').select('*').eq('project_id', project_id),
    supabase.from('risks').select('*').eq('project_id', project_id).eq('status', 'open'),
  ])

  const { data: agentRow } = await supabase.from('ai_agents').select('id').eq('slug', 'me-agent').single()

  const { data: runRow } = await supabase.from('agent_runs').insert({
    project_id,
    agent_id: agentRow?.id ?? null,
    status: 'running',
    input_data: { period_start, period_end },
    triggered_by: user_id ?? null,
  }).select().single()

  try {
    const prompt = `You are an M&E (Monitoring & Evaluation) analyst for a CSO project. Produce a concise monthly M&E intelligence brief.

PROJECT: ${project?.name ?? 'Unknown'}
PERIOD: ${period_start} to ${period_end}
DONOR: ${project?.donor ?? 'Not specified'}

INDICATORS (${indicators?.length ?? 0} total):
${(indicators ?? []).map(i =>
  `- ${i.name} [${i.level ?? 'unknown level'}]: Baseline ${i.baseline ?? '?'} | Target ${i.target ?? '?'} | Actual ${i.actual ?? 'not reported'} ${i.unit ?? ''} | Status: ${i.status ?? 'unknown'}`
).join('\n')}

ACTIVITIES (${activities?.length ?? 0} total):
${(activities ?? []).map(a =>
  `- ${a.title}: ${a.status} (${a.responsible ?? 'no responsible'})`
).join('\n')}

OPEN RISKS (${risks?.length ?? 0}):
${(risks ?? []).map(r =>
  `- ${r.title} [${r.risk_level ?? 'unknown'} risk]: ${r.mitigation ?? 'No mitigation'}`
).join('\n')}

Write a structured M&E brief in markdown with these sections:
## Executive Summary
## Indicator Status
## Activity Progress
## Data Quality & Evidence Gaps
## Key Risks
## Recommended Actions

Be specific, professional, and evidence-based. Flag concrete issues. Keep it under 600 words.`

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''
    const title = `M&E Brief — ${project?.name ?? 'Project'} (${period_start} to ${period_end})`

    const { data: reportRow } = await supabase.from('reports').insert({
      project_id,
      title,
      report_type: 'me_brief',
      content,
      generated_by: user_id ?? null,
      period_start,
      period_end,
    }).select().single()

    await supabase.from('agent_runs').update({
      status: 'completed',
      output_data: { title },
      report_id: reportRow?.id ?? null,
    }).eq('id', runRow?.id)

    return new Response(JSON.stringify({ success: true, report_id: reportRow?.id, content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await supabase.from('agent_runs').update({
      status: 'error',
      error_message: message,
    }).eq('id', runRow?.id)
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
