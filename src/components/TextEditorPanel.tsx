
import { useTextEditor } from '@/hooks/useTextEditor';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { TextEditorControls } from './text-editor/TextEditorControls';
import { TextEditorContent } from './text-editor/TextEditorContent';

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
  const [editableContent, setEditableContent] = useState(updatedContent || content);
  const textEditor = useTextEditor();

  useEffect(() => {
    setEditableContent(updatedContent || content);
  }, [updatedContent, content]);

  const applyFormat = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
  };

  const handleFormatWithSelection = (formatType: string) => {
    applyFormat(formatType);
  };

  const handleStyleWithSelection = (property: string, value: string) => {
    if (property === 'fontSize') {
      applyFormat('fontSize', value);
    } else if (property === 'fontFamily') {
      applyFormat('fontName', value);
    }
  };

  const handleUpdate = () => {
    onManualUpdate();
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-200">Updated Preview</h3>
        <Button 
          onClick={handleUpdate}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Update
        </Button>
      </div>

      <div className="space-y-4 h-[calc(100%-4rem)]">
        <div className="bg-[#242424] rounded p-2">
          <TextEditorControls
            font={textEditor.font}
            size={textEditor.size}
            alignment={textEditor.alignment}
            format={textEditor.format}
            onFormatChange={(formats) => {
              formats.forEach(format => handleFormatWithSelection(format));
            }}
            onFontChange={(value) => {
              textEditor.handleFontChange(value);
              handleStyleWithSelection('fontFamily', value);
            }}
            onSizeChange={(value) => {
              textEditor.handleSizeChange(value);
              handleStyleWithSelection('fontSize', value);
            }}
            onAlignmentChange={(value) => {
              textEditor.handleAlignmentChange(value);
              applyFormat('justifyLeft');
            }}
          />
        </div>

        <TextEditorContent
          content={editableContent}
          onContentChange={setEditableContent}
          format={textEditor.format}
          font={textEditor.font}
          size={textEditor.size}
          alignment={textEditor.alignment}
          lastCaretPosition={null}
        />
      </div>
    </div>
  );
};
