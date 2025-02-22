
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

    // Get the selected text
    const selectedText = range.toString();
    
    // Create a temporary element to check if the selected text is already formatted
    const temp = document.createElement('div');
    temp.innerHTML = selectedText;
    
    // Check if the format is already applied
    const isFormatApplied = document.queryCommandState(format);

    // Execute the command to toggle the format
    document.execCommand(format, false);

    // Restore the selection
    selection.removeAllRanges();
    selection.addRange(savedRange);

    // Save the new selection state
    saveSelection();
  };

  return {
    lastCaretPosition,
    toggleFormat,
    saveSelection,
    restoreSelection
  };
};
