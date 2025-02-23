
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSubscription = () => {
  return useQuery({
    queryKey: ['active-subscription'],
    queryFn: async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
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
          .in('status', ['active', 'trialing', 'canceled'])
          .order('created_at', { ascending: false })
          .maybeSingle();
        
        if (activeSubsError) {
          toast.error('Failed to fetch subscription status');
          return null;
        }

        return activeSubs;
      } catch (error) {
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
