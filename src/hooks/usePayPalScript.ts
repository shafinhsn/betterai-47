
import { useState, useEffect } from 'react';

interface UsePayPalScriptOptions {
  clientId: string;
  onError?: (error: Error) => void;
}

export const usePayPalScript = ({ clientId, onError }: UsePayPalScriptOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paypalScriptId = 'paypal-sdk';

  const cleanupPayPalScript = () => {
    try {
      const existingScript = document.getElementById(paypalScriptId);
      if (existingScript) {
        console.log('Cleaning up existing PayPal script...');
        existingScript.remove();
      }

      if (window.paypal) {
        console.log('Cleaning up window.paypal object...');
        delete window.paypal;
      }
    } catch (err) {
      console.error('Error during PayPal cleanup:', err);
    }
  };

  useEffect(() => {
    const loadScript = async () => {
      try {
        console.log('Starting PayPal script load...');
        setIsLoading(true);
        setError(null);
        cleanupPayPalScript();

        const script = document.createElement('script');
        script.id = paypalScriptId;
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=subscription&components=buttons`;
        script.crossOrigin = "anonymous";

        console.log('Loading PayPal script with URL:', script.src);

        // Create a promise that resolves when the script loads successfully
        await new Promise<void>((resolve, reject) => {
          script.onload = () => {
            console.log('PayPal script loaded, checking for PayPal object...');
            const checkPayPal = () => {
              if (window.paypal) {
                console.log('PayPal object found and initialized');
                resolve();
              } else {
                console.log('PayPal object not found, retrying...');
                setTimeout(checkPayPal, 100);
              }
            };
            checkPayPal();
          };

          script.onerror = (event) => {
            console.error('PayPal script failed to load:', event);
            reject(new Error('Failed to load PayPal SDK'));
          };

          document.body.appendChild(script);
        });

      } catch (error: any) {
        const errorMessage = error.message || 'Failed to load PayPal';
        console.error('PayPal script loading error:', error);
        setError(errorMessage);
        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadScript();

    return () => {
      cleanupPayPalScript();
    };
  }, [clientId, onError]);

  return {
    isLoading,
    error
  };
};

declare global {
  interface Window {
    paypal?: any;
  }
}
