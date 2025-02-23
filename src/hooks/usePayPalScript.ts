
import { useState, useEffect } from 'react';

interface UsePayPalScriptOptions {
  clientId: string;
  onError?: (error: Error) => void;
}

export const usePayPalScript = ({ clientId, onError }: UsePayPalScriptOptions) => {
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const loadScript = () => {
      return new Promise<void>((resolve, reject) => {
        const existingScript = document.getElementById('paypal-sdk');
        if (existingScript) {
          existingScript.remove();
        }

        const script = document.createElement('script');
        script.id = 'paypal-sdk';
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=subscription`;
        script.async = true;

        script.onload = () => {
          if (window.paypal) {
            setScriptLoaded(true);
            setIsLoading(false);
            resolve();
          } else {
            reject(new Error('PayPal SDK not available after script load'));
          }
        };

        script.onerror = (error) => {
          console.error('PayPal script failed to load:', error);
          const loadError = new Error('Failed to load PayPal SDK');
          onError?.(loadError);
          setIsLoading(false);
          reject(loadError);
        };

        document.body.appendChild(script);
      });
    };

    loadScript().catch((error) => {
      console.error('Error loading PayPal script:', error);
      onError?.(error);
    });

    return () => {
      const existingScript = document.getElementById('paypal-sdk');
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
