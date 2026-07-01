import Stripe from 'npm:stripe@14'
import { createClient } from 'npm:@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PRICE_IDS: Record<string, string> = {
  starter: Deno.env.get('STRIPE_STARTER_PRICE_ID') ?? '',
  professional: Deno.env.get('STRIPE_PROFESSIONAL_PRICE_ID') ?? '',
  organisation: Deno.env.get('STRIPE_ORGANISATION_PRICE_ID') ?? '',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader! } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const { plan, success_url, cancel_url } = await req.json()
    const priceId = PRICE_IDS[plan]
    if (!priceId) return new Response(JSON.stringify({ error: 'Invalid plan' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })

    const { data: profile } = await supabase.from('profiles').select('stripe_customer_id').eq('id', user.id).single()
    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { supabase_user_id: user.id } })
      customerId = customer.id
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: success_url ?? `${req.headers.get('origin')}/billing?success=1`,
      cancel_url: cancel_url ?? `${req.headers.get('origin')}/billing`,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
