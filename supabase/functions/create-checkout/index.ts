
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { stripe } from '../_shared/stripe.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { planType, email, userId } = await req.json()
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Get or create Stripe customer
    const { data: customerData } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    let stripeCustomerId = customerData?.stripe_customer_id

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({ email })
      
      await supabase
        .from('customers')
        .update({ stripe_customer_id: customer.id })
        .eq('id', userId)

      stripeCustomerId = customer.id
    }

    // Create checkout session
    const prices = {
      student: 'price_student', // Replace with actual Stripe price IDs
      business: 'price_business'
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: prices[planType as keyof typeof prices],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/`,
      cancel_url: `${req.headers.get('origin')}/`,
      automatic_tax: { enabled: true }
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
