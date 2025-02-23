
import { STUDENT_TRIAL_DAYS } from '@/constants/subscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const getFeatures = () => {
  return [
    'Unlimited messages',
    `${STUDENT_TRIAL_DAYS}-day free trial`,
    'Advanced document editing',
    'Citation generation',
    'Academic formatting (APA, MLA)',
    'Essay structure improvements',
    'Smart formatting',
    'Email support',
    '150 messages per day'
  ];
};

export const handleSubscribe = async (productId: string, planName: string): Promise<string> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Please sign in to subscribe');
    }

    console.log('Creating subscription for:', { productId, planName, userId: user.id });

    const response = await supabase.functions.invoke('create-paypal-checkout', {
      body: {
        planId: productId,
        userId: user.id,
        planName: planName
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.error) {
      console.error('Checkout error:', response.error);
      throw new Error(response.error.message || 'Failed to create subscription');
    }

    if (!response.data?.subscription_id) {
      console.error('No subscription ID returned', response.data);
      throw new Error('Failed to create subscription: Invalid response from server');
    }

    console.log('Created subscription:', response.data.subscription_id);
    return response.data.subscription_id;
  } catch (error: any) {
    console.error('Subscription error:', error);
    const errorMessage = error.message || 'Unknown error occurred';
    toast.error('Failed to start checkout: ' + errorMessage);
    throw error;
  }
};

export const handleManageSubscription = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      toast.error('Please sign in to manage your subscription');
      return null;
    }

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (subError) {
      throw subError;
    }

    if (!subscription?.payment_subscription_id) {
      toast.error('No active subscription found');
      return null;
    }
      
    const paypalDomain = process.env.NODE_ENV === 'production' ? 
      'https://www.paypal.com' : 
      'https://www.sandbox.paypal.com';
      
    return `${paypalDomain}/myaccount/autopay`;
  } catch (error: any) {
    console.error('Portal session error:', error);
    toast.error('Failed to open subscription portal: ' + (error.message || 'Unknown error occurred'));
    return null;
  }
};
