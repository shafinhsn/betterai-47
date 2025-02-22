
import { DocumentPreview } from '@/components/DocumentPreview';
import { TextEditorPanel } from '@/components/TextEditorPanel';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

interface PreviewPanelProps {
  content: string;
  updatedContent: string;
  isProcessing: boolean;
  previewKey: number;
  onManualUpdate: () => void;
}

export const PreviewPanel = ({ 
  content, 
  updatedContent, 
  isProcessing, 
  previewKey,
  onManualUpdate 
}: PreviewPanelProps) => {
  return (
    <div className="flex flex-col h-full">
      <ResizablePanelGroup
        direction="vertical"
        className="min-h-[600px] rounded-lg"
      >
        <ResizablePanel defaultSize={50} className="bg-[#1a1a1a] p-4">
          <h3 className="text-sm font-medium mb-2 text-gray-200">Document Preview</h3>
          {content ? (
            <div className="h-[calc(100%-2rem)] overflow-auto">
              <DocumentPreview 
                key={`original-${previewKey}`} 
                content={content} 
                isUpdated={false}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              {isProcessing ? 'Processing document...' : 'Upload a document to see preview'}
            </div>
          )}
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-[#2a2a2a]" />

        {content && (
          <ResizablePanel defaultSize={50}>
            <TextEditorPanel
              updatedContent={updatedContent}
              content={content}
              previewKey={previewKey}
              onManualUpdate={onManualUpdate}
            />
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </div>
  );
};
