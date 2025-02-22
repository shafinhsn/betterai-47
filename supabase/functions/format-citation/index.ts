
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

interface Source {
  link: string
  title: string
  author?: string
  publishDate?: string
}

interface RequestBody {
  text: string
  style: string
  sources: Source[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, style, sources } = await req.json() as RequestBody

    let formattedText = text
    let sourcesPage = ''

    const formatDate = (dateString?: string) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    }

    switch (style) {
      case 'apa':
        sourcesPage = '\n\nReferences\n\n'
        sources.forEach((source) => {
          const author = source.author ? `${source.author}. ` : ''
          const date = source.publishDate ? `(${formatDate(source.publishDate)}). ` : ''
          const citation = `${author}${date}${source.title}. Retrieved from ${source.link}`
          sourcesPage += `${citation}\n`
        })
        break

      case 'mla':
        sourcesPage = '\n\nWorks Cited\n\n'
        sources.forEach((source) => {
          const author = source.author ? `${source.author}. ` : ''
          const date = source.publishDate ? `${formatDate(source.publishDate)}. ` : ''
          const citation = `${author}"${source.title}." ${date}Web. ${source.link}`
          sourcesPage += `${citation}\n`
        })
        break

      case 'chicago':
        sourcesPage = '\n\nBibliography\n\n'
        sources.forEach((source) => {
          const author = source.author ? `${source.author}. ` : ''
          const date = source.publishDate ? `${formatDate(source.publishDate)}. ` : ''
          const citation = `${author}"${source.title}." ${date}Accessed online at ${source.link}`
          sourcesPage += `${citation}\n`
        })
        break

      case 'harvard':
        sourcesPage = '\n\nReference List\n\n'
        sources.forEach((source) => {
          const author = source.author ? `${source.author} ` : ''
          const year = source.publishDate ? `(${new Date(source.publishDate).getFullYear()}) ` : ''
          const citation = `${author}${year}'${source.title}', Available at: ${source.link}`
          sourcesPage += `${citation}\n`
        })
        break

      default:
        sourcesPage = '\n\nSources\n\n'
        sources.forEach((source) => {
          sourcesPage += `${source.title}: ${source.link}\n`
        })
    }

    // Format the sources page with proper indentation
    sourcesPage = sourcesPage.split('\n').map((line, index) => {
      if (index === 0 || line.trim() === '') return line
      if (line.includes('References') || line.includes('Works Cited') || 
          line.includes('Bibliography') || line.includes('Reference List') || 
          line.includes('Sources')) return line
      return '    ' + line // Add proper indentation for citation entries
    }).join('\n')

    return new Response(
      JSON.stringify({
        formattedText,
        sourcesPage
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    )
  }
})
