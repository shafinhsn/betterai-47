
import { useState } from 'react';
import { SUBSCRIPTION_PLANS, STUDENT_TRIAL_DAYS } from '@/constants/subscription';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { GraduationCap, Briefcase, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { SubscriptionDialogProps } from '@/types/chat';

export const SubscriptionDialog = ({ open, onOpenChange }: SubscriptionDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (plan: any) => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: { url }, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planType: plan.name === 'Student Plan' ? 'student' : 'business',
          email: user.email,
          userId: user.id
        }
      });

      if (error) throw error;
      if (!url) throw new Error('No checkout URL returned');

      window.location.href = url;
    } catch (error: any) {
      toast.error('Failed to start checkout: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Choose Your Plan</DialogTitle>
          <DialogDescription>
            Select the plan that best fits your needs. Student plan includes a {STUDENT_TRIAL_DAYS}-day free trial.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div 
              key={plan.name} 
              className="border rounded-lg p-6 flex flex-col hover:border-emerald-500 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                {plan.name === 'Student Plan' ? (
                  <GraduationCap className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Briefcase className="h-5 w-5 text-emerald-500" />
                )}
                <h3 className="font-bold text-lg">{plan.name}</h3>
              </div>
              <p className="text-3xl font-bold my-4">${plan.price}<span className="text-sm font-normal">/mo</span></p>
              <ul className="text-sm space-y-3 flex-grow mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                onClick={() => handleSubscribe(plan)}
                disabled={isLoading}
                variant={plan.name === 'Student Plan' ? 'default' : 'outline'}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  plan.name === 'Student Plan' ? 'Start Free Trial' : 'Subscribe Now'
                )}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
