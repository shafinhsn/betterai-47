import React, { useRef, useEffect, useCallback } from 'react';
import { ScrollArea } from '../ui/scroll-area';

interface TextEditorContentProps {
  content: string;
  onContentChange: (content: string) => void;
  lastCaretPosition: number | null;
  isEditable?: boolean;
}

export const TextEditorContent = ({
  content,
  onContentChange,
  isEditable = true
}: TextEditorContentProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);
  const lastSelectionRef = useRef<{
    startOffset: number;
    endOffset: number;
    node: Node | null;
    scrollTop: number;
  } | null>(null);

  const getTextOffsets = (node: Node, offset: number): number => {
    let currentOffset = 0;
    const walker = document.createTreeWalker(
      editorRef.current!,
      NodeFilter.SHOW_TEXT,
      null
    );

    let currentNode = walker.nextNode();
    while (currentNode) {
      if (currentNode === node) {
        return currentOffset + offset;
      }
      currentOffset += currentNode.textContent?.length || 0;
      currentNode = walker.nextNode();
    }
    return offset;
  };

  const saveSelection = useCallback(() => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const startOffset = getTextOffsets(range.startContainer, range.startOffset);
    const endOffset = getTextOffsets(range.endContainer, range.endOffset);

    lastSelectionRef.current = {
      startOffset,
      endOffset,
      node: range.startContainer,
      scrollTop: scrollAreaRef.current?.scrollTop || 0
    };
  }, []);

  const restoreSelection = useCallback(() => {
    if (!lastSelectionRef.current || !editorRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    const range = document.createRange();
    let currentOffset = 0;
    let startFound = false;
    let endFound = false;

    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node = walker.nextNode();
    while (node && (!startFound || !endFound)) {
      const nodeLength = node.textContent?.length || 0;

      if (!startFound && currentOffset + nodeLength >= lastSelectionRef.current.startOffset) {
        range.setStart(node, lastSelectionRef.current.startOffset - currentOffset);
        startFound = true;
      }

      if (!endFound && currentOffset + nodeLength >= lastSelectionRef.current.endOffset) {
        range.setEnd(node, lastSelectionRef.current.endOffset - currentOffset);
        endFound = true;
      }

      currentOffset += nodeLength;
      node = walker.nextNode();
    }

    try {
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (error) {
      console.error('Error restoring selection:', error);
    }
  }, []);

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    if (!isEditable || isComposingRef.current) return;
    
    saveSelection();
    const newContent = e.currentTarget.innerHTML;
    onContentChange(newContent);
    requestAnimationFrame(restoreSelection);
  }, [onContentChange, saveSelection, restoreSelection, isEditable]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isEditable) return;
    
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '\u00a0\u00a0\u00a0\u00a0');
      saveSelection();
    }
  }, [saveSelection, isEditable]);

  const handleCompositionStart = useCallback(() => {
    if (!isEditable) return;
    isComposingRef.current = true;
  }, [isEditable]);

  const handleCompositionEnd = useCallback(() => {
    if (!isEditable) return;
    isComposingRef.current = false;
    if (editorRef.current) {
      handleInput({ currentTarget: editorRef.current } as React.FormEvent<HTMLDivElement>);
    }
  }, [handleInput, isEditable]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleSelectionChange = () => {
      if (document.activeElement === editor) {
        saveSelection();
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [saveSelection]);

  return (
    <ScrollArea 
      className="h-full overflow-y-auto border border-border/20 rounded-lg bg-[#1a1a1a]"
      ref={scrollAreaRef}
    >
      <div 
        ref={editorRef}
        className="p-6 min-h-[200px] w-full focus:outline-none"
        contentEditable={isEditable}
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
        }}
      />
    </ScrollArea>
  );
};
