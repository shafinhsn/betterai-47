
import { FileUpload } from '@/components/FileUpload';
import { DocumentControls } from '@/components/DocumentControls';
import { ProcessedDocument } from '@/types/document';
import { Loader2 } from 'lucide-react';

interface DocumentSidebarProps {
  isProcessing: boolean;
  currentDocument: ProcessedDocument | null;
  content: string;
  updatedContent?: string;
  onFileSelect: (file: File, content: string) => void;
  onDocumentRemoved: () => void;
  isAuthenticated: boolean;
  onNavigate: () => void;
}

export const DocumentSidebar = ({
  isProcessing,
  currentDocument,
  content,
  updatedContent,
  onFileSelect,
  onDocumentRemoved,
  isAuthenticated,
  onNavigate,
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
        <div className="mt-4 p-4 border rounded-lg bg-muted/50 animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing document...</span>
          </div>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <p>• Extracting text content</p>
            <p>• Analyzing document structure</p>
            <p>• Preparing for chat</p>
          </div>
        </div>
      )}
      {currentDocument && !isProcessing && (
        <div className="space-y-4">
          <DocumentControls
            currentDocument={currentDocument}
            content={content}
            updatedContent={updatedContent}
            onDocumentRemoved={onDocumentRemoved}
            isAuthenticated={isAuthenticated}
            onNavigate={onNavigate}
          />
        </div>
      )}
    </div>
  );
};

