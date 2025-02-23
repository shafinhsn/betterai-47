
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
  const { isLoading, error } = usePayPalScript({
    clientId: 'Adj5TaOdSl2VqQgMJNt-en40d2bpOokFgrRqHsVeda7hIOMnNZXgN30newF-Mx8yc-utVNfbyprNNoXe',
    onError: (error) => {
      console.error('PayPal script error:', error);
      toast.error('Failed to load PayPal: ' + error.message);
    }
  });

  useEffect(() => {
    if (window.paypal && paypalButtonRef.current) {
      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'black',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: async () => {
          try {
            const subscriptionId = await onSubscribe('P-7W301107DK9194909M65W3BA', planName);
            return subscriptionId;
          } catch (error: any) {
            console.error('Subscription creation error:', error);
            toast.error('Failed to create subscription: ' + (error.message || 'Please try again'));
            throw error;
          }
        },
        onApprove: (data: { subscriptionID: string }) => {
          console.log('Subscription approved:', data.subscriptionID);
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
      }).render(paypalButtonRef.current);
    }
  }, [window.paypal, paypalButtonRef.current]);

  return (
    <div ref={paypalButtonRef} id="paypal-button-container-P-7W301107DK9194909M65W3BA" className="w-full">
      {(isProcessing || isLoading) && <PayPalLoading />}
      {error && (
        <div className="text-red-500 text-center text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  );
};

declare global {
  interface Window {
    paypal?: any;
  }
}
