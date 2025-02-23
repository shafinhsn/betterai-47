
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
        // Add all required parameters and set them correctly
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
        script.async = true;
        script.crossOrigin = "anonymous";

        const handleLoad = () => {
          if (window.paypal) {
            setScriptLoaded(true);
            setIsLoading(false);
            resolve();
          } else {
            const error = new Error('PayPal SDK not available after script load');
            console.error('PayPal SDK not found:', error);
            onError?.(error);
            reject(error);
          }
        };

        const handleError = (event: Event | string) => {
          const error = new Error('Failed to load PayPal SDK');
          console.error('PayPal script failed to load:', event);
          onError?.(error);
          setIsLoading(false);
          reject(error);
        };

        script.addEventListener('load', handleLoad);
        script.addEventListener('error', handleError);

        document.body.appendChild(script);

        return () => {
          script.removeEventListener('load', handleLoad);
          script.removeEventListener('error', handleError);
        };
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
