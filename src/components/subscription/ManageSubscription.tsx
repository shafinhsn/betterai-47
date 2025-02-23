
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/database.types';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { format } from 'date-fns';

interface ManageSubscriptionProps {
  subscription: Tables<'subscriptions'> | null;
  isLoading: boolean;
  onManageSubscription: () => Promise<void>;
}

export const ManageSubscription = ({
  subscription,
  isLoading,
  onManageSubscription
}: ManageSubscriptionProps) => {
  const navigate = useNavigate();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isUpdatingAutoRenew, setIsUpdatingAutoRenew] = useState(false);

  const handleCancelSubscription = async () => {
    try {
      setIsCancelling(true);
      const { error } = await supabase.functions.invoke('cancel-subscription', {});
      
      if (error) throw error;
      
      toast.success('Subscription cancelled successfully');
      // Refresh the page to update subscription status
      window.location.reload();
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription: ' + (error.message || 'Unknown error'));
    } finally {
      setIsCancelling(false);
    }
  };

  const handleAutoRenewToggle = async (enabled: boolean) => {
    try {
      setIsUpdatingAutoRenew(true);
      const { error } = await supabase.functions.invoke('update-subscription-renewal', {
        body: { autoRenew: enabled }
      });
      
      if (error) throw error;
      
      toast.success(`Auto-renewal ${enabled ? 'enabled' : 'disabled'}`);
      // Refresh the page to update subscription status
      window.location.reload();
    } catch (error: any) {
      console.error('Error updating auto-renewal:', error);
      toast.error('Failed to update auto-renewal: ' + (error.message || 'Unknown error'));
    } finally {
      setIsUpdatingAutoRenew(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMMM d, yyyy');
  };

  if (!subscription) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">No Active Subscription</h1>
          <p className="text-muted-foreground mb-6">
            You don't currently have an active subscription.
          </p>
          <Button onClick={() => navigate('/subscription')}>View Plans</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Manage Your Subscription</h1>
          <p className="text-muted-foreground">
            View and manage your current subscription settings
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 mb-6 space-y-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Plan: {subscription.plan_type}</h3>
                <p className="text-sm text-muted-foreground">
                  Status: {subscription.status}
                </p>
              </div>
              <Button onClick={onManageSubscription} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Update Payment Method'
                )}
              </Button>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Subscription Details</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Started</dt>
                  <dd>{formatDate(subscription.started_at)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Current Period Ends</dt>
                  <dd>{formatDate(subscription.stripe_current_period_end)}</dd>
                </div>
                {subscription.trial_end_at && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Trial Ends</dt>
                    <dd>{formatDate(subscription.trial_end_at)}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Subscription Settings</h4>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label htmlFor="auto-renew" className="text-sm font-medium">
                    Auto-renew subscription
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Your subscription will automatically renew at the end of each billing period
                  </p>
                </div>
                <Switch
                  id="auto-renew"
                  checked={subscription.status === 'active'}
                  disabled={isUpdatingAutoRenew}
                  onCheckedChange={handleAutoRenewToggle}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <Button 
                variant="destructive" 
                onClick={handleCancelSubscription}
                disabled={isCancelling || subscription.status !== 'active'}
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Subscription'
                )}
              </Button>
              {subscription.status === 'canceled' && (
                <p className="text-sm text-muted-foreground mt-2">
                  Your subscription will end on {formatDate(subscription.expires_at)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate('/')}>
            Return to Editor
          </Button>
        </div>
      </div>
    </div>
  );
};
