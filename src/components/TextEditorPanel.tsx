
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

    if (selection.toString().length === 0) {
      // If no text is selected, apply to the entire content
      applyFormattingToAll(formatType, '');
    } else {
      // Apply formatting only to selected text
      document.execCommand(formatType, false);
    }
  };

  const handleStyleWithSelection = (property: string, value: string) => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;

    if (selection.toString().length === 0) {
      // If no text is selected, apply to the entire content
      applyFormattingToAll(property, value);
    } else {
      // Create a span with the specified style
      const span = document.createElement('span');
      if (property === 'fontSize') {
        span.style.fontSize = value;
      } else if (property === 'fontFamily') {
        span.style.fontFamily = value;
      }

      // Get the selected range and surround it with the styled span
      const range = selection.getRangeAt(0);
      range.surroundContents(span);
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
