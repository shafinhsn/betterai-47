
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    const body = await req.json()
    const { planId, userId, planName } = body

    if (!planId || !userId || !planName) {
      console.error('Missing required parameters:', body)
      throw new Error('Missing required parameters')
    }

    console.log('Creating PayPal subscription for:', { planId, userId, planName })

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create a subscription record in pending state
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          plan_type: planName,
          status: 'pending',
          is_student: true,
          payment_processor: 'paypal'
        }
      ])
      .select()
      .single()

    if (subscriptionError) {
      console.error('Database error:', subscriptionError)
      throw new Error('Failed to create subscription record: ' + subscriptionError.message)
    }

    if (!subscription) {
      throw new Error('No subscription was created')
    }

    console.log('Created subscription:', subscription.id)

    return new Response(
      JSON.stringify({
        subscription_id: subscription.id
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Subscription error:', error)
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
