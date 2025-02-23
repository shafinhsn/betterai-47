
import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const paypalButtonRef = useRef<HTMLDivElement>(null);
  const paypalScriptId = 'paypal-sdk';
  const [scriptError, setScriptError] = useState<string | null>(null);

  const cleanupPayPalScript = () => {
    try {
      const existingScript = document.getElementById(paypalScriptId);
      if (existingScript) {
        existingScript.remove();
      }

      if (paypalButtonRef.current) {
        paypalButtonRef.current.innerHTML = '';
      }

      if (window.paypal?.Buttons?.instances) {
        window.paypal.Buttons.instances.forEach((instance: any) => {
          try {
            if (instance.close) {
              instance.close();
            }
          } catch (err) {
            console.error('Error closing PayPal button instance:', err);
          }
        });
      }
    } catch (err) {
      console.error('Error during PayPal cleanup:', err);
    }
  };

  useEffect(() => {
    const loadPayPalScript = async () => {
      try {
        setIsLoadingScript(true);
        setScriptError(null);
        cleanupPayPalScript();

        return new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.id = paypalScriptId;
          script.src = 'https://www.paypal.com/sdk/js?client-id=Adj5TaOdSl2VqQgMJNt-en40d2bpOokFgrRqHsVeda7hIOMnNZXgN30newF-Mx8yc-utVNfbyprNNoXe&vault=true&intent=subscription';
          script.async = true;
          script.defer = true;
          script.crossOrigin = "anonymous";
          
          script.onload = () => {
            console.log('PayPal script loaded successfully');
            resolve();
          };
          
          script.onerror = (error) => {
            console.error('PayPal script loading error:', error);
            setScriptError('Failed to load PayPal SDK');
            reject(new Error('Failed to load PayPal SDK'));
          };

          document.body.appendChild(script);
        });
      } catch (error: any) {
        console.error('PayPal script loading error:', error);
        setScriptError(error.message || 'Failed to load PayPal');
        throw error;
      }
    };

    const initializePayPalButton = async () => {
      try {
        await loadPayPalScript();

        if (!window.paypal || !paypalButtonRef.current) {
          throw new Error('PayPal SDK not initialized properly');
        }

        window.paypal.Buttons({
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
              console.error('Subscription creation error:', error);
              toast.error('Failed to create subscription: ' + (error.message || 'Please try again'));
              throw error;
            }
          },
          onApprove: (data: { subscriptionID: string }) => {
            console.log('Subscription approved:', data.subscriptionID);
            toast.success('Subscription created successfully!');
            window.location.href = '/manage-subscription';
          },
          onError: (err: Error) => {
            console.error('PayPal error:', err);
            toast.error('PayPal encountered an error: ' + err.message);
            setScriptError(err.message);
          },
          onCancel: () => {
            toast.info('Subscription cancelled');
          }
        }).render(paypalButtonRef.current);

      } catch (error: any) {
        console.error('PayPal initialization error:', error);
        setScriptError(error.message || 'Failed to initialize PayPal');
        toast.error('Failed to initialize PayPal. Please try again later.');
      } finally {
        setIsLoadingScript(false);
      }
    };

    initializePayPalButton();

    return () => {
      cleanupPayPalScript();
    };
  }, [stripeProductId, planName, onSubscribe]);

  return (
    <div ref={paypalButtonRef} className="w-full">
      {(isProcessing || isLoadingScript) && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}
      {scriptError && (
        <div className="text-red-500 text-center text-sm mt-2">
          {scriptError}
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
