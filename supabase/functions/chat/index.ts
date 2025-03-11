
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { message, context, preset, requestType, requestDetails } = await req.json();
    console.log('Received request:', { message, preset, requestType });
    console.log('Current document context:', context);
    
    if (requestDetails && requestDetails.originalContent) {
      console.log('Original document content provided');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    // Check if this is a style/tone change request
    const isStyleChange = preset === 'casual' || 
                         message.toLowerCase().includes('write this as') ||
                         message.toLowerCase().includes('change the tone') ||
                         message.toLowerCase().includes('make it sound');

    let systemPrompt = isStyleChange
      ? `You are an AI document assistant that modifies text to match specific styles or tones. When modifying documents:
         1. First output the COMPLETE modified text with the requested style changes, using the most recent document state as the starting point
         2. Follow with "---EXPLANATION---"
         3. After the explanation marker, briefly describe how the text was modified
         4. Always build upon the previous changes - do not revert to the original document
         5. Preserve all formatting and important information while changing only the tone/style`
      : `You are a helpful AI document assistant. When modifying documents:
         1. First output the COMPLETE modified document text with requested changes, using the most recent document state as the starting point
         2. Follow that with "---EXPLANATION---"
         3. After the explanation marker, describe what changes were made
         4. Always build upon the previous changes - do not revert to the original document
         5. Preserve all formatting and spacing in the modified document
         6. IMPORTANT: Make sure to use the most recent document state (context) as your starting point, NOT the original document`;

    console.log('Using system prompt:', systemPrompt);

    // Add an example to help clarify the expectation
    const exampleContext = `
When working with documents, always modify the current document state.

Example:
Original: "This is a long document with many sentences. It has multiple paragraphs. Each paragraph has its own theme."
User request 1: "Keep only the first sentence"
Response 1: "This is a long document with many sentences."
User request 2: "Add a sentence about documents being important"
Response 2: "This is a long document with many sentences. Documents are very important for communication."

Notice how the second response builds upon the first modification, not the original text.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'system', content: exampleContext },
          { role: 'user', content: `Current document state:\n${context}` },
          { role: 'user', content: message }
        ],
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    console.log('Got AI response:', aiResponse);

    if (aiResponse.includes('---EXPLANATION---')) {
      const [updatedDocument, explanation] = aiResponse.split('---EXPLANATION---').map(text => text.trim());
      console.log('Sending response with document update');
      return new Response(
        JSON.stringify({ 
          updatedDocument,
          reply: explanation || "I've updated the document based on your request."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If no document update was made, just return the reply
    console.log('Sending response without document update');
    return new Response(
      JSON.stringify({ reply: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

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
