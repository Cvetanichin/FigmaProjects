import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Bot, Play, Clock, CheckCircle, XCircle, Loader } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { AIAgent, AgentRun } from '../lib/types'
import { useAuth } from '../contexts/AuthContext'
import { UpgradeModal } from '../components/UpgradeModal'
import { toast } from 'sonner'

const AGENT_ICONS: Record<string, string> = {
  'me-agent': '📊',
  'compliance-agent': '✅',
  'reporting-agent': '📝',
}

const AGENT_COLORS: Record<string, string> = {
  'me-agent': 'border-blue-500/30 hover:border-blue-500/60',
  'compliance-agent': 'border-green-500/30 hover:border-green-500/60',
  'reporting-agent': 'border-purple-500/30 hover:border-purple-500/60',
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'running' || status === 'pending') return <Loader className="w-3.5 h-3.5 text-amber-400 animate-spin" />
  if (status === 'completed') return <CheckCircle className="w-3.5 h-3.5 text-green-400" />
  if (status === 'failed') return <XCircle className="w-3.5 h-3.5 text-red-400" />
  return <Clock className="w-3.5 h-3.5 text-muted-foreground" />
}

export function AIAgents() {
  const { id: projectId } = useParams<{ id: string }>()
  const { user, canRunAgent, refreshProfile } = useAuth()
  const [agents, setAgents] = useState<AIAgent[]>([])
  const [runs, setRuns] = useState<AgentRun[]>([])
  const [running, setRunning] = useState<Record<string, boolean>>({})
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [periodStart, setPeriodStart] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().slice(0, 10)
  })
  const [periodEnd, setPeriodEnd] = useState(() => new Date().toISOString().slice(0, 10))

  const load = async () => {
    const [{ data: a }, { data: r }] = await Promise.all([
      supabase.from('ai_agents').select('*').order('name'),
      supabase.from('agent_runs').select('*').eq('project_id', projectId!).order('created_at', { ascending: false }).limit(20),
    ])
    setAgents(a ?? [])
    setRuns(r ?? [])
  }

  useEffect(() => { load() }, [projectId])

  const runAgent = async (agent: AIAgent) => {
    if (!canRunAgent()) {
      setShowUpgrade(true)
      return
    }
    setRunning(r => ({ ...r, [agent.id]: true }))
    try {
      const { data, error } = await supabase.functions.invoke(agent.edge_function, {
        body: { project_id: projectId, period_start: periodStart, period_end: periodEnd, user_id: user?.id },
      })
      if (error) throw error
      const { data: prof } = await supabase.from('profiles').select('ai_runs_used').eq('id', user!.id).single()
      await supabase.from('profiles').update({ ai_runs_used: (prof?.ai_runs_used ?? 0) + 1 }).eq('id', user!.id)
      await refreshProfile()
      toast.success(`${agent.name} completed`)
      load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : `${agent.name} failed`)
    } finally {
      setRunning(r => ({ ...r, [agent.id]: false }))
    }
  }

  const field = 'px-2 py-1.5 bg-input-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring'

  return (
    <>
    {showUpgrade && <UpgradeModal feature="AI agent runs" onClose={() => setShowUpgrade(false)} />}
    <div className="p-6">
      <div className="mb-5">
        <h2 className="text-base font-medium text-foreground">AI Agents</h2>
        <p className="text-xs text-muted-foreground">Run intelligence agents to generate project insights</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 mb-5">
        <p className="text-xs font-medium text-foreground mb-3">Report period</p>
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">From</label>
            <input type="date" className={field} value={periodStart} onChange={e => setPeriodStart(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">To</label>
            <input type="date" className={field} value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {agents.map(agent => {
          const isRunning = running[agent.id]
          const lastRun = runs.find(r => r.agent_id === agent.id)
          return (
            <div key={agent.id} className={`bg-card border rounded-xl p-5 transition-all ${AGENT_COLORS[agent.slug] ?? 'border-border'}`}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{AGENT_ICONS[agent.slug] ?? '🤖'}</span>
                {lastRun && <StatusIcon status={lastRun.status} />}
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">{agent.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">{agent.description}</p>
              {lastRun && (
                <p className="text-xs text-muted-foreground mb-3">
                  Last run: {new Date(lastRun.created_at).toLocaleDateString()} · {lastRun.status}
                </p>
              )}
              <button
                onClick={() => runAgent(agent)}
                disabled={isRunning}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isRunning ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                {isRunning ? 'Running...' : 'Run agent'}
              </button>
            </div>
          )
        })}
      </div>

      {runs.length > 0 && (
        <div className="bg-card border border-border rounded-xl">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Bot className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">Recent runs</h3>
          </div>
          <div className="divide-y divide-border">
            {runs.map(run => {
              const agent = agents.find(a => a.id === run.agent_id)
              return (
                <div key={run.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={run.status} />
                    <span className="text-sm text-foreground">{agent?.name ?? 'Agent'}</span>
                    <span className="text-xs text-muted-foreground">{new Date(run.created_at).toLocaleString()}</span>
                  </div>
                  {run.report_id && (
                    <a href={`/projects/${projectId}/outputs`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      View output →
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
    </>
  )
}
