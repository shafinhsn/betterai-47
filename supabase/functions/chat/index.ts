
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, shouldUpdateDocument } = await req.json();
    
    console.log('Received request:', { message, shouldUpdateDocument });
    console.log('Document context:', context.substring(0, 100) + '...');

    // Choose appropriate system prompt based on request type
    const systemPrompt = shouldUpdateDocument
      ? 'You are a document editor. Your task is to update the given document based on the user\'s request. Output ONLY the modified document content without any explanations or commentary.'
      : 'You are a helpful document analysis assistant.';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: shouldUpdateDocument 
            ? `Original document:\n${context}\n\nEdit request: ${message}` 
            : `Document: ${context}\n\nQuestion: ${message}`
          }
        ],
        temperature: shouldUpdateDocument ? 0.3 : 0.7, // Lower temperature for more precise edits
      }),
    });

    const data = await response.json();
    console.log('OpenAI response:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    const aiReply = data.choices[0].message.content;

    if (shouldUpdateDocument) {
      return new Response(JSON.stringify({
        updatedDocument: aiReply,
        reply: "I've updated the document based on your request. You can see the changes in the preview panel."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({
        reply: aiReply
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
