
import { DocumentPreview } from '@/components/DocumentPreview';
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
  previewKey
}: PreviewPanelProps) => {
  const contentToShow = updatedContent || content;

  return (
    <div className="flex flex-col h-full">
      <div className="bg-[#1a1a1a] p-4 h-full rounded-lg">
        <h3 className="text-sm font-medium mb-2 text-gray-200">Document Preview</h3>
        {contentToShow ? (
          <div className="h-[calc(100%-2rem)] overflow-auto">
            <DocumentPreview 
              key={`preview-${previewKey}`} 
              content={contentToShow}
              originalContent={content}
              isUpdated={!!updatedContent}
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
