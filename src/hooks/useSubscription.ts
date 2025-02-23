
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
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching subscription:', error);
        throw error;
      }
      
      console.log('Fetched subscription:', data);
      return data;
    },
    refetchInterval: 5000, // Refetch every 5 seconds while the component is mounted
    staleTime: 0 // Consider the data stale immediately
  });
};
