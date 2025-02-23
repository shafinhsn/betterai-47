
import { useState, useEffect } from 'react';

interface UsePayPalScriptOptions {
  clientId: string;
  onError?: (error: Error) => void;
}

export const usePayPalScript = ({ clientId, onError }: UsePayPalScriptOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const paypalScriptId = 'paypal-sdk';
  const maxRetries = 3;
  const retryDelay = 1000;

  const cleanupPayPalScript = () => {
    try {
      const existingScript = document.getElementById(paypalScriptId);
      if (existingScript) {
        console.log('Cleaning up existing PayPal script...');
        existingScript.remove();
      }

      if (typeof window !== 'undefined' && window.paypal) {
        console.log('Cleaning up window.paypal object...');
        delete window.paypal;
      }
    } catch (err) {
      console.error('Error during PayPal cleanup:', err);
    }
  };

  const loadPayPalScript = async (retryCount = 0): Promise<void> => {
    try {
      console.log(`Attempting to load PayPal script (attempt ${retryCount + 1}/${maxRetries + 1})...`);
      
      const script = document.createElement('script');
      script.id = paypalScriptId;
      script.src = 'https://www.paypal.com/sdk/js?' + new URLSearchParams({
        'client-id': clientId,
        'currency': 'USD',
        'intent': 'subscription',
        'components': 'buttons',
      }).toString();
      
      script.async = true;
      script.crossOrigin = "anonymous";

      console.log('Loading PayPal script with URL:', script.src);

      await new Promise<void>((resolve, reject) => {
        let timeoutId: number;
        let attempts = 0;
        const maxPayPalChecks = 10;

        const checkPayPal = () => {
          attempts++;
          if (window.paypal?.Buttons) {
            console.log('PayPal object found and initialized');
            clearTimeout(timeoutId);
            setScriptLoaded(true);
            resolve();
          } else if (attempts < maxPayPalChecks) {
            console.log(`PayPal object not found, retrying... (attempt ${attempts}/${maxPayPalChecks})`);
            timeoutId = window.setTimeout(checkPayPal, 100);
          } else {
            const err = new Error('PayPal object not available after maximum retries');
            console.error(err);
            reject(err);
          }
        };

        script.onload = () => {
          console.log('PayPal script loaded, checking for PayPal object...');
          checkPayPal();
        };

        script.onerror = (event) => {
          console.error('PayPal script failed to load:', event);
          reject(new Error('Failed to load PayPal SDK'));
        };

        document.body.appendChild(script);
      });

    } catch (error: any) {
      console.error(`PayPal script loading error (attempt ${retryCount + 1}):`, error);
      
      if (retryCount < maxRetries) {
        console.log(`Retrying PayPal script load in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return loadPayPalScript(retryCount + 1);
      }
      
      const errorMessage = error.message || 'Failed to load PayPal';
      setError(errorMessage);
      onError?.(error);
      throw error;
    }
  };

  useEffect(() => {
    const initializePayPal = async () => {
      setIsLoading(true);
      setError(null);
      cleanupPayPalScript();
      
      try {
        await loadPayPalScript();
      } catch (error) {
        console.error('Final PayPal initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePayPal();

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
