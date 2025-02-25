
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const formatMLA = async (content: string, metadata: Record<string, string>) => {
  const prompt = `Format this text in MLA style. Include the header with the author's name, professor's name, course name, and date. Add a title. The text should be double-spaced with 1-inch margins:

Author: ${metadata.authorName || 'Student Name'}
Professor: ${metadata.professorName || 'Professor Name'}
Course: ${metadata.courseName || 'Course Name'}
Title: ${metadata.title || 'Document Title'}

Text to format:
${content}`;

  return await useGPT(prompt);
};

const formatAPA = async (content: string, metadata: Record<string, string>) => {
  const prompt = `Format this text in APA style (7th edition). Include a title page with the author's name and institution. Add a running head and page numbers. The text should be double-spaced with 1-inch margins:

Author: ${metadata.authorName || 'Author Name'}
Institution: ${metadata.institution || 'Institution Name'}
Title: ${metadata.title || 'Document Title'}

Text to format:
${content}`;

  return await useGPT(prompt);
};

const checkGrammar = async (content: string) => {
  const prompt = `You are a professional editor. Fix any grammar, spelling, punctuation, and style errors in the text while preserving its meaning. Only return the corrected text without any explanations or comments.

Text to check:
${content}`;

  return await useGPT(prompt);
};

async function useGPT(prompt: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a professional academic writing assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  const formattedText = data.choices[0].message.content;
  return formattedText;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, action, metadata = {} } = await req.json();

    if (!content) {
      throw new Error('No content provided');
    }

    let processedContent;
    console.log(`Processing ${action} request for document...`);

    switch (action) {
      case 'grammar':
        processedContent = await checkGrammar(content);
        break;
      case 'mla':
        processedContent = await formatMLA(content, metadata);
        break;
      case 'apa':
        processedContent = await formatAPA(content, metadata);
        break;
      default:
        throw new Error('Invalid action specified');
    }

    console.log('Document processing completed successfully');
    return new Response(JSON.stringify({ content: processedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing document:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
