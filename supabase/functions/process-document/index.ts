
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as mammoth from 'https://esm.sh/mammoth@1.6.0'
import { parse as parsePdf } from 'https://deno.land/x/pdfparser@v1.0.3/mod.ts'

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

    console.log('Processing file:', file.name, 'Type:', file.type);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const fileBuffer = await file.arrayBuffer()
    const fileType = file.type
    let extractedText = ''

    if (fileType === 'application/pdf') {
      console.log('Processing PDF file');
      try {
        const pdfData = new Uint8Array(fileBuffer);
        const result = await parsePdf(pdfData);
        extractedText = result.text;
        console.log('PDF processed successfully, text length:', extractedText.length);
      } catch (pdfError) {
        console.error('PDF processing error:', pdfError);
        throw new Error(`Failed to process PDF: ${pdfError.message}`);
      }
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      console.log('Processing DOCX file');
      try {
        const result = await mammoth.extractRawText({ arrayBuffer: fileBuffer });
        extractedText = result.value;
      } catch (docxError) {
        console.error('DOCX processing error:', docxError);
        throw new Error(`Failed to process DOCX: ${docxError.message}`);
      }
    } else {
      throw new Error('Unsupported file type')
    }

    const sanitizedFileName = file.name.replace(/[^\x00-\x7F]/g, '')
    const fileExt = sanitizedFileName.split('.').pop()
    const filePath = `${crypto.randomUUID()}.${fileExt}`

    console.log('Uploading file to storage:', filePath);

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError
    }

    console.log('File uploaded successfully');

    // Clean and normalize the extracted text
    const cleanedText = extractedText
      .replace(/\u0000/g, '') // Remove null characters
      .replace(/[\uFFFD\uFFFE\uFFFF]/g, '') // Remove replacement characters
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ') // Replace non-printable characters with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    console.log('Text extraction completed, length:', cleanedText.length);

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
    console.error('Error processing document:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
