
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Tables } from '@/integrations/supabase/database.types';

interface TrialBannerProps {
  subscription: Tables<'subscriptions'>;
}

export const TrialBanner = ({ subscription }: TrialBannerProps) => {
  if (!subscription.trial_end_at) return null;

  const trialEnd = new Date(subscription.trial_end_at);
  const now = new Date();
  const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 3600 * 24));

  if (daysLeft <= 0) return null;

  return (
    <Alert className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {daysLeft <= 3 
          ? `⚠️ Your trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}! Subscribe to continue using the service.`
          : `Your trial period ends in ${daysLeft} days.`}
      </AlertDescription>
    </Alert>
  );
};
