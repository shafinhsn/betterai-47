
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSubscription = () => {
  return useQuery({
    queryKey: ['active-subscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        return null;
      }
      
      console.log('Fetching subscription for user:', user.id);
      
      // First, let's log all subscriptions for this user to debug
      const allSubscriptions = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id);
      
      console.log('All subscriptions for user:', allSubscriptions.data);
      
      // Then get the active/trialing subscription
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .order('created_at', { ascending: false })
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching subscription:', error);
        throw error;
      }
      
      console.log('Fetched active/trialing subscription:', data);
      return data;
    },
    refetchInterval: 5000, // Refetch every 5 seconds while the component is mounted
  });
};

