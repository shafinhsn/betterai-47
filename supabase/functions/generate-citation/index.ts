
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

type CitationType = 'website' | 'book' | 'journal';

interface Contributor {
  id?: string;
  citation_id?: string;
  role: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  suffix?: string;
}

interface Citation {
  id?: string;
  user_id?: string;
  type: CitationType;
  title: string;
  url?: string;
  doi?: string;
  isbn?: string;
  publisher?: string;
  publication_date?: string;
  accessed_date?: string;
  contributors?: Contributor[];
}

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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    const formatPrompt = format === 'mla' 
      ? 'Format this citation in MLA 9th edition style.'
      : 'Format this citation in APA 7th edition style.';

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

    console.log('Sending request to OpenAI with prompt:', citationPrompt);

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

    console.log('Generated citation:', formattedCitation);

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
