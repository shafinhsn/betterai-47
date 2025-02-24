
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
    stripe_current_period_end: new Date().toISOString(),
    payment_processor: 'paypal',
    payment_subscription_id: 'admin',
    payment_price_id: 'admin',
    trial_end_at: null,
    started_at: new Date().toISOString(),
    expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_student: false
  };
};

