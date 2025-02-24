
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
    
    console.log('Received request:', { message, preset });
    console.log('Document context:', context.substring(0, 100) + '...');

    // Construct a more specific system prompt based on the preset
    let systemPrompt = 'You are a document editing assistant. ';
    if (preset) {
      switch (preset) {
        case 'summarize':
          systemPrompt += 'Focus on creating concise summaries while maintaining key points.';
          break;
        case 'formal':
          systemPrompt += 'Ensure the language is professional and formal.';
          break;
        case 'casual':
          systemPrompt += 'Make the tone more conversational and approachable.';
          break;
        default:
          systemPrompt += 'Apply the specific style requested: ' + preset;
      }
    }
    systemPrompt += ' Analyze the request carefully and make precise edits to the document.';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt
          },
          { 
            role: 'user', 
            content: `Original document content:\n${context}\n\nUser request: ${message}\n\nProvide the updated document content if changes are needed, or explain why no changes are necessary.`
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent editing
      }),
    });

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    const aiResponse = data.choices[0].message.content;
    
    // Check if the response contains actual document changes
    if (aiResponse.includes('Original document content') || aiResponse.toLowerCase().includes('no changes')) {
      // If no changes were made, just return the explanation
      return new Response(JSON.stringify({ 
        reply: aiResponse
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // If changes were made, return both the updated document and a confirmation message
      return new Response(JSON.stringify({
        updatedDocument: aiResponse,
        reply: "I've updated the document based on your request. You can see the changes in the preview panel."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
