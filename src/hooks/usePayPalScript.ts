
import { useState, useEffect } from 'react';

interface UsePayPalScriptOptions {
  clientId: string;
  onError?: (error: Error) => void;
}

export const usePayPalScript = ({ clientId, onError }: UsePayPalScriptOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paypalScriptId = 'paypal-sdk';
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const cleanupPayPalScript = () => {
    try {
      const existingScript = document.getElementById(paypalScriptId);
      if (existingScript) {
        console.log('Cleaning up existing PayPal script...');
        existingScript.remove();
      }

      // Clean up window.paypal in a safe way
      if (typeof window !== 'undefined' && window.paypal) {
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
        script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=subscription&components=buttons,funding-eligibility`;
        script.async = true;
        script.defer = true;
        script.crossOrigin = "anonymous";

        console.log('Loading PayPal script with URL:', script.src);

        // Create a promise that resolves when the script loads successfully
        await new Promise<void>((resolve, reject) => {
          let attempts = 0;
          const maxAttempts = 10;

          script.onload = () => {
            console.log('PayPal script loaded, checking for PayPal object...');
            const checkPayPal = () => {
              attempts++;
              if (window.paypal) {
                console.log('PayPal object found and initialized');
                setScriptLoaded(true);
                resolve();
              } else if (attempts < maxAttempts) {
                console.log(`PayPal object not found, retrying... (attempt ${attempts}/${maxAttempts})`);
                setTimeout(checkPayPal, 100);
              } else {
                const error = new Error('PayPal object not available after maximum retries');
                console.error(error);
                reject(error);
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
    error,
    scriptLoaded
  };
};

declare global {
  interface Window {
    paypal?: any;
  }
}
