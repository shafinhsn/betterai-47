
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as pdfjsLib from 'https://cdn.skypack.dev/pdfjs-dist@3.11.174/build/pdf.min.js'
import * as mammoth from 'https://esm.sh/mammoth@1.6.0'

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

    const fileBuffer = await file.arrayBuffer()
    const fileType = file.type
    let extractedText = ''

    if (fileType === 'application/pdf') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.skypack.dev/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
      const loadingTask = pdfjsLib.getDocument({ data: fileBuffer });
      const pdf = await loadingTask.promise;
      
      const textContent = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        textContent.push(pageText);
      }
      extractedText = textContent.join('\n\n');
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ arrayBuffer: fileBuffer });
      extractedText = result.value;
    } else {
      throw new Error('Unsupported file type')
    }

    // Sanitize filename and create storage path
    const sanitizedFileName = file.name.replace(/[^\x00-\x7F]/g, '')
    const fileExt = sanitizedFileName.split('.').pop()
    const filePath = `${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      throw uploadError
    }

    // Clean the extracted text and ensure it's properly encoded
    const cleanedText = extractedText
      .replace(/\u0000/g, '') // Remove null characters
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ') // Replace non-printable characters with spaces
      .trim();

    return new Response(
      JSON.stringify({
        content: cleanedText,
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
    console.error('Error processing document:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
