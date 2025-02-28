
import { forwardRef, memo, CSSProperties, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { FormatToolbar } from './document/FormatToolbar';
import { DocumentContent } from './document/DocumentContent';
import { useDocumentFormatting } from '@/hooks/useDocumentFormatting';

interface DocumentPreviewProps {
  content: string;
  style?: CSSProperties;
  onContentUpdate?: (newContent: string) => void;
}

const DocumentPreviewComponent = forwardRef<HTMLDivElement, DocumentPreviewProps>(
  ({ content, style, onContentUpdate }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(content);
    const [lastSavedContent, setLastSavedContent] = useState(content);
    const [isAIModified, setIsAIModified] = useState(false);
    const { toast } = useToast();

    const {
      fontSize,
      fontFamily,
      alignment,
      format,
      isProcessing,
      setFontSize,
      setFontFamily,
      setAlignment,
      handleFormatMLA,
      handleFormatAPA,
      handleGrammarCheck,
    } = useDocumentFormatting(editedContent || content, onContentUpdate);

    useEffect(() => {
      setEditedContent(content);
      setLastSavedContent(content);
      if (content !== editedContent) {
        setIsAIModified(true);
      }
    }, [content]);

    const handleSave = () => {
      if (onContentUpdate) {
        onContentUpdate(editedContent);
        setLastSavedContent(editedContent);
        setIsEditing(false);
        toast({
          title: "Changes saved",
          description: "Your edits have been saved successfully.",
        });
        setIsAIModified(false);
      }
    };

    const handleCancel = () => {
      setEditedContent(lastSavedContent);
      setIsEditing(false);
      toast({
        title: "Edits canceled",
        description: "Your changes have been discarded.",
      });
    };

    if (!content) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          No content available
        </div>
      );
    }

    return (
      <div className="document-preview h-full" ref={ref}>
        <FormatToolbar
          isEditing={isEditing}
          isProcessing={isProcessing}
          fontSize={fontSize}
          fontFamily={fontFamily}
          alignment={alignment}
          content={editedContent || content}
          isAIModified={isAIModified}
          setFontSize={setFontSize}
          setFontFamily={setFontFamily}
          setAlignment={setAlignment}
          onGrammarCheck={handleGrammarCheck}
          onFormatMLA={handleFormatMLA}
          onFormatAPA={handleFormatAPA}
          onEditToggle={() => setIsEditing(true)}
          onSave={handleSave}
          onCancel={handleCancel}
        />
        <DocumentContent
          content={content}
          isEditing={isEditing}
          editedContent={editedContent}
          format={format}
          style={style}
          fontFamily={fontFamily}
          fontSize={fontSize}
          alignment={alignment}
          onEditedContentChange={setEditedContent}
        />
      </div>
    );
  }
);

DocumentPreviewComponent.displayName = 'DocumentPreview';

export const DocumentPreview = memo(DocumentPreviewComponent);
