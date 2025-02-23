
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
  const selectionStateRef = useRef<{
    start: number;
    end: number;
    node: Node | null;
  }>({
    start: 0,
    end: 0,
    node: null
  });

  const saveSelectionState = () => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;

    const range = selection.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;

    selectionStateRef.current = {
      start: range.startOffset,
      end: range.endOffset,
      node: range.startContainer
    };
  };

  const restoreSelectionState = () => {
    if (!editorRef.current || !selectionStateRef.current.node) return;

    const selection = window.getSelection();
    if (!selection) return;

    try {
      const range = document.createRange();
      range.setStart(selectionStateRef.current.node, selectionStateRef.current.start);
      range.setEnd(selectionStateRef.current.node, selectionStateRef.current.end);
      
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (e) {
      console.warn('Failed to restore selection:', e);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML;
    saveSelectionState();
    onContentChange(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const tabNode = document.createTextNode('\t');
      
      range.deleteContents();
      range.insertNode(tabNode);
      
      // Update selection after inserting tab
      range.setStartAfter(tabNode);
      range.setEndAfter(tabNode);
      
      selection.removeAllRanges();
      selection.addRange(range);
      
      saveSelectionState();
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.fontFamily = font;
      editorRef.current.style.fontSize = `${size}px`;
      editorRef.current.style.textAlign = alignment;
      
      // Restore selection state after style changes
      requestAnimationFrame(() => {
        restoreSelectionState();
      });
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
        onSelect={saveSelectionState}
        onBlur={saveSelectionState}
        onFocus={restoreSelectionState}
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
