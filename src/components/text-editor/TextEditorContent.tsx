import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { useTextSelection } from '@/hooks/useTextSelection';

interface TextEditorContentProps {
  content: string;
  onContentChange: (content: string) => void;
  format: string[];
  font: string;
  size: string;
  alignment: string;
  lastCaretPosition: number | null;
}

export const TextEditorContent = ({
  content,
  onContentChange,
  format,
  font,
  size,
  alignment,
  lastCaretPosition
}: TextEditorContentProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const { saveSelection, restoreSelection } = useTextSelection(editorRef);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML;
    onContentChange(content);
    saveSelection();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
      saveSelection();
    } else if (e.key === 'Backspace' || e.key === 'Enter') {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      const currentPosition = range.startOffset;
      
      // Let the default behavior happen
      setTimeout(() => {
        if (!selection || !editorRef.current) return;
        
        // After the default behavior, restore cursor position if needed
        try {
          const newRange = document.createRange();
          const textNode = editorRef.current.firstChild || editorRef.current;
          
          // If the cursor was at the end, keep it at the end
          if (currentPosition >= textNode.textContent?.length!) {
            newRange.setStart(textNode, textNode.textContent?.length || 0);
          } else {
            newRange.setStart(textNode, currentPosition);
          }
          
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
          saveSelection();
        } catch (error) {
          console.error('Error restoring cursor position:', error);
        }
      }, 0);
    }
  };

  const handleBeforeInput = (e: React.FormEvent<HTMLDivElement>) => {
    saveSelection();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    saveSelection();
  };

  const handlePointerDown = () => {
    saveSelection();
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (editorRef.current?.contains(range.commonAncestorContainer)) {
          saveSelection();
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.fontFamily = font;
      editorRef.current.style.fontSize = `${size}px`;
      editorRef.current.style.textAlign = alignment;
      restoreSelection();
    }
  }, [format, font, size, alignment]);

  return (
    <ScrollArea className="h-[calc(100%-5rem)] overflow-y-auto">
      <div 
        ref={editorRef}
        className="bg-[#242424] rounded p-6 min-h-[200px] w-full"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onBeforeInput={handleBeforeInput}
        onPaste={handlePaste}
        onPointerDown={handlePointerDown}
        dangerouslySetInnerHTML={{ __html: content }}
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          lineHeight: '1.5',
          outline: 'none',
          maxWidth: '100%',
          height: 'auto',
          minHeight: '200px'
        }}
      />
    </ScrollArea>
  );
};
