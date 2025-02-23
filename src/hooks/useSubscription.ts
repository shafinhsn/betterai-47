
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSubscription = () => {
  return useQuery({
    queryKey: ['active-subscription'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No user found');
          return null;
        }
        
        console.log('Fetching subscription for user:', user.id);
        
        // Get active/trialing subscriptions
        const { data: activeSubs, error: activeSubsError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['active', 'trialing'])
          .order('created_at', { ascending: false });
        
        if (activeSubsError) {
          console.error('Error fetching active subscriptions:', activeSubsError);
          toast.error('Failed to fetch subscription status');
          return null;
        }

        console.log('Active subscriptions response:', { activeSubs });
        
        // If we have any active subscriptions, return the most recent one
        if (activeSubs && activeSubs.length > 0) {
          console.log('Found active subscription:', activeSubs[0]);
          return activeSubs[0];
        }

        // If no active subscription was found, let's check all subscriptions for debugging
        const { data: allSubs, error: allSubsError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (allSubsError) {
          console.error('Error fetching all subscriptions:', allSubsError);
          return null;
        }

        console.log('All subscriptions:', allSubs);
        console.log('No active subscription found');
        return null;
      } catch (error) {
        console.error('Error in useSubscription hook:', error);
        toast.error('Failed to check subscription status');
        return null;
      }
    },
    refetchInterval: 5000, // Refetch every 5 seconds while the component is mounted
  });
};
