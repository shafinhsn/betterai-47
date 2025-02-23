
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
    const initializePayPalButton = async () => {
      if (!window.paypal || !paypalButtonRef.current) {
        console.log('PayPal not ready or button container not found');
        return;
      }

      try {
        console.log('Initializing PayPal button');
        // Clean up previous instance if it exists
        if (buttonInstanceRef.current) {
          console.log('Cleaning up previous button instance');
          try {
            await buttonInstanceRef.current.close();
          } catch (err) {
            console.error('Error closing previous button:', err);
          }
        }

        buttonInstanceRef.current = window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'blue',
            layout: 'vertical',
            label: 'subscribe'
          },
          createSubscription: async (data: any, actions: any) => {
            console.log('Creating subscription with data:', data);
            try {
              const subscriptionId = await onSubscribe('P-7W301107DK9194909M65W3BA', planName);
              console.log('Subscription created:', subscriptionId);
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
            console.log('Subscription cancelled by user');
            toast.info('Subscription cancelled');
          }
        });

        await buttonInstanceRef.current.render(paypalButtonRef.current);
        console.log('PayPal button rendered successfully');
      } catch (error: any) {
        console.error('Error rendering PayPal button:', error);
        toast.error('Failed to initialize PayPal button: ' + error.message);
      }
    };

    if (window.paypal && !isLoading) {
      initializePayPalButton();
    }

    return () => {
      if (buttonInstanceRef.current) {
        try {
          buttonInstanceRef.current.close();
        } catch (err) {
          console.error('Error during button cleanup:', err);
        }
      }
    };
  }, [window.paypal, isLoading, onSubscribe, planName, navigate]);

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
