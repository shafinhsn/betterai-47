
import React, { useRef, useEffect, useCallback } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Bold, Italic, Undo } from 'lucide-react';

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

    if (scrollAreaRef.current && lastSelectionRef.current.scrollTop) {
      scrollAreaRef.current.scrollTop = lastSelectionRef.current.scrollTop;
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
    requestAnimationFrame(() => {
      restoreSelection();
    });
  }, [onContentChange, saveSelection, restoreSelection, isEditable]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isEditable) return;
    
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '\u00a0\u00a0\u00a0\u00a0');
      saveSelection();
    }

    // Allow default browser undo/redo functionality
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        document.execCommand('redo');
      } else {
        document.execCommand('undo');
      }
      if (editorRef.current) {
        handleInput({ currentTarget: editorRef.current } as React.FormEvent<HTMLDivElement>);
      }
    }
  }, [saveSelection, isEditable, handleInput]);

  const handleFormatting = (command: string) => {
    if (!isEditable) return;
    document.execCommand(command, false);
    if (editorRef.current) {
      handleInput({ currentTarget: editorRef.current } as React.FormEvent<HTMLDivElement>);
    }
  };

  const handleFontSize = (size: string) => {
    if (!isEditable || !editorRef.current) return;
    document.execCommand('fontSize', false, size);
    handleInput({ currentTarget: editorRef.current } as React.FormEvent<HTMLDivElement>);
  };

  const handleFontFamily = (font: string) => {
    if (!isEditable || !editorRef.current) return;
    document.execCommand('fontName', false, font);
    handleInput({ currentTarget: editorRef.current } as React.FormEvent<HTMLDivElement>);
  };

  const handleUndo = () => {
    if (!isEditable || !editorRef.current) return;
    document.execCommand('undo');
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

  return (
    <div className="flex flex-col gap-2">
      {isEditable && (
        <div className="flex items-center gap-2 p-2 bg-[#1a1a1a] rounded-t-lg">
          <Select onValueChange={handleFontSize}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={handleFontFamily}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Courier New">Courier New</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleFormatting('bold')}
            className="hover:bg-emerald-900/20"
          >
            <Bold className="h-4 w-4 text-emerald-500" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleFormatting('italic')}
            className="hover:bg-emerald-900/20"
          >
            <Italic className="h-4 w-4 text-emerald-500" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleUndo}
            className="hover:bg-emerald-900/20"
          >
            <Undo className="h-4 w-4 text-emerald-500" />
          </Button>
        </div>
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
