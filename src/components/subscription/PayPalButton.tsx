
import { useRef, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { usePayPalScript } from '@/hooks/usePayPalScript';
import { PayPalLoading } from './PayPalLoading';
import { useNavigate } from 'react-router-dom';
import { CookieAlert } from './CookieAlert';

interface PayPalButtonProps {
  onSubscribe: (productId: string, planName: string) => Promise<string>;
  stripeProductId: string;
  planName: string;
  isProcessing: boolean;
}

interface PayPalButtonStyle {
  layout: 'vertical';
  color: 'blue';
  shape: 'rect';
  label: 'subscribe';
}

interface CreateSubscriptionActions {
  subscription: {
    create: (data: {
      plan_id: string;
      custom_id?: string;
      application_context?: {
        shipping_preference?: string;
      };
    }) => Promise<string>;
  };
}

interface OnApproveData {
  orderID: string;
  subscriptionID: string;
}

interface OnApproveActions {
  redirect: () => void;
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
  const [cookiesBlocked, setCookiesBlocked] = useState(false);

  const { isLoading, scriptLoaded } = usePayPalScript({
    clientId: 'Adj5TaOdSl2VqQgMJNt-en40d2bpOokFgrRqHsVeda7hIOMnNZXgN30newF-Mx8yc-utVNfbyprNNoXe',
    onError: (error) => {
      console.error('PayPal script error:', error);
      if (error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        setCookiesBlocked(true);
      } else {
        toast.error('Failed to load PayPal: ' + error.message);
      }
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

        const buttonConfig = {
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'subscribe'
          } as PayPalButtonStyle,
          createSubscription: async (_: unknown, actions: CreateSubscriptionActions) => {
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
              return subscriptionId;
            } catch (error: any) {
              console.error('Subscription creation error:', error);
              toast.error('Failed to create subscription: ' + (error.message || 'Unknown error'));
              throw error;
            }
          },
          onApprove: async (data: OnApproveData, actions: OnApproveActions) => {
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
          }
        };

        if (isMounted) {
          // Create the PayPal button instance
          buttonInstanceRef.current = window.paypal.Buttons(buttonConfig);
          
          // Check if the button can be rendered
          if (buttonInstanceRef.current.isEligible()) {
            await buttonInstanceRef.current.render(paypalButtonRef.current);
            console.log('PayPal button rendered successfully');
          } else {
            console.error('PayPal button is not eligible for rendering');
            toast.error('PayPal payment method is not available');
          }
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

  const handleOpenCookieSettings = () => {
    window.open('chrome://settings/cookies');
  };

  return (
    <div className="w-full">
      {cookiesBlocked ? (
        <CookieAlert onOpenSettings={handleOpenCookieSettings} />
      ) : (
        <div ref={paypalButtonRef} className="min-h-[150px]">
          {(isProcessing || isLoading) && <PayPalLoading />}
        </div>
      )}
    </div>
  );
};

