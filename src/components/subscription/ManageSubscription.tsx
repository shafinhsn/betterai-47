
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/database.types';
import { SubscriptionSkeleton } from './SubscriptionSkeleton';
import { NoSubscription } from './NoSubscription';
import { SubscriptionDetails } from './SubscriptionDetails';
import { SubscriptionSettings } from './SubscriptionSettings';
import { CancellationSection } from './CancellationSection';

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

  if (isLoading) {
    return <SubscriptionSkeleton />;
  }

  if (!subscription) {
    return <NoSubscription />;
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
          <SubscriptionDetails 
            subscription={subscription}
            isLoading={isLoading}
            onManageSubscription={onManageSubscription}
          />
          <SubscriptionSettings subscription={subscription} />
          <CancellationSection subscription={subscription} />
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
