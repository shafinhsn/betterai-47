
import { useState } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

export type TextAlignment = 'left' | 'center' | 'right' | 'justify';
export type FormatOption = 'bold' | 'italic';
export type CitationStyle = 'none' | 'apa' | 'mla' | 'chicago' | 'harvard';
export type FontFamily = 'Arial' | 'Times New Roman' | 'Courier New' | 'Georgia' | 'Verdana';

export interface TextEditorState {
  font: FontFamily;
  size: string;
  alignment: TextAlignment;
  format: FormatOption[];
  citationStyle: CitationStyle;
  isCheckingPlagiarism: boolean;
}

export interface TextEditorActions {
  handleFormatChange: (value: FormatOption[]) => void;
  handleFontChange: (value: FontFamily) => void;
  handleSizeChange: (value: string) => void;
  handleAlignmentChange: (value: TextAlignment) => void;
  handleCitationStyleChange: (value: CitationStyle) => void;
  handlePlagiarismCheck: () => Promise<void>;
}

export type TextEditorHookReturn = TextEditorState & TextEditorActions;

export const useTextEditor = (): TextEditorHookReturn => {
  const [font, setFont] = useState<FontFamily>('Arial');
  const [size, setSize] = useState('16');
  const [alignment, setAlignment] = useState<TextAlignment>('left');
  const [format, setFormat] = useState<FormatOption[]>([]);
  const [citationStyle, setCitationStyle] = useState<CitationStyle>('none');
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);

  const handleFormatChange = (value: FormatOption[]) => {
    setFormat(value);
  };

  const handleFontChange = (value: FontFamily) => {
    setFont(value);
  };

  const handleSizeChange = (value: string) => {
    setSize(value);
  };

  const handleAlignmentChange = (value: TextAlignment) => {
    setAlignment(value);
  };

  const extractQuotes = (text: string): string[] => {
    const quoteRegex = /"([^"]*)"|'([^']*)'|"([^"]*)"|'([^']*)'|"([^"]*)"|'([^']*)'/g;
    const matches = text.match(quoteRegex);
    return matches ? matches.map(quote => quote.slice(1, -1)) : [];
  };

  const handleCitationStyleChange = async (value: CitationStyle) => {
    try {
      if (value === 'none') {
        setCitationStyle(value);
        return;
      }

      const editorContent = document.querySelector('[contenteditable]');
      if (!editorContent) return;

      const text = editorContent.textContent || '';
      const quotes = extractQuotes(text);

      if (quotes.length === 0) {
        toast.error("No quotes found in the text");
        return;
      }

      const { data, error } = await supabase.functions.invoke('format-citation', {
        body: { 
          quotes,
          style: value,
          fullText: text // Send full text for context
        },
      });

      if (error) throw error;

      if (data?.citations) {
        // Replace each quote with its cited version
        let newContent = text;
        quotes.forEach((quote, index) => {
          const citation = data.citations[index];
          newContent = newContent.replace(`"${quote}"`, `"${quote}" ${citation}`);
          newContent = newContent.replace(`'${quote}'`, `'${quote}' ${citation}`);
        });

        if (editorContent) {
          editorContent.innerHTML = newContent;
        }
        setCitationStyle(value);
        toast.success(`Applied ${value.toUpperCase()} citations to quotes`);
      }
    } catch (error) {
      console.error('Error formatting citations:', error);
      toast.error('Failed to format citations');
    }
  };

  const handlePlagiarismCheck = async () => {
    try {
      setIsCheckingPlagiarism(true);
      const text = document.querySelector('[contenteditable]')?.textContent || '';

      const { data, error } = await supabase.functions.invoke('check-plagiarism', {
        body: { text },
      });

      if (error) throw error;

      if (data?.isOriginal) {
        toast.success("Document checked for plagiarism - No issues found", {
          description: `Similarity score: ${data.similarityScore.toFixed(1)}%`,
          duration: 5000,
        });
      } else {
        toast.error("Potential plagiarism detected", {
          description: `Similarity score: ${data.similarityScore.toFixed(1)}%`,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error checking plagiarism:', error);
      toast.error("Error checking for plagiarism");
    } finally {
      setIsCheckingPlagiarism(false);
    }
  };

  return {
    font,
    size,
    alignment,
    format,
    citationStyle,
    isCheckingPlagiarism,
    handleFormatChange,
    handleFontChange,
    handleSizeChange,
    handleAlignmentChange,
    handleCitationStyleChange,
    handlePlagiarismCheck,
  };
};
