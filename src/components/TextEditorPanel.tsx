
import { DocumentPreview } from '@/components/DocumentPreview';
import { TextEditorControls } from './text-editor/TextEditorControls';
import { useTextEditor } from '@/hooks/useTextEditor';
import { Button } from './ui/button';
import { useState, useEffect, useRef } from 'react';

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

  useEffect(() => {
    setEditableContent(updatedContent || content);
  }, [updatedContent, content]);

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

  const applyFormattingToSelection = (property: string, value: string) => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return; // No text selected

    const span = document.createElement('span');
    span.style[property as any] = value;
    span.appendChild(range.extractContents());
    range.insertNode(span);

    // Clean up selection
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const applyFormattingToAll = (property: string, value: string) => {
    if (!editorRef.current) return;
    editorRef.current.style[property as any] = value;
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerText;
    setEditableContent(content);
  };

  const handleFormatWithSelection = (formats: string[]) => {
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
      // No selection, apply to all text
      formats.forEach(format => {
        if (format === 'bold') {
          applyFormattingToAll('fontWeight', 'bold');
        } else if (format === 'italic') {
          applyFormattingToAll('fontStyle', 'italic');
        }
      });
    } else {
      // Apply to selected text only
      formats.forEach(format => {
        if (format === 'bold') {
          applyFormattingToSelection('fontWeight', 'bold');
        } else if (format === 'italic') {
          applyFormattingToSelection('fontStyle', 'italic');
        }
      });
    }
  };

  const handleStyleWithSelection = (property: string, value: string) => {
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
      // No selection, apply to all text
      applyFormattingToAll(property, value);
    } else {
      // Apply to selected text only
      applyFormattingToSelection(property, value);
    }
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-200">Updated preview</h3>
        <Button 
          onClick={onManualUpdate}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Update
        </Button>
      </div>

      <div className="space-y-4 h-[calc(100%-4rem)]">
        <div className="bg-[#242424] rounded p-2">
          <TextEditorControls
            font={font}
            size={size}
            alignment={alignment}
            format={format}
            citationStyle={citationStyle}
            isCheckingPlagiarism={isCheckingPlagiarism}
            onFormatChange={(value) => {
              handleFormatChange(value);
              handleFormatWithSelection(value);
            }}
            onFontChange={(value) => {
              handleFontChange(value);
              handleStyleWithSelection('fontFamily', value);
            }}
            onSizeChange={(value) => {
              handleSizeChange(value);
              handleStyleWithSelection('fontSize', `${value}px`);
            }}
            onAlignmentChange={(value) => {
              handleAlignmentChange(value);
              applyFormattingToAll('textAlign', value);
            }}
            onCitationStyleChange={handleCitationStyleChange}
            onPlagiarismCheck={handlePlagiarismCheck}
          />
        </div>

        <div 
          ref={editorRef}
          className="bg-[#242424] rounded p-4 min-h-[200px] h-[calc(100%-5rem)] overflow-auto"
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          style={{
            whiteSpace: 'pre-wrap',
            outline: 'none'
          }}
        >
          {editableContent}
        </div>
      </div>
    </div>
  );
};

