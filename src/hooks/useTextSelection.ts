
import { useState, useRef, RefObject } from 'react';

export const useTextSelection = (editorRef: RefObject<HTMLDivElement>) => {
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const [lastCaretPosition, setLastCaretPosition] = useState<number | null>(null);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setSelectionRange(selection.getRangeAt(0).cloneRange());
      setLastCaretPosition(selection.getRangeAt(0).startOffset);
    }
  };

  const restoreSelection = () => {
    if (selectionRange && editorRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(selectionRange);
      }
    }
  };

  const toggleFormat = (format: string) => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;

    // Save the current selection
    const range = selection.getRangeAt(0);
    const savedRange = range.cloneRange();

    // If no text is selected, return
    if (range.collapsed) return;

    // Execute the command to toggle the format
    document.execCommand(format, false);

    // Restore the selection
    selection.removeAllRanges();
    selection.addRange(savedRange);

    // Save the new selection state
    saveSelection();
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
    toggleFormat,
    saveSelection,
    restoreSelection,
    applyFormattingToSelection,
    applyFormattingToAll
  };
};
