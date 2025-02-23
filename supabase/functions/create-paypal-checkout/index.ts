
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

    // Parse and validate request body
    let body;
    try {
      const text = await req.text(); // First get the raw text
      console.log('Raw request body:', text); // Log the raw body
      body = JSON.parse(text); // Then parse it
    } catch (e) {
      console.error('Error parsing request body:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { planId, userId, planName } = body;

    if (!planId || !userId || !planName) {
      console.error('Missing required fields:', { planId, userId, planName });
      return new Response(
        JSON.stringify({ error: 'Missing required fields', received: { planId, userId, planName } }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Creating subscription for:', { planId, userId, planName });

    // Get PayPal access token
    const tokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${btoa(`${Deno.env.get('PAYPAL_CLIENT_ID')}:${Deno.env.get('PAYPAL_SECRET_KEY')}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const tokenData = await tokenResponse.text();
    console.log('Token response:', tokenData);

    if (!tokenResponse.ok) {
      console.error('PayPal auth error:', tokenData);
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate with PayPal', details: tokenData }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let accessToken;
    try {
      const tokenJson = JSON.parse(tokenData);
      accessToken = tokenJson.access_token;
    } catch (e) {
      console.error('Error parsing token response:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid token response from PayPal' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create PayPal subscription
    const subscriptionResponse = await fetch('https://api-m.sandbox.paypal.com/v1/billing/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `${userId}-${Date.now()}`,
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

    const subscriptionData = await subscriptionResponse.text();
    console.log('Subscription response:', subscriptionData);

    if (!subscriptionResponse.ok) {
      console.error('PayPal subscription error:', subscriptionData);
      return new Response(
        JSON.stringify({ error: 'Failed to create PayPal subscription', details: subscriptionData }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let paypalSubscription;
    try {
      paypalSubscription = JSON.parse(subscriptionData);
    } catch (e) {
      console.error('Error parsing subscription response:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid subscription response from PayPal' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('PayPal subscription created:', paypalSubscription);

    // Create a subscription record in Supabase
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        payment_subscription_id: paypalSubscription.id,
        status: 'pending',
        started_at: new Date().toISOString(),
        plan_type: planName,
        payment_provider: 'paypal'
      })
      .select()
      .single();

    if (subError) {
      console.error('Database error:', subError);
      return new Response(
        JSON.stringify({ error: 'Failed to create subscription record', details: subError }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
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
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
