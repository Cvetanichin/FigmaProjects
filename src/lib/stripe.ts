import { supabase } from './supabase'

export type Plan = 'free' | 'starter' | 'professional' | 'organisation'

export const PLAN_LIMITS: Record<Plan, { projects: number; aiRuns: number; reports: number; seats: number }> = {
  free:         { projects: 2,        aiRuns: 5,   reports: 5,         seats: 1 },
  starter:      { projects: 5,        aiRuns: 15,  reports: 20,        seats: 1 },
  professional: { projects: 15,       aiRuns: 45,  reports: Infinity,  seats: 3 },
  organisation: { projects: Infinity, aiRuns: 100, reports: Infinity,  seats: 7 },
}

export const PLAN_LABELS: Record<Plan, string> = {
  free:         'Free',
  starter:      'Starter',
  professional: 'Professional',
  organisation: 'Organisation',
}

export async function redirectToCheckout(plan: Exclude<Plan, 'free'>) {
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
