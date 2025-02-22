
import { useState } from 'react';
import { STUDENT_TRIAL_DAYS } from '@/constants/subscription';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { GraduationCap, Briefcase, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { SubscriptionDialogProps } from '@/types/chat';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const SubscriptionDialog = ({ open, onOpenChange }: SubscriptionDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleClose = () => {
    setIsLoading(false);
    setProcessingPlanId(null);
    queryClient.removeQueries({ queryKey: ['stripe-products'] });
    onOpenChange(false);
  };

  const { data: products } = useQuery({
    queryKey: ['stripe-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stripe_products')
        .select('*')
        .eq('active', true);
      
      if (error) throw error;
      return data;
    },
    enabled: open,
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
      handleClose();
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

  if (!products && open) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading Plans...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Choose Your Plan</DialogTitle>
          <DialogDescription>
            Select the plan that best fits your needs. Student plan includes a {STUDENT_TRIAL_DAYS}-day free trial.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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

        <DialogClose asChild>
          <Button
            variant="ghost"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
