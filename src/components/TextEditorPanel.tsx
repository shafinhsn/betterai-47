
import { DocumentPreview } from '@/components/DocumentPreview';
import { TextEditorControls } from './text-editor/TextEditorControls';
import { useTextEditor } from '@/hooks/useTextEditor';
import { Button } from './ui/button';
import { useState, useEffect, useRef } from 'react';
import { ScrollArea } from './ui/scroll-area';

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
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const [lastCaretPosition, setLastCaretPosition] = useState<number | null>(null);

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

  const restoreSelection = () => {
    if (selectionRange && editorRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(selectionRange);
      }
    }
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setSelectionRange(selection.getRangeAt(0).cloneRange());
      setLastCaretPosition(selection.getRangeAt(0).startOffset);
    }
  };

  const applyFormattingToSelection = (property: string, value: string | null) => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const span = document.createElement('span');
    if (value) {
      span.style[property as any] = value;
    } else {
      // Remove formatting
      span.style[property as any] = '';
    }
    
    const fragment = range.extractContents();
    span.appendChild(fragment);
    range.insertNode(span);

    // Preserve selection
    selection.removeAllRanges();
    selection.addRange(range);
    saveSelection();
  };

  const applyFormattingToAll = (property: string, value: string | null) => {
    if (!editorRef.current) return;
    if (value) {
      editorRef.current.style[property as any] = value;
    } else {
      editorRef.current.style[property as any] = '';
    }
    saveSelection();
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML;
    setEditableContent(content);
    saveSelection();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
      saveSelection();
    }
  };

  const handleFormatWithSelection = (formats: string[]) => {
    const selection = window.getSelection();
    const hasFormatting = format.length > 0;
    
    if (!selection || selection.toString().length === 0) {
      formats.forEach(format => {
        if (format === 'bold') {
          applyFormattingToAll('fontWeight', hasFormatting ? null : 'bold');
        } else if (format === 'italic') {
          applyFormattingToAll('fontStyle', hasFormatting ? null : 'italic');
        }
      });
    } else {
      formats.forEach(format => {
        if (format === 'bold') {
          applyFormattingToSelection('fontWeight', hasFormatting ? null : 'bold');
        } else if (format === 'italic') {
          applyFormattingToSelection('fontStyle', hasFormatting ? null : 'italic');
        }
      });
    }
  };

  const handleStyleWithSelection = (property: string, value: string) => {
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
      applyFormattingToAll(property, value);
    } else {
      applyFormattingToSelection(property, value);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    saveSelection();
  };

  const handleUpdate = () => {
    onManualUpdate();
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setEditableContent(content);
    }
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      editor.focus();
      if (lastCaretPosition !== null) {
        const selection = window.getSelection();
        const range = document.createRange();
        
        // Find the text node to place the cursor
        let currentNode = editor.firstChild;
        let currentOffset = 0;
        
        while (currentNode && currentOffset + (currentNode.textContent?.length || 0) < lastCaretPosition) {
          currentOffset += currentNode.textContent?.length || 0;
          currentNode = currentNode.nextSibling;
        }
        
        if (currentNode) {
          range.setStart(currentNode, Math.min(lastCaretPosition - currentOffset, currentNode.textContent?.length || 0));
          range.collapse(true);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }
    }
  }, [format, font, size, alignment, lastCaretPosition]);

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-200">Updated preview</h3>
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

        <ScrollArea className="h-[calc(100%-5rem)]">
          <div 
            ref={editorRef}
            className="bg-[#242424] rounded p-4 min-h-[200px] w-full"
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            dangerouslySetInnerHTML={{ __html: editableContent }}
            style={{
              whiteSpace: 'pre-wrap',
              outline: 'none',
              overflowWrap: 'break-word'
            }}
          />
        </ScrollArea>
      </div>
    </div>
  );
};

