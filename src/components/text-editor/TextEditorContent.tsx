
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

  useEffect(() => {
    const handleSelectionChange = () => {
      saveSelection();
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
        className="bg-[#242424] rounded p-4 min-h-[200px] w-full"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onBeforeInput={handleBeforeInput}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: content }}
        style={{
          whiteSpace: 'pre-wrap',
          outline: 'none',
          overflowWrap: 'break-word'
        }}
      />
    </ScrollArea>
  );
};
