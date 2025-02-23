
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { PlanFeatures } from './PlanFeatures';
import { useEffect, useRef } from 'react';
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
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const paypalButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (name.toLowerCase().includes('student')) {
      // Cleanup any existing PayPal scripts first
      const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Create new script element
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=Adj5TaOdSl2VqQgMJNt-en40d2bpOokFgrRqHsVeda7hIOMnNZXgN30newF-Mx8yc-utVNfbyprNNoXe&vault=true&intent=subscription';
      script.async = true;
      script.crossOrigin = "anonymous";
      script.dataset.sdkIntegrationSource = 'button-factory';
      
      // Add error handler for script loading
      script.onerror = (error) => {
        console.error('PayPal script loading error:', error);
        toast.error('Failed to load PayPal. Please try again later.');
      };
      
      script.onload = () => {
        if (window.paypal && paypalButtonRef.current) {
          try {
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
                  if (!subscriptionId) {
                    throw new Error('Failed to create subscription');
                  }
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
              }
            }).render(paypalButtonRef.current);
          } catch (error) {
            console.error('Error rendering PayPal button:', error);
            toast.error('Failed to initialize PayPal. Please refresh the page.');
          }
        }
      };

      // Store reference and append script
      scriptRef.current = script;
      document.body.appendChild(script);
      
      return () => {
        // Safe cleanup of script element
        if (scriptRef.current && document.body.contains(scriptRef.current)) {
          document.body.removeChild(scriptRef.current);
        }
        // Reset reference
        scriptRef.current = null;

        // Clean up any PayPal buttons
        if (paypalButtonRef.current) {
          paypalButtonRef.current.innerHTML = '';
        }
      };
    }
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
          {isProcessing && (
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
