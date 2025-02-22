
import { DocumentSidebar } from '@/components/DocumentSidebar';
import { Chat } from '@/components/Chat';
import { PreviewPanel } from '@/components/PreviewPanel';
import { TextEditorPanel } from '@/components/TextEditorPanel';
import { DocumentControls } from '@/components/DocumentControls';
import { FileUpload } from '@/components/FileUpload';
import { DocumentPreview } from '@/components/DocumentPreview';
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
        isProcessing={isProcessing}
        currentDocument={currentDocument}
        content={content}
        updatedContent={updatedContent}
        onFileSelect={onFileSelect}
        onDocumentRemoved={onDocumentRemoved}
        isAuthenticated={isAuthenticated}
        onNavigate={onNavigate}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DocumentControls
          currentDocument={currentDocument}
          content={content}
          updatedContent={updatedContent}
          onDocumentRemoved={onDocumentRemoved}
          isAuthenticated={isAuthenticated}
          onNavigate={onNavigate}
        />
        
        <div className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden">
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
                onDocumentUpdate={onDocumentUpdate}
              />
              <div className="flex flex-col space-y-4 overflow-hidden">
                <PreviewPanel
                  content={content}
                  isProcessing={isProcessing}
                  previewKey={previewKey}
                />
                {updatedContent && (
                  <div className="flex-1">
                    <h3 className="text-sm font-medium mb-2 text-gray-200">Updated Document Preview</h3>
                    <div className="bg-[#242424] rounded-lg p-4 h-[calc(100%-2rem)] overflow-auto">
                      <DocumentPreview 
                        key={`updated-${previewKey}`} 
                        content={updatedContent}
                        isUpdated={true}
                        originalContent={content}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="col-start-3">
              <FileUpload onFileSelect={onFileSelect} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

