
import { DocumentPreview } from '@/components/DocumentPreview';
import { TextEditorPanel } from '@/components/TextEditorPanel';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          WordEdit
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/preview')}
            className="hover:bg-emerald-900/20"
          >
            <Pencil className="h-4 w-4 text-emerald-500" />
          </Button>
        </h2>
      </div>

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
