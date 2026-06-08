import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { FileOutput, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Report } from '../lib/types'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'

const TYPE_COLOR: Record<string, string> = {
  me_brief: 'bg-blue-400/10 text-blue-400',
  compliance_review: 'bg-green-400/10 text-green-400',
  monthly_report: 'bg-purple-400/10 text-purple-400',
}

const TYPE_LABEL: Record<string, string> = {
  me_brief: 'M&E Brief',
  compliance_review: 'Compliance Review',
  monthly_report: 'Monthly Report',
}

export function Outputs() {
  const { id: projectId } = useParams<{ id: string }>()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = async () => {
    const { data } = await supabase.from('reports').select('*').eq('project_id', projectId!).order('created_at', { ascending: false })
    setReports(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [projectId])

  const handleDelete = async (report: Report) => {
    await supabase.from('reports').delete().eq('id', report.id)
    toast.success('Report deleted')
    load()
  }

  return (
    <div className="p-6">
      <div className="mb-5">
        <h2 className="text-base font-medium text-foreground">Outputs</h2>
        <p className="text-xs text-muted-foreground">{reports.length} saved report{reports.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : reports.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <FileOutput className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No outputs yet</p>
          <p className="text-xs text-muted-foreground mt-1">Run an AI agent to generate your first report</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(report => (
            <div key={report.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-accent/30 transition-colors"
                onClick={() => setExpanded(expanded === report.id ? null : report.id)}
              >
                <div className="flex items-center gap-3">
                  {report.report_type && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLOR[report.report_type] ?? 'bg-muted text-muted-foreground'}`}>
                      {TYPE_LABEL[report.report_type] ?? report.report_type}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{report.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(report.created_at).toLocaleString()}
                      {report.period_start && ` · ${report.period_start} → ${report.period_end}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(report) }}
                    className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-accent rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {expanded === report.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>
              {expanded === report.id && report.content && (
                <div className="px-5 pb-5 border-t border-border">
                  <div className="prose prose-sm prose-invert max-w-none mt-4">
                    <ReactMarkdown>{report.content}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
