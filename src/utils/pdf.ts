
import { PDFDocument, StandardFonts } from 'pdf-lib';

export const createPDFFromText = async (text: string) => {
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Split text into paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
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
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const lineWidth = helveticaFont.widthOfTextAtSize(testLine, fontSize);
      
      if (lineWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        // Check if we need a new page
        if (yPosition - lineHeight < margin) {
          currentPage = pdfDoc.addPage();
          yPosition = height - margin;
        }
        
        // Draw the current line
        currentPage.drawText(currentLine, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: helveticaFont,
        });
        yPosition -= lineHeight;
        currentLine = word;
      }
    }
    
    // Draw the last line of the paragraph
    if (currentLine) {
      // Check if we need a new page
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
      yPosition -= lineHeight * 1.5; // Add extra space after paragraphs
    }
  }
  
  return await pdfDoc.save();
};
