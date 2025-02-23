
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the request body
    const { planId, userId, planName } = await req.json();

    if (!planId || !userId || !planName) {
      throw new Error('Missing required fields');
    }

    console.log('Creating subscription for:', { planId, userId, planName });

    // Make the PayPal API request to create a subscription
    const response = await fetch('https://api.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${btoa(`${Deno.env.get('PAYPAL_CLIENT_ID')}:${Deno.env.get('PAYPAL_SECRET_KEY')}`)}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('PayPal auth error:', error);
      throw new Error('Failed to authenticate with PayPal');
    }

    const { access_token } = await response.json();

    const subscriptionResponse = await fetch('https://api.paypal.com/v1/billing/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        application_context: {
          user_action: 'SUBSCRIBE_NOW',
          payment_method: {
            payer_selected: 'PAYPAL',
            payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
          },
          return_url: `${req.headers.get('origin')}/manage-subscription`,
          cancel_url: `${req.headers.get('origin')}/subscription`,
        },
      }),
    });

    if (!subscriptionResponse.ok) {
      const error = await subscriptionResponse.text();
      console.error('PayPal subscription error:', error);
      throw new Error('Failed to create PayPal subscription');
    }

    const paypalSubscription = await subscriptionResponse.json();
    console.log('PayPal subscription created:', paypalSubscription);

    // Create a subscription record in Supabase
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        payment_subscription_id: paypalSubscription.id,
        status: 'pending',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false,
        payment_provider: 'paypal',
      })
      .select()
      .single();

    if (subError) {
      console.error('Database error:', subError);
      throw new Error('Failed to create subscription record');
    }

    return new Response(
      JSON.stringify({ subscription_id: paypalSubscription.id }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});
