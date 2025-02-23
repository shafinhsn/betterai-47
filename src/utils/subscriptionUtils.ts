
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

export const handleSubscribe = async (productId: string, planName: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to subscribe');
      return '/auth';
    }

    console.log('Looking up product with ID:', productId);

    // Get the specific product
    const { data: product, error: productError } = await supabase
      .from('stripe_products')
      .select('*')
      .eq('stripe_product_id', productId)
      .maybeSingle();

    if (productError) {
      console.error('Product lookup error:', productError);
      throw new Error('Error looking up product');
    }

    if (!product) {
      console.error('Product not found for ID:', productId);
      throw new Error('Product not found in database');
    }

    console.log('Found product:', product);
    console.log('Creating checkout for:', { 
      planName, 
      productId: product.stripe_product_id, 
      email: user.email, 
      userId: user.id 
    });

    const { data: { url }, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        planType: 'student',
        productId: product.stripe_product_id,
        email: user.email,
        userId: user.id
      }
    });

    if (error) {
      console.error('Checkout error:', error);
      throw error;
    }

    if (!url) {
      console.error('No checkout URL returned');
      throw new Error('No checkout URL returned');
    }

    console.log('Redirecting to checkout URL:', url);
    return url;
  } catch (error: any) {
    console.error('Subscription error:', error);
    toast.error('Failed to start checkout: ' + (error.message || 'Unknown error occurred'));
    return null;
  }
};

export const handleManageSubscription = async () => {
  try {
    const { data: { url }, error } = await supabase.functions.invoke('create-portal-session', {});
    if (error) throw error;
    if (!url) throw new Error('No portal URL returned');
    return url;
  } catch (error: any) {
    console.error('Portal session error:', error);
    toast.error('Failed to open subscription portal: ' + (error.message || 'Unknown error occurred'));
    return null;
  }
};
