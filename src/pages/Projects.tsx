import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Plus, FolderKanban, ArrowRight, CalendarDays, DollarSign } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Project } from '../lib/types'
import { ProjectForm } from '../components/projects/ProjectForm'

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-400/10 text-green-400',
  completed: 'bg-blue-400/10 text-blue-400',
  suspended: 'bg-amber-400/10 text-amber-400',
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    setProjects(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New project
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <FolderKanban className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No projects yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Create your first project to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Create project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(project => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all group block"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    {project.name}
                  </h3>
                  {project.domain && (
                    <span className="text-xs text-muted-foreground">{project.domain}</span>
                  )}
                </div>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[project.status] ?? 'bg-muted text-muted-foreground'}`}>
                  {project.status}
                </span>
              </div>

              {project.description && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
              )}

              <div className="space-y-1.5">
                {project.donor && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/70">Donor:</span> {project.donor}
                  </div>
                )}
                {(project.start_date || project.end_date) && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="w-3 h-3" />
                    {project.start_date} → {project.end_date ?? 'ongoing'}
                  </div>
                )}
                {project.budget_total && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <DollarSign className="w-3 h-3" />
                    €{project.budget_total.toLocaleString()}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end mt-3 pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1">
                  Open workspace <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showForm && (
        <ProjectForm
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load() }}
        />
      )}
    </div>
  )
}
