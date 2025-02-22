
import { useState, useRef, RefObject } from 'react';

export const useTextSelection = (editorRef: RefObject<HTMLDivElement>) => {
  const [lastCaretPosition, setLastCaretPosition] = useState<number | null>(null);
  const formatStateRef = useRef<{ isBold: boolean; isItalic: boolean }>({ isBold: false, isItalic: false });
  const selectionRangeRef = useRef<Range | null>(null);

  const saveSelection = () => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (editorRef.current.contains(range.commonAncestorContainer)) {
      selectionRangeRef.current = range.cloneRange();
      setLastCaretPosition(range.startOffset);
      
      // Update format state
      formatStateRef.current = {
        isBold: document.queryCommandState('bold'),
        isItalic: document.queryCommandState('italic')
      };
    }
  };

  const restoreSelection = () => {
    if (!editorRef.current || !selectionRangeRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    selection.removeAllRanges();

    try {
      selection.addRange(selectionRangeRef.current);
    } catch (e) {
      // If the saved range is invalid, set cursor to the end of content
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      selection.addRange(range);
    }
  };

  const applyFormattingToSelection = (property: string, value: string | null) => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;

    const range = selection.getRangeAt(0);
    if (!range.collapsed) {
      const span = document.createElement('span');
      if (value) {
        span.style[property as any] = value;
      }
      
      range.surroundContents(span);
      
      if (!value) {
        // Remove formatting by unwrapping the span
        const parent = span.parentNode;
        if (parent) {
          while (span.firstChild) {
            parent.insertBefore(span.firstChild, span);
          }
          parent.removeChild(span);
        }
      }
    }
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

  return {
    lastCaretPosition,
    saveSelection,
    restoreSelection,
    applyFormattingToSelection,
    applyFormattingToAll
  };
};
