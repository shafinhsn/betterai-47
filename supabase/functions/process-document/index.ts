
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    const fileExt = sanitizedFileName.split('.').pop()
    const filePath = `${crypto.randomUUID()}.${fileExt}`

    console.log('Uploading file:', filePath)

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

    // Read and process the file content
    let content = ''
    try {
      // Read the file content
      const arrayBuffer = await file.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)
      
      // Use TextDecoder to properly decode the content
      const decoder = new TextDecoder('utf-8')
      content = decoder.decode(buffer)
      
      // Basic text cleanup
      content = content
        .replace(/\u0000/g, '') // Remove null bytes
        .replace(/[\uFFFD\uFFFE\uFFFF]/g, '') // Remove replacement characters and BOM
        .replace(/\r\n/g, '\n') // Normalize line endings
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
