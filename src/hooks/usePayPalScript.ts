
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
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription&components=buttons&enable-funding=venmo,paylater`;
        script.async = true;
        script.defer = true;
        script.crossOrigin = "anonymous";
        
        // Add script attributes to help with CORS
        script.setAttribute('data-namespace', 'paypal-sdk');
        script.setAttribute('data-csp-nonce', 'random-nonce');

        const handleError = (event: Event | string) => {
          console.error('PayPal script loading error:', event);
          if (isSubscribed) {
            onError?.(new Error(typeof event === 'string' ? event : 'Failed to load PayPal SDK'));
          }
        };

        script.onerror = handleError;
        window.addEventListener('error', (event) => {
          if (event.filename?.includes('paypal')) {
            handleError(event);
          }
        }, { once: true });

        script.onload = () => {
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

        // Increased timeout to 30 seconds for slower connections
        timeoutId = window.setTimeout(() => {
          if (isSubscribed) {
            const error = new Error('PayPal SDK load timeout');
            console.error('PayPal script timeout');
            onError?.(error);
          }
        }, 30000);

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

