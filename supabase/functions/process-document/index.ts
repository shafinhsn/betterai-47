
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      throw new Error('No file uploaded')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Extract text based on file type
    const fileBuffer = await file.arrayBuffer()
    const fileType = file.type
    let extractedText = ''

    if (fileType === 'application/pdf') {
      // Handle PDF files
      const pdfDoc = await PDFDocument.load(fileBuffer)
      const pages = pdfDoc.getPages()
      extractedText = (await Promise.all(
        pages.map(async (page) => {
          const text = await page.getText()
          return text
        })
      )).join('\n\n')
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Handle DOCX files
      const textDecoder = new TextDecoder('utf-8')
      extractedText = textDecoder.decode(fileBuffer)
    } else {
      throw new Error('Unsupported file type')
    }

    // Sanitize filename and create storage path
    const sanitizedFileName = file.name.replace(/[^\x00-\x7F]/g, '')
    const fileExt = sanitizedFileName.split('.').pop()
    const filePath = `${crypto.randomUUID()}.${fileExt}`

    // Upload original file to storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      throw uploadError
    }

    const content = extractedText.trim()

    return new Response(
      JSON.stringify({
        content,
        filePath,
        filename: sanitizedFileName,
        fileType
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
