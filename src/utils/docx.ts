
import { Document, Packer, Paragraph, TextRun } from 'docx';

export const createDocxFromText = async (text: string): Promise<Uint8Array> => {
  // Split text into paragraphs
  const paragraphs = text.split('\n').map(line => {
    return new Paragraph({
      children: [
        new TextRun({
          text: line,
          break: line === '' ? 1 : 0
        })
      ]
    });
  });

  // Create document
  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs
    }]
  });

  // Generate and return document as Uint8Array for browser compatibility
  return await Packer.toBuffer(doc);
};
