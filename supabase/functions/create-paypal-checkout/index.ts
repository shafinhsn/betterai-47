
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

interface RequestBody {
  planId: string;
  userId: string;
  planName: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const requestData = await req.json() as RequestBody;
    const { planId, userId, planName } = requestData;

    if (!planId || !userId || !planName) {
      console.error('Missing required parameters:', { planId, userId, planName });
      throw new Error('Missing required parameters');
    }

    console.log('Creating subscription for:', { planId, userId, planName });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate a UUID for the subscription
    const subscriptionId = crypto.randomUUID();

    // Check if user exists first
    const { data: userExists, error: userCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (userCheckError || !userExists) {
      console.error('User check error:', userCheckError);
      throw new Error('User not found');
    }

    // Create a subscription record
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert([
        {
          id: subscriptionId,
          user_id: userId,
          status: 'pending',
          plan_type: planName,
          payment_processor: 'paypal',
          is_student: planName.toLowerCase().includes('student'),
          started_at: new Date().toISOString()
        }
      ]);

    if (subscriptionError) {
      console.error('Database error:', subscriptionError);
      throw new Error(`Failed to create subscription record: ${subscriptionError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        subscription_id: subscriptionId,
        status: 'success'
      }),
      { 
        status: 200, 
        headers: corsHeaders 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      }),
      { 
        status: 400, 
        headers: corsHeaders 
      }
    );
  }
});
