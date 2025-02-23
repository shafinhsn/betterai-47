
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { corsHeaders } from '../_shared/cors.ts'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const PAYPAL_API_URL = Deno.env.get('PAYPAL_MODE') === 'sandbox' 
  ? 'https://api-m.sandbox.paypal.com' 
  : 'https://api-m.paypal.com';

async function getPayPalAccessToken() {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const clientSecret = Deno.env.get('PAYPAL_SECRET_KEY');
  
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
  const response = await fetch(`${PAYPAL_API_URL}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      plan_id: planId,
      application_context: {
        return_url: `${Deno.env.get('PUBLIC_SITE_URL')}/subscription?success=true`,
        cancel_url: `${Deno.env.get('PUBLIC_SITE_URL')}/subscription?success=false`,
        user_action: 'SUBSCRIBE_NOW',
        shipping_preference: 'NO_SHIPPING',
      },
      custom_id: userId, // Store the user ID for webhook processing
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('PayPal subscription error:', data);
    throw new Error('Failed to create PayPal subscription');
  }

  return data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planId, email, userId } = await req.json();

    console.log('Creating PayPal checkout with:', { planId, email, userId });

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
      console.error('Product lookup error:', productError);
      throw new Error('Product not found or inactive');
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    
    // Create PayPal subscription
    const subscription = await createSubscription(accessToken, planId, userId);

    console.log('PayPal subscription created:', subscription);

    return new Response(
      JSON.stringify({ url: subscription.links.find((link: any) => link.rel === 'approve').href }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
