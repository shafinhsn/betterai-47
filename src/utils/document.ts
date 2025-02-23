
import { supabase } from "@/integrations/supabase/client";
import { ProcessedDocument } from "@/types/document";
import { createPDFFromText } from "./pdf";
import { createDocxFromText } from "./docx";

export const downloadOriginalDocument = async (currentDocument: ProcessedDocument, content: string) => {
  if (currentDocument.fileType === 'application/pdf') {
    // For PDF files, download directly from storage
    const { data, error } = await supabase.storage
      .from('documents')
      .download(currentDocument.filePath);

    if (error) throw error;

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentDocument.filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } else {
    // For DOCX files, generate new document
    const docxBuffer = await createDocxFromText(content);
    const blob = new Blob([docxBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentDocument.filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};

export const downloadUpdatedDocument = async (content: string, filename: string, fileType: string) => {
  if (fileType === 'application/pdf') {
    // Generate PDF for PDF files
    const pdfBytes = await createPDFFromText(content);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace(/\.[^/.]+$/, '')}_updated.pdf`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } else {
    // Generate new DOCX for Word documents
    const docxBuffer = await createDocxFromText(content);
    const blob = new Blob([docxBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace(/\.[^/.]+$/, '')}_updated.docx`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};
