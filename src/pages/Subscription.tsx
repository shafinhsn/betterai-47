
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { ManageSubscription } from '@/components/subscription/ManageSubscription';
import { LoadingSpinner } from '@/components/subscription/LoadingSpinner';
import { SubscriptionHeader } from '@/components/subscription/SubscriptionHeader';
import { useSubscription } from '@/hooks/useSubscription';
import { useProducts } from '@/hooks/useProducts';
import { getFeatures, handleSubscribe, handleManageSubscription } from '@/utils/subscriptionUtils';

export const SubscriptionPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isManagingSubscription = location.pathname === '/manage-subscription';
  const { data: subscription, isLoading: isLoadingSubscription } = useSubscription();
  const { data: products, isLoading: isLoadingProducts, error: productsError } = useProducts();

  if (subscription && !isManagingSubscription && !isLoadingSubscription) {
    navigate('/manage-subscription');
    return null;
  }

  const onSubscribe = async (productId: string, planName: string): Promise<string> => {
    setIsLoading(true);
    setProcessingPlanId(planName);
    try {
      return await handleSubscribe(productId, planName);
    } finally {
      setIsLoading(false);
      setProcessingPlanId(null);
    }
  };

  const onManageSubscription = async () => {
    setIsLoading(true);
    const url = await handleManageSubscription();
    if (url) {
      window.location.href = url;
    }
    setIsLoading(false);
  };

  if (isLoadingProducts || isLoadingSubscription) {
    return <LoadingSpinner />;
  }

  if (productsError) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col gap-4">
        <p className="text-red-500">Failed to load subscription plans</p>
        <Button variant="ghost" onClick={() => navigate('/')}>
          Return to Editor
        </Button>
      </div>
    );
  }

  if (isManagingSubscription) {
    return (
      <ManageSubscription
        subscription={subscription}
        isLoading={isLoading}
        onManageSubscription={onManageSubscription}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto">
        <SubscriptionHeader />
        <div className="space-y-6">
          <SubscriptionCard
            key="student-plan"
            name="Student Plan"
            price={8}
            features={getFeatures()}
            stripeProductId="P-7W301107DK9194909M65W3BA"
            isProcessing={processingPlanId === "Student Plan"}
            onSubscribe={onSubscribe}
          />
        </div>
        <div className="mt-8 text-center">
          <Button variant="ghost" onClick={() => navigate('/')}>
            Return to Editor
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
