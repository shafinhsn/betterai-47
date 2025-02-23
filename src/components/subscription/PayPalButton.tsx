
import { useRef, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { usePayPalScript } from '@/hooks/usePayPalScript';
import { PayPalLoading } from './PayPalLoading';
import { useNavigate } from 'react-router-dom';
import { CookieAlert } from './CookieAlert';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';

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
  const navigate = useNavigate();
  const [cookiesBlocked, setCookiesBlocked] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPayPalProcessing, setIsPayPalProcessing] = useState(false);

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
    if (!window.paypal?.Buttons || !paypalButtonRef.current || !scriptLoaded) {
      return;
    }

    // Clean up any existing content
    if (paypalButtonRef.current) {
      paypalButtonRef.current.innerHTML = '';
    }

    const buttonConfig = {
      style: {
        layout: 'horizontal',
        color: 'blue',
        shape: 'rect',
        label: 'paypal'
      },
      createSubscription: async () => {
        try {
          setIsPayPalProcessing(true);
          setLoadError(null);
          const subscriptionId = await onSubscribe(stripeProductId, planName);
          
          if (!subscriptionId) {
            throw new Error('Failed to create subscription');
          }
          
          console.log('Created subscription:', subscriptionId);
          return subscriptionId;
        } catch (error: any) {
          console.error('Subscription creation error:', error);
          toast.error('Failed to create subscription: ' + error.message);
          throw error;
        } finally {
          setIsPayPalProcessing(false);
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
        setLoadError(err.message || 'PayPal encountered an error');
        toast.error('PayPal encountered an error: ' + err.message);
      },
      onCancel: () => {
        console.log('Subscription was cancelled by user');
        toast.error('Subscription was cancelled');
      }
    };

    try {
      const button = window.paypal?.Buttons(buttonConfig);
      if (button) {
        button.render(paypalButtonRef.current);
        console.log('PayPal button rendered successfully');
      } else {
        throw new Error('Failed to create PayPal button');
      }
    } catch (error) {
      console.error('Error rendering PayPal button:', error);
      if (error instanceof Error) {
        if (error.message?.includes('blocked') || error.message?.includes('cookie')) {
          console.log('Cookies are blocked during render - showing alert');
          setCookiesBlocked(true);
        } else {
          setLoadError(error.message);
          toast.error('Failed to render PayPal button: ' + error.message);
        }
      }
    }

    return () => {
      if (paypalButtonRef.current) {
        paypalButtonRef.current.innerHTML = '';
      }
    };
  }, [scriptLoaded, isLoading, onSubscribe, stripeProductId, planName, navigate]);

  const handleCardPayment = async () => {
    try {
      setIsPayPalProcessing(true);
      const subscriptionId = await onSubscribe(stripeProductId, planName);
      window.location.href = `https://www.paypal.com/subscription/checkout?subscription_id=${subscriptionId}`;
    } catch (error: any) {
      console.error('Card payment error:', error);
      toast.error('Failed to start card payment: ' + error.message);
    } finally {
      setIsPayPalProcessing(false);
    }
  };

  const handleOpenCookieSettings = () => {
    if (navigator.userAgent.includes('Chrome')) {
      window.open('chrome://settings/cookies');
    } else if (navigator.userAgent.includes('Firefox')) {
      window.open('about:preferences#privacy');
    } else {
      window.open('about:settings');
    }
  };

  if (cookiesBlocked) {
    return <CookieAlert onOpenSettings={handleOpenCookieSettings} />;
  }

  if (loadError) {
    return (
      <div className="text-red-500 text-sm p-4 border border-red-200 rounded-md bg-red-50">
        Error: {loadError}. Please try refreshing the page or check your connection.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div ref={paypalButtonRef} className="min-h-[45px] relative">
        {(isProcessing || isLoading || isPayPalProcessing) && <PayPalLoading />}
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or pay with card</span>
        </div>
      </div>
      <Button
        className="w-full"
        onClick={handleCardPayment}
        disabled={isProcessing || isPayPalProcessing}
        variant="outline"
      >
        <CreditCard className="w-4 h-4 mr-2" />
        Pay with Card
      </Button>
    </div>
  );
};
