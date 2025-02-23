
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Stripe } from 'https://esm.sh/stripe@13.3.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    console.log('Received webhook event');

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
        // Get customer data from Stripe with expanded metadata
        const stripeCustomer = await stripe.customers.retrieve(stripeCustomerId, {
          expand: ['metadata']
        });
        
        if (!stripeCustomer || typeof stripeCustomer !== 'object' || !('email' in stripeCustomer)) {
          throw new Error(`Invalid or deleted customer: ${stripeCustomerId}`);
        }

        const customerEmail = stripeCustomer.email;
        if (!customerEmail) {
          throw new Error(`No email found for customer: ${stripeCustomerId}`);
        }

        console.log('Found customer email:', customerEmail);

        // Get the user from Supabase Auth
        const { data: users, error: usersError } = await supabaseClient.auth.admin
          .listUsers();

        if (usersError) {
          throw new Error(`Error fetching users: ${usersError.message}`);
        }

        const user = users.users.find(u => u.email === customerEmail);
        if (!user) {
          throw new Error(`No user found with email: ${customerEmail}`);
        }

        const userId = user.id;
        console.log('Found matching user ID:', userId);

        // Upsert the customer record
        const { error: customerError } = await supabaseClient
          .from('customers')
          .upsert({
            id: userId,
            email: customerEmail,
            stripe_customer_id: stripeCustomerId,
            updated_at: new Date().toISOString()
          });

        if (customerError) {
          console.error('Error upserting customer:', customerError);
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
          console.error('Error upserting subscription:', subscriptionError);
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
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ 
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});
