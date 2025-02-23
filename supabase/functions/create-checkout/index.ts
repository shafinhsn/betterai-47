
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { stripe } from '../_shared/stripe.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planType, email, userId, productId } = await req.json();
    
    if (!planType || !email || !userId || !productId) {
      console.error('Missing required fields:', { planType, email, userId, productId });
      throw new Error('Missing required fields');
    }

    console.log('Creating checkout session for:', { planType, email, userId, productId });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get product details from Supabase
    const { data: product, error: productError } = await supabase
      .from('stripe_products')
      .select('*')
      .eq('stripe_product_id', productId)
      .single();

    if (productError || !product) {
      console.error('Error fetching product:', productError);
      throw new Error(`Product not found: ${productId}`);
    }

    console.log('Found product:', product);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price: product.stripe_price_id,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/`,
      cancel_url: `${req.headers.get('origin')}/subscription`,
      client_reference_id: userId,
      metadata: {
        supabase_user_id: userId,
        plan_type: planType
      }
    });

    if (!session?.url) {
      console.error('No URL returned from Stripe session');
      throw new Error('Failed to create checkout session');
    }

    console.log('Checkout session created:', session.id);
    
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error in create-checkout:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
