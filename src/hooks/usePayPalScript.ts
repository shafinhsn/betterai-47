
import { useState, useEffect } from 'react';

interface UsePayPalScriptOptions {
  clientId: string;
  onError?: (error: Error) => void;
}

export const usePayPalScript = ({ clientId, onError }: UsePayPalScriptOptions) => {
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const existingScript = document.getElementById('paypal-sdk');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=subscription`;
    script.async = true;

    script.onload = () => {
      setScriptLoaded(true);
      setIsLoading(false);
    };

    script.onerror = (error) => {
      console.error('PayPal script failed to load:', error);
      onError?.(new Error('Failed to load PayPal SDK'));
      setIsLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [clientId, onError]);

  return {
    isLoading,
    scriptLoaded
  };
};

