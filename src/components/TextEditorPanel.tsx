
import { useState, useEffect } from 'react';
import { TextEditorContent } from './text-editor/TextEditorContent';
import { Button } from './ui/button';
import { Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface TextEditorPanelProps {
  updatedContent: string;
  content: string;
  previewKey: number;
  onManualUpdate: () => void;
  isEditable?: boolean;
}

export const TextEditorPanel = ({ 
  updatedContent, 
  content, 
  onManualUpdate,
  isEditable = false
}: TextEditorPanelProps) => {
  const [editableContent, setEditableContent] = useState(updatedContent || content);
  const navigate = useNavigate();

  useEffect(() => {
    setEditableContent(updatedContent || content);
  }, [updatedContent, content]);

  return (
    <div className="bg-[#1f1f1f] rounded-lg p-6 h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-200">Updated Preview</h3>
          {!isEditable && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/preview')}
              className="hover:bg-emerald-900/20"
            >
              <Pencil className="h-4 w-4 text-emerald-500" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 h-[calc(100%-3rem)]">
        <TextEditorContent
          content={editableContent}
          onContentChange={setEditableContent}
          lastCaretPosition={null}
          isEditable={isEditable}
        />
      </div>
    </div>
  );
};
