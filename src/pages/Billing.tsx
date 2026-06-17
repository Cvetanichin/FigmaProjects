import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { CreditCard, Zap, FolderKanban, Bot, FileOutput } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { redirectToCheckout, redirectToBillingPortal, PLAN_LABELS, PLAN_LIMITS, type Plan } from '../lib/stripe'
import { toast } from 'sonner'

function UsageBar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const pct = limit === Infinity ? 0 : Math.min(100, Math.round((used / limit) * 100))
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground">{used} / {limit === Infinity ? '∞' : limit}</span>
      </div>
      {limit !== Infinity && (
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-red-400' : pct >= 70 ? 'bg-amber-400' : 'bg-primary'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}

const PLAN_ORDER: Plan[] = ['free', 'pro', 'team']
const PLAN_PRICE: Record<Plan, string> = { free: '€0', pro: '€29', team: '€79' }
const PLAN_FEATURES: Record<Plan, string[]> = {
  free: ['2 projects', '5 AI agent runs/mo', '100 MB storage', '5 saved reports'],
  pro: ['Unlimited projects', '50 AI agent runs/mo', '5 GB storage', 'Unlimited reports', 'PDF & Word export'],
  team: ['Unlimited projects', '200 AI agent runs/mo', '20 GB storage', 'Unlimited reports', 'Up to 5 seats', 'Priority support'],
}

export function Billing() {
  const { profile, refreshProfile } = useAuth()
  const [searchParams] = useSearchParams()
  const [projectCount, setProjectCount] = useState(0)
  const [reportCount, setReportCount] = useState(0)
  const [upgrading, setUpgrading] = useState<Plan | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get('success') === '1') {
      toast.success('Plan upgraded successfully!')
      refreshProfile()
    }
    supabase.from('projects').select('id', { count: 'exact', head: true }).then(({ count }) => setProjectCount(count ?? 0))
    supabase.from('reports').select('id', { count: 'exact', head: true }).then(({ count }) => setReportCount(count ?? 0))
  }, [])

  const handleUpgrade = async (plan: 'pro' | 'team') => {
    setUpgrading(plan)
    try {
      await redirectToCheckout(plan)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start upgrade')
      setUpgrading(null)
    }
  }

  const handleManage = async () => {
    setPortalLoading(true)
    try {
      await redirectToBillingPortal()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to open billing portal')
      setPortalLoading(false)
    }
  }

  const limits = PLAN_LIMITS[profile.plan]

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Billing</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your plan and usage</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">Current plan</h2>
          </div>
          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
            {PLAN_LABELS[profile.plan]}
          </span>
        </div>

        <div className="space-y-3 mb-4">
          <UsageBar used={profile.ai_runs_used} limit={limits.aiRuns} label="AI agent runs this month" />
          <UsageBar used={projectCount} limit={limits.projects} label="Projects" />
          <UsageBar used={reportCount} limit={limits.reports} label="Saved reports" />
        </div>

        {profile.plan !== 'free' && (
          <button
            onClick={handleManage}
            disabled={portalLoading}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            {portalLoading ? 'Opening…' : 'Manage subscription →'}
          </button>
        )}
      </div>

      <h2 className="text-sm font-medium text-foreground mb-3">Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLAN_ORDER.map(plan => {
          const isCurrent = profile.plan === plan
          const isUpgrade = PLAN_ORDER.indexOf(plan) > PLAN_ORDER.indexOf(profile.plan)
          return (
            <div
              key={plan}
              className={`bg-card border rounded-xl p-5 flex flex-col ${isCurrent ? 'border-primary/50' : 'border-border'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-foreground">{PLAN_LABELS[plan]}</span>
                {isCurrent && <span className="text-xs text-primary">Current</span>}
              </div>
              <p className="text-xl font-bold text-foreground mb-4">
                {PLAN_PRICE[plan]}<span className="text-xs font-normal text-muted-foreground">/mo</span>
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5 flex-1 mb-5">
                {PLAN_FEATURES[plan].map(f => (
                  <li key={f} className="flex items-center gap-1.5">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              {isUpgrade && (
                <button
                  onClick={() => handleUpgrade(plan as 'pro' | 'team')}
                  disabled={upgrading !== null}
                  className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {upgrading === plan ? 'Redirecting…' : `Upgrade to ${PLAN_LABELS[plan]}`}
                </button>
              )}
              {isCurrent && plan === 'free' && (
                <p className="text-xs text-center text-muted-foreground">Your current plan</p>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-card border border-border rounded-xl">
        <div className="flex items-start gap-3">
          <Bot className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-foreground mb-1">NGO / Nonprofit discount</p>
            <p className="text-xs text-muted-foreground">
              Registered nonprofits may qualify for a 40% discount. Contact us at{' '}
              <a href="mailto:billing@intelligenceworkspace.app" className="text-primary hover:underline">
                billing@intelligenceworkspace.app
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
