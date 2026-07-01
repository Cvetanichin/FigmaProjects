import { Link } from 'react-router'
import { Bot, ArrowLeft, Check } from 'lucide-react'
import { PLAN_LABELS, type Plan } from '../../lib/stripe'

const PLAN_ORDER: Plan[] = ['free', 'starter', 'professional', 'organisation']

const PLAN_PRICE_MONTHLY: Record<Plan, string> = {
  free: '€0',
  starter: '€49',
  professional: '€109',
  organisation: '€169',
}

const PLAN_PRICE_ANNUAL: Record<Plan, string | null> = {
  free: null,
  starter: '€39/mo billed annually',
  professional: '€99/mo billed annually',
  organisation: '€159/mo billed annually',
}

const PLAN_DESCRIPTION: Record<Plan, string> = {
  free: 'Try the core workspace with limited AI usage.',
  starter: 'For small CSOs running their first EC or bilateral grant.',
  professional: 'For active project teams managing multiple donor grants.',
  organisation: 'For larger CSOs and consultancies managing full portfolios.',
}

const PLAN_FEATURES: Record<Plan, string[]> = {
  free: [
    '2 projects',
    '5 AI agent runs (first month only)',
    '100 MB document storage',
    '5 saved reports',
    '1 user',
  ],
  starter: [
    '5 projects',
    '15 AI agent runs/mo',
    '2 GB document storage',
    '20 saved reports',
    'Up to 2 users',
  ],
  professional: [
    '10 projects',
    '50 AI agent runs/mo',
    '10 GB document storage',
    'Unlimited saved reports',
    'PDF & Word export',
    'Up to 5 users',
  ],
  organisation: [
    'Unlimited projects',
    '100 AI agent runs/mo',
    '50 GB document storage',
    'Unlimited saved reports',
    'PDF & Word export',
    'Up to 7 users',
    'Priority support',
  ],
}

export function Pricing() {
  return (
    <div className="min-h-screen bg-background flex justify-center p-4 py-10">
      <div className="w-full max-w-5xl">
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

        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Pricing</h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            AI-enhanced CSO project management, M&amp;E, and donor reporting — plans built for
            organisations of every size, from a single grant to a full portfolio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLAN_ORDER.map(plan => {
            const isFree = plan === 'free'
            return (
              <div
                key={plan}
                className={`bg-card border rounded-xl p-5 flex flex-col ${isFree ? 'border-border' : 'border-border'}`}
              >
                <span className="text-sm font-semibold text-foreground">{PLAN_LABELS[plan]}</span>
                <p className="text-xs text-muted-foreground mt-1 mb-4 min-h-[2.5rem]">{PLAN_DESCRIPTION[plan]}</p>

                <p className="text-2xl font-bold text-foreground">
                  {PLAN_PRICE_MONTHLY[plan]}
                  <span className="text-xs font-normal text-muted-foreground">/mo</span>
                </p>
                {PLAN_PRICE_ANNUAL[plan] && (
                  <p className="text-xs text-muted-foreground mb-3">{PLAN_PRICE_ANNUAL[plan]}</p>
                )}
                {isFree && <p className="text-xs text-muted-foreground mb-3">No credit card required</p>}

                <ul className="text-xs text-muted-foreground space-y-1.5 flex-1 mt-3 mb-5">
                  {PLAN_FEATURES[plan].map(f => (
                    <li key={f} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-green-400 mt-px flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/login"
                  className={`w-full text-center py-2 rounded-md text-sm font-medium transition-opacity ${
                    isFree
                      ? 'border border-border text-foreground hover:bg-accent'
                      : 'bg-primary text-primary-foreground hover:opacity-90'
                  }`}
                >
                  {isFree ? 'Start for free' : `Choose ${PLAN_LABELS[plan]}`}
                </Link>
              </div>
            )
          })}
        </div>

        <div className="mt-8 p-4 bg-card border border-border rounded-xl max-w-2xl mx-auto text-center">
          <p className="text-xs text-muted-foreground">
            Registered nonprofits and EU-funded CSOs qualify for <span className="text-foreground font-medium">20% off</span> any
            paid plan. Contact us at{' '}
            <a href="mailto:cvetanichin@gmail.com" className="text-primary hover:underline">cvetanichin@gmail.com</a>{' '}
            with your registration number to apply.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mt-8 text-xs text-muted-foreground">
          <Link to="/legal/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <span>·</span>
          <Link to="/legal/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <span>·</span>
          <Link to="/legal/refunds" className="hover:text-foreground transition-colors">Refunds</Link>
          <span>·</span>
          <a href="mailto:cvetanichin@gmail.com" className="hover:text-foreground transition-colors">Contact</a>
        </div>
      </div>
    </div>
  )
}
