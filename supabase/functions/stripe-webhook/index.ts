
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Stripe } from 'https://esm.sh/stripe@13.3.0';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseClient = createClient(
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
      throw new Error('No signature provided');
    }

    const body = await req.text();
    console.log('Received webhook event');

    try {
      const event = JSON.parse(body);
      console.log('Successfully parsed webhook event:', event.type);

      if (event.type === 'customer.subscription.created' || 
          event.type === 'customer.subscription.updated') {
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer;
        const priceId = subscription.items.data[0].price.id;

        console.log('Processing subscription:', subscription.id);
        console.log('Looking up customer:', stripeCustomerId);

        try {
          // Get customer data from Stripe
          const stripeCustomer = await stripe.customers.retrieve(stripeCustomerId);
          
          if (!stripeCustomer || stripeCustomer.deleted || !stripeCustomer.email) {
            throw new Error(`Invalid customer data from Stripe for ID: ${stripeCustomerId}`);
          }

          // Get the user from Supabase Auth
          const { data: { users }, error: usersError } = await supabaseClient.auth.admin
            .listUsers({
              filters: {
                email: stripeCustomer.email
              }
            });

          if (usersError || !users || users.length === 0) {
            throw new Error(`No user found for email: ${stripeCustomer.email}`);
          }

          const userId = users[0].id;

          // Upsert the customer record
          const { error: customerError } = await supabaseClient
            .from('customers')
            .upsert({
              id: userId,
              email: stripeCustomer.email,
              stripe_customer_id: stripeCustomerId,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            });

          if (customerError) {
            throw new Error(`Error updating customer: ${customerError.message}`);
          }

          // Get the product details from stripe
          const price = await stripe.prices.retrieve(priceId);
          const product = await stripe.products.retrieve(price.product as string);

          // Prepare subscription data
          const subscriptionData = {
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            status: subscription.status,
            plan_type: (product.metadata.plan_type || 'standard').toLowerCase(),
            stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            trial_end_at: subscription.trial_end 
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
            started_at: new Date(subscription.start_date * 1000).toISOString(),
            expires_at: subscription.cancel_at 
              ? new Date(subscription.cancel_at * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString()
          };

          // Upsert the subscription
          const { error: subscriptionError } = await supabaseClient
            .from('subscriptions')
            .upsert(subscriptionData);

          if (subscriptionError) {
            throw new Error(`Error updating subscription: ${subscriptionError.message}`);
          }

          console.log('Successfully processed subscription for user:', userId);

          return new Response(JSON.stringify({ 
            success: true,
            message: 'Subscription processed successfully' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          });
        } catch (error) {
          console.error('Error processing subscription:', error);
          throw error;
        }
      }

      // Return success for other event types
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });

    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ 
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});
