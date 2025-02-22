
import { DocumentPreview } from '@/components/DocumentPreview';
import { TextEditorControls } from './text-editor/TextEditorControls';
import { TextEditorHeader } from './text-editor/TextEditorHeader';
import { useTextEditor } from '@/hooks/useTextEditor';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    <div className="flex flex-col h-full gap-4">
      <TextEditorHeader onManualUpdate={onManualUpdate} />
      
      <div className="bg-[#242424] rounded-lg p-4">
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

      <div className="grid grid-cols-2 gap-4 flex-1">
        <div className="bg-[#242424] rounded-lg p-4">
          <h3 className="text-sm font-medium mb-2 text-gray-200">Original Document</h3>
          <ScrollArea className="h-[calc(100vh-15rem)]">
            <DocumentPreview 
              key={`original-${previewKey}`} 
              content={content} 
              isUpdated={false}
            />
          </ScrollArea>
        </div>

        <div className="bg-[#242424] rounded-lg p-4">
          <h3 className="text-sm font-medium mb-2 text-gray-200">Updated Document</h3>
          <ScrollArea className="h-[calc(100vh-15rem)]">
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
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
