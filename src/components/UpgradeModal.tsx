import { useState } from 'react'
import { X, Zap } from 'lucide-react'
import { redirectToCheckout } from '../lib/stripe'
import { toast } from 'sonner'

interface Props {
  feature: string
  onClose: () => void
}

export function UpgradeModal({ feature, onClose }: Props) {
  const [loading, setLoading] = useState<'pro' | 'team' | null>(null)

  const upgrade = async (plan: 'pro' | 'team') => {
    setLoading(plan)
    try {
      await redirectToCheckout(plan)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start upgrade')
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-xl">
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
            <div className="border border-primary/40 rounded-lg p-4 bg-primary/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">Pro</span>
                <span className="text-sm font-bold text-foreground">€29<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                <li>✓ Unlimited projects</li>
                <li>✓ 50 AI agent runs/month</li>
                <li>✓ 5 GB document storage</li>
                <li>✓ Unlimited saved reports</li>
                <li>✓ PDF & Word export</li>
              </ul>
              <button
                onClick={() => upgrade('pro')}
                disabled={loading !== null}
                className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading === 'pro' ? 'Redirecting…' : 'Upgrade to Pro'}
              </button>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">Team</span>
                <span className="text-sm font-bold text-foreground">€79<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                <li>✓ Everything in Pro</li>
                <li>✓ 200 AI agent runs/month</li>
                <li>✓ 20 GB document storage</li>
                <li>✓ Up to 5 team seats</li>
                <li>✓ Priority support</li>
              </ul>
              <button
                onClick={() => upgrade('team')}
                disabled={loading !== null}
                className="w-full py-2 border border-border text-foreground rounded-md text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
              >
                {loading === 'team' ? 'Redirecting…' : 'Upgrade to Team'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
