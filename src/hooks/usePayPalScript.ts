
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
      // Clean up existing script if present
      const existingScript = document.getElementById(paypalScriptId);
      if (existingScript) {
        console.log('Removing existing PayPal script');
        existingScript.remove();
      }

      // Clean up any existing PayPal button instances
      if (window.paypal?.Buttons?.instances) {
        console.log('Cleaning up PayPal button instances');
        window.paypal.Buttons.instances.forEach((instance: any) => {
          try {
            if (instance.close) {
              instance.close();
            }
          } catch (err) {
            console.error('Error closing PayPal button instance:', err);
          }
        });
      }

      // Clear the global paypal object
      if (window.paypal) {
        console.log('Clearing global PayPal object');
        delete window.paypal;
      }
    } catch (err) {
      console.error('Error during PayPal cleanup:', err);
    }
  };

  useEffect(() => {
    const loadScript = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Clean up any existing PayPal resources
        cleanupPayPalScript();

        return new Promise<void>((resolve, reject) => {
          console.log('Starting PayPal script load');
          const script = document.createElement('script');
          script.id = paypalScriptId;
          script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
          script.async = true;
          script.crossOrigin = "anonymous";
          
          // Add specific attributes for better error handling
          script.setAttribute('data-namespace', 'paypal-sdk');
          script.setAttribute('data-page-type', 'checkout');
          
          script.onload = () => {
            console.log('PayPal script loaded successfully');
            if (window.paypal) {
              console.log('PayPal object is available');
              resolve();
            } else {
              const err = new Error('PayPal object not available after script load');
              console.error(err);
              reject(err);
            }
          };
          
          script.onerror = (error) => {
            console.error('PayPal script loading error:', error);
            const err = new Error('Failed to load PayPal SDK');
            setError(err.message);
            onError?.(err);
            reject(err);
          };

          document.body.appendChild(script);
        });
      } catch (error: any) {
        console.error('PayPal script loading error:', error);
        setError(error.message || 'Failed to load PayPal');
        onError?.(error);
        throw error;
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
