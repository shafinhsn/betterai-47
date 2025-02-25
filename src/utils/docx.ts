
import { Document, Packer, Paragraph, TextRun, HeightRule, convertInchesToTwip } from 'docx';

export const createDocxFromText = async (text: string): Promise<Blob> => {
  // Split text into paragraphs while preserving empty lines
  const paragraphs = text.split('\n');
  
  const docxParagraphs = paragraphs.map(line => {
    // Calculate indentation based on leading spaces
    const indentation = line.match(/^\s*/)[0].length * 240; // 240 TWIPs = 1/6 inch
    const trimmedLine = line.trim();
    
    // Handle empty lines
    if (trimmedLine === '') {
      return new Paragraph({
        spacing: {
          before: 200,
          after: 200,
        },
      });
    }

    // Process the line content
    const processedLine = trimmedLine
      .replace(/(\d+)\^(\d+)/g, '$1^$2')
      .replace(/(\d+)_(\d+)/g, '$1_$2')
      .replace(/[−]/g, '-')
      .replace(/[×]/g, 'x')
      .replace(/[÷]/g, '/')
      .replace(/[±]/g, '+/-')
      .replace(/[π]/g, 'π')
      .replace(/[∞]/g, '∞')
      .replace(/[√]/g, '√');

    return new Paragraph({
      indent: {
        left: indentation,
      },
      spacing: {
        line: 360, // 1.5 line spacing
        lineRule: HeightRule.EXACT,
        before: 200,
        after: 200,
      },
      children: [
        new TextRun({
          text: processedLine,
          size: 24, // 12pt font
          font: 'Times New Roman',
        }),
      ],
    });
  });

  // Create document with preserved formatting
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1),
          },
        },
      },
      children: docxParagraphs,
    }],
  });

  // Generate and return document as Blob
  return await Packer.toBlob(doc);
};

