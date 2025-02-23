
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";
import { corsHeaders } from '../_shared/cors.ts';

console.log('Loading stripe-webhook function...');

// Initialize Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('No Stripe signature found');
      return new Response('No signature', { status: 400 });
    }

    const body = await req.text();
    console.log('Received webhook. Processing event...');

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    const cryptoProvider = Stripe.createSubtleCryptoProvider();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );

    console.log('Stripe event type:', event.type);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle subscription events
    if (event.type.startsWith('customer.subscription')) {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Processing subscription:', subscription.id);
      console.log('Subscription status:', subscription.status);
      console.log('Customer:', subscription.customer);

      // Get customer data
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      console.log('Customer data:', customer);

      // Find user by email in customers table
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('stripe_customer_id', subscription.customer)
        .single();

      if (customerError || !customerData) {
        console.error('Error finding customer:', customerError);
        throw new Error('Customer not found in database');
      }

      const userId = customerData.id;
      console.log('Found user ID:', userId);

      // Get price details
      const priceId = subscription.items.data[0].price.id;
      console.log('Price data:', priceId);

      const subscriptionData = {
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        status: subscription.status,
        plan_type: 'student', // You might want to make this dynamic based on the price
        is_student: true,
        stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        trial_end_at: subscription.trial_end 
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
        started_at: new Date(subscription.start_date * 1000).toISOString(),
      };

      console.log('Preparing to upsert subscription data:', subscriptionData);

      const { data, error } = await supabase
        .from('subscriptions')
        .upsert(subscriptionData)
        .select();
      
      if (error) {
        console.error('Error upserting subscription:', error);
        throw error;
      }

      console.log('Successfully updated subscription in database:', data);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(
      JSON.stringify({
        error: {
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
