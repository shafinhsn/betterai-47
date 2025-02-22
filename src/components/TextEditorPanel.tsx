
import { useState } from 'react';
import { toast } from "sonner";
import { DocumentPreview } from '@/components/DocumentPreview';
import { TextEditorControls } from './text-editor/TextEditorControls';
import { TextEditorHeader } from './text-editor/TextEditorHeader';

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
  const [font, setFont] = useState('Arial');
  const [size, setSize] = useState('16');
  const [alignment, setAlignment] = useState('left');
  const [format, setFormat] = useState<string[]>([]);
  const [citationStyle, setCitationStyle] = useState('none');
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);

  const handleFormatChange = (value: string[]) => {
    setFormat(value);
  };

  const handleFontChange = (value: string) => {
    setFont(value);
  };

  const handleSizeChange = (value: string) => {
    setSize(value);
  };

  const handleAlignmentChange = (value: string) => {
    if (value) setAlignment(value);
  };

  const handleCitationStyleChange = (value: string) => {
    setCitationStyle(value);
    toast.success(`Applied ${value.toUpperCase()} citation style`);
  };

  const handlePlagiarismCheck = async () => {
    try {
      setIsCheckingPlagiarism(true);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
      toast.success("Document checked for plagiarism - No issues found", {
        description: "Your document appears to be original content.",
        duration: 5000,
      });
    } catch (error) {
      toast.error("Error checking for plagiarism");
    } finally {
      setIsCheckingPlagiarism(false);
    }
  };

  return (
    <div className="mt-4">
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

      <div className="bg-[#242424] rounded-lg p-4 overflow-auto">
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
