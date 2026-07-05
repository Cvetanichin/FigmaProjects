import { useState } from 'react'
import { X, Zap } from 'lucide-react'
import { openCheckout, type Plan } from '../lib/paddle'
import { toast } from 'sonner'

interface Props {
  feature: string
  onClose: () => void
}

type PaidPlan = Exclude<Plan, 'free'>

export function UpgradeModal({ feature, onClose }: Props) {
  const [loading, setLoading] = useState<PaidPlan | null>(null)

  const upgrade = async (plan: PaidPlan) => {
    setLoading(plan)
    try {
      await openCheckout(plan)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start upgrade')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Upgrade your plan</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-muted-foreground mb-6">
            You've reached the limit for <span className="text-foreground font-medium">{feature}</span> on the Free plan. Upgrade to keep going.
          </p>

          <div className="space-y-3">
            {/* Starter */}
            <div className="border border-primary/40 rounded-lg p-4 bg-primary/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">Starter</span>
                <span className="text-sm font-bold text-foreground">€49<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                <li>✓ 5 projects</li>
                <li>✓ 15 AI agent runs/month</li>
                <li>✓ 2 GB document storage</li>
                <li>✓ 20 saved reports</li>
                <li>✓ Up to 2 users</li>
              </ul>
              <button
                onClick={() => upgrade('starter')}
                disabled={loading !== null}
                className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading === 'starter' ? 'Opening checkout…' : 'Upgrade to Starter'}
              </button>
            </div>

            {/* Professional */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">Professional</span>
                <span className="text-sm font-bold text-foreground">€109<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                <li>✓ 10 projects</li>
                <li>✓ 50 AI agent runs/month</li>
                <li>✓ 10 GB document storage</li>
                <li>✓ Unlimited reports + PDF/Word export</li>
                <li>✓ Up to 5 users</li>
              </ul>
              <button
                onClick={() => upgrade('professional')}
                disabled={loading !== null}
                className="w-full py-2 border border-border text-foreground rounded-md text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
              >
                {loading === 'professional' ? 'Opening checkout…' : 'Upgrade to Professional'}
              </button>
            </div>

            {/* Organisation */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">Organisation</span>
                <span className="text-sm font-bold text-foreground">€169<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                <li>✓ Unlimited projects</li>
                <li>✓ 100 AI agent runs/month</li>
                <li>✓ 50 GB storage + PDF/Word export</li>
                <li>✓ Up to 7 users</li>
                <li>✓ Priority support</li>
              </ul>
              <button
                onClick={() => upgrade('organisation')}
                disabled={loading !== null}
                className="w-full py-2 border border-border text-foreground rounded-md text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
              >
                {loading === 'organisation' ? 'Opening checkout…' : 'Upgrade to Organisation'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
