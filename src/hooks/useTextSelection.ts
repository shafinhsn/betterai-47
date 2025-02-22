
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
      }
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
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    // Save current selection
    const savedSelection = selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;

    if (selection.toString().length > 0) {
      // Text is selected - apply formatting only to selection
      document.execCommand(format, false);
    } else {
      // No text selected - toggle format state for future input
      const formatKey = format === 'bold' ? 'isBold' : 'isItalic';
      formatStateRef.current[formatKey] = !formatStateRef.current[formatKey];
      
      // Create a new span with the formatting
      const span = document.createElement('span');
      if (formatStateRef.current[formatKey]) {
        span.style.fontWeight = format === 'bold' ? 'bold' : 'normal';
        span.style.fontStyle = format === 'italic' ? 'italic' : 'normal';
      }
      
      // Insert the span at cursor position
      document.execCommand('insertHTML', false, span.outerHTML);
    }

    // Restore the selection
    if (savedSelection) {
      selection.removeAllRanges();
      selection.addRange(savedSelection);
    }

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
