import { createClient } from 'npm:@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, paddle-signature',
}

const PLAN_BY_PRICE: Record<string, string> = {
  [Deno.env.get('PADDLE_STARTER_PRICE_ID') ?? '']: 'starter',
  [Deno.env.get('PADDLE_PROFESSIONAL_PRICE_ID') ?? '']: 'professional',
  [Deno.env.get('PADDLE_ORGANISATION_PRICE_ID') ?? '']: 'organisation',
}

async function verifyPaddleSignature(rawBody: string, signatureHeader: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(signatureHeader.split(';').map(p => p.split('=')))
  const ts = parts.ts
  const h1 = parts.h1
  if (!ts || !h1) return false

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(`${ts}:${rawBody}`))
  const computed = Array.from(new Uint8Array(signed)).map(b => b.toString(16).padStart(2, '0')).join('')

  return computed === h1
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const signature = req.headers.get('paddle-signature') ?? ''
  const body = await req.text()

  const valid = await verifyPaddleSignature(body, signature, Deno.env.get('PADDLE_WEBHOOK_SECRET')!)
  if (!valid) return new Response('Webhook signature verification failed', { status: 400 })

  const event = JSON.parse(body)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const eventType = event.event_type as string
  const data = event.data

  if (eventType === 'subscription.created' || eventType === 'subscription.updated' || eventType === 'subscription.activated') {
    const customerId = data.customer_id as string
    const priceId = data.items?.[0]?.price?.id ?? ''
    const status = data.status as string
    const plan = status === 'active' || status === 'trialing' ? (PLAN_BY_PRICE[priceId] ?? 'free') : 'free'
    const supabaseUserId = data.custom_data?.supabase_user_id as string | undefined

    if (supabaseUserId) {
      await supabase.from('profiles')
        .update({ plan, paddle_customer_id: customerId })
        .eq('id', supabaseUserId)
    } else {
      await supabase.from('profiles')
        .update({ plan, paddle_customer_id: customerId })
        .eq('paddle_customer_id', customerId)
    }
  }

  if (eventType === 'subscription.canceled' || eventType === 'subscription.past_due' || eventType === 'subscription.paused') {
    const customerId = data.customer_id as string
    await supabase.from('profiles').update({ plan: 'free' }).eq('paddle_customer_id', customerId)
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
