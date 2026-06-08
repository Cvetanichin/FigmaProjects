import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'
import type { Project } from '../../lib/types'

interface ProjectFormProps {
  project?: Project
  onClose: () => void
  onSaved: () => void
}

export function ProjectForm({ project, onClose, onSaved }: ProjectFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: project?.name ?? '',
    description: project?.description ?? '',
    domain: project?.domain ?? 'CSO',
    status: project?.status ?? 'active',
    donor: project?.donor ?? '',
    grant_reference: project?.grant_reference ?? '',
    start_date: project?.start_date ?? '',
    end_date: project?.end_date ?? '',
    budget_total: project?.budget_total?.toString() ?? '',
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        domain: form.domain,
        status: form.status,
        donor: form.donor || null,
        grant_reference: form.grant_reference || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        budget_total: form.budget_total ? parseFloat(form.budget_total) : null,
        created_by: user?.id ?? null,
      }
      if (project) {
        const { error } = await supabase.from('projects').update(payload).eq('id', project.id)
        if (error) throw error
        toast.success('Project updated')
      } else {
        const { error } = await supabase.from('projects').insert(payload)
        if (error) throw error
        toast.success('Project created')
      }
      onSaved()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save project')
    } finally {
      setLoading(false)
    }
  }

  const field = 'w-full px-3 py-2 bg-input-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-medium text-foreground">{project ? 'Edit project' : 'New project'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Project name *</label>
            <input className={field} value={form.name} onChange={set('name')} required placeholder="HERA Phase II" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Description</label>
            <textarea className={`${field} resize-none`} rows={2} value={form.description} onChange={set('description')} placeholder="Brief project description" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Domain</label>
              <select className={field} value={form.domain} onChange={set('domain')}>
                <option value="CSO">CSO</option>
                <option value="AI">AI</option>
                <option value="Personal">Personal</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Status</label>
              <select className={field} value={form.status} onChange={set('status')}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Donor</label>
            <input className={field} value={form.donor} onChange={set('donor')} placeholder="European Commission" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Grant reference</label>
            <input className={field} value={form.grant_reference} onChange={set('grant_reference')} placeholder="EC-2024-001" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Start date</label>
              <input type="date" className={field} value={form.start_date} onChange={set('start_date')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">End date</label>
              <input type="date" className={field} value={form.end_date} onChange={set('end_date')} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Total budget (€)</label>
            <input type="number" className={field} value={form.budget_total} onChange={set('budget_total')} placeholder="150000" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 px-4 border border-border rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? 'Saving...' : project ? 'Save changes' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
