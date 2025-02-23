
import Stripe from 'https://esm.sh/stripe@14.21.0';

// Initialize Stripe with the secret key
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16', // Use latest API version
  httpClient: Stripe.createFetchHttpClient(), // Required for Deno
});

// Export the stripe instance
export { stripe };

// CORS headers for edge functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to construct Stripe webhook events
export const constructEventAsync = async (
  payload: string,
  sigHeader: string,
  webhookSecret: string
): Promise<Stripe.Event> => {
  return await stripe.webhooks.constructEventAsync(
    payload,
    sigHeader,
    webhookSecret
  );
};

// Export Stripe types that might be needed
export type { Stripe };
