
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
    
    if (!planId || !userId || !planName) {
      throw new Error('Missing required parameters');
    }

    console.log('Creating PayPal subscription for:', { planId, userId, planName });

    // Create a new subscription record in the database
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          plan_type: planName,
          status: 'pending',
          is_student: true,
        }
      ])
      .select()
      .single();

    if (subscriptionError || !subscription) {
      console.error('Database error:', subscriptionError);
      throw new Error('Failed to create subscription record');
    }

    // Return the subscription ID for PayPal to use
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
