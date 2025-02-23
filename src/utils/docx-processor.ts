
import mammoth from 'mammoth';

export const processDocx = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Error processing DOCX:', error);
    throw new Error('Failed to process DOCX file');
  }
}
