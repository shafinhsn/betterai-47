
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
  const selectionRef = useRef<Range | null>(null);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    selectionRef.current = selection.getRangeAt(0).cloneRange();
  };

  const restoreSelection = () => {
    if (!selectionRef.current || !editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection) return;

    try {
      selection.removeAllRanges();
      selection.addRange(selectionRef.current);
    } catch (error) {
      console.error('Failed to restore selection:', error);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (isComposingRef.current) return;
    saveSelection();
    const content = e.currentTarget.innerHTML;
    onContentChange(content);
    
    // Use setTimeout to ensure DOM is updated before restoring selection
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
        restoreSelection();
      }
    }, 0);
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
      saveSelection();
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

  const handleFocus = () => {
    restoreSelection();
  };

  const handleBlur = () => {
    saveSelection();
  };

  useEffect(() => {
    if (editorRef.current) {
      // Only apply these styles to the container
      editorRef.current.style.fontFamily = font;
      editorRef.current.style.textAlign = alignment;
    }
  }, [font, alignment]);

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
        onFocus={handleFocus}
        onBlur={handleBlur}
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
