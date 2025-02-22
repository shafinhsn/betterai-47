
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { DocumentSidebar } from '@/components/DocumentSidebar';
import { Chat } from '@/components/Chat';
import { PreviewPanel } from '@/components/PreviewPanel';
import { TextEditorPanel } from '@/components/TextEditorPanel';
import { Button } from '@/components/ui/button';
import { ProfileMenu } from '@/components/ProfileMenu';
import { ProcessedDocument } from '@/types/document';
import { Message } from '@/types/document';

interface MainLayoutProps {
  isAuthenticated: boolean | null;
  isProcessing: boolean;
  currentDocument: ProcessedDocument | null;
  content: string;
  updatedContent: string;
  messages: Message[];
  previewKey: number;
  onFileSelect: (file: File, content: string, filePath?: string) => void;
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
  onNavigate,
}: MainLayoutProps) => {
  return (
    <div className="h-screen bg-[#121212] text-white overflow-hidden flex flex-col">
      <div className="fixed top-4 right-4 z-50">
        {isAuthenticated ? (
          <ProfileMenu />
        ) : (
          <Button
            onClick={onNavigate}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Sign In
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={25} minSize={20} className="bg-[#1a1a1a] border-r border-[#2a2a2a]">
            <DocumentSidebar
              isProcessing={isProcessing}
              currentDocument={currentDocument}
              content={content}
              updatedContent={updatedContent}
              onFileSelect={onFileSelect}
              onDocumentRemoved={onDocumentRemoved}
            />
          </ResizablePanel>
          
          <ResizableHandle withHandle className="bg-[#2a2a2a]" />
          
          <ResizablePanel defaultSize={50}>
            <div className="h-full flex flex-col">
              <div className="flex-1">
                <Chat
                  messages={messages}
                  onSendMessage={onSendMessage}
                  documentContent={content}
                  onDocumentUpdate={onDocumentUpdate}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-[#2a2a2a]" />

          <ResizablePanel defaultSize={25}>
            <div className="h-full p-4">
              <PreviewPanel
                content={content}
                isProcessing={isProcessing}
                previewKey={previewKey}
              />
              {updatedContent && (
                <TextEditorPanel
                  updatedContent={updatedContent}
                  content={content}
                  previewKey={previewKey}
                  onManualUpdate={onManualUpdate}
                />
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};
