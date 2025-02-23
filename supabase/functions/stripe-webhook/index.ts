
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
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return new Response('No signature', { status: 400 });
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    let event;
    try {
      const timestampStr = signature.split(',')[0].split('=')[1];
      const timestamp = parseInt(timestampStr);
      const currentTime = Math.floor(Date.now() / 1000);

      if (currentTime - timestamp > 300) {
        throw new Error('Webhook too old');
      }

      event = JSON.parse(body);
      console.log('Successfully parsed webhook event:', event.type);
    } catch (err) {
      console.error('Error parsing webhook:', err);
      return new Response(`Webhook error: ${err.message}`, { status: 400 });
    }

    if (event.type.startsWith('customer.subscription')) {
      const subscription = event.data.object;
      console.log('Processing subscription:', subscription.id);
      
      const stripeCustomerId = subscription.customer;
      console.log('Looking up customer:', stripeCustomerId);

      try {
        // First try to find existing customer
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id, email')
          .eq('stripe_customer_id', stripeCustomerId)
          .maybeSingle();

        let userId;
        let customerEmail;

        if (existingCustomer) {
          console.log('Found existing customer:', existingCustomer);
          userId = existingCustomer.id;
          customerEmail = existingCustomer.email;
        } else {
          // If no customer found, get from Stripe and create new record
          console.log('No existing customer found, fetching from Stripe');
          const stripeCustomer = await stripe.customers.retrieve(stripeCustomerId);
          
          if (!stripeCustomer || !stripeCustomer.email) {
            throw new Error('Invalid customer data from Stripe');
          }

          customerEmail = stripeCustomer.email;

          // Get user from auth.users
          const { data: { users }, error: usersError } = await supabase.auth.admin
            .listUsers({
              filters: {
                email: customerEmail
              }
            });

          if (usersError || !users || users.length === 0) {
            throw new Error(`No user found for email: ${customerEmail}`);
          }

          userId = users[0].id;

          // Create new customer record
          const { error: createCustomerError } = await supabase
            .from('customers')
            .insert({
              id: userId,
              email: customerEmail,
              stripe_customer_id: stripeCustomerId,
              created_at: new Date().toISOString()
            });

          if (createCustomerError) {
            throw createCustomerError;
          }

          console.log('Created new customer record for user:', userId);
        }

        // Get price details
        const priceId = subscription.items.data[0].price.id;
        console.log('Price ID:', priceId);

        // Prepare subscription data
        const subscriptionData = {
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_price_id: priceId,
          status: subscription.status,
          plan_type: 'standard', // You might want to determine this based on the price
          stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          trial_end_at: subscription.trial_end 
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
          started_at: new Date(subscription.start_date * 1000).toISOString(),
          expires_at: subscription.cancel_at 
            ? new Date(subscription.cancel_at * 1000).toISOString()
            : null
        };

        console.log('Upserting subscription data:', subscriptionData);

        // Upsert subscription record
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .upsert(subscriptionData, {
            onConflict: 'user_id',
            ignoreDuplicates: false
          });

        if (subscriptionError) {
          throw subscriptionError;
        }

        console.log('Successfully processed subscription update');

      } catch (error) {
        console.error('Error processing subscription:', error);
        throw error;
      }
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
