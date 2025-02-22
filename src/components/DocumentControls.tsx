
import { Button } from "@/components/ui/button";
import { Download, Trash } from "lucide-react";
import { ProcessedDocument } from "@/types/document";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DocumentControlsProps {
  currentDocument: ProcessedDocument;
  content: string;
  onDocumentRemoved: () => void;
}

export const DocumentControls = ({ currentDocument, content, onDocumentRemoved }: DocumentControlsProps) => {
  const { toast } = useToast();

  const handleRemoveDocument = async () => {
    try {
      const { error } = await supabase.storage
        .from('documents')
        .remove([currentDocument.filePath]);

      if (error) throw error;

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

  const handleDownloadDocument = () => {
    if (!content) return;

    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `processed_${currentDocument.filename}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Document downloaded",
        description: "Successfully downloaded the processed document",
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
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadDocument}
          className="w-full"
          disabled={!content}
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
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
