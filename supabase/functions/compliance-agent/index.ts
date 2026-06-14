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

  const [{ data: project }, { data: docs }, { data: risks }, { data: activities }, { data: indicators }] = await Promise.all([
    supabase.from('projects').select('*').eq('id', project_id).single(),
    supabase.from('project_documents').select('name, category').eq('project_id', project_id),
    supabase.from('risks').select('*').eq('project_id', project_id),
    supabase.from('activities').select('title, status').eq('project_id', project_id),
    supabase.from('indicators').select('name, status, actual, target').eq('project_id', project_id),
  ])

  const { data: agentRow } = await supabase.from('ai_agents').select('id').eq('slug', 'compliance-agent').single()
  const { data: runRow } = await supabase.from('agent_runs').insert({
    project_id,
    agent_id: agentRow?.id ?? null,
    status: 'running',
    input_data: { period_start, period_end },
    triggered_by: user_id ?? null,
  }).select().single()

  try {
    const docList = (docs ?? []).map(d => `- ${d.name} [${d.category ?? 'uncategorised'}]`).join('\n')
    const riskList = (risks ?? []).map(r => `- ${r.title} [${r.category ?? 'general'}, ${r.risk_level ?? '?'} risk, ${r.status}]`).join('\n')

    const prompt = `You are a compliance analyst reviewing a CSO/NGO project for donor compliance and organisational risk.

PROJECT: ${project?.name ?? 'Unknown'}
DONOR: ${project?.donor ?? 'Not specified'}
GRANT REF: ${project?.grant_reference ?? 'N/A'}
PERIOD: ${period_start} to ${period_end}

DOCUMENTS ON FILE (${docs?.length ?? 0}):
${docList || 'No documents uploaded'}

RISK REGISTER (${risks?.length ?? 0} risks):
${riskList || 'No risks logged'}

ACTIVITIES (${activities?.length ?? 0}):
${(activities ?? []).map(a => `- ${a.title}: ${a.status}`).join('\n') || 'None logged'}

INDICATORS with data gaps (missing actuals):
${(indicators ?? []).filter(i => i.actual === null).map(i => `- ${i.name}`).join('\n') || 'All indicators have data'}

Produce a structured compliance review in markdown with these sections:
## Compliance Status Overview
## Document Completeness
(Check for: log frame, budget, narrative reports, contracts, annexes, visibility materials)
## Data & Reporting Gaps
## Risk Assessment
## Audit Readiness
## Required Actions (prioritised)

Rate overall compliance: GREEN / AMBER / RED with justification. Be direct and specific.`

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''
    const title = `Compliance Review — ${project?.name ?? 'Project'} (${period_start} to ${period_end})`

    const { data: reportRow } = await supabase.from('reports').insert({
      project_id,
      title,
      report_type: 'compliance_review',
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
