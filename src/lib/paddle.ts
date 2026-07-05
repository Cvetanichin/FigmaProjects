import { supabase } from './supabase'

export type Plan = 'free' | 'starter' | 'professional' | 'organisation'

export const PLAN_LIMITS: Record<Plan, { projects: number; aiRuns: number; reports: number; seats: number }> = {
  free:         { projects: 2,        aiRuns: 5,   reports: 5,         seats: 1 },
  starter:      { projects: 5,        aiRuns: 15,  reports: 20,        seats: 2 },
  professional: { projects: 10,       aiRuns: 50,  reports: Infinity,  seats: 5 },
  organisation: { projects: Infinity, aiRuns: 100, reports: Infinity,  seats: 7 },
}

export const PLAN_LABELS: Record<Plan, string> = {
  free:         'Free',
  starter:      'Starter',
  professional: 'Professional',
  organisation: 'Organisation',
}

// Paddle price IDs are not secret — safe to expose via VITE_ env vars, same as Stripe publishable price IDs.
const PADDLE_PRICE_IDS: Record<Exclude<Plan, 'free'>, string> = {
  starter: import.meta.env.VITE_PADDLE_STARTER_PRICE_ID as string,
  professional: import.meta.env.VITE_PADDLE_PROFESSIONAL_PRICE_ID as string,
  organisation: import.meta.env.VITE_PADDLE_ORGANISATION_PRICE_ID as string,
}

declare global {
  interface Window {
    Paddle?: {
      Environment: { set: (env: 'sandbox' | 'production') => void }
      Setup: (opts: { token: string }) => void
      Checkout: { open: (opts: Record<string, unknown>) => void }
    }
  }
}

let paddleLoadPromise: Promise<void> | null = null

function loadPaddleJs(): Promise<void> {
  if (window.Paddle) return Promise.resolve()
  if (paddleLoadPromise) return paddleLoadPromise

  paddleLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'
    script.onload = () => {
      const token = import.meta.env.VITE_PADDLE_CLIENT_TOKEN as string
      const env = (import.meta.env.VITE_PADDLE_ENV as string) ?? 'production'
      if (env === 'sandbox') window.Paddle?.Environment.set('sandbox')
      window.Paddle?.Setup({ token })
      resolve()
    }
    script.onerror = () => reject(new Error('Failed to load Paddle.js'))
    document.head.appendChild(script)
  })
  return paddleLoadPromise
}

export async function openCheckout(plan: Exclude<Plan, 'free'>) {
  const priceId = PADDLE_PRICE_IDS[plan]
  if (!priceId) throw new Error(`Missing Paddle price ID for plan "${plan}"`)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be signed in to upgrade')

  await loadPaddleJs()
  window.Paddle?.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customer: { email: user.email },
    customData: { supabase_user_id: user.id },
    settings: {
      successUrl: `${window.location.origin}/billing?success=1`,
    },
  })
}

export async function redirectToBillingPortal() {
  const { data: { session } } = await supabase.auth.getSession()
  const { data, error } = await supabase.functions.invoke('paddle-customer-portal', {
    headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined,
  })
  if (error || !data?.url) throw new Error(error?.message ?? 'Failed to open billing portal')
  window.location.href = data.url
}
