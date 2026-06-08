import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Plus, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Risk } from '../lib/types'
import { toast } from 'sonner'

const RISK_LEVEL_COLOR: Record<string, string> = {
  low: 'bg-green-400/10 text-green-400',
  medium: 'bg-amber-400/10 text-amber-400',
  high: 'bg-orange-400/10 text-orange-400',
  critical: 'bg-red-400/10 text-red-400',
}
const STATUS_COLOR: Record<string, string> = {
  open: 'bg-red-400/10 text-red-400',
  mitigated: 'bg-amber-400/10 text-amber-400',
  closed: 'bg-green-400/10 text-green-400',
}
const CATEGORIES = ['operational', 'financial', 'reputational', 'compliance', 'contextual', 'other']
const LEVELS = ['low', 'medium', 'high']
const RISK_LEVELS = ['low', 'medium', 'high', 'critical']
const STATUSES = ['open', 'mitigated', 'closed']

const emptyForm = {
  title: '', description: '', category: 'operational', likelihood: 'medium',
  impact: 'medium', risk_level: 'medium', mitigation: '', owner: '', status: 'open',
}

export function Risks() {
  const { id: projectId } = useParams<{ id: string }>()
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Risk | null>(null)
  const [form, setForm] = useState(emptyForm)

  const load = async () => {
    const { data } = await supabase.from('risks').select('*').eq('project_id', projectId!).order('created_at')
    setRisks(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [projectId])

  const openNew = () => { setForm(emptyForm); setEditing(null); setShowForm(true) }
  const openEdit = (r: Risk) => {
    setForm({
      title: r.title, description: r.description ?? '', category: r.category ?? 'operational',
      likelihood: r.likelihood ?? 'medium', impact: r.impact ?? 'medium',
      risk_level: r.risk_level ?? 'medium', mitigation: r.mitigation ?? '',
      owner: r.owner ?? '', status: r.status,
    })
    setEditing(r)
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
      category: form.category || null,
      likelihood: form.likelihood || null,
      impact: form.impact || null,
      risk_level: form.risk_level || null,
      mitigation: form.mitigation || null,
      owner: form.owner || null,
      status: form.status,
    }
    try {
      if (editing) {
        const { error } = await supabase.from('risks').update(payload).eq('id', editing.id)
        if (error) throw error
        toast.success('Risk updated')
      } else {
        const { error } = await supabase.from('risks').insert(payload)
        if (error) throw error
        toast.success('Risk added')
      }
      setShowForm(false)
      load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  const handleDelete = async (r: Risk) => {
    await supabase.from('risks').delete().eq('id', r.id)
    toast.success('Risk removed')
    load()
  }

  const field = 'w-full px-3 py-2 bg-input-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-medium text-foreground">Risk Register</h2>
          <p className="text-xs text-muted-foreground">{risks.length} risk{risks.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-3.5 h-3.5" /> Add risk
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : risks.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground">No risks logged yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {risks.map(r => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-foreground">{r.title}</p>
                    {r.risk_level && <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${RISK_LEVEL_COLOR[r.risk_level] ?? 'bg-muted text-muted-foreground'}`}>{r.risk_level}</span>}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${STATUS_COLOR[r.status] ?? 'bg-muted text-muted-foreground'}`}>{r.status}</span>
                  </div>
                  {r.description && <p className="text-xs text-muted-foreground mb-2">{r.description}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {r.category && <span><span className="font-medium text-foreground/70">Category:</span> {r.category}</span>}
                    {r.likelihood && <span><span className="font-medium text-foreground/70">Likelihood:</span> {r.likelihood}</span>}
                    {r.impact && <span><span className="font-medium text-foreground/70">Impact:</span> {r.impact}</span>}
                    {r.owner && <span><span className="font-medium text-foreground/70">Owner:</span> {r.owner}</span>}
                  </div>
                  {r.mitigation && (
                    <div className="mt-2 p-2 bg-accent/50 rounded-md">
                      <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground/70">Mitigation:</span> {r.mitigation}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openEdit(r)} className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-accent transition-colors">Edit</button>
                  <button onClick={() => handleDelete(r)} className="text-xs text-muted-foreground hover:text-red-400 px-2 py-1 rounded hover:bg-accent transition-colors">Delete</button>
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
              <h2 className="text-base font-medium text-foreground">{editing ? 'Edit risk' : 'Add risk'}</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Risk title *</label>
                <input className={field} value={form.title} onChange={set('title')} required placeholder="Staff turnover in key roles" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Description</label>
                <textarea className={`${field} resize-none`} rows={2} value={form.description} onChange={set('description')} placeholder="Brief description of the risk" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Category</label>
                  <select className={field} value={form.category} onChange={set('category')}>
                    {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Status</label>
                  <select className={field} value={form.status} onChange={set('status')}>
                    {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Likelihood</label>
                  <select className={field} value={form.likelihood} onChange={set('likelihood')}>
                    {LEVELS.map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Impact</label>
                  <select className={field} value={form.impact} onChange={set('impact')}>
                    {LEVELS.map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Risk level</label>
                  <select className={field} value={form.risk_level} onChange={set('risk_level')}>
                    {RISK_LEVELS.map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Mitigation</label>
                <textarea className={`${field} resize-none`} rows={2} value={form.mitigation} onChange={set('mitigation')} placeholder="Actions to reduce this risk" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Owner</label>
                <input className={field} value={form.owner} onChange={set('owner')} placeholder="Project Manager" />
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
