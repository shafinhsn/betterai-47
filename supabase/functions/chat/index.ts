
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

    // Construct a system prompt that emphasizes exact modifications
    let systemPrompt = 'You are a document editing assistant. You must follow these rules strictly:\n';
    systemPrompt += '1. Only return the exact content that should remain in the document\n';
    systemPrompt += '2. Do not include any explanatory text or messages\n';
    systemPrompt += '3. Do not preserve any content that should be removed\n';
    systemPrompt += '4. Make sure your response contains ONLY the final document content\n';
    
    if (preset) {
      switch (preset) {
        case 'summarize':
          systemPrompt += '5. Focus on creating concise summaries while maintaining key points\n';
          break;
        case 'formal':
          systemPrompt += '5. Ensure the language is professional and formal\n';
          break;
        case 'casual':
          systemPrompt += '5. Make the tone more conversational and approachable\n';
          break;
        default:
          systemPrompt += `5. Apply the specific style requested: ${preset}\n`;
      }
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
          { 
            role: 'system', 
            content: systemPrompt
          },
          { 
            role: 'user', 
            content: `Current document content:\n${context}\n\nUser request: ${message}\n\nProvide ONLY the content that should remain in the document, exactly as it should appear. Do not include any explanations or additional text.`
          }
        ],
        temperature: 0.1, // Using a lower temperature for more precise output
      }),
    });

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    const aiResponse = data.choices[0].message.content.trim();
    
    // If the response looks like an explanation rather than content, handle it differently
    if (aiResponse.toLowerCase().includes('no changes needed') || 
        aiResponse.toLowerCase().includes('original document') ||
        aiResponse.toLowerCase().includes('here is') ||
        aiResponse.toLowerCase().includes('i have') ||
        aiResponse.includes('```')) {
      return new Response(JSON.stringify({ 
        reply: "I'll keep the document as is. No changes were necessary."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return the modified content and a chat message
    return new Response(JSON.stringify({
      updatedDocument: aiResponse,
      reply: "I've updated the document based on your request. You can see the changes in the preview panel."
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
