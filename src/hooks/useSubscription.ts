
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
        
        console.log('Checking subscription for user:', user.id);
        
        // First, let's check if we can find the customer in our customers table
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (customerError) {
          console.error('Error fetching customer:', customerError);
        } else {
          console.log('Found customer:', customer);
        }

        // Get active/trialing subscriptions
        const { data: activeSubs, error: activeSubsError } = await supabase
          .from('subscriptions')
          .select('*, stripe_products(name, price)')
          .eq('user_id', user.id)
          .in('status', ['active', 'trialing'])
          .order('created_at', { ascending: false });
        
        if (activeSubsError) {
          console.error('Error fetching active subscriptions:', activeSubsError);
          toast.error('Failed to fetch subscription status');
          return null;
        }

        console.log('Active subscriptions response:', activeSubs);
        
        // If we have any active subscriptions, return the most recent one
        if (activeSubs && activeSubs.length > 0) {
          console.log('Found active subscription:', activeSubs[0]);
          return activeSubs[0];
        }

        // If no active subscription was found, let's check all subscriptions for debugging
        const { data: allSubs, error: allSubsError } = await supabase
          .from('subscriptions')
          .select('*, stripe_products(name, price)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (allSubsError) {
          console.error('Error fetching all subscriptions:', allSubsError);
          return null;
        }

        console.log('All subscriptions for user:', allSubs);
        
        if (!allSubs || allSubs.length === 0) {
          console.log('No subscriptions found for user');
          return null;
        }

        // Log the status of the most recent subscription
        console.log('Most recent subscription status:', allSubs[0].status);
        
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
