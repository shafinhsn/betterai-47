
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

interface PayPalButtonConfig {
  style: {
    layout: 'vertical';
    color: 'blue';
    shape: 'rect';
    label: 'subscribe';
  };
  createSubscription: () => Promise<string>;
  onApprove: (data: { subscriptionID: string }) => void;
  onError: (err: Error) => void;
  onCancel?: () => void;
}

export const PayPalButton = ({
  onSubscribe,
  stripeProductId,
  planName,
  isProcessing
}: PayPalButtonProps) => {
  const paypalButtonRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const buttonInstanceRef = useRef<any>(null);

  const { isLoading, scriptLoaded } = usePayPalScript({
    clientId: 'Adj5TaOdSl2VqQgMJNt-en40d2bpOokFgrRqHsVeda7hIOMnNZXgN30newF-Mx8yc-utVNfbyprNNoXe',
    onError: (error) => {
      console.error('PayPal script error:', error);
      toast.error('Failed to load PayPal: ' + error.message);
    }
  });

  useEffect(() => {
    let isMounted = true;

    const renderButton = async () => {
      if (!window.paypal?.Buttons || !paypalButtonRef.current || !scriptLoaded || !isMounted) {
        return;
      }

      try {
        // Clean up previous button instance
        if (buttonInstanceRef.current?.close) {
          buttonInstanceRef.current.close();
        }

        // PayPal button configuration
        const buttonConfig: PayPalButtonConfig = {
          createSubscription: async () => {
            try {
              console.log('Creating subscription with:', {
                productId: stripeProductId,
                planName: planName
              });
              const subscriptionId = await onSubscribe(stripeProductId, planName);
              if (!subscriptionId) {
                throw new Error('Failed to create subscription');
              }
              console.log('Created subscription:', subscriptionId);
              return subscriptionId; // Return just the ID string
            } catch (error: any) {
              console.error('Subscription creation error:', error);
              toast.error('Failed to create subscription: ' + (error.message || 'Unknown error'));
              throw error;
            }
          },
          onApprove: (data) => {
            console.log('Subscription approved:', data);
            toast.success('Your subscription has been created successfully!');
            navigate('/manage-subscription');
          },
          onError: (err: Error) => {
            console.error('PayPal error:', err);
            toast.error('PayPal encountered an error: ' + err.message);
          },
          onCancel: () => {
            toast.error('Subscription was cancelled');
          },
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'subscribe'
          }
        };

        if (isMounted) {
          buttonInstanceRef.current = window.paypal.Buttons(buttonConfig);
          await buttonInstanceRef.current.render(paypalButtonRef.current);
          console.log('PayPal button rendered successfully');
        }
      } catch (error) {
        console.error('Error rendering PayPal button:', error);
        toast.error('Failed to render PayPal button');
      }
    };

    if (scriptLoaded && !isLoading) {
      console.log('Attempting to render PayPal button');
      renderButton();
    }

    return () => {
      isMounted = false;
      if (buttonInstanceRef.current?.close) {
        buttonInstanceRef.current.close();
      }
    };
  }, [scriptLoaded, isLoading, onSubscribe, stripeProductId, planName, navigate]);

  return (
    <div className="w-full">
      <div ref={paypalButtonRef} className="min-h-[150px]">
        {(isProcessing || isLoading) && <PayPalLoading />}
      </div>
    </div>
  );
};
