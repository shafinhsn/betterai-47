
import { useState } from 'react';
import { DocumentFormat, DocumentAlignment } from '@/types/document-formatting';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

export const useDocumentFormatting = (
  content: string,
  onContentUpdate?: (newContent: string) => void
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Inter');
  const [alignment, setAlignment] = useState<DocumentAlignment>('left');
  const [format, setFormat] = useState<DocumentFormat>('none');
  const { toast } = useToast();

  const setDocumentFormat = (newFormat: DocumentFormat) => {
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
          content,
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
          content,
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
          content,
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

  return {
    fontSize,
    fontFamily,
    alignment,
    format,
    isProcessing,
    setFontSize,
    setFontFamily,
    setAlignment,
    setDocumentFormat,
    handleFormatMLA,
    handleFormatAPA,
    handleGrammarCheck,
  };
};
