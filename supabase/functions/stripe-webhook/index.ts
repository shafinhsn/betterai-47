
import { serve } from "https://deno.fresh.dev/std@v1/http/server.ts";
import { stripeWebhook, handleSubscriptionChange } from "../_shared/stripe-webhook.ts";

serve(async (req) => {
  try {
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      return new Response("No signature", { status: 400 });
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }

    const event = stripeWebhook.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log(`Processing stripe:${event.type}`);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        await handleSubscriptionChange(subscription);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
