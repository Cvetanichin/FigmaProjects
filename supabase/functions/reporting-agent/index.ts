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

  const [{ data: project }, { data: indicators }, { data: activities }, { data: risks }, { data: docs }] = await Promise.all([
    supabase.from('projects').select('*').eq('id', project_id).single(),
    supabase.from('indicators').select('*').eq('project_id', project_id),
    supabase.from('activities').select('*').eq('project_id', project_id)
      .or(`end_date.is.null,end_date.gte.${period_start}`)
      .or(`start_date.is.null,start_date.lte.${period_end}`),
    supabase.from('risks').select('*').eq('project_id', project_id).eq('status', 'open'),
    supabase.from('project_documents').select('name, category').eq('project_id', project_id),
  ])

  const { data: agentRow } = await supabase.from('ai_agents').select('id').eq('slug', 'reporting-agent').single()
  const { data: runRow } = await supabase.from('agent_runs').insert({
    project_id,
    agent_id: agentRow?.id ?? null,
    status: 'running',
    input_data: { period_start, period_end },
    triggered_by: user_id ?? null,
  }).select().single()

  try {
    const indByStatus = (status: string) => (indicators ?? []).filter(i => i.status === status)
    const actByStatus = (status: string) => (activities ?? []).filter(a => a.status === status)

    const prompt = `You are a senior programme officer writing a donor progress report for a CSO/NGO project.

PROJECT: ${project?.name ?? 'Unknown'}
DONOR: ${project?.donor ?? 'Not specified'}
GRANT REF: ${project?.grant_reference ?? 'N/A'}
REPORTING PERIOD: ${period_start} to ${period_end}
PROJECT DURATION: ${project?.start_date ?? '?'} to ${project?.end_date ?? '?'}

INDICATOR SUMMARY:
- On track: ${indByStatus('on_track').length}
- At risk: ${indByStatus('at_risk').length}
- Behind: ${indByStatus('behind').length}
- Achieved: ${indByStatus('achieved').length}

KEY INDICATORS:
${(indicators ?? []).slice(0, 8).map(i =>
  `- ${i.name}: ${i.actual ?? 'NR'} / ${i.target ?? '?'} ${i.unit ?? ''} (${i.status ?? 'unknown'})`
).join('\n')}

ACTIVITY PROGRESS:
- Completed: ${actByStatus('completed').length}
- In progress: ${actByStatus('in_progress').length}
- Delayed: ${actByStatus('delayed').length}

COMPLETED ACTIVITIES:
${actByStatus('completed').slice(0, 5).map(a => `- ${a.title}${a.output ? ': ' + a.output : ''}`).join('\n') || 'None'}

IN-PROGRESS ACTIVITIES:
${actByStatus('in_progress').slice(0, 5).map(a => `- ${a.title} (${a.responsible ?? 'unassigned'})`).join('\n') || 'None'}

OPEN RISKS (${risks?.length ?? 0}):
${(risks ?? []).map(r => `- ${r.title} [${r.risk_level ?? '?'}]: ${r.mitigation ?? 'No mitigation'}`).join('\n') || 'None'}

DOCUMENTS ON FILE: ${docs?.length ?? 0}

Write a professional donor progress report in markdown with:
## Executive Summary (3-4 sentences)
## Progress Against Objectives
## Activity Implementation
### Completed This Period
### Ongoing Activities
### Delayed / Not Started
## Results and Indicators
## Challenges and Mitigations
## Financial Overview
(Note if budget data is available; otherwise note it's not provided in this brief)
## Next Steps (next 30-60 days)
## Annexes Required

Write in formal donor report language. Be evidence-based. Acknowledge gaps honestly.`

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''
    const title = `Monthly Report — ${project?.name ?? 'Project'} (${period_start} to ${period_end})`

    const { data: reportRow } = await supabase.from('reports').insert({
      project_id,
      title,
      report_type: 'monthly_report',
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
