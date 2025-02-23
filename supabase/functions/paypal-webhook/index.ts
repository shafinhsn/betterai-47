
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { corsHeaders } from '../_shared/cors.ts'

const PAYPAL_API_URL = Deno.env.get('PAYPAL_MODE') === 'sandbox' 
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

async function verifyWebhook(accessToken: string, webhookId: string, event: any) {
  console.log('Verifying webhook signature...');
  
  const response = await fetch(`${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      webhook_id: webhookId,
      webhook_event: event,
      transmission_id: event.id,
      transmission_time: event.create_time,
      cert_url: event.links?.[0]?.href,
      auth_algo: event.auth_algo,
      transmission_sig: event.transmission_sig,
    }),
  });

  const data = await response.json();
  console.log('Webhook verification response:', data);
  
  if (!response.ok) {
    console.error('Webhook verification failed:', data);
    throw new Error('Failed to verify webhook signature');
  }
  
  return data.verification_status === 'SUCCESS';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookData = await req.json();
    console.log('Received PayPal webhook:', JSON.stringify(webhookData, null, 2));

    const accessToken = await getPayPalAccessToken();
    const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID');

    if (!webhookId) {
      throw new Error('PayPal webhook ID not configured');
    }

    // Verify webhook signature
    const isValid = await verifyWebhook(accessToken, webhookId, webhookData);
    if (!isValid) {
      console.error('Invalid webhook signature');
      throw new Error('Invalid webhook signature');
    }

    console.log('Webhook signature verified successfully');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    const eventType = webhookData.event_type;
    const resource = webhookData.resource;
    const userId = resource.custom_id; // This is our user ID passed during subscription creation

    console.log('Processing webhook event:', { eventType, userId });

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        console.log('Processing subscription activation...');
        await supabaseClient
          .from('subscriptions')
          .upsert({
            user_id: userId,
            payment_subscription_id: resource.id,
            status: 'active',
            stripe_current_period_end: resource.billing_info.next_billing_time,
            plan_type: 'student'
          });
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        console.log('Processing subscription cancellation...');
        await supabaseClient
          .from('subscriptions')
          .update({
            status: 'canceled',
            expires_at: resource.billing_info.next_billing_time
          })
          .eq('payment_subscription_id', resource.id);
        break;

      case 'BILLING.SUBSCRIPTION.EXPIRED':
        console.log('Processing subscription expiration...');
        await supabaseClient
          .from('subscriptions')
          .update({
            status: 'expired',
            expires_at: new Date().toISOString()
          })
          .eq('payment_subscription_id', resource.id);
        break;

      default:
        console.log('Unhandled webhook event type:', eventType);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
