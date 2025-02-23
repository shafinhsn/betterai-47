
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
        existingScript.remove();
      }

      if (window.paypal?.Buttons?.instances) {
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
    } catch (err) {
      console.error('Error during PayPal cleanup:', err);
    }
  };

  useEffect(() => {
    const loadScript = async () => {
      try {
        setIsLoading(true);
        setError(null);
        cleanupPayPalScript();

        return new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.id = paypalScriptId;
          script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
          script.async = true;
          script.defer = true;
          script.crossOrigin = "anonymous";
          
          script.onload = () => {
            console.log('PayPal script loaded successfully');
            resolve();
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
