
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

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

    const event = await stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log('Stripe event type:', event.type);

    // Handle subscription events
    if (event.type.startsWith('customer.subscription')) {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Processing subscription:', subscription.id);
      
      // Get customer data
      const stripeCustomerId = subscription.customer as string;
      console.log('Looking up customer:', stripeCustomerId);
      
      // Find user by stripe_customer_id in customers table
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('stripe_customer_id', stripeCustomerId)
        .single();

      if (customerError) {
        console.error('Error finding customer:', customerError);
        // If customer not found, try to get customer from Stripe and create them
        const stripeCustomer = await stripe.customers.retrieve(stripeCustomerId);
        if (!stripeCustomer.email) {
          throw new Error('No email found for Stripe customer');
        }

        // Get user by email from auth.users
        const { data: { users }, error: usersError } = await supabase.auth.admin
          .listUsers({
            filters: {
              email: stripeCustomer.email
            }
          });

        if (usersError || !users || users.length === 0) {
          throw new Error(`No user found for email: ${stripeCustomer.email}`);
        }

        // Create customer record
        const { data: newCustomer, error: createError } = await supabase
          .from('customers')
          .insert({
            id: users[0].id,
            email: stripeCustomer.email,
            stripe_customer_id: stripeCustomerId
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        console.log('Created new customer record:', newCustomer);
        customerData = newCustomer;
      }

      const userId = customerData.id;
      console.log('Found user ID:', userId);

      // Get price details from the subscription
      const priceId = subscription.items.data[0].price.id;
      console.log('Price ID:', priceId);

      const subscriptionData = {
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        status: subscription.status,
        plan_type: 'student',
        is_student: true,
        stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        trial_end_at: subscription.trial_end 
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
        started_at: new Date(subscription.start_date * 1000).toISOString(),
      };

      console.log('Upserting subscription data:', subscriptionData);

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
