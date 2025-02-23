
import { useState, useEffect } from 'react';

interface UsePayPalScriptOptions {
  clientId: string;
  onError?: (error: Error) => void;
}

export const usePayPalScript = ({ clientId, onError }: UsePayPalScriptOptions) => {
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    let timeoutId: number;
    let isSubscribed = true;
    
    const loadScript = async () => {
      try {
        // Check if PayPal is already loaded
        if (window.paypal) {
          if (isSubscribed) {
            setScriptLoaded(true);
            setIsLoading(false);
          }
          return;
        }

        // Remove any existing PayPal scripts
        const existingScripts = document.querySelectorAll('script[src*="paypal"]');
        existingScripts.forEach(script => script.remove());

        const script = document.createElement('script');
        script.id = 'paypal-sdk';
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
        script.async = true;

        // Add error handlers before setting src
        const handleError = (event: Event | string) => {
          console.error('PayPal script loading error:', event);
          const error = new Error(typeof event === 'string' ? event : 'Failed to load PayPal SDK');
          if (isSubscribed) {
            onError?.(error);
          }
        };

        script.onerror = handleError;
        window.addEventListener('error', (event) => {
          if (event.filename?.includes('paypal')) {
            handleError(event);
          }
        }, { once: true });

        const handleLoad = () => {
          // Wait a short moment to ensure PayPal object is initialized
          setTimeout(() => {
            if (window.paypal && isSubscribed) {
              console.log('PayPal SDK loaded successfully');
              setScriptLoaded(true);
              setIsLoading(false);
            } else if (isSubscribed) {
              const error = new Error('PayPal SDK not available after load');
              console.error('PayPal SDK load error:', error);
              onError?.(error);
            }
          }, 100);
        };

        script.addEventListener('load', handleLoad);

        // Set timeout for script loading
        timeoutId = window.setTimeout(() => {
          if (isSubscribed) {
            const error = new Error('PayPal SDK load timeout');
            console.error('PayPal script timeout');
            onError?.(error);
          }
        }, 10000);

        // Add the script to document head instead of body
        document.head.appendChild(script);
      } catch (error) {
        console.error('Script loading error:', error);
        if (isSubscribed) {
          onError?.(error instanceof Error ? error : new Error(String(error)));
        }
      }
    };

    loadScript();

    return () => {
      isSubscribed = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [clientId, onError]);

  return {
    isLoading,
    scriptLoaded
  };
};
