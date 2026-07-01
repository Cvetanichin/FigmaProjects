import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Bot, ArrowLeft } from 'lucide-react'

export function LegalLayout({ title, updated, children }: { title: string; updated?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex justify-center p-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <Link to="/login" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">Intelligence Workspace</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
          <h1 className="text-xl font-semibold text-foreground mb-1">{title}</h1>
          {updated && <p className="text-xs text-muted-foreground mb-6">Last updated: {updated}</p>}
          <div className="prose-legal text-sm text-muted-foreground space-y-4 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{title}</h2>
      {children}
    </section>
  )
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-1">
      {items.map(item => <li key={item}>{item}</li>)}
    </ul>
  )
}
