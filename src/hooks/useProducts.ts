
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProducts = () => {
  return useQuery({
    queryKey: ['payment-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_products')
        .select('*')
        .eq('active', true)
        .ilike('name', '%student%');
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      console.log('Fetched products:', data);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5
  });
};
