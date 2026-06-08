import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Plus, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Activity } from '../lib/types'
import { toast } from 'sonner'

const STATUS_COLOR: Record<string, string> = {
  planned: 'bg-blue-400/10 text-blue-400',
  in_progress: 'bg-amber-400/10 text-amber-400',
  completed: 'bg-green-400/10 text-green-400',
  delayed: 'bg-red-400/10 text-red-400',
}

const STATUSES = ['planned', 'in_progress', 'completed', 'delayed']

const emptyForm = {
  title: '', description: '', output: '',
  start_date: '', end_date: '', status: 'planned', responsible: '',
}

export function Activities() {
  const { id: projectId } = useParams<{ id: string }>()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Activity | null>(null)
  const [form, setForm] = useState(emptyForm)

  const load = async () => {
    const { data } = await supabase.from('activities').select('*').eq('project_id', projectId!).order('start_date', { ascending: true })
    setActivities(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [projectId])

  const openNew = () => { setForm(emptyForm); setEditing(null); setShowForm(true) }
  const openEdit = (a: Activity) => {
    setForm({
      title: a.title, description: a.description ?? '', output: a.output ?? '',
      start_date: a.start_date ?? '', end_date: a.end_date ?? '',
      status: a.status, responsible: a.responsible ?? '',
    })
    setEditing(a)
    setShowForm(true)
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      project_id: projectId!,
      title: form.title,
      description: form.description || null,
      output: form.output || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      status: form.status,
      responsible: form.responsible || null,
    }
    try {
      if (editing) {
        const { error } = await supabase.from('activities').update(payload).eq('id', editing.id)
        if (error) throw error
        toast.success('Activity updated')
      } else {
        const { error } = await supabase.from('activities').insert(payload)
        if (error) throw error
        toast.success('Activity added')
      }
      setShowForm(false)
      load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  const handleDelete = async (a: Activity) => {
    await supabase.from('activities').delete().eq('id', a.id)
    toast.success('Activity removed')
    load()
  }

  const field = 'w-full px-3 py-2 bg-input-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-medium text-foreground">Activities</h2>
          <p className="text-xs text-muted-foreground">{activities.length} activit{activities.length !== 1 ? 'ies' : 'y'}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-3.5 h-3.5" /> Add activity
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : activities.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground">No activities yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map(a => (
            <div key={a.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-foreground">{a.title}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${STATUS_COLOR[a.status] ?? 'bg-muted text-muted-foreground'}`}>
                      {a.status.replace('_', ' ')}
                    </span>
                  </div>
                  {a.description && <p className="text-xs text-muted-foreground mb-1">{a.description}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {(a.start_date || a.end_date) && (
                      <span>{a.start_date ?? '?'} → {a.end_date ?? 'ongoing'}</span>
                    )}
                    {a.responsible && <span><span className="font-medium text-foreground/70">Responsible:</span> {a.responsible}</span>}
                    {a.output && <span><span className="font-medium text-foreground/70">Output:</span> {a.output}</span>}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openEdit(a)} className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-accent transition-colors">Edit</button>
                  <button onClick={() => handleDelete(a)} className="text-xs text-muted-foreground hover:text-red-400 px-2 py-1 rounded hover:bg-accent transition-colors">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-base font-medium text-foreground">{editing ? 'Edit activity' : 'Add activity'}</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Activity title *</label>
                <input className={field} value={form.title} onChange={set('title')} required placeholder="Community awareness campaign" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Description</label>
                <textarea className={`${field} resize-none`} rows={2} value={form.description} onChange={set('description')} />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Expected output</label>
                <input className={field} value={form.output} onChange={set('output')} placeholder="5 community workshops delivered" />
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Status</label>
                  <select className={field} value={form.status} onChange={set('status')}>
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Responsible</label>
                  <input className={field} value={form.responsible} onChange={set('responsible')} placeholder="Programme Officer" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border border-border rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
