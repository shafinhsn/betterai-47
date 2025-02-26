
import { serve } from 'https://deno.fresh.dev/server'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { citation } = await req.json()
    
    // Generate citation based on type and data
    let formattedCitation = ''
    
    if (citation.type === 'website') {
      const authors = citation.contributors
        ?.filter(c => c.role === 'author')
        .map(a => `${a.last_name}, ${a.first_name?.[0] || ''}.`)
        .join(', ') || 'n.a.'

      formattedCitation = `${authors} (${new Date(citation.publication_date).getFullYear() || 'n.d.'}). ${citation.title}. Retrieved from ${citation.url}`
    } 
    else if (citation.type === 'book') {
      const authors = citation.contributors
        ?.filter(c => c.role === 'author')
        .map(a => `${a.last_name}, ${a.first_name?.[0] || ''}.`)
        .join(' & ') || 'n.a.'

      formattedCitation = `${authors} (${new Date(citation.publication_date).getFullYear() || 'n.d.'}). ${citation.title}. ${citation.publisher}.`
    }
    else if (citation.type === 'journal') {
      const authors = citation.contributors
        ?.filter(c => c.role === 'author')
        .map(a => `${a.last_name}, ${a.first_name?.[0] || ''}.`)
        .join(', ') || 'n.a.'

      formattedCitation = `${authors} (${new Date(citation.publication_date).getFullYear() || 'n.d.'}). ${citation.title}. ${citation.publisher}. https://doi.org/${citation.doi}`
    }

    return new Response(
      JSON.stringify({ citation: formattedCitation }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
