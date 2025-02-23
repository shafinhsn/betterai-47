
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PAYPAL_API_URL = Deno.env.get('PAYPAL_MODE') === 'sandbox' 
  ? 'https://api-m.sandbox.paypal.com' 
  : 'https://api-m.paypal.com';

async function getPayPalAccessToken() {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const clientSecret = Deno.env.get('PAYPAL_SECRET_KEY');
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

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
    console.error('PayPal auth error:', data);
    throw new Error('Failed to get PayPal access token');
  }

  return data.access_token;
}

async function createSubscription(accessToken: string, planId: string, userId: string) {
  const webhookId = '1C641354TA816383R';
  const response = await fetch(`${PAYPAL_API_URL}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'PayPal-Request-Id': crypto.randomUUID(), // Prevent duplicate subscriptions
    },
    body: JSON.stringify({
      plan_id: planId,
      application_context: {
        brand_name: 'Student Writing Assistant',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: `${Deno.env.get('PUBLIC_SITE_URL')}/subscription?success=true`,
        cancel_url: `${Deno.env.get('PUBLIC_SITE_URL')}/subscription?success=false`,
      },
      custom_id: userId,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('PayPal subscription creation error:', data);
    throw new Error('Failed to create PayPal subscription');
  }

  console.log('PayPal subscription created:', data);
  return data;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planId, userId } = await req.json();
    
    if (!planId || !userId) {
      throw new Error('Missing required parameters');
    }

    console.log('Creating PayPal subscription:', { planId, userId });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Verify the product exists and is active
    const { data: product, error: productError } = await supabaseClient
      .from('payment_products')
      .select('*')
      .eq('payment_processor_id', planId)
      .eq('active', true)
      .maybeSingle();

    if (productError || !product) {
      console.error('Product verification error:', productError);
      throw new Error('Invalid or inactive product');
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    
    // Create PayPal subscription
    const subscription = await createSubscription(accessToken, planId, userId);

    console.log('Subscription created successfully');

    // Return the approval URL
    const approvalUrl = subscription.links.find((link: any) => link.rel === 'approve').href;
    return new Response(
      JSON.stringify({ 
        subscription_id: subscription.id,
        url: approvalUrl 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
