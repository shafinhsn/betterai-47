
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UsePayPalButtonRendererProps {
  paypalButtonRef: React.RefObject<HTMLDivElement>;
  scriptLoaded: boolean;
  onSubscribe: (productId: string, planName: string) => Promise<string>;
  stripeProductId: string;
  planName: string;
  navigate: (path: string) => void;
  setCookiesBlocked: (blocked: boolean) => void;
  setLoadError: (error: string | null) => void;
  setIsPayPalProcessing: (processing: boolean) => void;
}

export const usePayPalButtonRenderer = ({
  paypalButtonRef,
  scriptLoaded,
  onSubscribe,
  stripeProductId,
  planName,
  navigate,
  setCookiesBlocked,
  setLoadError,
  setIsPayPalProcessing
}: UsePayPalButtonRendererProps) => {
  const [paypalButton, setPaypalButton] = useState<any>(null);

  useEffect(() => {
    if (!window.paypal?.Buttons || !paypalButtonRef.current || !scriptLoaded) {
      return;
    }

    // Clean up existing button if present
    if (paypalButton) {
      paypalButton.close();
      setPaypalButton(null);
    }
    
    // Clean up any existing content
    if (paypalButtonRef.current) {
      paypalButtonRef.current.innerHTML = '';
    }

    const buttonConfig = {
      style: {
        layout: 'horizontal' as const,
        color: 'blue' as const,
        shape: 'rect' as const,
        label: 'paypal' as const
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
        setPaypalButton(button);
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
      // Clean up on unmount
      if (paypalButton) {
        paypalButton.close();
      }
      if (paypalButtonRef.current) {
        paypalButtonRef.current.innerHTML = '';
      }
    };
  }, [scriptLoaded, onSubscribe, stripeProductId, planName, navigate, paypalButton]);

  return { paypalButton };
};

