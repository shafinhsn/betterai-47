
import { Button } from '@/components/ui/button';
import { TextEditor } from '@/components/TextEditor';
import { DocumentPreview } from '@/components/DocumentPreview';

interface TextEditorPanelProps {
  updatedContent: string;
  content: string;
  previewKey: number;
  onManualUpdate: () => void;
}

export const TextEditorPanel = ({ 
  updatedContent, 
  content, 
  previewKey, 
  onManualUpdate 
}: TextEditorPanelProps) => {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-200">Updated Document</h3>
        <Button variant="outline" size="sm" onClick={onManualUpdate}>
          Update
        </Button>
      </div>
      <TextEditor
        onFormatChange={() => {}}
        onFontChange={() => {}}
        onSizeChange={() => {}}
        onAlignmentChange={() => {}}
      />
      <div className="bg-[#242424] rounded-lg p-4 overflow-auto">
        <DocumentPreview 
          key={`updated-${previewKey}`} 
          content={updatedContent} 
          isUpdated={true}
          originalContent={content}
        />
      </div>
    </div>
  );
};
