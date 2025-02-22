
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

  const applyFormattingToSelection = (property: string, value: string | null) => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const span = document.createElement('span');
    if (value) {
      span.style[property as any] = value;
    } else {
      span.style[property as any] = '';
    }
    
    const fragment = range.extractContents();
    span.appendChild(fragment);
    range.insertNode(span);

    selection.removeAllRanges();
    selection.addRange(range);
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
    applyFormattingToSelection,
    applyFormattingToAll,
    saveSelection,
    restoreSelection
  };
};
