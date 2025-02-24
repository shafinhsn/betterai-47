
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    
    console.log('Processing request:', { message, preset });
    console.log('Current document context:', context.substring(0, 100) + '...');

    // Construct system prompt that demands exact document modifications
    let systemPrompt = `You are a document editing assistant. Follow these instructions precisely:

1. If the user requests ANY modifications to the document:
   - Return ONLY the complete modified document content
   - Do not include ANY explanatory text or messages
   - Make EXACTLY the changes requested, nothing more or less
   - Ensure the entire document content is returned, not just the modified section

2. If the user asks a question or requests information WITHOUT asking for document changes:
   - Provide a clear, informative response
   - Do not modify or return the document content

3. NEVER mix document modifications with explanatory text
   - Either return the modified document OR a response, never both
   - If returning modified content, it must be the complete document with changes`;

    if (preset) {
      systemPrompt += `\n\n4. Apply the following style preset: ${preset}`;
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
          { 
            role: 'system', 
            content: systemPrompt
          },
          { 
            role: 'user', 
            content: `Current document content:\n\n${context}\n\nUser request: ${message}`
          }
        ],
        temperature: 0.1, // Using low temperature for more precise output
      }),
    });

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    const aiResponse = data.choices[0].message.content.trim();
    
    // If the response looks like an explanation rather than document content
    if (aiResponse.toLowerCase().includes('i ') || 
        aiResponse.toLowerCase().includes('the ') ||
        aiResponse.toLowerCase().includes('here') ||
        aiResponse.toLowerCase().includes('will') ||
        aiResponse.includes('```')) {
      // This is a response message, not document content
      return new Response(JSON.stringify({ 
        reply: aiResponse 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If we get here, assume the response is modified document content
    return new Response(JSON.stringify({
      updatedDocument: aiResponse
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process your request. Please try again.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
