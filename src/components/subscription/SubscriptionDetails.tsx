
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/database.types';
import { format } from 'date-fns';

interface SubscriptionDetailsProps {
  subscription: Tables<'subscriptions'>;
  isLoading: boolean;
  onManageSubscription: () => Promise<void>;
}

export const SubscriptionDetails = ({ 
  subscription, 
  isLoading, 
  onManageSubscription 
}: SubscriptionDetailsProps) => {
  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMMM d, yyyy');
  };

  return (
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
    </div>
  );
};
