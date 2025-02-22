
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

  const applyFormatting = (property: string, value: string) => {
    const selection = window.getSelection();
    const editorElement = editorRef.current;

    if (!editorElement || !selection) return;

    // If there's no selection, apply to the whole content
    if (selection.toString().length === 0) {
      editorElement.style[property as any] = value;
      return;
    }

    // If there's a selection, create a span with the formatting
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style[property as any] = value;
    
    // Copy only the relevant styles to preserve existing formatting
    const computedStyle = window.getComputedStyle(editorElement);
    const stylesToCopy = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'textAlign'];
    stylesToCopy.forEach(style => {
      if (style !== property) { // Don't copy the style we're currently changing
        span.style[style as any] = computedStyle[style];
      }
    });

    // Apply the new formatting
    span.appendChild(range.extractContents());
    range.insertNode(span);
    
    // Clean up selection
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerText;
    setEditableContent(content);
  };

  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      
      // Apply formatting to the whole content when no text is selected
      if (!window.getSelection()?.toString()) {
        editor.style.fontFamily = font;
        editor.style.fontSize = `${size}px`;
        editor.style.textAlign = alignment;
        editor.style.fontWeight = format.includes('bold') ? 'bold' : 'normal';
        editor.style.fontStyle = format.includes('italic') ? 'italic' : 'normal';
      }
    }
  }, [font, size, alignment, format]);

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
              value.forEach(format => {
                if (format === 'bold') {
                  applyFormatting('fontWeight', 'bold');
                } else if (format === 'italic') {
                  applyFormatting('fontStyle', 'italic');
                }
              });
            }}
            onFontChange={(value) => {
              handleFontChange(value);
              applyFormatting('fontFamily', value);
            }}
            onSizeChange={(value) => {
              handleSizeChange(value);
              applyFormatting('fontSize', `${value}px`);
            }}
            onAlignmentChange={(value) => {
              handleAlignmentChange(value);
              applyFormatting('textAlign', value);
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

