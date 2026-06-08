import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { FolderKanban, Target, AlertTriangle, Activity, ArrowRight, TrendingUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Project } from '../lib/types'

interface Stats {
  totalProjects: number
  activeProjects: number
  totalIndicators: number
  onTrackIndicators: number
  openRisks: number
  criticalRisks: number
  totalActivities: number
  completedActivities: number
}

export function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0, activeProjects: 0,
    totalIndicators: 0, onTrackIndicators: 0,
    openRisks: 0, criticalRisks: 0,
    totalActivities: 0, completedActivities: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: projs }, { data: inds }, { data: rsks }, { data: acts }] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('indicators').select('status'),
        supabase.from('risks').select('risk_level, status'),
        supabase.from('activities').select('status'),
      ])
      setProjects(projs ?? [])
      setStats({
        totalProjects: projs?.length ?? 0,
        activeProjects: projs?.filter(p => p.status === 'active').length ?? 0,
        totalIndicators: inds?.length ?? 0,
        onTrackIndicators: inds?.filter(i => i.status === 'on_track').length ?? 0,
        openRisks: rsks?.filter(r => r.status === 'open').length ?? 0,
        criticalRisks: rsks?.filter(r => r.risk_level === 'critical' && r.status === 'open').length ?? 0,
        totalActivities: acts?.length ?? 0,
        completedActivities: acts?.filter(a => a.status === 'completed').length ?? 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    {
      label: 'Projects', value: stats.totalProjects,
      sub: `${stats.activeProjects} active`,
      icon: FolderKanban, color: 'text-blue-400', bg: 'bg-blue-400/10',
    },
    {
      label: 'Indicators', value: stats.totalIndicators,
      sub: `${stats.onTrackIndicators} on track`,
      icon: Target, color: 'text-green-400', bg: 'bg-green-400/10',
    },
    {
      label: 'Open Risks', value: stats.openRisks,
      sub: `${stats.criticalRisks} critical`,
      icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10',
    },
    {
      label: 'Activities', value: stats.totalActivities,
      sub: `${stats.completedActivities} completed`,
      icon: Activity, color: 'text-purple-400', bg: 'bg-purple-400/10',
    },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Portfolio overview across all projects</p>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map(({ label, value, sub, icon: Icon, color, bg }) => (
              <div key={label} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                  </div>
                </div>
                <p className="text-2xl font-semibold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-medium text-foreground">Recent Projects</h2>
              </div>
              <Link to="/projects" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {projects.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No projects yet.</p>
                <Link to="/projects" className="text-sm text-foreground hover:underline mt-1 inline-block">Create your first project →</Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {projects.slice(0, 5).map(project => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-accent/50 transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{project.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{project.domain ?? 'CSO'} · {project.donor ?? 'No donor'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        project.status === 'active' ? 'bg-green-400/10 text-green-400' :
                        project.status === 'completed' ? 'bg-blue-400/10 text-blue-400' :
                        'bg-amber-400/10 text-amber-400'
                      }`}>
                        {project.status}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
