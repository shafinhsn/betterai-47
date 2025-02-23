
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from '../_shared/cors.ts';

const PAYPAL_MODE = Deno.env.get('PAYPAL_MODE') || 'sandbox';
const PAYPAL_API_URL = PAYPAL_MODE === 'sandbox' 
  ? 'https://api-m.sandbox.paypal.com' 
  : 'https://api-m.paypal.com';

async function getPayPalAccessToken() {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const clientSecret = Deno.env.get('PAYPAL_SECRET_KEY');
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  console.log('Getting PayPal access token...');
  
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-Language': 'en_US',
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Failed to get PayPal access token:', data);
    throw new Error('Failed to get PayPal access token');
  }
  
  console.log('Successfully obtained PayPal access token');
  return data.access_token;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planId, userId, planName } = await req.json();

    if (!planId || !userId || !planName) {
      console.error('Missing required fields:', { planId, userId, planName });
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          details: { planId, userId, planName } 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Creating subscription with:', { planId, userId, planName });

    const accessToken = await getPayPalAccessToken();

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    // Create PayPal subscription
    const subscriptionResponse = await fetch(`${PAYPAL_API_URL}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `${userId}-${Date.now()}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        subscriber: {
          name: {
            given_name: userId
          },
          email_address: userId,  // Using userId as email for now
        },
        application_context: {
          user_action: 'SUBSCRIBE_NOW',
          payment_method: {
            payer_selected: 'PAYPAL',
            payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
          },
          return_url: `${origin}/manage-subscription`,
          cancel_url: `${origin}/subscription`,
        },
      }),
    });

    const responseData = await subscriptionResponse.text();
    console.log('PayPal API Response:', responseData);

    let subscriptionData;
    try {
      subscriptionData = JSON.parse(responseData);
    } catch (e) {
      console.error('Failed to parse PayPal response:', e);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response from PayPal',
          details: responseData
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!subscriptionResponse.ok) {
      console.error('PayPal subscription error:', subscriptionData);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create PayPal subscription',
          details: subscriptionData
        }),
        { 
          status: subscriptionResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create a record in Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        payment_subscription_id: subscriptionData.id,
        status: 'pending',
        started_at: new Date().toISOString(),
        plan_type: planName,
        payment_provider: 'paypal'
      });

    if (subError) {
      console.error('Database error:', subError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create subscription record',
          details: subError
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        subscription_id: subscriptionData.id,
        approve_url: subscriptionData.links.find((link: any) => link.rel === 'approve').href
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
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

