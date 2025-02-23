
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
  const buttonInstanceRef = useRef<any>(null);
  const navigate = useNavigate();

  const { isLoading, error } = usePayPalScript({
    clientId: 'Adj5TaOdSl2VqQgMJNt-en40d2bpOokFgrRqHsVeda7hIOMnNZXgN30newF-Mx8yc-utVNfbyprNNoXe',
    onError: (error) => {
      console.error('PayPal script error:', error);
      toast.error('Failed to load PayPal: ' + error.message);
    }
  });

  useEffect(() => {
    if (!window.paypal || !paypalButtonRef.current || isLoading) {
      return;
    }

    const initializePayPalButton = async () => {
      try {
        if (buttonInstanceRef.current) {
          await buttonInstanceRef.current.close();
        }

        buttonInstanceRef.current = window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'blue',
            layout: 'vertical',
            label: 'subscribe'
          },
          createSubscription: async (data: any, actions: any) => {
            try {
              const subscriptionId = await onSubscribe(stripeProductId, planName);
              return subscriptionId;
            } catch (error: any) {
              toast.error('Failed to create subscription: ' + error.message);
              throw error;
            }
          },
          onApprove: (data: { subscriptionID: string }) => {
            toast.success('Subscription created successfully!');
            navigate('/manage-subscription');
          },
          onError: (err: Error) => {
            console.error('PayPal error:', err);
            toast.error('PayPal encountered an error: ' + err.message);
          },
          onCancel: () => {
            toast.info('Subscription cancelled');
          }
        });

        await buttonInstanceRef.current.render(paypalButtonRef.current);
      } catch (error: any) {
        console.error('Error rendering PayPal button:', error);
        toast.error('Failed to initialize PayPal button: ' + error.message);
      }
    };

    initializePayPalButton();

    return () => {
      if (buttonInstanceRef.current?.close) {
        buttonInstanceRef.current.close();
      }
    };
  }, [window.paypal, isLoading, onSubscribe, planName, navigate, stripeProductId]);

  return (
    <div ref={paypalButtonRef} className="w-full">
      {(isProcessing || isLoading) && <PayPalLoading />}
      {error && (
        <div className="text-red-500 text-center text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  );
};
