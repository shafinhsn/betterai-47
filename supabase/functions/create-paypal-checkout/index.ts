
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planId, userId, planName } = await req.json();
    console.log('Creating subscription with:', { planId, userId, planName });

    // Get PayPal access token
    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const clientSecret = Deno.env.get("PAYPAL_SECRET_KEY");

    if (!clientId || !clientSecret) {
      throw new Error("PayPal credentials not configured");
    }

    console.log('Getting PayPal access token...');
    const auth = btoa(`${clientId}:${clientSecret}`);
    const tokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('PayPal token error:', errorData);
      throw new Error(`Failed to get PayPal access token: ${JSON.stringify(errorData)}`);
    }

    const { access_token } = await tokenResponse.json();
    
    // Create PayPal subscription
    console.log('Creating subscription...');
    const subscriptionResponse = await fetch('https://api-m.sandbox.paypal.com/v1/billing/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': crypto.randomUUID(),
      },
      body: JSON.stringify({
        plan_id: planId,
        subscriber: {
          name: {
            given_name: "Student",
            surname: "Subscriber"
          },
        },
        application_context: {
          return_url: 'https://example.com/success',
          cancel_url: 'https://example.com/cancel',
        }
      })
    });

    if (!subscriptionResponse.ok) {
      const errorData = await subscriptionResponse.json();
      console.error('PayPal subscription error:', errorData);
      throw new Error(`Failed to create subscription: ${JSON.stringify(errorData)}`);
    }

    const subscription = await subscriptionResponse.json();
    console.log('Subscription created:', subscription);

    return new Response(
      JSON.stringify({
        subscription_id: subscription.id,
        approve_url: subscription.links.find((link: any) => link.rel === 'approve').href
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
