
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { STUDENT_TRIAL_DAYS } from '@/constants/subscription';
import { Button } from '@/components/ui/button';
import { GraduationCap, Briefcase, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

export const SubscriptionPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // If we're on /manage-subscription, fetch current subscription details
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
    if (planType === 'Student Plan') {
      return [
        'Unlimited messages',
        `${STUDENT_TRIAL_DAYS}-day free trial`,
        'Advanced document editing',
        'Citation generation',
        'Academic formatting (APA, MLA)',
        'Essay structure improvements',
        'Plagiarism checker',
        'Smart formatting',
        'Email support',
        '150 messages per day'
      ];
    }
    return [
      'Everything in Student Plan',
      'Industry-specific editing',
      'Legal document support',
      'Medical content refinement',
      'Corporate language optimization',
      'Priority support',
      'Advanced document analysis',
      'Custom document templates',
      'Team collaboration features',
      'API access',
      '500 messages per day'
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Manage Your Subscription</h1>
            <p className="text-muted-foreground">
              View and manage your current subscription settings
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 mb-6">
            {subscription ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{subscription.plan_type}</h3>
                    <p className="text-sm text-muted-foreground">
                      Status: {subscription.status}
                    </p>
                  </div>
                  <Button onClick={handleManageSubscription} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Manage Plan'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">You don't have an active subscription</p>
                <Button onClick={() => navigate('/subscription')}>View Plans</Button>
              </div>
            )}
          </div>

          <div className="text-center">
            <Button variant="ghost" onClick={() => navigate('/')}>
              Return to Editor
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-muted-foreground">
            Select the plan that best fits your needs. Student plan includes a {STUDENT_TRIAL_DAYS}-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products?.map((product) => {
            const isPlanProcessing = processingPlanId === product.name;
            
            return (
              <div 
                key={product.id} 
                className="border rounded-lg p-6 flex flex-col hover:border-emerald-500 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  {product.name === 'Student Plan' ? (
                    <GraduationCap className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Briefcase className="h-5 w-5 text-emerald-500" />
                  )}
                  <h3 className="font-bold text-lg">{product.name}</h3>
                </div>
                <p className="text-3xl font-bold my-4">${product.price}<span className="text-sm font-normal">/mo</span></p>
                <ul className="text-sm space-y-3 flex-grow mb-6">
                  {getFeatures(product.name).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span> {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe(product.stripe_product_id, product.name)}
                  disabled={isLoading}
                  variant={product.name === 'Student Plan' ? 'default' : 'outline'}
                >
                  {isPlanProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    product.name === 'Student Plan' ? 'Start Free Trial' : 'Subscribe Now'
                  )}
                </Button>
              </div>
            )}
          )}
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

