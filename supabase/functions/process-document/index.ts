
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as pdfjs from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/+esm'
import mammoth from 'https://esm.sh/mammoth@1.6.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Process document function called')

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse the FormData from the request
    const formData = await req.formData()
    const file = formData.get('file')

    console.log('File received:', file?.name)

    if (!file || !(file instanceof File)) {
      throw new Error('No file provided')
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate a unique file path
    const sanitizedFileName = file.name.replace(/[^\x00-\x7F]/g, '')
    const fileExt = sanitizedFileName.split('.').pop()?.toLowerCase()
    const filePath = `${crypto.randomUUID()}.${fileExt}`

    console.log('Processing file:', filePath)

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(`Failed to upload file: ${uploadError.message}`)
    }

    console.log('File uploaded successfully')

    // Extract text content based on file type
    let content = ''
    try {
      const arrayBuffer = await file.arrayBuffer()

      if (fileExt === 'pdf') {
        // Load and parse PDF
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
        const pdf = await loadingTask.promise
        
        // Extract text from all pages
        const numPages = pdf.numPages
        const textContent = []
        
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i)
          const text = await page.getTextContent()
          const pageText = text.items.map(item => item.str).join(' ')
          textContent.push(pageText)
        }
        
        content = textContent.join('\n\n')
      } else if (fileExt === 'docx') {
        // Parse DOCX document
        const result = await mammoth.extractRawText({ arrayBuffer })
        content = result.value
      } else {
        throw new Error('Unsupported file type. Only PDF and DOCX files are supported.')
      }

      // Clean up the extracted text
      content = content
        .replace(/\u0000/g, '') // Remove null bytes
        .replace(/[\uFFFD\uFFFE\uFFFF]/g, '') // Remove replacement characters
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
        .trim()

      console.log('Content extracted successfully, length:', content.length)
      console.log('First 100 characters:', content.substring(0, 100))
    } catch (error) {
      console.error('Error extracting text content:', error)
      throw new Error(`Failed to extract text content: ${error.message}`)
    }

    // Save document metadata to database
    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        filename: sanitizedFileName,
        file_path: filePath,
        content_type: file.type,
        content: content
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error(`Failed to save document metadata: ${dbError.message}`)
    }

    console.log('Document processed and saved successfully')

    // Return the processed document data
    return new Response(
      JSON.stringify({
        content,
        filePath,
        filename: sanitizedFileName
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error processing document:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
