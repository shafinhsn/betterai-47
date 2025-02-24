
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1'

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
    const { message, context, preset } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    const configuration = new Configuration({ apiKey: openAIApiKey });
    const openai = new OpenAIApi(configuration);

    const isTransformRequest = message.toLowerCase().includes('write') || 
                             message.toLowerCase().includes('rewrite') || 
                             message.toLowerCase().includes('transform') ||
                             message.toLowerCase().includes('change') ||
                             message.toLowerCase().includes('update') ||
                             message.toLowerCase().includes('modify') ||
                             message.toLowerCase().includes('edit') ||
                             message.toLowerCase().includes('delete');

    let systemPrompt = `You are a helpful AI document assistant. `;
    
    if (isTransformRequest) {
      systemPrompt += `When modifying documents, follow these rules:
      1. Only transform the text as requested
      2. Output the modified text
      3. After the modified text, add "---EXPLANATION---" followed by a brief explanation of what was changed
      4. Preserve any existing spacing and formatting patterns`;
    } else {
      systemPrompt += `Provide helpful responses about the document and explain your changes clearly.`;
    }

    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Original text: "${context}"` },
        { role: 'user', content: message }
      ],
      temperature: 0.3
    });

    const aiResponse = completion.data.choices[0].message.content;

    if (isTransformRequest) {
      // Split the response into document update and explanation
      const [updatedDocument, explanation] = aiResponse.split('---EXPLANATION---');
      
      return new Response(
        JSON.stringify({ 
          updatedDocument: updatedDocument.trim(),
          reply: explanation ? explanation.trim() : "I've updated the document based on your request."
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
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

