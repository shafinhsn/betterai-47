
import { DocumentPreview } from '@/components/DocumentPreview';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

interface PreviewPanelProps {
  content: string;
  updatedContent: string;
  isProcessing: boolean;
  previewKey: number;
  onManualUpdate: (content: string) => void;
}

export const PreviewPanel = ({ 
  content, 
  updatedContent, 
  isProcessing, 
  previewKey,
  onManualUpdate
}: PreviewPanelProps) => {
  const contentToShow = updatedContent || content;

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a]">
      <div className="p-4 h-full">
        <h3 className="text-sm font-medium mb-2 text-gray-200">Document Preview</h3>
        {contentToShow ? (
          <div className="h-[calc(100%-2rem)] overflow-auto">
            <DocumentPreview 
              key={`preview-${previewKey}`} 
              content={contentToShow}
              onContentUpdate={onManualUpdate}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            {isProcessing ? 'Processing document...' : 'Upload a document to see preview'}
          </div>
        )}
      </div>
    </div>
  );
};
