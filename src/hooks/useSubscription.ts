
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSubscription = () => {
  return useQuery({
    queryKey: ['active-subscription'],
    queryFn: async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting user:', userError);
          return null;
        }

        if (!user) {
          console.log('No authenticated user found');
          return null;
        }
        
        // Get active/trialing subscriptions with product details
        const { data: activeSubs, error: activeSubsError } = await supabase
          .from('subscriptions')
          .select(`
            *,
            product:stripe_products(
              name,
              price,
              description
            )
          `)
          .eq('user_id', user.id)
          .in('status', ['active', 'trialing'])
          .order('created_at', { ascending: false })
          .single(); // Get only the most recent subscription
        
        if (activeSubsError) {
          console.error('Error fetching active subscription:', activeSubsError);
          toast.error('Failed to fetch subscription status');
          return null;
        }

        if (activeSubs) {
          console.log('Found active subscription:', activeSubs);
          return activeSubs;
        }

        console.log('No active subscription found for user:', user.id);
        return null;
      } catch (error) {
        console.error('Error in useSubscription hook:', error);
        toast.error('Failed to check subscription status');
        return null;
      }
    },
    refetchInterval: 5000, // Refetch every 5 seconds while component is mounted
  });
};
