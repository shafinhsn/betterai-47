
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/database.types';

type SubscriptionWithPrice = Tables<'subscriptions'> & {
  prices?: {
    price: number;
    name: string;
    description: string | null;
  };
};

export const useSubscription = () => {
  return useQuery({
    queryKey: ['active-subscription'],
    queryFn: async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.log('No authenticated user found');
          return null;
        }

        // Get active/trialing subscription with product details
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select(`
            *,
            prices:stripe_products(
              price,
              name,
              description
            )
          `)
          .eq('user_id', user.id)
          .in('status', ['active', 'trialing'])
          .maybeSingle();

        if (subError) {
          console.error('Error fetching subscription:', subError);
          toast.error('Failed to fetch subscription status');
          return null;
        }

        // Check if subscription is ending soon (7 days)
        if (subscription?.stripe_current_period_end) {
          const endDate = new Date(subscription.stripe_current_period_end);
          const now = new Date();
          const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilEnd <= 7 && subscription.status === 'active') {
            toast.warning(`Your subscription will end in ${daysUntilEnd} days`);
          }
        }

        console.log('Fetched subscription:', subscription);
        return subscription as SubscriptionWithPrice;
      } catch (error) {
        console.error('Subscription query error:', error);
        toast.error('Failed to fetch subscription status');
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};
