
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
          toast.error('Authentication error');
          return null;
        }

        if (!user) {
          console.log('No authenticated user found');
          return null;
        }

        console.log('Fetching subscription for user:', user.id);
        
        // First check if we have any subscriptions at all for debugging
        const { data: allSubs, error: allSubsError } = await supabase
          .from('subscriptions')
          .select('*');
          
        if (allSubsError) {
          console.error('Error checking all subscriptions:', allSubsError);
        } else {
          console.log('Total subscriptions in database:', allSubs?.length || 0);
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
          .in('status', ['active', 'trialing', 'canceled'])
          .order('created_at', { ascending: false });
        
        if (activeSubsError) {
          console.error('Error fetching active subscription:', activeSubsError);
          toast.error('Failed to fetch subscription status');
          return null;
        }

        // Log all found subscriptions for debugging
        console.log('Found subscriptions for user:', activeSubs);

        if (!activeSubs || activeSubs.length === 0) {
          console.log('No active subscriptions found for user:', user.id);
          return null;
        }

        // Get the most recent subscription
        const latestSub = activeSubs[0];
        console.log('Latest subscription:', latestSub);

        if (latestSub.status === 'active' || latestSub.status === 'trialing') {
          console.log('Found active/trialing subscription:', latestSub);
          return latestSub;
        }

        if (latestSub.status === 'canceled') {
          console.log('Found canceled subscription:', latestSub);
          return latestSub;
        }

        console.log('No valid subscription found');
        return null;
      } catch (error) {
        console.error('Error in useSubscription hook:', error);
        toast.error('Failed to fetch subscription status');
        return null;
      }
    },
    refetchInterval: 5000, // Refetch every 5 seconds while component is mounted
  });
};
