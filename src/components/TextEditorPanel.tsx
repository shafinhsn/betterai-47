
import { DocumentPreview } from '@/components/DocumentPreview';
import { TextEditorControls } from './text-editor/TextEditorControls';
import { useTextEditor } from '@/hooks/useTextEditor';
import { Button } from './ui/button';

export interface TextEditorPanelProps {
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
  const {
    font,
    size,
    alignment,
    format,
    citationStyle,
    isCheckingPlagiarism,
    handleFormatChange,
    handleFontChange,
    handleSizeChange,
    handleAlignmentChange,
    handleCitationStyleChange,
    handlePlagiarismCheck,
  } = useTextEditor();

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-200">Updated preview</h3>
        <Button 
          onClick={onManualUpdate}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Update
        </Button>
      </div>

      <div className="space-y-4">
        <div className="bg-[#242424] rounded p-2">
          <TextEditorControls
            font={font}
            size={size}
            alignment={alignment}
            format={format}
            citationStyle={citationStyle}
            isCheckingPlagiarism={isCheckingPlagiarism}
            onFormatChange={handleFormatChange}
            onFontChange={handleFontChange}
            onSizeChange={handleSizeChange}
            onAlignmentChange={handleAlignmentChange}
            onCitationStyleChange={handleCitationStyleChange}
            onPlagiarismCheck={handlePlagiarismCheck}
          />
        </div>

        <div className="bg-[#242424] rounded p-4 min-h-[200px] overflow-auto">
          <DocumentPreview 
            key={`updated-${previewKey}`} 
            content={updatedContent || content} 
            isUpdated={true}
            originalContent={content}
            style={{
              fontFamily: font,
              fontSize: `${size}px`,
              textAlign: alignment as any,
              fontWeight: format.includes('bold') ? 'bold' : 'normal',
              fontStyle: format.includes('italic') ? 'italic' : 'normal'
            }}
          />
        </div>
      </div>
    </div>
  );
};
