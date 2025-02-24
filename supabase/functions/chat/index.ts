
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
    let systemPrompt = 'You are a document editing assistant. Only output the exact modified content without any explanatory text or messages. ';
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
    systemPrompt += ' Return ONLY the modified content exactly as it should appear, with no additional text or explanations.';

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
            content: `Document content:\n${context}\n\nUser request: ${message}\n\nProvide ONLY the modified content with no explanatory text.`
          }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    const aiResponse = data.choices[0].message.content.trim();
    
    // Check if the response is an explanation rather than content
    if (aiResponse.toLowerCase().includes('no changes needed') || 
        aiResponse.toLowerCase().includes('original document') ||
        aiResponse.toLowerCase().includes('here is') ||
        aiResponse.toLowerCase().includes('the rest of')) {
      // If it's an explanation, return it as a reply only
      return new Response(JSON.stringify({ 
        reply: "I'll keep the document as is. No changes were necessary."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // If it's actual content changes, return them
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
