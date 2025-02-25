
import { PDFDocument, StandardFonts } from 'pdf-lib';

export const createPDFFromText = async (text: string) => {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const symbolFont = await pdfDoc.embedFont(StandardFonts.Symbol);
  
  // Fix line breaks and encode special characters
  const sanitizedText = text
    .replace(/\n/g, '\r\n')
    // Properly encode mathematical operators
    .replace(/−/g, '-')
    .replace(/×/g, 'x')
    .replace(/÷/g, '/')
    .replace(/±/g, '+/-')
    // Handle superscripts and subscripts
    .replace(/(\d+)\^(\d+)/g, '$1^$2')
    .replace(/(\d+)_(\d+)/g, '$1_$2')
    // Handle common mathematical symbols
    .replace(/π/g, 'pi')
    .replace(/∞/g, 'inf')
    .replace(/√/g, 'sqrt')
    // Handle fraction-like structures
    .replace(/(\d+)\/(\d+)/g, '$1/$2');

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
      // Handle special mathematical expressions
      const processedWord = word
        .replace(/[^\x00-\x7F]/g, char => {
          // Replace Unicode mathematical symbols with their ASCII equivalents
          if (char === '²') return '^2';
          if (char === '³') return '^3';
          if (char === '±') return '+/-';
          if (char === '∞') return 'inf';
          if (char === 'π') return 'pi';
          return char;
        })
        .trim();

      const testLine = currentLine ? `${currentLine} ${processedWord}` : processedWord;
      const lineWidth = timesRomanFont.widthOfTextAtSize(testLine, fontSize);
      
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
          font: timesRomanFont,
        });
        yPosition -= lineHeight;
        currentLine = processedWord;
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
        font: timesRomanFont,
      });
      yPosition -= lineHeight * 1.5;
    }
  }
  
  return await pdfDoc.save();
};

