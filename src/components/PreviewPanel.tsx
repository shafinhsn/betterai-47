
import { DocumentPreview } from '@/components/DocumentPreview';

interface PreviewPanelProps {
  content: string;
  isProcessing: boolean;
  previewKey: number;
}

export const PreviewPanel = ({ content, isProcessing, previewKey }: PreviewPanelProps) => {
  return (
    <>
      <h3 className="text-sm font-medium mb-2 text-gray-200">Document Preview</h3>
      {content ? (
        <div className="bg-[#242424] rounded-lg p-4 h-[calc(100%-2rem)] overflow-auto">
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
    </>
  );
};
