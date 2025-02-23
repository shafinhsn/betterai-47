
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
        console.log('Removing existing PayPal script');
        existingScript.remove();
      }

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

        // Create a new promise to handle script loading
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.id = paypalScriptId;
          script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
          script.async = true;
          
          // Important: Set these attributes before adding the script to the document
          script.crossOrigin = "anonymous";
          script.dataset.namespace = "paypal-sdk";
          script.dataset.pageType = "checkout";
          
          script.onload = () => {
            // Add a small delay to ensure PayPal object is initialized
            setTimeout(() => {
              if (window.paypal) {
                console.log('PayPal object is available');
                resolve();
              } else {
                const err = new Error('PayPal object not available after script load');
                console.error(err);
                reject(err);
              }
            }, 100);
          };
          
          script.onerror = (event) => {
            const err = new Error('Failed to load PayPal SDK');
            console.error('PayPal script loading error:', event);
            reject(err);
          };

          document.body.appendChild(script);
        });
      } catch (error: any) {
        console.error('PayPal script loading error:', error);
        const errorMessage = error.message || 'Failed to load PayPal';
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
