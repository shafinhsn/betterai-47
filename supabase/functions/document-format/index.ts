
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const formatMLA = (content: string, metadata: any) => {
  const date = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  return `${metadata.authorName || 'Student Name'}\n${metadata.professorName || 'Professor Name'}\n${metadata.courseName || 'Course Name'}\n${date}\n\n${metadata.title || 'Title'}\n\n${content}`;
};

const formatAPA = (content: string, metadata: any) => {
  return `Running head: ${metadata.title?.toUpperCase() || 'TITLE'}\n\n${metadata.title || 'Title'}\n\n${metadata.authorName || 'Author Name'}\n${metadata.institution || 'Institution'}\n\nAbstract\n\n${content}`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, action, metadata } = await req.json();

    if (action === 'grammar') {
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
              content: 'You are a professional editor. Fix any grammar, spelling, and punctuation errors in the text while preserving its meaning. Only return the corrected text without any explanations.'
            },
            { role: 'user', content }
          ],
        }),
      });

      const data = await response.json();
      const correctedText = data.choices[0].message.content;

      return new Response(JSON.stringify({ content: correctedText }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (action === 'mla') {
      const formattedContent = formatMLA(content, metadata);
      return new Response(JSON.stringify({ content: formattedContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (action === 'apa') {
      const formattedContent = formatAPA(content, metadata);
      return new Response(JSON.stringify({ content: formattedContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action specified');
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
