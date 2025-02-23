
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/database.types';

type SubscriptionWithProduct = Tables<'subscriptions'> & {
  product?: {
    name: string;
    price: number;
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
            product:stripe_products(
              name,
              price,
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

        console.log('Fetched subscription:', subscription);
        return subscription as SubscriptionWithProduct;
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
