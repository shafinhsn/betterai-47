
import { supabase } from "@/integrations/supabase/client";
import { ProcessedDocument } from "@/types/document";
import { createPDFFromText } from "./pdf";
import { createDocxFromText } from "./docx";

export const downloadOriginalDocument = async (currentDocument: ProcessedDocument, content: string) => {
  if (!currentDocument) {
    throw new Error('No document selected for download');
  }

  try {
    const { data, error } = await supabase.storage
      .from('documents')
      .download(currentDocument.filePath);

    if (error) {
      console.error('Error downloading document:', error);
      throw new Error(`Failed to download document: ${error.message || 'Unknown error occurred'}`);
    }

    if (!data) {
      throw new Error('No data received from storage');
    }

    // Create and trigger download
    const url = URL.createObjectURL(data);
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
