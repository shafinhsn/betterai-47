
import { DocumentSidebar } from '@/components/DocumentSidebar';
import { Chat } from '@/components/Chat';
import { PreviewPanel } from '@/components/PreviewPanel';
import { TextEditorPanel } from '@/components/TextEditorPanel';
import { DocumentControls } from '@/components/DocumentControls';
import { FileUpload } from '@/components/FileUpload';
import { ProcessedDocument, Message } from '@/types/document';

interface MainLayoutProps {
  isAuthenticated: boolean | null;
  isProcessing: boolean;
  currentDocument: ProcessedDocument | null;
  content: string;
  updatedContent: string;
  messages: Message[];
  previewKey: number;
  onFileSelect: (file: File, content: string, path?: string) => void;
  onDocumentRemoved: () => void;
  onSendMessage: (message: string, sender: 'user' | 'ai') => void;
  onDocumentUpdate: (content: string) => void;
  onManualUpdate: () => void;
  onNavigate: () => void;
}

export const MainLayout = ({
  isAuthenticated,
  isProcessing,
  currentDocument,
  content,
  updatedContent,
  messages,
  previewKey,
  onFileSelect,
  onDocumentRemoved,
  onSendMessage,
  onDocumentUpdate,
  onManualUpdate,
  onNavigate
}: MainLayoutProps) => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DocumentSidebar
        currentDocument={currentDocument}
        onDocumentRemoved={onDocumentRemoved}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DocumentControls
          currentDocument={currentDocument}
          isAuthenticated={isAuthenticated}
          onNavigate={onNavigate}
        />
        
        <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
          <div className="flex flex-col overflow-hidden">
            <PreviewPanel
              content={content}
              isProcessing={isProcessing}
              previewKey={previewKey}
            />
          </div>
          
          <div className="flex flex-col space-y-4 overflow-hidden">
            {currentDocument ? (
              <>
                <TextEditorPanel
                  updatedContent={updatedContent}
                  content={content}
                  previewKey={previewKey}
                  onManualUpdate={onManualUpdate}
                />
                <Chat
                  messages={messages}
                  onSendMessage={onSendMessage}
                />
              </>
            ) : (
              <FileUpload onFileSelect={onFileSelect} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
