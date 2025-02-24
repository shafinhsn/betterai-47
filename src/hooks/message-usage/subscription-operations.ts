
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/database.types';

export const fetchSubscription = async () => {
  const { data: sub, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw error;
  return sub;
};

export const getAdminSubscription = () => ({
  plan_type: 'Business Pro',
  status: 'active'
} as Tables<'subscriptions'>);
