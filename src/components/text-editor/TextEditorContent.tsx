
import React, { useRef, useEffect } from 'react';
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

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML;
    onContentChange(content);
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.fontFamily = font;
      editorRef.current.style.fontSize = `${size}px`;
      editorRef.current.style.textAlign = alignment;
    }
  }, [font, size, alignment]);

  return (
    <ScrollArea className="h-[calc(100%-5rem)] overflow-y-auto">
      <div 
        ref={editorRef}
        className="bg-[#242424] rounded p-6 min-h-[200px] w-full"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: content }}
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          lineHeight: '1.5',
          outline: 'none',
          maxWidth: '100%',
          height: 'auto',
          minHeight: '200px'
        }}
      />
    </ScrollArea>
  );
};
