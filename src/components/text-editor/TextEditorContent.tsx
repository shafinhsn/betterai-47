
import React, { useRef, useEffect, useCallback } from 'react';
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
    const selection = window.getSelection();
    if (!selection || !lastSelectionRef.current || !editorRef.current) return;

    let charCount = 0;
    let foundStart = false;
    let foundEnd = false;
    let startNode: Node | null = null;
    let startOffset = 0;
    let endNode: Node | null = null;
    let endOffset = 0;

    const traverse = (node: Node) => {
      if (foundStart && foundEnd) return;

      if (node.nodeType === Node.TEXT_NODE) {
        const nextCharCount = charCount + node.textContent!.length;
        if (!foundStart && lastSelectionRef.current!.start >= charCount && lastSelectionRef.current!.start <= nextCharCount) {
          startNode = node;
          startOffset = lastSelectionRef.current!.start - charCount;
          foundStart = true;
        }
        if (!foundEnd && lastSelectionRef.current!.end >= charCount && lastSelectionRef.current!.end <= nextCharCount) {
          endNode = node;
          endOffset = lastSelectionRef.current!.end - charCount;
          foundEnd = true;
        }
        charCount = nextCharCount;
      } else {
        for (const childNode of Array.from(node.childNodes)) {
          traverse(childNode);
        }
      }
    };

    traverse(editorRef.current);

    if (startNode && endNode) {
      try {
        const range = document.createRange();
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);
        selection.removeAllRanges();
        selection.addRange(range);

        // After setting the selection, restore the scroll position
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
    }
  }, []);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (isComposingRef.current) return;
    saveSelection();
    const newContent = e.currentTarget.innerHTML;
    onContentChange(newContent);
    requestAnimationFrame(() => {
      restoreSelection();
    });
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
    if (scrollAreaRef.current) {
      lastSelectionRef.current = {
        ...lastSelectionRef.current!,
        scrollTop: scrollAreaRef.current.scrollTop
      };
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      const fontSize = parseInt(size) || 16;
      const containerStyle = {
        fontFamily: font || 'inherit',
        fontSize: `${fontSize}px`,
        textAlign: alignment as 'left' | 'center' | 'right' | 'justify',
      };
      Object.assign(editorRef.current.style, containerStyle);
    }
  }, [font, size, alignment]);

  return (
    <ScrollArea 
      className="h-[calc(100%-5rem)] overflow-y-auto"
      ref={scrollAreaRef}
      onScrollCapture={handleScroll}
    >
      <div 
        ref={editorRef}
        className="bg-[#242424] rounded p-6 min-h-[200px] w-full"
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
          outline: 'none',
          maxWidth: '100%',
          minHeight: '200px'
        }}
      />
    </ScrollArea>
  );
};
