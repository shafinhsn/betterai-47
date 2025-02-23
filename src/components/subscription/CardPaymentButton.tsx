
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface CardPaymentButtonProps {
  onSubscribe: (productId: string, planName: string) => Promise<string>;
  stripeProductId: string;
  planName: string;
  isProcessing: boolean;
  isPayPalProcessing: boolean;
}

export const CardPaymentButton = ({
  onSubscribe,
  stripeProductId,
  planName,
  isProcessing,
  isPayPalProcessing
}: CardPaymentButtonProps) => {
  const handleCardPayment = async () => {
    try {
      const subscriptionId = await onSubscribe(stripeProductId, planName);
      window.location.href = `https://www.paypal.com/subscription/checkout?subscription_id=${subscriptionId}`;
    } catch (error: any) {
      console.error('Card payment error:', error);
      toast.error('Failed to start card payment: ' + error.message);
    }
  };

  return (
    <>
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
        onClick={handleCardPayment}
        disabled={isProcessing || isPayPalProcessing}
        variant="outline"
      >
        <CreditCard className="w-4 h-4 mr-2" />
        Pay with Card
      </Button>
    </>
  );
};

