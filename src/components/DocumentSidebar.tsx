
import { FileUpload } from '@/components/FileUpload';
import { DocumentControls } from '@/components/DocumentControls';
import { ProcessedDocument } from '@/types/document';

interface DocumentSidebarProps {
  isProcessing: boolean;
  currentDocument: ProcessedDocument | null;
  content: string;
  onFileSelect: (file: File) => void;
  onDocumentRemoved: () => void;
}

export const DocumentSidebar = ({
  isProcessing,
  currentDocument,
  content,
  onFileSelect,
  onDocumentRemoved,
}: DocumentSidebarProps) => {
  return (
    <div className="h-screen p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Document Assistant</h1>
        <p className="text-sm text-muted-foreground">
          Upload a document and start chatting
        </p>
      </div>
      <FileUpload onFileSelect={onFileSelect} />
      {isProcessing && (
        <div className="mt-4 text-sm text-muted-foreground">
          Processing document...
        </div>
      )}
      {currentDocument && !isProcessing && (
        <DocumentControls
          currentDocument={currentDocument}
          content={content}
          onDocumentRemoved={onDocumentRemoved}
        />
      )}
    </div>
  );
};
