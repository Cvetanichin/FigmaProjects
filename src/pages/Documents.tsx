import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router'
import { Plus, FileText, Download, Trash2, Upload } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { ProjectDocument } from '../lib/types'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

const CATEGORIES = ['report', 'log_frame', 'budget', 'contract', 'narrative', 'annex', 'other']
const CATEGORY_COLOR: Record<string, string> = {
  report: 'bg-blue-400/10 text-blue-400',
  log_frame: 'bg-purple-400/10 text-purple-400',
  budget: 'bg-green-400/10 text-green-400',
  contract: 'bg-amber-400/10 text-amber-400',
  narrative: 'bg-pink-400/10 text-pink-400',
  annex: 'bg-cyan-400/10 text-cyan-400',
  other: 'bg-muted text-muted-foreground',
}

function formatBytes(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function Documents() {
  const { id: projectId } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [docs, setDocs] = useState<ProjectDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [category, setCategory] = useState('report')
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    const { data } = await supabase.from('project_documents').select('*').eq('project_id', projectId!).order('created_at', { ascending: false })
    setDocs(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [projectId])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const path = `${projectId}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('documents').upload(path, file)
      if (uploadError) throw uploadError

      const { error: dbError } = await supabase.from('project_documents').insert({
        project_id: projectId!,
        name: file.name,
        category,
        file_path: path,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: user?.id ?? null,
      })
      if (dbError) throw dbError
      toast.success('Document uploaded')
      load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDownload = async (doc: ProjectDocument) => {
    if (!doc.file_path) return
    const { data } = await supabase.storage.from('documents').createSignedUrl(doc.file_path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const handleDelete = async (doc: ProjectDocument) => {
    if (doc.file_path) {
      const { error: storageError } = await supabase.storage.from('documents').remove([doc.file_path])
      if (storageError) {
        toast.error('Failed to delete file from storage')
        return
      }
    }
    const { error: dbError } = await supabase.from('project_documents').delete().eq('id', doc.id)
    if (dbError) {
      toast.error('Failed to remove document record')
      return
    }
    toast.success('Document removed')
    load()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-medium text-foreground">Documents</h2>
          <p className="text-xs text-muted-foreground">{docs.length} document{docs.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="px-2 py-1.5 bg-input-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c.replace('_', ' ')}</option>)}
          </select>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : docs.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
          <p className="text-xs text-muted-foreground mt-1">Select a category and upload your first document</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <div key={doc.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <FileText className="w-8 h-8 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                  {doc.category && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize flex-shrink-0 ${CATEGORY_COLOR[doc.category] ?? CATEGORY_COLOR.other}`}>
                      {doc.category.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(doc.file_size)}
                  {doc.created_at && ` · ${new Date(doc.created_at).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex gap-1.5">
                {doc.file_path && (
                  <button onClick={() => handleDownload(doc)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => handleDelete(doc)} className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-accent rounded transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
