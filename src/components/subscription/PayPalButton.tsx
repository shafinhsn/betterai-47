
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
  const buttonRenderedRef = useRef(false);

  const { isLoading, error, scriptLoaded } = usePayPalScript({
    clientId: 'Adj5TaOdSl2VqQgMJNt-en40d2bpOokFgrRqHsVeda7hIOMnNZXgN30newF-Mx8yc-utVNfbyprNNoXe',
    onError: (error) => {
      console.error('PayPal script error:', error);
      toast.error('Failed to load PayPal: ' + error.message);
    }
  });

  useEffect(() => {
    const initializePayPalButton = async () => {
      if (!window.paypal?.Buttons || !paypalButtonRef.current || isLoading || !scriptLoaded || buttonRenderedRef.current) {
        console.log('PayPal not ready:', { 
          hasPayPal: !!window.paypal?.Buttons, 
          hasButtonRef: !!paypalButtonRef.current, 
          isLoading,
          scriptLoaded,
          buttonRendered: buttonRenderedRef.current
        });
        return;
      }

      try {
        console.log('Initializing PayPal button...');
        if (buttonInstanceRef.current) {
          console.log('Cleaning up existing button...');
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
            console.log('Creating subscription...', { stripeProductId, planName });
            try {
              const subscriptionId = await onSubscribe(stripeProductId, planName);
              console.log('Subscription created:', subscriptionId);
              return subscriptionId;
            } catch (error: any) {
              console.error('Subscription creation error:', error);
              toast.error('Failed to create subscription: ' + error.message);
              throw error;
            }
          },
          onApprove: (data: { subscriptionID: string }) => {
            console.log('Subscription approved:', data);
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

        console.log('Rendering PayPal button...');
        await buttonInstanceRef.current.render(paypalButtonRef.current);
        buttonRenderedRef.current = true;
        console.log('PayPal button rendered successfully');
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
      buttonRenderedRef.current = false;
    };
  }, [window.paypal, isLoading, scriptLoaded, onSubscribe, planName, navigate, stripeProductId]);

  return (
    <div>
      <div ref={paypalButtonRef} className="w-full min-h-[150px] bg-white rounded-md">
        {(isProcessing || isLoading) && <PayPalLoading />}
      </div>
      {error && (
        <div className="text-red-500 text-center text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  );
};
