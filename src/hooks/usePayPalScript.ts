
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
        script.id = 'paypal-js';
        script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=subscription`;
        script.async = true;
        script.crossOrigin = "anonymous";
        
        // Record load/error state
        let hasLoaded = false;
        let hasErrored = false;

        const handleError = (event: Event | string) => {
          if (hasLoaded || hasErrored) return; // Prevent multiple callbacks
          hasErrored = true;
          
          console.error('PayPal script loading error:', event);
          if (isSubscribed) {
            onError?.(new Error(typeof event === 'string' ? event : 'Failed to load PayPal SDK'));
          }
        };

        script.onerror = handleError;

        script.onload = () => {
          if (hasErrored) return; // Don't proceed if we already had an error
          hasLoaded = true;
          
          if (window.paypal && isSubscribed) {
            console.log('PayPal SDK loaded successfully');
            setScriptLoaded(true);
            setIsLoading(false);
          } else if (isSubscribed) {
            const error = new Error('PayPal SDK not available after load');
            console.error('PayPal SDK load error:', error);
            onError?.(error);
          }
        };

        // Start timeout before appending script
        timeoutId = window.setTimeout(() => {
          if (!hasLoaded && isSubscribed) {
            const error = new Error('PayPal SDK load timeout');
            console.error('PayPal script timeout');
            onError?.(error);
          }
        }, 10000);

        // Append the script
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
