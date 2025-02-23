
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
  const [loadError, setLoadError] = useState<string | null>(null);

  const { isLoading, scriptLoaded } = usePayPalScript({
    clientId: 'Adj5TaOdSl2VqQgMJNt-en40d2bpOokFgrRqHsVeda7hIOMnNZXgN30newF-Mx8yc-utVNfbyprNNoXe',
    onError: (error) => {
      console.error('PayPal script error:', error);
      if (error.message?.includes('blocked') || error.message?.includes('cookie')) {
        console.log('Cookies are blocked - showing alert');
        setCookiesBlocked(true);
      } else {
        setLoadError(error.message);
        toast.error('Failed to load PayPal: ' + error.message);
      }
    }
  });

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const renderButton = async () => {
      if (!window.paypal?.Buttons || !paypalButtonRef.current || !scriptLoaded || !isMounted) {
        return;
      }

      try {
        if (buttonInstanceRef.current?.close) {
          buttonInstanceRef.current.close();
        }

        const buttonConfig = {
          fundingSource: window.paypal.FUNDING.PAYPAL,
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'subscribe'
          } as PayPalButtonStyle,
          createSubscription: async () => {
            try {
              console.log('Creating subscription with:', {
                productId: stripeProductId,
                planName: planName
              });
              
              setLoadError(null);
              const subscriptionId = await onSubscribe(stripeProductId, planName);
              
              if (!subscriptionId) {
                throw new Error('Failed to create subscription');
              }
              
              console.log('Created subscription:', subscriptionId);
              return subscriptionId;
            } catch (error: any) {
              console.error('Subscription creation error:', error);
              const errorMessage = error.message || 'Unknown error';
              setLoadError('Failed to create subscription: ' + errorMessage);
              toast.error('Failed to create subscription: ' + errorMessage);
              throw error;
            }
          },
          onApprove: (data: any) => {
            console.log('Subscription approved:', data);
            toast.success('Your subscription has been created successfully!');
            navigate('/manage-subscription');
          },
          onError: (err: Error) => {
            console.error('PayPal error:', err);
            if (err.message?.includes('blocked') || err.message?.includes('cookie')) {
              console.log('Cookies are blocked during button interaction - showing alert');
              setCookiesBlocked(true);
              return;
            }

            if (retryCount < MAX_RETRIES) {
              retryCount++;
              console.log(`Retrying PayPal button render (attempt ${retryCount})`);
              setTimeout(renderButton, 1000 * retryCount);
              return;
            }

            setLoadError(err.message || 'PayPal encountered an error');
            toast.error('PayPal encountered an error: ' + err.message);
          },
          onCancel: () => {
            console.log('Subscription was cancelled by user');
            toast.error('Subscription was cancelled');
          }
        };

        if (isMounted) {
          buttonInstanceRef.current = window.paypal.Buttons(buttonConfig);
          
          if (buttonInstanceRef.current.isEligible()) {
            await buttonInstanceRef.current.render(paypalButtonRef.current);
            console.log('PayPal button rendered successfully');
            retryCount = 0; // Reset retry count on successful render
          } else {
            console.error('PayPal button is not eligible for rendering');
            setLoadError('PayPal payment method is not available');
            toast.error('PayPal payment method is not available');
          }
        }
      } catch (error) {
        console.error('Error rendering PayPal button:', error);
        if (error instanceof Error) {
          if (error.message?.includes('blocked') || error.message?.includes('cookie')) {
            console.log('Cookies are blocked during render - showing alert');
            setCookiesBlocked(true);
          } else if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Retrying PayPal button render (attempt ${retryCount})`);
            setTimeout(renderButton, 1000 * retryCount);
          } else {
            setLoadError(error.message);
            toast.error('Failed to render PayPal button: ' + error.message);
          }
        }
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
    if (navigator.userAgent.includes('Chrome')) {
      window.open('chrome://settings/cookies');
    } else if (navigator.userAgent.includes('Firefox')) {
      window.open('about:preferences#privacy');
    } else {
      window.open('about:settings');
    }
  };

  return (
    <div className="w-full">
      {cookiesBlocked ? (
        <CookieAlert onOpenSettings={handleOpenCookieSettings} />
      ) : loadError ? (
        <div className="text-red-500 text-sm p-4 border border-red-200 rounded-md bg-red-50">
          Error: {loadError}. Please try refreshing the page or check your connection.
        </div>
      ) : (
        <div ref={paypalButtonRef} className="min-h-[150px] relative">
          {(isProcessing || isLoading) && <PayPalLoading />}
        </div>
      )}
    </div>
  );
};
