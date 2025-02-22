
import { Button } from "@/components/ui/button";
import { Download, Trash } from "lucide-react";
import { ProcessedDocument } from "@/types/document";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PDFDocument, StandardFonts } from 'pdf-lib';

interface DocumentControlsProps {
  currentDocument: ProcessedDocument;
  content: string;
  updatedContent?: string;
  onDocumentRemoved: () => void;
}

export const DocumentControls = ({ 
  currentDocument, 
  content, 
  updatedContent, 
  onDocumentRemoved 
}: DocumentControlsProps) => {
  const { toast } = useToast();

  const handleRemoveDocument = async () => {
    try {
      // Delete from storage if it's a PDF
      if (currentDocument.fileType === 'application/pdf') {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([currentDocument.filePath]);

        if (storageError) throw storageError;
      }

      onDocumentRemoved();

      toast({
        title: "Document removed",
        description: "Successfully removed the document",
      });
    } catch (error) {
      console.error('Error removing document:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove document. Please try again.",
      });
    }
  };

  const createPDFFromText = async (text: string) => {
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    
    const fontSize = 12;
    const lineHeight = fontSize * 1.2;
    const margin = 50;
    const maxWidth = width - (margin * 2);
    
    // Split text into paragraphs first
    const paragraphs = text.split('\n');
    let yPosition = height - margin;
    
    for (const paragraph of paragraphs) {
      // Split paragraph into words and create lines
      const words = paragraph.split(' ');
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const lineWidth = helveticaFont.widthOfTextAtSize(testLine, fontSize);
        
        if (lineWidth <= maxWidth) {
          currentLine = testLine;
        } else {
          // Draw the current line and start a new one
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
      
      // Draw the last line of the paragraph
      if (currentLine && yPosition > margin) {
        page.drawText(currentLine, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: helveticaFont,
        });
        yPosition -= lineHeight;
      }
      
      // Add extra space between paragraphs
      yPosition -= lineHeight/2;
      
      // If we're running out of space, add a new page
      if (yPosition <= margin) {
        const newPage = pdfDoc.addPage();
        yPosition = newPage.getSize().height - margin;
      }
    }
    
    return await pdfDoc.save();
  };

  const handleDownload = async (content: string, type: 'original' | 'updated') => {
    try {
      if (type === 'original') {
        // For PDF files, download directly from Supabase storage
        if (currentDocument.fileType === 'application/pdf') {
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
          // For non-PDF files, download as text
          const blob = new Blob([content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${currentDocument.filename.replace(/\.[^/.]+$/, '')}.txt`;
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      } else {
        // For updated content, generate a PDF
        const pdfBytes = await createPDFFromText(content);
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentDocument.filename.replace(/\.[^/.]+$/, '')}_updated.pdf`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast({
        title: "Document downloaded",
        description: `Successfully downloaded the ${type} document`,
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download document. Please try again.",
      });
    }
  };

  return (
    <div className="mt-4">
      <div className="text-sm mb-2">
        <p className="font-medium">Current document:</p>
        <p className="text-muted-foreground">{currentDocument.filename}</p>
      </div>
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload(content, 'original')}
            className="w-full"
            disabled={!content}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Original
          </Button>
        </div>
        {updatedContent && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(updatedContent, 'updated')}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Updated
            </Button>
          </div>
        )}
        <Button
          variant="destructive"
          size="sm"
          onClick={handleRemoveDocument}
          className="w-full"
        >
          <Trash className="mr-2 h-4 w-4" />
          Remove
        </Button>
      </div>
    </div>
  );
};
