
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Citation } from '../_shared/types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { citation, format } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    const formatPrompt = format === 'mla' 
      ? 'Format this citation in MLA style.'
      : 'Format this citation in APA style.';

    const citationPrompt = `
      Here's the citation information:
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

      ${formatPrompt}
      Return only the formatted citation, nothing else.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a citation formatting assistant. Format citations accurately in the requested style.' },
          { role: 'user', content: citationPrompt }
        ],
      }),
    });

    const data = await response.json();
    const formattedCitation = data.choices[0].message.content.trim();

    return new Response(JSON.stringify({ citation: formattedCitation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating citation:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
