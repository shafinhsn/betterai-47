
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

    let systemPrompt = 'You are a helpful document analysis assistant.';
    
    if (shouldUpdateDocument) {
      systemPrompt = 'You are a document editor. Given a document and an edit request, output ONLY the updated document content with the requested changes. Do not include any explanations or commentary.';
    }

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
          { role: 'user', content: shouldUpdateDocument ? 
            `Original document:\n${context}\n\nEdit request: ${message}` :
            `Document: ${context}\n\nQuestion: ${message}` 
          }
        ],
      }),
    });

    const data = await response.json();
    console.log('OpenAI response:', data);

    if (shouldUpdateDocument) {
      return new Response(JSON.stringify({ 
        updatedDocument: data.choices[0].message.content,
        reply: "I've updated the document based on your request. You can see the changes in the preview panel."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ 
        reply: data.choices[0].message.content 
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
