
import { Button } from "@/components/ui/button";
import { Download, Trash } from "lucide-react";
import { ProcessedDocument } from "@/types/document";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DocumentInfo } from "./DocumentInfo";
import { downloadOriginalDocument, downloadUpdatedDocument } from "@/utils/document";

interface DocumentControlsProps {
  currentDocument: ProcessedDocument | null;
  content?: string;
  updatedContent?: string;
  onDocumentRemoved: () => void;
  isAuthenticated: boolean | null;
  onNavigate: () => void;
}

export const DocumentControls = ({ 
  currentDocument, 
  content, 
  updatedContent, 
  onDocumentRemoved,
  isAuthenticated,
  onNavigate
}: DocumentControlsProps) => {
  const { toast } = useToast();

  if (!currentDocument) {
    return null;
  }

  const handleRemoveDocument = async () => {
    try {
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

  const handleDownload = async (downloadContent: string, type: 'original' | 'updated') => {
    try {
      if (type === 'original') {
        await downloadOriginalDocument(currentDocument, downloadContent);
      } else {
        await downloadUpdatedDocument(downloadContent, currentDocument.filename, currentDocument.fileType);
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
    <div className="border-b p-4">
      <DocumentInfo filename={currentDocument.filename} />
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload(content || '', 'original')}
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
