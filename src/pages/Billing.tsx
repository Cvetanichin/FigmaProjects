import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { CreditCard, Bot } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { openCheckout, redirectToBillingPortal, PLAN_LABELS, PLAN_LIMITS, type Plan } from '../lib/paddle'
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

const PLAN_ORDER: Plan[] = ['free', 'starter', 'professional', 'organisation']

const PLAN_PRICE_MONTHLY: Record<Plan, string> = {
  free:         '€0',
  starter:      '€49',
  professional: '€109',
  organisation: '€169',
}

const PLAN_PRICE_ANNUAL: Record<Plan, string | null> = {
  free:         null,
  starter:      '€39/mo billed annually',
  professional: '€99/mo billed annually',
  organisation: '€159/mo billed annually',
}

const PLAN_FEATURES: Record<Plan, string[]> = {
  free: [
    '2 projects',
    '5 AI runs (first month only)',
    '100 MB storage',
    '5 saved reports',
    '1 user',
  ],
  starter: [
    '5 projects',
    '15 AI agent runs/mo',
    '2 GB storage',
    '20 saved reports',
    'Up to 2 users',
  ],
  professional: [
    '10 projects',
    '50 AI agent runs/mo',
    '10 GB storage',
    'Unlimited reports',
    'PDF & Word export',
    'Up to 5 users',
  ],
  organisation: [
    'Unlimited projects',
    '100 AI agent runs/mo',
    '50 GB storage',
    'Unlimited reports',
    'PDF & Word export',
    'Up to 7 users',
    'Priority support',
  ],
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

  const handleUpgrade = async (plan: Exclude<Plan, 'free'>) => {
    setUpgrading(plan)
    try {
      await openCheckout(plan)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start upgrade')
    } finally {
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Billing</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your plan and usage</p>
      </div>

      {/* Current plan + usage */}
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

      {/* Plan cards */}
      <h2 className="text-sm font-medium text-foreground mb-3">Plans</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLAN_ORDER.map(plan => {
          const isCurrent = profile.plan === plan
          const isUpgrade = PLAN_ORDER.indexOf(plan) > PLAN_ORDER.indexOf(profile.plan)
          return (
            <div
              key={plan}
              className={`bg-card border rounded-xl p-5 flex flex-col ${isCurrent ? 'border-primary/60 ring-1 ring-primary/20' : 'border-border'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-foreground">{PLAN_LABELS[plan]}</span>
                {isCurrent && <span className="text-xs text-primary font-medium">Current</span>}
              </div>

              <p className="text-2xl font-bold text-foreground">
                {PLAN_PRICE_MONTHLY[plan]}
                <span className="text-xs font-normal text-muted-foreground">/mo</span>
              </p>
              {PLAN_PRICE_ANNUAL[plan] && (
                <p className="text-xs text-muted-foreground mb-3">{PLAN_PRICE_ANNUAL[plan]}</p>
              )}

              <ul className="text-xs text-muted-foreground space-y-1.5 flex-1 mt-3 mb-5">
                {PLAN_FEATURES[plan].map(f => (
                  <li key={f} className="flex items-start gap-1.5">
                    <span className="text-green-400 mt-px">✓</span> {f}
                  </li>
                ))}
              </ul>

              {isUpgrade && (
                <button
                  onClick={() => handleUpgrade(plan as Exclude<Plan, 'free'>)}
                  disabled={upgrading !== null}
                  className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {upgrading === plan ? 'Opening checkout…' : `Upgrade`}
                </button>
              )}
              {isCurrent && plan === 'free' && (
                <p className="text-xs text-center text-muted-foreground">Your current plan</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Nonprofit discount note */}
      <div className="mt-6 p-4 bg-card border border-border rounded-xl">
        <div className="flex items-start gap-3">
          <Bot className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-foreground mb-1">NGO / Nonprofit discount — 20% off</p>
            <p className="text-xs text-muted-foreground">
              Registered nonprofits and EU-funded CSOs qualify for 20% off any paid plan.
              Contact us at{' '}
              <a href="mailto:billing@intelligenceworkspace.app" className="text-primary hover:underline">
                billing@intelligenceworkspace.app
              </a>{' '}
              with your registration number to apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
