
import { useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { usePayPalScript } from '@/hooks/usePayPalScript';
import { PayPalLoading } from './PayPalLoading';
import { useNavigate } from 'react-router-dom';

interface PayPalButtonProps {
  onSubscribe: (productId: string, planName: string) => Promise<string>;
  stripeProductId: string;
  planName: string;
  isProcessing: boolean;
}

export const PayPalButton = ({
  onSubscribe,
  stripeProductId,
  planName,
  isProcessing
}: PayPalButtonProps) => {
  const paypalButtonRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { isLoading, scriptLoaded } = usePayPalScript({
    clientId: 'Adj5TaOdSl2VqQgMJNt-en40d2bpOokFgrRqHsVeda7hIOMnNZXgN30newF-Mx8yc-utVNfbyprNNoXe',
    onError: (error) => {
      console.error('PayPal script error:', error);
      toast.error('Failed to load PayPal: ' + error.message);
    }
  });

  useEffect(() => {
    if (!window.paypal?.Buttons || !paypalButtonRef.current || !scriptLoaded) {
      return;
    }

    const button = window.paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'blue',
        layout: 'vertical',
        label: 'subscribe'
      },
      createSubscription: async () => {
        try {
          const subscriptionId = await onSubscribe(stripeProductId, planName);
          return subscriptionId;
        } catch (error: any) {
          toast.error('Failed to create subscription: ' + error.message);
          throw error;
        }
      },
      onApprove: () => {
        toast.success('Subscription created successfully!');
        navigate('/manage-subscription');
      },
      onError: (err: Error) => {
        console.error('PayPal error:', err);
        toast.error('PayPal encountered an error: ' + err.message);
      }
    });

    button.render(paypalButtonRef.current);

    return () => {
      if (button?.close) {
        button.close();
      }
    };
  }, [scriptLoaded, onSubscribe, stripeProductId, planName, navigate]);

  return (
    <div>
      <div ref={paypalButtonRef} className="w-full min-h-[150px] bg-white rounded-md">
        {(isProcessing || isLoading) && <PayPalLoading />}
      </div>
    </div>
  );
};

