
import { Button } from "@/components/ui/button";
import { Download, Trash } from "lucide-react";
import { ProcessedDocument } from "@/types/document";
import { useToast } from "@/hooks/use-toast";
import { DocumentInfo } from "./DocumentInfo";
import { downloadOriginalDocument, downloadUpdatedDocument } from "@/utils/document";

interface DocumentControlsProps {
  currentDocument: ProcessedDocument | null;
  content: string;
  updatedContent?: string;
  onDocumentRemoved: () => void;
  isAuthenticated: boolean;
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

  const handleRemoveDocument = () => {
    if (!isAuthenticated) {
      onNavigate();
      return;
    }

    onDocumentRemoved();

    toast({
      title: "Document removed",
      description: "Successfully removed the document",
    });
  };

  const handleDownload = async (content: string, type: 'original' | 'updated') => {
    if (!isAuthenticated) {
      onNavigate();
      return;
    }

    if (!currentDocument) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No document selected for download.",
      });
      return;
    }

    try {
      if (type === 'original') {
        await downloadOriginalDocument(currentDocument, content);
      } else {
        await downloadUpdatedDocument(content, currentDocument.filename, currentDocument.fileType);
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
        description: error.message || "Failed to download document. Please try again.",
      });
    }
  };

  if (!currentDocument) {
    return null;
  }

  return (
    <div className="mt-4">
      <DocumentInfo filename={currentDocument.filename} />
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
