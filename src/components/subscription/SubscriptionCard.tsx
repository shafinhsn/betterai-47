
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

  const cleanupPayPalScript = () => {
    // Remove existing script
    const existingScript = document.getElementById(paypalScriptId);
    if (existingScript && document.body.contains(existingScript)) {
      existingScript.remove();
    }

    // Clean up PayPal button container
    if (paypalButtonRef.current) {
      paypalButtonRef.current.innerHTML = '';
    }

    // Clean up PayPal button instances
    if (window.paypal?.Buttons?.instances) {
      window.paypal.Buttons.instances.forEach((instance: any) => {
        if (instance.close) {
          instance.close();
        }
      });
    }
  };

  useEffect(() => {
    if (!name.toLowerCase().includes('student')) return;

    const loadPayPalScript = async () => {
      try {
        setIsLoadingScript(true);
        cleanupPayPalScript();

        // Create and load new PayPal script
        const script = document.createElement('script');
        script.id = paypalScriptId;
        script.src = 'https://www.paypal.com/sdk/js?client-id=Adj5TaOdSl2VqQgMJNt-en40d2bpOokFgrRqHsVeda7hIOMnNZXgN30newF-Mx8yc-utVNfbyprNNoXe&vault=true&intent=subscription';
        script.async = true;
        script.crossOrigin = "anonymous";
        script.dataset.sdkIntegrationSource = 'button-factory';
        script.dataset.namespace = 'paypal_sdk';

        // Create a promise to handle script loading
        const scriptLoaded = new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = (error) => {
            console.error('PayPal script loading error:', error);
            reject(new Error('Failed to load PayPal SDK'));
          };
        });

        // Add script to document and wait for it to load
        document.body.appendChild(script);
        await scriptLoaded;

        // Initialize PayPal button after script loads
        if (window.paypal && paypalButtonRef.current) {
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
              } catch (error) {
                console.error('Subscription creation error:', error);
                toast.error('Failed to create subscription. Please try again.');
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
              toast.error('PayPal encountered an error. Please try again.');
            },
            onCancel: () => {
              toast.info('Subscription cancelled');
            }
          }).render(paypalButtonRef.current);
        }
      } catch (error) {
        console.error('PayPal script loading error:', error);
        toast.error('Failed to load PayPal. Please try again later.');
      } finally {
        setIsLoadingScript(false);
      }
    };

    loadPayPalScript();

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
