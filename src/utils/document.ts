
import { supabase } from "@/integrations/supabase/client";
import { ProcessedDocument } from "@/types/document";
import { createPDFFromText } from "./pdf";
import { createDocxFromText } from "./docx";

export const downloadOriginalDocument = async (currentDocument: ProcessedDocument, content: string) => {
  if (!currentDocument) {
    throw new Error('No document selected for download');
  }

  try {
    // Get signed URL for download
    const { data: { signedUrl }, error: signedUrlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(currentDocument.filePath, 60); // URL valid for 60 seconds

    if (signedUrlError || !signedUrl) {
      console.error('Error getting signed URL:', signedUrlError);
      throw new Error(`Failed to get download URL: ${signedUrlError?.message || 'Unknown error occurred'}`);
    }

    // Fetch the file using the signed URL
    const response = await fetch(signedUrl);
    if (!response.ok) {
      throw new Error(`Failed to download document: HTTP error ${response.status}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentDocument.filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
  } catch (error) {
    console.error('Error in downloadOriginalDocument:', error);
    throw error;
  }
};

export const downloadUpdatedDocument = async (content: string, filename: string, fileType: string) => {
  if (!content) {
    throw new Error('No content provided for download');
  }

  try {
    let blob;
    if (fileType === 'application/pdf') {
      const pdfBytes = await createPDFFromText(content);
      blob = new Blob([pdfBytes], { type: 'application/pdf' });
    } else {
      const docxBytes = await createDocxFromText(content);
      blob = new Blob([docxBytes], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
    }

    // Create and trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace(/\.[^/.]+$/, '')}_updated.${fileType === 'application/pdf' ? 'pdf' : 'docx'}`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
  } catch (error) {
    console.error('Error generating document:', error);
    throw error;
  }
};
