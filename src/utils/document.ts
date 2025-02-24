
import { ProcessedDocument } from "@/types/document";
import { createPDFFromText } from "./pdf";
import { createDocxFromText } from "./docx";

export const downloadOriginalDocument = async (currentDocument: ProcessedDocument, content: string) => {
  if (!currentDocument) {
    throw new Error('No document selected for download');
  }
  
  try {
    // Check if the filePath is a valid URL
    let url: string;
    try {
      url = currentDocument.filePath;
      new URL(url); // This will throw if the URL is invalid
    } catch {
      throw new Error('Invalid file path');
    }

    // Create new fetch request with proper error handling
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download document: HTTP error ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = currentDocument.filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
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
      // Now createDocxFromText returns a Blob directly
      blob = await createDocxFromText(content);
    }

    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${filename.replace(/\.[^/.]+$/, '')}_updated.${fileType === 'application/pdf' ? 'pdf' : 'docx'}`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error generating document:', error);
    throw error;
  }
};
