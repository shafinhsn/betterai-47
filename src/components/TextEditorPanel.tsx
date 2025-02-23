
import { useState, useEffect } from 'react';
import { TextEditorContent } from './text-editor/TextEditorContent';

export interface TextEditorPanelProps {
  updatedContent: string;
  content: string;
  previewKey: number;
  onManualUpdate: () => void;
}

export const TextEditorPanel = ({ 
  updatedContent, 
  content, 
  onManualUpdate 
}: TextEditorPanelProps) => {
  const [editableContent, setEditableContent] = useState(updatedContent || content);

  useEffect(() => {
    setEditableContent(updatedContent || content);
  }, [updatedContent, content]);

  return (
    <div className="bg-[#1f1f1f] rounded-lg p-6 h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-200">Updated Preview</h3>
      </div>

      <div className="flex-1 h-[calc(100%-3rem)]">
        <TextEditorContent
          content={editableContent}
          onContentChange={setEditableContent}
          lastCaretPosition={null}
        />
      </div>
    </div>
  );
};
