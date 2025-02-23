
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    const { planId, userId, planName } = await req.json()
    
    // Validate all required parameters
    if (!planId || !userId || !planName) {
      console.error('Missing required parameters:', { planId, userId, planName });
      return new Response(
        JSON.stringify({
          error: 'Missing required parameters',
          details: { planId, userId, planName }
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    console.log('Creating PayPal subscription for:', { planId, userId, planName });

    // For now, simulate subscription creation to debug the flow
    const subscription_id = `test_sub_${Date.now()}`;
    
    console.log('Created subscription:', subscription_id);

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
    );

  } catch (error) {
    console.error('Error creating subscription:', error);
    
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
    );
  }
});

