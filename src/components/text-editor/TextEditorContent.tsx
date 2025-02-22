
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

  // Save selection when clicking or touching the editor
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
    <ScrollArea className="h-[calc(100%-5rem)]">
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
          maxWidth: '100%'
        }}
      />
    </ScrollArea>
  );
};
