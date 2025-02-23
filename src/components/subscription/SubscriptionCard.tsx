
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
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
      <div className="space-y-4">
        <PayPalButton
          onSubscribe={onSubscribe}
          stripeProductId={stripeProductId}
          planName={name}
          isProcessing={isProcessing}
        />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or pay with card</span>
          </div>
        </div>
        <Button
          className="w-full"
          onClick={() => onSubscribe(stripeProductId, name)}
          disabled={isProcessing}
          variant="outline"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Pay with Card
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
