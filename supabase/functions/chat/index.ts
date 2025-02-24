
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, preset } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    console.log('Processing chat request with message:', message);
    console.log('Current document context:', context);

    // If the message indicates a document transformation
    const isTransformRequest = message.toLowerCase().includes('write') || 
                             message.toLowerCase().includes('rewrite') || 
                             message.toLowerCase().includes('transform') ||
                             message.toLowerCase().includes('change');

    let systemPrompt = `You are a helpful AI document assistant. `;
    
    if (isTransformRequest) {
      systemPrompt += `When asked to modify text, you should:
      1. Preserve all paragraph breaks using \n\n between paragraphs
      2. Output ONLY the modified text without any additional comments or explanations
      3. Never include phrases like "Here's the text written..." or "I've modified the text..."
      4. Return the transformed text exactly as requested, maintaining the original structure
      5. Preserve any existing spacing and formatting patterns`;
    } else {
      systemPrompt += `Provide helpful responses about the document and explain your changes clearly.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Original text: "${context}"` },
          { role: 'user', content: message }
        ],
        temperature: 0.3 // Lower temperature for more consistent outputs
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    console.log('AI Response:', aiResponse);

    if (isTransformRequest) {
      return new Response(
        JSON.stringify({ 
          updatedDocument: aiResponse,
          reply: "I've transformed the document as requested. You can see the changes in the preview."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ reply: aiResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred while processing your request.',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
