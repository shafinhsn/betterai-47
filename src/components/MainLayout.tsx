import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { DocumentSidebar } from '@/components/DocumentSidebar';
import { Chat } from '@/components/Chat';
import { PreviewPanel } from '@/components/PreviewPanel';
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
  onManualUpdate: (content: string) => void;
  onNavigate: () => void;
  onCitationsOpen: () => void;
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
  onCitationsOpen,
}: MainLayoutProps) => {
  return (
    <div className="h-screen bg-[#121212] text-white overflow-hidden flex flex-col">
      <div className="fixed top-4 right-4 z-50 flex gap-4">
        {isAuthenticated && (
          <Button
            onClick={onCitationsOpen}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Citations
          </Button>
        )}
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
              isAuthenticated={isAuthenticated || false}
              onNavigate={onNavigate}
            />
          </ResizablePanel>
          
          <ResizableHandle withHandle className="bg-[#2a2a2a]" />
          
          <ResizablePanel defaultSize={75}>
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={40}>
                <div className="h-full flex flex-col bg-[#1a1a1a]">
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

              <ResizablePanel defaultSize={60} className="bg-[#1a1a1a]">
                <div className="h-full">
                  <PreviewPanel
                    content={content}
                    updatedContent={updatedContent}
                    isProcessing={isProcessing}
                    previewKey={previewKey}
                    onManualUpdate={onManualUpdate}
                  />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};
