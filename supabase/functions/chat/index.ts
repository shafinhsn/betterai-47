
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

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    const configuration = new Configuration({ apiKey: openAIApiKey });
    const openai = new OpenAIApi(configuration);

    const isDocumentModification = message.toLowerCase().includes('add') ||
                                 message.toLowerCase().includes('remove') ||
                                 message.toLowerCase().includes('change') ||
                                 message.toLowerCase().includes('format') ||
                                 message.toLowerCase().includes('update') ||
                                 message.toLowerCase().includes('modify') ||
                                 message.toLowerCase().includes('rewrite');

    const systemPrompt = isDocumentModification 
      ? `You are an AI document assistant. When modifying documents:
         1. First output the COMPLETE modified document text with requested changes
         2. Follow that with "---EXPLANATION---"
         3. After the explanation marker, describe what changes were made
         4. Preserve all formatting and spacing in the modified document`
      : `You are a helpful AI document assistant. Provide clear explanations about the document without modifying it.`;

    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Original document content:\n${context}` },
        { role: 'user', content: message }
      ],
      temperature: 0.3
    });

    const aiResponse = completion.data.choices[0].message.content;

    if (isDocumentModification) {
      const [updatedDocument, explanation] = aiResponse.split('---EXPLANATION---').map(text => text.trim());
      return new Response(
        JSON.stringify({ 
          updatedDocument,
          reply: explanation || "I've updated the document as requested."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ reply: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
