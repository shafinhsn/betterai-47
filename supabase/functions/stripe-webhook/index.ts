
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No signature found");
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }

    const body = await req.text();
    console.log('Received webhook body:', body);

    let event;
    try {
      event = await stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Error verifying webhook signature:', err);
      return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Processing checkout session:', session);

        const subscriptionId = session.subscription as string;
        if (!subscriptionId) {
          throw new Error('No subscription ID found in session');
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const customerId = session.customer as string;
        const customer = await stripe.customers.retrieve(customerId);

        if (!customer.email) {
          throw new Error('No email found for customer');
        }

        // Get the user from Supabase using their email
        const { data: { users }, error: userError } = await supabase.auth.admin
          .listUsers({
            filters: {
              email: customer.email
            }
          });

        if (userError || !users || users.length === 0) {
          throw new Error(`No user found for email: ${customer.email}`);
        }

        const userId = users[0].id;
        const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;
        const periodEnd = new Date(subscription.current_period_end * 1000);

        // Update subscription in database
        const { error: updateError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            status: subscription.status,
            plan_type: 'student',
            trial_end_at: trialEnd?.toISOString(),
            stripe_current_period_end: periodEnd.toISOString(),
            stripe_subscription_id: subscriptionId,
            stripe_price_id: subscription.items.data[0].price.id,
            started_at: new Date().toISOString(),
            is_student: true
          });

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          throw updateError;
        }

        console.log('Successfully updated subscription for user:', userId);
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Processing subscription update:', subscription);

        const customer = await stripe.customers.retrieve(subscription.customer as string);
        if (!customer.email) {
          throw new Error('No email found for customer');
        }

        const { data: { users }, error: userError } = await supabase.auth.admin
          .listUsers({
            filters: {
              email: customer.email
            }
          });

        if (userError || !users || users.length === 0) {
          throw new Error(`No user found for email: ${customer.email}`);
        }

        const userId = users[0].id;
        const periodEnd = new Date(subscription.current_period_end * 1000);
        const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;

        const { error: updateError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            status: subscription.status,
            plan_type: 'student',
            trial_end_at: trialEnd?.toISOString(),
            stripe_current_period_end: periodEnd.toISOString(),
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0].price.id,
            is_student: true
          });

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          throw updateError;
        }

        console.log('Successfully updated subscription status for user:', userId);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error('Error processing webhook:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
