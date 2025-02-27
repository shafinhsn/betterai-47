
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
    const { citation, format } = await req.json();

    const formatInstructions = format === 'mla' 
      ? 'Create an MLA 9th edition citation. Include hanging indentation if there are multiple lines.'
      : 'Create an APA 7th edition citation. Include hanging indentation if there are multiple lines.';

    const citationPrompt = `
      Format the following citation information ${format === 'mla' ? 'in MLA style' : 'in APA style'}:
      
      Type: ${citation.type}
      Title: ${citation.title}
      ${citation.url ? `URL: ${citation.url}` : ''}
      ${citation.doi ? `DOI: ${citation.doi}` : ''}
      ${citation.isbn ? `ISBN: ${citation.isbn}` : ''}
      ${citation.publisher ? `Publisher: ${citation.publisher}` : ''}
      ${citation.publication_date ? `Publication Date: ${citation.publication_date}` : ''}
      ${citation.accessed_date ? `Access Date: ${citation.accessed_date}` : ''}
      Contributors: ${citation.contributors?.map(c => 
        `${c.first_name || ''} ${c.middle_name || ''} ${c.last_name || ''} (${c.role})`
      ).join(', ') || 'None'}

      ${formatInstructions}
      Return only the formatted citation, nothing else.
    `;

    console.log('Generating citation with format:', format);
    
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
            content: 'You are a citation expert that generates precise citations following academic style guides.' 
          },
          { 
            role: 'user', 
            content: citationPrompt 
          }
        ],
      }),
    });

    const data = await response.json();
    const generatedCitation = data.choices[0].message.content.trim();
    
    console.log('Generated citation:', generatedCitation);

    return new Response(JSON.stringify({ citation: generatedCitation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-citation function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
