
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
  const customerId = subscription.customer as string;
  const status = subscription.status;
  const priceId = subscription.items.data[0].price.id;
  const subscriptionId = subscription.id;
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;

  // Get the customer from our database to get the user_id
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!customer) {
    throw new Error(`No customer found for Stripe customer ID: ${customerId}`);
  }

  // Update or insert the subscription
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: customer.id,
      status,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId,
      stripe_current_period_end: currentPeriodEnd,
      trial_end_at: trialEnd,
      plan_type: 'student' // You might want to make this dynamic based on the price
    });

  if (error) {
    throw error;
  }
};
