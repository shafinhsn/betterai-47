
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const createPDFFromText = async (text: string) => {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const symbolFont = await pdfDoc.embedFont(StandardFonts.Symbol);
  
  // Preserve original spacing and format
  const sanitizedText = text
    .replace(/\n/g, '\r\n')
    // Handle mathematical operators while preserving spacing
    .replace(/−/g, '-')
    .replace(/×/g, 'x')
    .replace(/÷/g, '/')
    .replace(/±/g, '+/-')
    // Handle superscripts and subscripts with proper spacing
    .replace(/(\d+)\^(\d+)/g, (_, base, exp) => `${base}^${exp} `)
    .replace(/(\d+)_(\d+)/g, (_, base, sub) => `${base}_${sub} `)
    // Handle mathematical symbols with proper spacing
    .replace(/π/g, 'π ')
    .replace(/∞/g, '∞ ')
    .replace(/√/g, '√ ')
    // Preserve fraction spacing
    .replace(/(\d+)\/(\d+)/g, (_, num, den) => `${num}/${den} `);

  const paragraphs = text.split('\n').map(p => p.trim()).filter(p => p.length > 0);
  
  let currentPage = pdfDoc.addPage();
  const { width, height } = currentPage.getSize();
  
  const fontSize = 12;
  const lineHeight = fontSize * 1.5; // Increased line height for better readability
  const margin = 50;
  const maxWidth = width - (margin * 2);
  let yPosition = height - margin;
  
  for (const paragraph of paragraphs) {
    // Preserve indentation and spacing
    const indentation = paragraph.match(/^\s*/)[0].length;
    const xOffset = margin + (indentation * fontSize * 0.5);
    
    const words = paragraph.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      const processedWord = word
        .replace(/[^\x00-\x7F]/g, char => {
          // Properly handle mathematical symbols while preserving spacing
          if (char === '²') return '^2 ';
          if (char === '³') return '^3 ';
          if (char === '±') return '+/- ';
          if (char === '∞') return 'inf ';
          if (char === 'π') return 'pi ';
          return char;
        })
        .trim();

      // Handle multiple consecutive spaces
      const spacingBefore = word.match(/^\s*/)[0].length > 1 ? '  ' : ' ';
      const testLine = currentLine ? `${currentLine}${spacingBefore}${processedWord}` : processedWord;
      const lineWidth = timesRomanFont.widthOfTextAtSize(testLine, fontSize);
      
      if (lineWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (yPosition - lineHeight < margin) {
          currentPage = pdfDoc.addPage();
          yPosition = height - margin;
        }
        
        currentPage.drawText(currentLine, {
          x: xOffset,
          y: yPosition,
          size: fontSize,
          font: timesRomanFont,
          lineHeight: lineHeight,
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
        x: xOffset,
        y: yPosition,
        size: fontSize,
        font: timesRomanFont,
        lineHeight: lineHeight,
      });
      yPosition -= lineHeight * 1.5; // Add extra spacing between paragraphs
    }
  }
  
  return await pdfDoc.save();
};

