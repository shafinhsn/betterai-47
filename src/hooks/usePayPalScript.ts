
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
          setScriptLoaded(true);
          setIsLoading(false);
          return;
        }

        // Remove any existing PayPal scripts
        const existingScript = document.getElementById('paypal-sdk');
        if (existingScript) {
          existingScript.remove();
        }

        const script = document.createElement('script');
        script.id = 'paypal-sdk';
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        
        // Add error event listener before setting src
        script.addEventListener('error', (event) => {
          const error = new Error('Failed to load PayPal SDK');
          console.error('PayPal script error:', event);
          onError?.(error);
        });

        const handleLoad = () => {
          if (window.paypal && isSubscribed) {
            setScriptLoaded(true);
            setIsLoading(false);
          } else if (isSubscribed) {
            const error = new Error('PayPal SDK not available after load');
            console.error('PayPal SDK load error:', error);
            onError?.(error);
          }
        };

        script.addEventListener('load', handleLoad);

        // Set a timeout to detect if script loading takes too long
        timeoutId = window.setTimeout(() => {
          if (isSubscribed) {
            const error = new Error('PayPal SDK load timeout');
            console.error('PayPal script timeout');
            onError?.(error);
          }
        }, 10000); // 10 second timeout

        document.body.appendChild(script);
      } catch (error) {
        console.error('Script loading error:', error);
        onError?.(error instanceof Error ? error : new Error(String(error)));
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
