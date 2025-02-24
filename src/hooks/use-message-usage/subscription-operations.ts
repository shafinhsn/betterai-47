
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/database.types';

export const fetchSubscription = async (): Promise<Tables<'subscriptions'> | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return subscription;
};

export const getAdminSubscription = (): Tables<'subscriptions'> => {
  return {
    id: 'admin',
    user_id: 'admin',
    plan_type: 'Business Pro',
    status: 'active',
    current_period_end: new Date().toISOString(),
    cancel_at_period_end: false,
    created_at: new Date().toISOString(),
    stripe_customer_id: 'admin',
    stripe_subscription_id: 'admin',
    trial_end: null,
    paypal_subscription_id: null,
    payment_type: 'stripe'
  };
};
