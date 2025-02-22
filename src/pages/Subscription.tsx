import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { STUDENT_TRIAL_DAYS } from '@/constants/subscription';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { ManageSubscription } from '@/components/subscription/ManageSubscription';

export const SubscriptionPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isManagingSubscription = location.pathname === '/manage-subscription';

  const { data: subscription } = useQuery({
    queryKey: ['active-subscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();
      
      return data;
    },
    enabled: isManagingSubscription
  });

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['stripe-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stripe_products')
        .select('*')
        .eq('active', true);
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5
  });

  const handleSubscribe = async (productId: string, planName: string) => {
    try {
      setIsLoading(true);
      setProcessingPlanId(planName);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to subscribe');
        navigate('/auth');
        return;
      }

      const { data: { url }, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planType: planName === 'Student Plan' ? 'student' : 'business',
          productId: productId,
          email: user.email,
          userId: user.id
        }
      });

      if (error) throw error;
      if (!url) throw new Error('No checkout URL returned');

      window.location.href = url;
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error('Failed to start checkout: ' + (error.message || 'Unknown error occurred'));
    } finally {
      setIsLoading(false);
      setProcessingPlanId(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      const { data: { url }, error } = await supabase.functions.invoke('create-portal-session', {});
      if (error) throw error;
      if (!url) throw new Error('No portal URL returned');
      window.location.href = url;
    } catch (error: any) {
      console.error('Portal session error:', error);
      toast.error('Failed to open subscription portal: ' + (error.message || 'Unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const getFeatures = (planType: string) => {
    return [
      'Unlimited messages',
      `${STUDENT_TRIAL_DAYS}-day free trial`,
      'Advanced document editing',
      'Citation generation',
      'Academic formatting (APA, MLA)',
      'Essay structure improvements',
      'Smart formatting',
      'Email support',
      '150 messages per day'
    ];
  };

  if (isLoadingProducts) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (isManagingSubscription) {
    return (
      <ManageSubscription
        subscription={subscription}
        isLoading={isLoading}
        onManageSubscription={handleManageSubscription}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-muted-foreground">
            Start with a {STUDENT_TRIAL_DAYS}-day free trial. No credit card required.
          </p>
        </div>

        <div className="space-y-6">
          {products?.filter(product => product.name === 'Student Plan').map((product) => (
            <SubscriptionCard
              key={product.id}
              name={product.name}
              price={product.price}
              features={getFeatures(product.name)}
              stripeProductId={product.stripe_product_id}
              isProcessing={processingPlanId === product.name}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
          >
            Return to Editor
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
