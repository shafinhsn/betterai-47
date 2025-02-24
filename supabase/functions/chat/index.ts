
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

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

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    const configuration = new Configuration({ apiKey: openAIApiKey });
    const openai = new OpenAIApi(configuration);

    // Check if this is a style/tone change request
    const isStyleChange = preset === 'casual' || 
                         message.toLowerCase().includes('write this as') ||
                         message.toLowerCase().includes('change the tone') ||
                         message.toLowerCase().includes('make it sound');

    let systemPrompt = isStyleChange
      ? `You are an AI document assistant that modifies text to match specific styles or tones. When modifying documents:
         1. First output the COMPLETE modified text with the requested style changes
         2. Follow with "---EXPLANATION---"
         3. After the explanation marker, briefly describe how the text was modified
         4. Preserve all important information while changing only the tone/style`
      : `You are a helpful AI document assistant. When modifying documents:
         1. First output the COMPLETE modified document text with requested changes
         2. Follow that with "---EXPLANATION---"
         3. After the explanation marker, describe what changes were made
         4. Preserve all formatting and spacing in the modified document`;

    console.log('Using system prompt:', systemPrompt);

    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Original document content:\n${context}` },
        { role: 'user', content: message }
      ],
      temperature: 0.7 // Slightly higher temperature for style changes to allow more creative responses
    });

    const aiResponse = completion.data.choices[0].message.content;
    console.log('Got AI response:', aiResponse);

    if (aiResponse.includes('---EXPLANATION---')) {
      const [updatedDocument, explanation] = aiResponse.split('---EXPLANATION---').map(text => text.trim());
      console.log('Sending response with document update');
      return new Response(
        JSON.stringify({ 
          updatedDocument,
          reply: explanation || "I've updated the document's style as requested."
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
        error: 'An error occurred while processing your request. Please try again.',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
