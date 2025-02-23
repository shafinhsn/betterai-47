
import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Tables } from '@/integrations/supabase/database.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionSettingsProps {
  subscription: Tables<'subscriptions'>;
}

export const SubscriptionSettings = ({ subscription }: SubscriptionSettingsProps) => {
  const [isUpdatingAutoRenew, setIsUpdatingAutoRenew] = useState(false);

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

  return (
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
  );
};
