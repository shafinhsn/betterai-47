
import { DocumentPreview } from '@/components/DocumentPreview';
import { TextEditorControls } from './text-editor/TextEditorControls';
import { TextEditorHeader } from './text-editor/TextEditorHeader';
import { useTextEditor } from '@/hooks/useTextEditor';

export interface TextEditorPanelProps {
  /** The updated content after AI processing */
  updatedContent: string;
  /** The original content before AI processing */
  content: string;
  /** Key used to force re-render of preview */
  previewKey: number;
  /** Callback function to trigger manual content update */
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
    <div className="flex flex-col h-full">
      <TextEditorHeader onManualUpdate={onManualUpdate} />
      
      <div className="bg-[#242424] rounded-lg p-4 mb-4">
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

      <div className="bg-[#242424] rounded-lg p-4 flex-1 overflow-auto">
        <DocumentPreview 
          key={`updated-${previewKey}`} 
          content={updatedContent} 
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
  );
};
