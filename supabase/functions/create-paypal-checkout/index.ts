
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    const { planId, userId, planName } = await req.json()
    
    if (!planId || !userId || !planName) {
      console.error('Missing required parameters:', { planId, userId, planName })
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters' 
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

    console.log('Creating subscription for:', { planId, userId, planName })
    
    // Simulate subscription creation - replace with actual PayPal API call
    const subscription_id = `sub_${Date.now()}`
    
    console.log('Created subscription:', subscription_id)

    return new Response(
      JSON.stringify({ 
        subscription_id 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )

  } catch (error) {
    console.error('Error creating subscription:', error)
    
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
