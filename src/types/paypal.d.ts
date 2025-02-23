
interface PayPalButtonStyle {
  shape?: 'rect' | 'pill';
  color?: 'gold' | 'blue' | 'silver' | 'black' | 'white';
  layout?: 'vertical' | 'horizontal';
  label?: 'paypal' | 'checkout' | 'buynow' | 'pay' | 'subscribe';
  height?: number;
}

interface PayPalButtons {
  render: (element: HTMLElement) => Promise<void>;
  close: () => void;
}

interface PayPalNamespace {
  Buttons: (config: {
    style?: PayPalButtonStyle;
    createSubscription: () => Promise<string>;
    onApprove: (data: any) => void;
    onError: (error: Error) => void;
    onCancel?: () => void;
  }) => PayPalButtons;
}

declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}

