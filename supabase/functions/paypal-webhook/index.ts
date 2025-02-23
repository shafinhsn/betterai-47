
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { corsHeaders } from '../_shared/cors.ts'

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
  if (!response.ok) throw new Error('Failed to get PayPal access token');
  return data.access_token;
}

async function verifyWebhook(accessToken: string, webhookId: string, event: any) {
  const response = await fetch(`${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      webhook_id: webhookId,
      webhook_event: event,
    }),
  });

  const data = await response.json();
  return data.verification_status === 'SUCCESS';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookData = await req.json();
    console.log('Received PayPal webhook:', webhookData);

    const accessToken = await getPayPalAccessToken();
    const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID');

    // Verify webhook signature
    const isValid = await verifyWebhook(accessToken, webhookId, webhookData);
    if (!isValid) {
      console.error('Invalid webhook signature');
      throw new Error('Invalid webhook signature');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const eventType = webhookData.event_type;
    const resource = webhookData.resource;
    const userId = resource.custom_id; // This is our user ID we passed during subscription creation

    console.log('Processing webhook event:', { eventType, userId });

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        // Update subscription status to active
        await supabaseClient
          .from('subscriptions')
          .upsert({
            user_id: userId,
            payment_subscription_id: resource.id,
            payment_processor: 'paypal',
            status: 'active',
            current_period_end: resource.billing_info.next_billing_time,
            plan_type: 'student'
          });
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        // Update subscription status to canceled
        await supabaseClient
          .from('subscriptions')
          .update({
            status: 'canceled',
            expires_at: resource.billing_info.next_billing_time
          })
          .eq('payment_subscription_id', resource.id);
        break;

      case 'BILLING.SUBSCRIPTION.EXPIRED':
        // Update subscription status to expired
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
