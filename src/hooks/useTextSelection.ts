
import { useState, useRef, RefObject } from 'react';

export const useTextSelection = (editorRef: RefObject<HTMLDivElement>) => {
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const [lastCaretPosition, setLastCaretPosition] = useState<number | null>(null);
  const formatStateRef = useRef<{ isBold: boolean; isItalic: boolean }>({ isBold: false, isItalic: false });

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        setSelectionRange(range.cloneRange());
        setLastCaretPosition(range.startOffset);
        
        // Update format state
        formatStateRef.current = {
          isBold: document.queryCommandState('bold'),
          isItalic: document.queryCommandState('italic')
        };
      }
    }
  };

  const restoreSelection = () => {
    if (!editorRef.current) return;

    // Wait for the next frame to ensure DOM is updated
    requestAnimationFrame(() => {
      if (selectionRange && editorRef.current) {
        const selection = window.getSelection();
        if (selection) {
          try {
            // First, check if the range is still valid
            const newRange = document.createRange();
            newRange.setStart(selectionRange.startContainer, selectionRange.startOffset);
            newRange.setEnd(selectionRange.endContainer, selectionRange.endOffset);
            
            selection.removeAllRanges();
            selection.addRange(newRange);
          } catch (e) {
            // If the range is invalid, try to set cursor at the end
            const range = document.createRange();
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }
    });
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

