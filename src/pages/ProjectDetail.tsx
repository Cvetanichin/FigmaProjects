import { useEffect, useState } from 'react'
import { useParams, Link, Outlet, useLocation } from 'react-router'
import {
  ArrowLeft, Pencil, Activity, Target,
  AlertTriangle, FileText, Bot, FileOutput,
  CalendarDays, DollarSign, LayoutDashboard
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Project } from '../lib/types'
import { ProjectForm } from '../components/projects/ProjectForm'
import { cn } from '../lib/utils'

const tabs = [
  { path: '', label: 'Overview', icon: LayoutDashboard },
  { path: 'activities', label: 'Activities', icon: Activity },
  { path: 'indicators', label: 'Indicators', icon: Target },
  { path: 'risks', label: 'Risks', icon: AlertTriangle },
  { path: 'documents', label: 'Documents', icon: FileText },
  { path: 'agents', label: 'AI Agents', icon: Bot },
  { path: 'outputs', label: 'Outputs', icon: FileOutput },
]

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-400/10 text-green-400',
  completed: 'bg-blue-400/10 text-blue-400',
  suspended: 'bg-amber-400/10 text-amber-400',
}

function Overview({ project, id }: { project: Project; id: string }) {
  return (
    <div className="p-6 max-w-3xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {project.donor && (
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Donor</p>
            <p className="text-sm font-medium text-foreground">{project.donor}</p>
          </div>
        )}
        {project.grant_reference && (
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Grant reference</p>
            <p className="text-sm font-medium text-foreground">{project.grant_reference}</p>
          </div>
        )}
        {(project.start_date || project.end_date) && (
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <CalendarDays className="w-3 h-3" /> Timeline
            </p>
            <p className="text-sm font-medium text-foreground">
              {project.start_date ?? '?'} → {project.end_date ?? 'ongoing'}
            </p>
          </div>
        )}
        {project.budget_total && (
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Budget
            </p>
            <p className="text-sm font-medium text-foreground">€{project.budget_total.toLocaleString()}</p>
            {project.budget_spent > 0 && (
              <p className="text-xs text-muted-foreground mt-1">€{project.budget_spent.toLocaleString()} spent</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-xs font-medium text-foreground mb-3">Quick access</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {tabs.slice(1).map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className="flex items-center gap-2 p-2.5 rounded-md bg-accent/50 hover:bg-accent text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('projects').select('*').eq('id', id!).single()
    setProject(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const isOverview = location.pathname === `/projects/${id}` || location.pathname === `/projects/${id}/`

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading...</div>
  if (!project) return <div className="p-6 text-sm text-muted-foreground">Project not found</div>

  return (
    <div className="flex flex-col h-full">
      {/* Project header */}
      <div className="border-b border-border px-6 pt-5 pb-0 flex-shrink-0">
        <Link to="/projects" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3">
          <ArrowLeft className="w-3 h-3" /> All projects
        </Link>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-foreground">{project.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[project.status] ?? 'bg-muted text-muted-foreground'}`}>
                {project.status}
              </span>
            </div>
            {project.description && <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>}
          </div>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-accent"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
        </div>

        {/* Tab nav */}
        <nav className="flex gap-0.5 -mb-px overflow-x-auto">
          {tabs.map(({ path, label, icon: Icon }) => {
            const to = path === '' ? `/projects/${id}` : `/projects/${id}/${path}`
            const isActive = path === ''
              ? isOverview
              : location.pathname === to
            return (
              <Link
                key={path}
                to={to}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors',
                  isActive
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isOverview ? <Overview project={project} id={id!} /> : <Outlet />}
      </div>

      {editing && (
        <ProjectForm
          project={project}
          onClose={() => setEditing(false)}
          onSaved={() => { setEditing(false); load() }}
        />
      )}
    </div>
  )
}
