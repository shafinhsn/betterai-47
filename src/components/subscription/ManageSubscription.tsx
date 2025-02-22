
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/database.types';

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
                <Button onClick={onManageSubscription} disabled={isLoading}>
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
};
