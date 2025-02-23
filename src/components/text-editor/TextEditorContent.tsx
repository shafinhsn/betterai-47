
import React, { useRef, useEffect, useCallback } from 'react';
import { ScrollArea } from '../ui/scroll-area';

interface TextEditorContentProps {
  content: string;
  onContentChange: (content: string) => void;
  lastCaretPosition: number | null;
}

export const TextEditorContent = ({
  content,
  onContentChange,
}: TextEditorContentProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);
  const lastSelectionRef = useRef<{
    start: number;
    end: number;
    scrollTop?: number;
  } | null>(null);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;

    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(editorRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;

    lastSelectionRef.current = {
      start,
      end: start + range.toString().length,
      scrollTop: scrollAreaRef.current?.scrollTop
    };
  };

  const restoreSelection = useCallback(() => {
    if (!lastSelectionRef.current || !editorRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    const range = document.createRange();
    let charCount = 0;
    let done = false;

    const traverse = (node: Node) => {
      if (done) return;

      if (node.nodeType === Node.TEXT_NODE) {
        const nextCount = charCount + node.textContent!.length;
        if (!done && lastSelectionRef.current!.start >= charCount && lastSelectionRef.current!.start <= nextCount) {
          range.setStart(node, lastSelectionRef.current!.start - charCount);
          if (lastSelectionRef.current!.start === lastSelectionRef.current!.end) {
            range.setEnd(node, lastSelectionRef.current!.start - charCount);
            done = true;
          }
        }
        if (!done && lastSelectionRef.current!.end >= charCount && lastSelectionRef.current!.end <= nextCount) {
          range.setEnd(node, lastSelectionRef.current!.end - charCount);
          done = true;
        }
        charCount = nextCount;
      } else {
        for (const child of Array.from(node.childNodes)) {
          traverse(child);
        }
      }
    };

    traverse(editorRef.current);

    try {
      selection.removeAllRanges();
      selection.addRange(range);

      if (lastSelectionRef.current.scrollTop !== undefined && scrollAreaRef.current) {
        requestAnimationFrame(() => {
          if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = lastSelectionRef.current!.scrollTop!;
          }
        });
      }
    } catch (error) {
      console.error('Error restoring selection:', error);
    }
  }, []);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (isComposingRef.current) return;
    saveSelection();
    const newContent = e.currentTarget.innerHTML;
    onContentChange(newContent);
    requestAnimationFrame(restoreSelection);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '\u00a0\u00a0\u00a0\u00a0');
      saveSelection();
    }
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

  const handleScroll = () => {
    if (scrollAreaRef.current && lastSelectionRef.current) {
      lastSelectionRef.current.scrollTop = scrollAreaRef.current.scrollTop;
    }
  };

  return (
    <ScrollArea 
      className="h-full overflow-y-auto border border-border/20 rounded-lg bg-[#1a1a1a]"
      ref={scrollAreaRef}
      onScrollCapture={handleScroll}
    >
      <div 
        ref={editorRef}
        className="p-6 min-h-[200px] w-full focus:outline-none"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onSelect={saveSelection}
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
