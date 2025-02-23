
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { PlanFeatures } from './PlanFeatures';
import { useEffect, useRef } from 'react';

interface SubscriptionCardProps {
  name: string;
  price: number;
  features: string[];
  stripeProductId: string;
  isProcessing: boolean;
  onSubscribe: (productId: string, planName: string) => Promise<void>;
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

  useEffect(() => {
    if (name.toLowerCase().includes('student')) {
      // Load PayPal SDK
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=Adj5TaOdSl2VqQgMJNt-en40d2bpOokFgrRqHsVeda7hIOMnNZXgN30newF-Mx8yc-utVNfbyprNNoXe&vault=true&intent=subscription';
      script.async = true;
      script.dataset.sdkIntegrationSource = 'button-factory';
      
      script.onload = () => {
        // Initialize PayPal button after SDK loads
        if (window.paypal) {
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
                throw error;
              }
            },
            onApprove: (data: { subscriptionID: string }) => {
              console.log('Subscription approved:', data.subscriptionID);
              window.location.href = '/manage-subscription';
            },
            onError: (err: Error) => {
              console.error('PayPal error:', err);
            }
          }).render(`#paypal-button-${stripeProductId}`);
        }
      };

      // Store reference to script element
      scriptRef.current = script;
      document.body.appendChild(script);
      
      return () => {
        // Safe cleanup of script element
        if (scriptRef.current && document.body.contains(scriptRef.current)) {
          document.body.removeChild(scriptRef.current);
        }
        // Reset reference
        scriptRef.current = null;
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
        <div id={`paypal-button-${stripeProductId}`} className="w-full">
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
