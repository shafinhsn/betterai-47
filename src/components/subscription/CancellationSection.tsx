
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/database.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface CancellationSectionProps {
  subscription: Tables<'subscriptions'>;
}

export const CancellationSection = ({ subscription }: CancellationSectionProps) => {
  const [isCancelling, setIsCancelling] = useState(false);

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

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMMM d, yyyy');
  };

  return (
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
  );
};
