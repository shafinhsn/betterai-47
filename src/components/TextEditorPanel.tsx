
import { useTextEditor } from '@/hooks/useTextEditor';
import { Button } from './ui/button';
import { useState, useEffect, useRef } from 'react';
import { TextEditorControls } from './text-editor/TextEditorControls';
import { TextEditorContent } from './text-editor/TextEditorContent';
import { useTextSelection } from '@/hooks/useTextSelection';

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
  const editorRef = useRef<HTMLDivElement>(null);
  const { lastCaretPosition, applyFormattingToSelection, applyFormattingToAll } = useTextSelection(editorRef);
  const textEditor = useTextEditor();

  useEffect(() => {
    setEditableContent(updatedContent || content);
  }, [updatedContent, content]);

  const handleFormatWithSelection = (formatType: string) => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;

    document.execCommand(formatType === 'bold' ? 'bold' : 'italic', false);
  };

  const handleStyleWithSelection = (property: string, value: string) => {
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
      applyFormattingToAll(property, value);
    } else {
      applyFormattingToSelection(property, value);
    }
  };

  const handleUpdate = () => {
    onManualUpdate();
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setEditableContent(content);
    }
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
            citationStyle={textEditor.citationStyle}
            isLoading={textEditor.isLoading}
            onFormatChange={(formats) => {
              formats.forEach(format => handleFormatWithSelection(format));
            }}
            onFontChange={(value) => {
              textEditor.handleFontChange(value);
              handleStyleWithSelection('fontFamily', value);
            }}
            onSizeChange={(value) => {
              textEditor.handleSizeChange(value);
              handleStyleWithSelection('fontSize', `${value}px`);
            }}
            onAlignmentChange={(value) => {
              textEditor.handleAlignmentChange(value);
              applyFormattingToAll('textAlign', value);
            }}
            onCitationStyleChange={textEditor.handleCitationStyleChange}
            onAddSourceLink={textEditor.handleAddSourceLink}
          />
        </div>

        <TextEditorContent
          content={editableContent}
          onContentChange={setEditableContent}
          format={textEditor.format}
          font={textEditor.font}
          size={textEditor.size}
          alignment={textEditor.alignment}
          lastCaretPosition={lastCaretPosition}
        />
      </div>
    </div>
  );
};
