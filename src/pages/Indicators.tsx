import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Plus, X, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Indicator } from '../lib/types'
import { toast } from 'sonner'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  on_track: { label: 'On track', color: 'bg-green-400/10 text-green-400' },
  at_risk: { label: 'At risk', color: 'bg-amber-400/10 text-amber-400' },
  behind: { label: 'Behind', color: 'bg-red-400/10 text-red-400' },
  achieved: { label: 'Achieved', color: 'bg-blue-400/10 text-blue-400' },
}

const LEVELS = ['outcome', 'output', 'process']
const STATUSES = Object.keys(STATUS_CONFIG)
const FREQUENCIES = ['monthly', 'quarterly', 'annually']

function ProgressBar({ baseline, target, actual }: { baseline: number | null; target: number | null; actual: number | null }) {
  if (!target || actual === null) return <div className="h-1 bg-border rounded-full" />
  const base = baseline ?? 0
  const pct = Math.min(100, Math.max(0, ((actual - base) / (target - base)) * 100))
  return (
    <div className="h-1 bg-border rounded-full">
      <div className="h-1 bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}

const emptyForm = {
  name: '', level: 'output', unit: '', baseline: '', target: '', actual: '',
  data_source: '', collection_method: '', frequency: 'quarterly', responsible: '', status: 'on_track',
}

export function Indicators() {
  const { id: projectId } = useParams<{ id: string }>()
  const [indicators, setIndicators] = useState<Indicator[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Indicator | null>(null)
  const [form, setForm] = useState(emptyForm)

  const load = async () => {
    const { data } = await supabase.from('indicators').select('*').eq('project_id', projectId!).order('created_at')
    setIndicators(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [projectId])

  const openNew = () => { setForm(emptyForm); setEditing(null); setShowForm(true) }
  const openEdit = (ind: Indicator) => {
    setForm({
      name: ind.name, level: ind.level ?? 'output', unit: ind.unit ?? '',
      baseline: ind.baseline?.toString() ?? '', target: ind.target?.toString() ?? '',
      actual: ind.actual?.toString() ?? '', data_source: ind.data_source ?? '',
      collection_method: ind.collection_method ?? '', frequency: ind.frequency ?? 'quarterly',
      responsible: ind.responsible ?? '', status: ind.status ?? 'on_track',
    })
    setEditing(ind)
    setShowForm(true)
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      project_id: projectId!,
      name: form.name,
      level: form.level || null,
      unit: form.unit || null,
      baseline: form.baseline ? parseFloat(form.baseline) : null,
      target: form.target ? parseFloat(form.target) : null,
      actual: form.actual ? parseFloat(form.actual) : null,
      data_source: form.data_source || null,
      collection_method: form.collection_method || null,
      frequency: form.frequency || null,
      responsible: form.responsible || null,
      status: form.status || null,
    }
    try {
      if (editing) {
        const { error } = await supabase.from('indicators').update(payload).eq('id', editing.id)
        if (error) throw error
        toast.success('Indicator updated')
      } else {
        const { error } = await supabase.from('indicators').insert(payload)
        if (error) throw error
        toast.success('Indicator added')
      }
      setShowForm(false)
      load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  const handleDelete = async (ind: Indicator) => {
    await supabase.from('indicators').delete().eq('id', ind.id)
    toast.success('Indicator removed')
    load()
  }

  const field = 'w-full px-3 py-2 bg-input-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-medium text-foreground">Indicators</h2>
          <p className="text-xs text-muted-foreground">{indicators.length} indicator{indicators.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-3.5 h-3.5" /> Add indicator
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : indicators.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground">No indicators yet. Add your first indicator to start tracking progress.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {indicators.map(ind => {
            const sc = STATUS_CONFIG[ind.status ?? '']
            const pct = ind.target && ind.actual !== null && ind.baseline !== null
              ? Math.round(((ind.actual - (ind.baseline ?? 0)) / (ind.target - (ind.baseline ?? 0))) * 100)
              : null
            return (
              <div key={ind.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground truncate">{ind.name}</p>
                      {ind.level && (
                        <span className="text-xs px-1.5 py-0.5 bg-accent rounded text-muted-foreground capitalize">{ind.level}</span>
                      )}
                      {sc && <span className={`text-xs px-1.5 py-0.5 rounded-full ${sc.color}`}>{sc.label}</span>}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground mb-2">
                      <div><span className="font-medium text-foreground/70">Baseline:</span> {ind.baseline ?? '—'} {ind.unit}</div>
                      <div><span className="font-medium text-foreground/70">Target:</span> {ind.target ?? '—'} {ind.unit}</div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-foreground/70">Actual:</span> {ind.actual ?? '—'} {ind.unit}
                        {pct !== null && (
                          pct >= 100 ? <TrendingUp className="w-3 h-3 text-green-400" /> :
                          pct >= 50 ? <Minus className="w-3 h-3 text-amber-400" /> :
                          <TrendingDown className="w-3 h-3 text-red-400" />
                        )}
                      </div>
                    </div>
                    <ProgressBar baseline={ind.baseline} target={ind.target} actual={ind.actual} />
                    {pct !== null && <p className="text-xs text-muted-foreground mt-1">{pct}% of target</p>}
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(ind)} className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-accent transition-colors">Edit</button>
                    <button onClick={() => handleDelete(ind)} className="text-xs text-muted-foreground hover:text-red-400 px-2 py-1 rounded hover:bg-accent transition-colors">Delete</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-base font-medium text-foreground">{editing ? 'Edit indicator' : 'Add indicator'}</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Indicator name *</label>
                <input className={field} value={form.name} onChange={set('name')} required placeholder="% of women reporting increased agency" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Level</label>
                  <select className={field} value={form.level} onChange={set('level')}>
                    {LEVELS.map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Unit</label>
                  <input className={field} value={form.unit} onChange={set('unit')} placeholder="%" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Baseline</label>
                  <input type="number" className={field} value={form.baseline} onChange={set('baseline')} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Target</label>
                  <input type="number" className={field} value={form.target} onChange={set('target')} placeholder="80" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Actual</label>
                  <input type="number" className={field} value={form.actual} onChange={set('actual')} placeholder="45" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Status</label>
                  <select className={field} value={form.status} onChange={set('status')}>
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Frequency</label>
                  <select className={field} value={form.frequency} onChange={set('frequency')}>
                    {FREQUENCIES.map(f => <option key={f} value={f} className="capitalize">{f}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Data source</label>
                <input className={field} value={form.data_source} onChange={set('data_source')} placeholder="Survey, FGD, admin records" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Responsible</label>
                <input className={field} value={form.responsible} onChange={set('responsible')} placeholder="M&E Officer" />
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
