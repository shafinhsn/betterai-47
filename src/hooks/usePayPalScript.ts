
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
    
    const loadScript = () => {
      return new Promise<void>((resolve, reject) => {
        try {
          // Check if PayPal is already loaded
          if (window.paypal) {
            console.log('PayPal SDK already loaded');
            setScriptLoaded(true);
            setIsLoading(false);
            resolve();
            return;
          }

          // Remove any existing PayPal scripts
          const existingScript = document.getElementById('paypal-sdk');
          if (existingScript) {
            console.log('Removing existing PayPal script');
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
            reject(error);
          });

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

          // Set a timeout to detect if script loading takes too long
          timeoutId = window.setTimeout(() => {
            const error = new Error('PayPal SDK load timeout');
            console.error('PayPal script timeout');
            onError?.(error);
            reject(error);
          }, 10000); // 10 second timeout

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
    }).finally(() => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
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
