
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayPalScript } from '@/hooks/usePayPalScript';
import { usePayPalButtonRenderer } from '@/hooks/usePayPalButtonRenderer';
import { PayPalLoading } from './PayPalLoading';
import { CookieAlert } from './CookieAlert';
import { CardPaymentButton } from './CardPaymentButton';
import { openCookieSettings } from '@/utils/cookieSettings';
import { toast } from 'sonner';

interface PayPalButtonProps {
  onSubscribe: (productId: string, planName: string) => Promise<string>;
  stripeProductId: string;
  planName: string;
  isProcessing: boolean;
}

export const PayPalButton = ({
  onSubscribe,
  stripeProductId,
  planName,
  isProcessing
}: PayPalButtonProps) => {
  const paypalButtonRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [cookiesBlocked, setCookiesBlocked] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPayPalProcessing, setIsPayPalProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Use sandbox client ID for development
  const clientId = process.env.NODE_ENV === 'production'
    ? 'PRODUCTION_CLIENT_ID' // This will be updated when going to production
    : 'AcMPwQd6TE8DnV2pOgoM-4Fqx8VopnQKtVjIJ2ce0V-YmeEmpuZruuFCOgFEvQB_HB4GcXd89c9SHndi';

  const handleError = (error: Error) => {
    console.error('PayPal script error:', error);
    if (error.message?.includes('blocked') || error.message?.includes('cookie')) {
      console.log('Cookies are blocked - showing alert');
      setCookiesBlocked(true);
    } else if (retryCount < 3) {
      // Retry loading the script up to 3 times
      console.log(`Retrying PayPal script load (attempt ${retryCount + 1})`);
      setRetryCount(prev => prev + 1);
      setLoadError(null);
    } else {
      setLoadError(error.message);
      toast.error('Failed to load PayPal: ' + error.message);
    }
  };

  const { isLoading, scriptLoaded } = usePayPalScript({
    clientId,
    onError: handleError
  });

  usePayPalButtonRenderer({
    paypalButtonRef,
    scriptLoaded,
    onSubscribe,
    stripeProductId,
    planName,
    navigate,
    setCookiesBlocked,
    setLoadError,
    setIsPayPalProcessing
  });

  if (cookiesBlocked) {
    return <CookieAlert onOpenSettings={openCookieSettings} />;
  }

  if (loadError) {
    return (
      <div className="text-red-500 text-sm p-4 border border-red-200 rounded-md bg-red-50">
        <p>Error: {loadError}</p>
        <p className="text-sm mt-2">Please try:</p>
        <ul className="list-disc ml-6 text-sm">
          <li>Refreshing the page</li>
          <li>Checking your internet connection</li>
          <li>Disabling any ad blockers</li>
          <li>Using a different browser</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div ref={paypalButtonRef} className="min-h-[45px] relative">
        {(isProcessing || isLoading || isPayPalProcessing) && <PayPalLoading />}
      </div>
      <CardPaymentButton
        onSubscribe={onSubscribe}
        stripeProductId={stripeProductId}
        planName={planName}
        isProcessing={isProcessing}
        isPayPalProcessing={isPayPalProcessing}
      />
    </div>
  );
};
