
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { stripe } from '../_shared/stripe.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planType, email, userId } = await req.json();
    
    if (!planType || !email || !userId) {
      console.error('Missing required fields:', { planType, email, userId });
      throw new Error('Missing required fields');
    }

    console.log(`Creating checkout session for user ${userId} with plan ${planType}`);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get product and price info from Supabase
    const { data: products, error: productsError } = await supabase
      .from('stripe_products')
      .select('*')
      .eq('name', planType === 'student' ? 'Student Plan' : 'Business Pro Plan')
      .single();

    if (productsError || !products) {
      console.error('Error fetching product:', productsError);
      throw new Error(`Failed to fetch product for plan type: ${planType}`);
    }

    console.log('Found product:', products);

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [{ price: products.stripe_price_id, quantity: 1 }],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/`,
      cancel_url: `${req.headers.get('origin')}/`,
      client_reference_id: userId,
      metadata: {
        supabase_user_id: userId
      }
    });

    if (!session.url) {
      console.error('No URL returned from Stripe session:', session);
      throw new Error('No checkout URL returned from Stripe');
    }

    console.log('Checkout session created successfully:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
