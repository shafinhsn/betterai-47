
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '../ui/scroll-area';

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
  font,
  size,
  alignment
}: TextEditorContentProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);

  const saveAndRestoreSelection = () => {
    // Delay the selection restoration slightly to ensure DOM updates are complete
    requestAnimationFrame(() => {
      if (!editorRef.current) return;
      editorRef.current.focus();
    });
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (isComposingRef.current) return;
    const content = e.currentTarget.innerHTML;
    onContentChange(content);
    saveAndRestoreSelection();
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = () => {
    isComposingRef.current = false;
    if (editorRef.current) {
      handleInput({ currentTarget: editorRef.current } as React.FormEvent<HTMLDivElement>);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const tabNode = document.createTextNode('\t');
      range.insertNode(tabNode);
      range.setStartAfter(tabNode);
      range.setEndAfter(tabNode);
      selection.removeAllRanges();
      selection.addRange(range);

      if (editorRef.current) {
        onContentChange(editorRef.current.innerHTML);
      }
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.fontFamily = font;
      editorRef.current.style.fontSize = `${size}px`;
      editorRef.current.style.textAlign = alignment;
    }
  }, [font, size, alignment]);

  return (
    <ScrollArea className="h-[calc(100%-5rem)] overflow-y-auto">
      <div 
        ref={editorRef}
        className="bg-[#242424] rounded p-6 min-h-[200px] w-full"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
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
