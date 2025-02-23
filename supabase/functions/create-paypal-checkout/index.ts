
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

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

    const { planId, userId, planName } = await req.json()

    if (!planId || !userId || !planName) {
      throw new Error('Missing required parameters')
    }

    console.log('Creating PayPal subscription for:', { planId, userId, planName })

    // Create a subscription record in pending state
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          plan_type: planName,
          status: 'pending',
          is_student: true,
          payment_processor: 'paypal',
          payment_subscription_id: null // Will be updated by webhook
        }
      ])
      .select()
      .single()

    if (subscriptionError || !subscription) {
      console.error('Database error:', subscriptionError)
      throw new Error('Failed to create subscription record')
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
