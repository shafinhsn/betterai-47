
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { stripe } from '../_shared/stripe.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { planType, email, userId } = await req.json()
    
    // Validate required fields
    if (!planType || !email || !userId) {
      throw new Error('Missing required fields')
    }

    console.log(`Creating checkout session for user ${userId} with plan ${planType}`)
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Get or create Stripe customer
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (customerError) {
      console.error('Error fetching customer:', customerError)
      throw new Error('Failed to fetch customer data')
    }

    let stripeCustomerId = customerData?.stripe_customer_id

    if (!stripeCustomerId) {
      console.log('Creating new Stripe customer')
      const customer = await stripe.customers.create({ email })
      
      const { error: updateError } = await supabase
        .from('customers')
        .update({ stripe_customer_id: customer.id })
        .eq('id', userId)

      if (updateError) {
        console.error('Error updating customer:', updateError)
        throw new Error('Failed to update customer data')
      }

      stripeCustomerId = customer.id
    }

    // Create checkout session
    const prices = {
      student: Deno.env.get('STRIPE_STUDENT_PRICE_ID'),
      business: Deno.env.get('STRIPE_BUSINESS_PRICE_ID')
    }

    const priceId = prices[planType as keyof typeof prices]
    if (!priceId) {
      throw new Error('Invalid plan type')
    }

    console.log(`Creating checkout session with price ID ${priceId}`)
    
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/`,
      cancel_url: `${req.headers.get('origin')}/`,
      automatic_tax: { enabled: true }
    })

    console.log('Checkout session created successfully')

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Checkout error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
