
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

export const stripeWebhook = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

export const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export const handleSubscriptionChange = async (subscription: Stripe.Subscription) => {
  try {
    const customerId = subscription.customer as string;
    const status = subscription.status;
    const priceId = subscription.items.data[0].price.id;
    const subscriptionId = subscription.id;
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;

    console.log('Processing subscription:', {
      customerId,
      status,
      priceId,
      subscriptionId,
      currentPeriodEnd,
      trialEnd
    });

    // Get the customer from Stripe to get their email
    const customer = await stripeWebhook.customers.retrieve(customerId);
    
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

    // Update or insert the subscription
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        status,
        stripe_subscription_id: subscriptionId,
        stripe_price_id: priceId,
        stripe_current_period_end: currentPeriodEnd.toISOString(),
        trial_end_at: trialEnd?.toISOString() || null,
        plan_type: 'student', // You might want to make this dynamic based on the price
        started_at: new Date().toISOString(),
      });

    if (subscriptionError) {
      throw subscriptionError;
    }

    console.log('Successfully updated subscription for user:', userId);
    return true;
  } catch (error) {
    console.error('Error handling subscription:', error);
    throw error;
  }
};
