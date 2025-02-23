
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
        try {
          // Check if PayPal is already loaded
          if (window.paypal) {
            setScriptLoaded(true);
            setIsLoading(false);
            resolve();
            return;
          }

          // Remove any existing PayPal scripts
          const existingScript = document.getElementById('paypal-sdk');
          if (existingScript) {
            existingScript.remove();
          }

          const script = document.createElement('script');
          script.id = 'paypal-sdk';
          // Add all required parameters and attributes for subscriptions
          script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription&components=buttons`;
          script.async = true;

          const handleLoad = () => {
            if (window.paypal) {
              console.log('PayPal SDK loaded successfully');
              setScriptLoaded(true);
              setIsLoading(false);
              resolve();
            } else {
              const error = new Error('PayPal SDK not available after load');
              console.error('PayPal SDK load error:', error);
              onError?.(error);
              reject(error);
            }
          };

          script.addEventListener('load', handleLoad);
          script.addEventListener('error', (event) => {
            const error = new Error('Failed to load PayPal SDK');
            console.error('PayPal script error:', event);
            onError?.(error);
            reject(error);
          });

          document.body.appendChild(script);
        } catch (error) {
          console.error('Script loading error:', error);
          onError?.(error instanceof Error ? error : new Error(String(error)));
          reject(error);
        }
      });
    };

    loadScript().catch((error) => {
      setIsLoading(false);
      console.error('PayPal script loading failed:', error);
      onError?.(error);
    });

    return () => {
      const script = document.getElementById('paypal-sdk');
      if (script) {
        script.remove();
      }
    };
  }, [clientId, onError]);

  return {
    isLoading,
    scriptLoaded
  };
};
