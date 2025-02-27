import { forwardRef, memo, CSSProperties, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { FormatToolbar } from './document/FormatToolbar';
import { DocumentContent } from './document/DocumentContent';

interface DocumentPreviewProps {
  content: string;
  style?: CSSProperties;
  onContentUpdate?: (newContent: string) => void;
}

const DocumentPreviewComponent = forwardRef<HTMLDivElement, DocumentPreviewProps>(
  ({ content, style, onContentUpdate }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(content);
    const [isProcessing, setIsProcessing] = useState(false);
    const [fontSize, setFontSize] = useState(16);
    const [fontFamily, setFontFamily] = useState('Inter');
    const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');
    const [format, setFormat] = useState<'none' | 'mla' | 'apa'>('none');
    const [isAIModified, setIsAIModified] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
      setEditedContent(content);
      if (content !== editedContent) {
        setIsAIModified(true);
      }
    }, [content]);

    const handleSave = () => {
      if (onContentUpdate) {
        onContentUpdate(editedContent);
        setIsEditing(false);
        toast({
          title: "Changes saved",
          description: "Your edits have been saved successfully.",
        });
        setIsAIModified(false);
      }
    };

    const setDocumentFormat = (newFormat: 'none' | 'mla' | 'apa') => {
      setFormat(newFormat);
      if (newFormat === 'mla' || newFormat === 'apa') {
        setFontFamily('Times New Roman');
        setFontSize(12);
      }
    };

    const handleFormatMLA = async () => {
      setIsProcessing(true);
      try {
        const { data, error } = await supabase.functions.invoke('document-format', {
          body: {
            content: editedContent || content,
            action: 'mla',
            metadata: {
              authorName: 'Your Name',
              professorName: 'Professor Name',
              courseName: 'Course Name',
              title: 'Document Title'
            }
          }
        });

        if (error) throw error;
        
        if (onContentUpdate && data.content) {
          onContentUpdate(data.content);
          setDocumentFormat('mla');
          toast({
            title: "MLA Format Applied",
            description: "Document has been formatted using MLA style.",
          });
        }
      } catch (error) {
        console.error('Error formatting MLA:', error);
        toast({
          title: "Error",
          description: "Failed to apply MLA formatting. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    const handleFormatAPA = async () => {
      setIsProcessing(true);
      try {
        const { data, error } = await supabase.functions.invoke('document-format', {
          body: {
            content: editedContent || content,
            action: 'apa',
            metadata: {
              authorName: 'Your Name',
              institution: 'Institution Name',
              title: 'Document Title'
            }
          }
        });

        if (error) throw error;
        
        if (onContentUpdate && data.content) {
          onContentUpdate(data.content);
          setDocumentFormat('apa');
          toast({
            title: "APA Format Applied",
            description: "Document has been formatted using APA style.",
          });
        }
      } catch (error) {
        console.error('Error formatting APA:', error);
        toast({
          title: "Error",
          description: "Failed to apply APA formatting. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    const handleGrammarCheck = async () => {
      setIsProcessing(true);
      try {
        const { data, error } = await supabase.functions.invoke('document-format', {
          body: {
            content: editedContent || content,
            action: 'grammar'
          }
        });

        if (error) throw error;
        
        if (onContentUpdate && data.content) {
          onContentUpdate(data.content);
          toast({
            title: "Grammar Check Complete",
            description: "Your document has been checked and corrected.",
          });
        }
      } catch (error) {
        console.error('Error checking grammar:', error);
        toast({
          title: "Error",
          description: "Failed to check grammar. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
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
