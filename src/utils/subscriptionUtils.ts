
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to subscribe');
      return Promise.reject('User not authenticated');
    }

    console.log('Creating subscription for:', { productId, planName, userId: user.id });

    const { data, error } = await supabase.functions.invoke('create-paypal-checkout', {
      body: {
        planId: productId,
        userId: user.id,
        planName: planName
      }
    });

    if (error) {
      console.error('Checkout error:', error);
      throw error;
    }

    if (!data?.subscription_id) {
      console.error('No subscription ID returned', data);
      throw new Error('Failed to create subscription');
    }

    console.log('Created subscription with ID:', data.subscription_id);
    return data.subscription_id;
  } catch (error: any) {
    console.error('Subscription error:', error);
    toast.error('Failed to start checkout: ' + (error.message || 'Unknown error occurred'));
    throw error;
  }
};

export const handleManageSubscription = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to manage your subscription');
      return null;
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

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
