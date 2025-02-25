
import { PDFDocument, StandardFonts } from 'pdf-lib';

export const createPDFFromText = async (text: string) => {
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Fix line breaks and encode special characters
  const sanitizedText = text.replace(/\n/g, '\r\n');
  const paragraphs = sanitizedText.split('\r\n\r\n').filter(p => p.trim().length > 0);
  
  let currentPage = pdfDoc.addPage();
  const { width, height } = currentPage.getSize();
  
  const fontSize = 12;
  const lineHeight = fontSize * 1.2;
  const margin = 50;
  const maxWidth = width - (margin * 2);
  let yPosition = height - margin;
  
  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(' ');
    let currentLine = '';
    
    for (const word of words) {
      // Sanitize text to prevent encoding issues
      const sanitizedWord = word.replace(/[\u0000-\u001F]/g, ' ');
      const testLine = currentLine ? `${currentLine} ${sanitizedWord}` : sanitizedWord;
      const lineWidth = helveticaFont.widthOfTextAtSize(testLine, fontSize);
      
      if (lineWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (yPosition - lineHeight < margin) {
          currentPage = pdfDoc.addPage();
          yPosition = height - margin;
        }
        
        currentPage.drawText(currentLine, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: helveticaFont,
        });
        yPosition -= lineHeight;
        currentLine = sanitizedWord;
      }
    }
    
    if (currentLine) {
      if (yPosition - lineHeight < margin) {
        currentPage = pdfDoc.addPage();
        yPosition = height - margin;
      }
      
      currentPage.drawText(currentLine, {
        x: margin,
        y: yPosition,
        size: fontSize,
        font: helveticaFont,
      });
      yPosition -= lineHeight * 1.5;
    }
  }
  
  return await pdfDoc.save();
};

