
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { stripe } from '../_shared/stripe.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { planType, email, userId } = await req.json();
    
    if (!planType || !email || !userId) {
      console.error('Missing required fields:', { planType, email, userId });
      throw new Error('Missing required fields');
    }

    console.log(`Creating checkout session for user ${userId} with plan ${planType}`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get or create Stripe customer
    let { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', userId)
      .maybeSingle();

    if (customerError) {
      console.error('Error fetching customer:', customerError);
      throw new Error('Failed to fetch customer data');
    }

    let stripeCustomerId = customerData?.stripe_customer_id;

    if (!stripeCustomerId) {
      console.log('Creating new Stripe customer for:', email);
      const customer = await stripe.customers.create({ email });
      stripeCustomerId = customer.id;

      const { error: updateError } = await supabase
        .from('customers')
        .upsert({ 
          id: userId,
          email,
          stripe_customer_id: stripeCustomerId 
        });

      if (updateError) {
        console.error('Error updating customer:', updateError);
        throw new Error('Failed to update customer data');
      }
    }

    const priceId = planType === 'student' 
      ? Deno.env.get('STRIPE_STUDENT_PRICE_ID')
      : Deno.env.get('STRIPE_BUSINESS_PRICE_ID');

    if (!priceId) {
      console.error('Missing price ID for plan type:', planType);
      throw new Error(`Invalid price ID for plan type: ${planType}`);
    }

    console.log(`Creating checkout session with price ID ${priceId}`);
    
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/`,
      cancel_url: `${req.headers.get('origin')}/`,
      automatic_tax: { enabled: true },
      client_reference_id: userId
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
