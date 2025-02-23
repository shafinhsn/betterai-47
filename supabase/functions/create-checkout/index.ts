
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { corsHeaders } from '../_shared/cors.ts';
import { stripe } from '../_shared/stripe.ts';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    const { productId, email, userId } = await req.json();

    if (!productId || !email || !userId) {
      throw new Error('Missing required fields');
    }

    // Get the product from Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: product, error: productError } = await supabaseClient
      .from('stripe_products')
      .select('stripe_price_id')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      throw new Error('Product not found');
    }

    // Create or get customer
    const { data: customer } = await supabaseClient
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', userId)
      .maybeSingle();

    let stripeCustomerId = customer?.stripe_customer_id;

    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email,
        metadata: {
          supabaseUUID: userId,
        },
      });
      stripeCustomerId = stripeCustomer.id;

      // Update the customer in Supabase
      await supabaseClient
        .from('customers')
        .upsert({
          id: userId,
          stripe_customer_id: stripeCustomerId,
          email,
        });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: product.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/subscription?success=true`,
      cancel_url: `${req.headers.get('origin')}/subscription?success=false`,
      subscription_data: {
        metadata: {
          supabaseUUID: userId,
        },
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
