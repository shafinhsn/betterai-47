
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { PlanFeatures } from './PlanFeatures';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface SubscriptionCardProps {
  name: string;
  price: number;
  features: string[];
  stripeProductId: string;
  isProcessing: boolean;
  onSubscribe: (productId: string, planName: string) => Promise<string>;
}

export const SubscriptionCard = ({
  name,
  price,
  features,
  stripeProductId,
  isProcessing,
  onSubscribe
}: SubscriptionCardProps) => {
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const paypalButtonRef = useRef<HTMLDivElement>(null);
  const paypalScriptId = 'paypal-sdk';
  const [scriptError, setScriptError] = useState<string | null>(null);

  const cleanupPayPalScript = () => {
    try {
      // Remove existing script
      const existingScript = document.getElementById(paypalScriptId);
      if (existingScript) {
        existingScript.remove();
      }

      // Clean up PayPal button container
      if (paypalButtonRef.current) {
        paypalButtonRef.current.innerHTML = '';
      }

      // Clean up PayPal button instances
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
    if (!name.toLowerCase().includes('student')) return;

    const loadPayPalScript = async () => {
      try {
        setIsLoadingScript(true);
        setScriptError(null);
        cleanupPayPalScript();

        return new Promise<void>((resolve, reject) => {
          // Create and load new PayPal script
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
              const subscriptionId = await onSubscribe(stripeProductId, name);
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
  }, [name, stripeProductId, onSubscribe]);

  return (
    <div className="border rounded-lg p-6 flex flex-col hover:border-emerald-500 transition-colors">
      <PlanFeatures
        name={name}
        price={price}
        features={features}
      />
      {name.toLowerCase().includes('student') ? (
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
      ) : (
        <Button
          className="w-full"
          onClick={() => onSubscribe(stripeProductId, name)}
          disabled={isProcessing}
          variant="outline"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            'Subscribe Now'
          )}
        </Button>
      )}
    </div>
  );
};

// Add PayPal types to global window object
declare global {
  interface Window {
    paypal?: any;
  }
}
