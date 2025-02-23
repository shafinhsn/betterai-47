
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

  const { isLoading, scriptLoaded } = usePayPalScript({
    clientId: 'Adj5TaOdSl2VqQgMJNt-en40d2bpOokFgrRqHsVeda7hIOMnNZXgN30newF-Mx8yc-utVNfbyprNNoXe',
    onError: (error) => {
      console.error('PayPal script error:', error);
      if (error.message?.includes('blocked') || error.message?.includes('cookie')) {
        console.log('Cookies are blocked - showing alert');
        setCookiesBlocked(true);
      } else {
        setLoadError(error.message);
        toast.error('Failed to load PayPal: ' + error.message);
      }
    }
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
        Error: {loadError}. Please try refreshing the page or check your connection.
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

