
import { PDFDocument, StandardFonts } from 'pdf-lib';

export const createPDFFromText = async (text: string) => {
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  
  const fontSize = 12;
  const lineHeight = fontSize * 1.2;
  const margin = 50;
  const maxWidth = width - (margin * 2);
  
  const paragraphs = text.split('\n');
  let yPosition = height - margin;
  
  for (const paragraph of paragraphs) {
    const words = paragraph.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const lineWidth = helveticaFont.widthOfTextAtSize(testLine, fontSize);
      
      if (lineWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (yPosition > margin) {
          page.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: fontSize,
            font: helveticaFont,
          });
          yPosition -= lineHeight;
        }
        currentLine = word;
      }
    }
    
    if (currentLine && yPosition > margin) {
      page.drawText(currentLine, {
        x: margin,
        y: yPosition,
        size: fontSize,
        font: helveticaFont,
      });
      yPosition -= lineHeight;
    }
    
    yPosition -= lineHeight/2;
    
    if (yPosition <= margin) {
      const newPage = pdfDoc.addPage();
      yPosition = newPage.getSize().height - margin;
    }
  }
  
  return await pdfDoc.save();
};
