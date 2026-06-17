import { supabase } from './supabase'

export type Plan = 'free' | 'pro' | 'team'

export const PLAN_LIMITS: Record<Plan, { projects: number; aiRuns: number; reports: number }> = {
  free: { projects: 2, aiRuns: 5, reports: 5 },
  pro:  { projects: Infinity, aiRuns: 50, reports: Infinity },
  team: { projects: Infinity, aiRuns: 200, reports: Infinity },
}

export const PLAN_LABELS: Record<Plan, string> = {
  free: 'Free',
  pro: 'Pro',
  team: 'Team',
}

export async function redirectToCheckout(plan: 'pro' | 'team') {
  const { data: { session } } = await supabase.auth.getSession()
  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: { plan },
    headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined,
  })
  if (error || !data?.url) throw new Error(error?.message ?? 'Failed to create checkout session')
  window.location.href = data.url
}

export async function redirectToBillingPortal() {
  const { data: { session } } = await supabase.auth.getSession()
  const { data, error } = await supabase.functions.invoke('stripe-billing-portal', {
    headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined,
  })
  if (error || !data?.url) throw new Error(error?.message ?? 'Failed to open billing portal')
  window.location.href = data.url
}
