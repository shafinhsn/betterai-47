
import { PlanFeatures } from './PlanFeatures';
import { PayPalButton } from './PayPalButton';

interface SubscriptionCardProps {
  name: string;
  price: number;
  features: string[];
  stripeProductId: string;
  isProcessing: boolean;
  onSubscribe: (productId: string, planName: string) => Promise<string>;
}

export const SubscriptionCard = ({
  name,
  price,
  features,
  stripeProductId,
  isProcessing,
  onSubscribe
}: SubscriptionCardProps) => {
  return (
    <div className="border rounded-lg p-6 flex flex-col hover:border-emerald-500 transition-colors">
      <PlanFeatures
        name={name}
        price={price}
        features={features}
      />
      <PayPalButton
        onSubscribe={onSubscribe}
        stripeProductId={stripeProductId}
        planName={name}
        isProcessing={isProcessing}
      />
    </div>
  );
};
