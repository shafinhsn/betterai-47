
import React, { useRef, useCallback, useEffect } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { TextEditorToolbar } from './TextEditorToolbar';
import { saveSelection, restoreSelection } from './utils/selection';

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

  const handleSaveSelection = useCallback(() => {
    if (!editorRef.current) return;
    lastSelectionRef.current = saveSelection(editorRef.current, scrollAreaRef.current);
  }, []);

  const handleRestoreSelection = useCallback(() => {
    if (!lastSelectionRef.current || !editorRef.current) return;
    restoreSelection(editorRef.current, scrollAreaRef.current, lastSelectionRef.current);
  }, []);

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    if (!isEditable || isComposingRef.current) return;
    
    handleSaveSelection();
    const newContent = e.currentTarget.innerHTML;
    onContentChange(newContent);
    requestAnimationFrame(() => {
      handleRestoreSelection();
    });
  }, [onContentChange, handleSaveSelection, handleRestoreSelection, isEditable]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isEditable) return;
    
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '\u00a0\u00a0\u00a0\u00a0');
      handleSaveSelection();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '<br><br>');
      handleSaveSelection();
    } else if (e.key === ' ') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '\u00a0');
      handleSaveSelection();
    }

    // Handle undo/redo keyboard shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        document.execCommand('redo', false);
      } else {
        document.execCommand('undo', false);
      }
      if (editorRef.current) {
        handleInput({ currentTarget: editorRef.current } as React.FormEvent<HTMLDivElement>);
      }
    }
  }, [handleSaveSelection, handleInput, isEditable]);

  const handleFormatting = (command: string) => {
    if (!isEditable) return;
    handleSaveSelection();
    document.execCommand(command, false);
    if (editorRef.current) {
      handleInput({ currentTarget: editorRef.current } as React.FormEvent<HTMLDivElement>);
    }
    handleRestoreSelection();
  };

  const handleFontSize = (size: string) => {
    if (!isEditable || !editorRef.current) return;
    handleSaveSelection();
    document.execCommand('fontSize', false, '7');
    const fonts = editorRef.current.getElementsByTagName('font');
    for (let i = 0; i < fonts.length; i++) {
      if (fonts[i].size === '7') {
        fonts[i].removeAttribute('size');
        fonts[i].style.fontSize = `${size}px`;
      }
    }
    handleInput({ currentTarget: editorRef.current } as React.FormEvent<HTMLDivElement>);
    handleRestoreSelection();
  };

  const handleFontFamily = (font: string) => {
    if (!isEditable || !editorRef.current) return;
    handleSaveSelection();
    document.execCommand('fontName', false, font);
    handleInput({ currentTarget: editorRef.current } as React.FormEvent<HTMLDivElement>);
    handleRestoreSelection();
  };

  const handleUndo = () => {
    if (!isEditable || !editorRef.current) return;
    document.execCommand('undo', false);
    handleInput({ currentTarget: editorRef.current } as React.FormEvent<HTMLDivElement>);
  };

  const handleRedo = () => {
    if (!isEditable || !editorRef.current) return;
    document.execCommand('redo', false);
    handleInput({ currentTarget: editorRef.current } as React.FormEvent<HTMLDivElement>);
  };

  const handleScroll = useCallback(() => {
    if (scrollAreaRef.current) {
      lastSelectionRef.current = {
        ...lastSelectionRef.current!,
        scrollTop: scrollAreaRef.current.scrollTop
      };
    }
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.addEventListener('compositionstart', () => {
        isComposingRef.current = true;
      });
      editorRef.current.addEventListener('compositionend', () => {
        isComposingRef.current = false;
      });
    }
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {isEditable && (
        <TextEditorToolbar
          onFormatting={handleFormatting}
          onFontSize={handleFontSize}
          onFontFamily={handleFontFamily}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
      )}

      <ScrollArea 
        className="h-[500px] overflow-y-auto border border-border/20 rounded-lg bg-[#1a1a1a]"
        ref={scrollAreaRef}
        onScroll={handleScroll}
      >
        <div 
          ref={editorRef}
          className="p-6 min-h-[200px] w-full focus:outline-none text-base"
          contentEditable={isEditable}
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          dangerouslySetInnerHTML={{ __html: content }}
          style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            lineHeight: '1.5',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        />
      </ScrollArea>
    </div>
  );
};
