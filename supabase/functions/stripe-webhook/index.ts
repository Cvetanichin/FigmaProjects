import Stripe from 'npm:stripe@14'
import { createClient } from 'npm:@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

const PLAN_BY_PRICE: Record<string, string> = {
  [Deno.env.get('STRIPE_STARTER_PRICE_ID') ?? '']: 'starter',
  [Deno.env.get('STRIPE_PROFESSIONAL_PRICE_ID') ?? '']: 'professional',
  [Deno.env.get('STRIPE_ORGANISATION_PRICE_ID') ?? '']: 'organisation',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature!, Deno.env.get('STRIPE_WEBHOOK_SECRET')!)
  } catch {
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const customerId = session.customer as string
    const subscriptionId = session.subscription as string
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const priceId = subscription.items.data[0]?.price.id ?? ''
    const plan = PLAN_BY_PRICE[priceId] ?? 'free'

    await supabase.from('profiles')
      .update({ plan, stripe_customer_id: customerId })
      .eq('stripe_customer_id', customerId)
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string
    const priceId = subscription.items.data[0]?.price.id ?? ''
    const plan = subscription.status === 'active' ? (PLAN_BY_PRICE[priceId] ?? 'free') : 'free'

    await supabase.from('profiles')
      .update({ plan })
      .eq('stripe_customer_id', customerId)
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string
    await supabase.from('profiles').update({ plan: 'free' }).eq('stripe_customer_id', customerId)
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
