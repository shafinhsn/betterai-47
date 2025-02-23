
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, constructEventAsync, stripe } from '../_shared/stripe.ts';

console.log('Loading stripe-webhook function...');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    console.error('No Stripe signature found');
    return new Response('No signature', { status: 400 });
  }

  try {
    const body = await req.text();
    console.log('Received webhook. Processing event...');

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    const event = await constructEventAsync(body, signature, webhookSecret);
    console.log('Stripe event type:', event.type);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle subscription events
    if (event.type.startsWith('customer.subscription')) {
      const subscription = event.data.object as any;
      console.log('Processing subscription:', subscription.id);
      console.log('Subscription status:', subscription.status);
      console.log('Customer:', subscription.customer);

      // Get customer data to find user
      const { data: customerData } = await stripe.customers.retrieve(subscription.customer as string);
      console.log('Customer data:', customerData);

      if (!customerData.metadata?.user_id) {
        console.error('No user_id found in customer metadata');
        return new Response('No user ID found', { status: 400 });
      }

      const userId = customerData.metadata.user_id;
      console.log('Found user ID:', userId);

      // Get active price details
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      console.log('Price data:', price);

      const subscriptionData = {
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        status: subscription.status,
        plan_type: price.nickname || 'student',
        is_student: true,
        stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        trial_end_at: subscription.trial_end 
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null
      };

      console.log('Preparing to upsert subscription data:', subscriptionData);

      const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
          ...subscriptionData,
          started_at: subscription.start_date 
            ? new Date(subscription.start_date * 1000).toISOString()
            : new Date().toISOString(),
        })
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
          stack: err instanceof Error ? err.stack : undefined
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
