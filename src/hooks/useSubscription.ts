
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
      
      // First, check for any subscriptions in the database
      const allSubs = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id);
        
      console.log('All subscriptions found:', allSubs);
      
      // Then get only active/trialing ones
      const activeSubs = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .order('created_at', { ascending: false });
      
      console.log('Active/trialing subscriptions:', activeSubs);

      if (activeSubs.error) {
        console.error('Error fetching active subscriptions:', activeSubs.error);
        throw activeSubs.error;
      }
      
      // If we have any active subscriptions, return the most recent one
      if (activeSubs.data && activeSubs.data.length > 0) {
        console.log('Returning most recent active subscription:', activeSubs.data[0]);
        return activeSubs.data[0];
      }
      
      console.log('No active subscription found');
      return null;
    },
    refetchInterval: 5000, // Refetch every 5 seconds while the component is mounted
  });
};
