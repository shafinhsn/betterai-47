
import { useState } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

export type TextAlignment = 'left' | 'center' | 'right' | 'justify';
export type FormatOption = 'bold' | 'italic';
export type CitationStyle = 'none' | 'apa' | 'mla' | 'chicago' | 'harvard';
export type FontFamily = 'Arial' | 'Times New Roman' | 'Courier New' | 'Georgia' | 'Verdana';

interface Source {
  link: string;
  title: string;
  author?: string;
  publishDate?: string;
}

export interface TextEditorState {
  font: FontFamily;
  size: string;
  alignment: TextAlignment;
  format: FormatOption[];
  citationStyle: CitationStyle;
  sources: Source[];
  isLoading: boolean;
}

export interface TextEditorActions {
  handleFormatChange: (value: FormatOption[]) => void;
  handleFontChange: (value: FontFamily) => void;
  handleSizeChange: (value: string) => void;
  handleAlignmentChange: (value: TextAlignment) => void;
  handleCitationStyleChange: (value: CitationStyle) => void;
  handleAddSourceLink: (sourceLink: string, sourceTitle: string, authorName?: string, publishDate?: string) => void;
}

export type TextEditorHookReturn = TextEditorState & TextEditorActions;

export const useTextEditor = (): TextEditorHookReturn => {
  const [font, setFont] = useState<FontFamily>('Arial');
  const [size, setSize] = useState('16');
  const [alignment, setAlignment] = useState<TextAlignment>('left');
  const [format, setFormat] = useState<FormatOption[]>([]);
  const [citationStyle, setCitationStyle] = useState<CitationStyle>('none');
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleAddSourceLink = async (sourceLink: string, sourceTitle: string, authorName?: string, publishDate?: string) => {
    const newSource = {
      link: sourceLink,
      title: sourceTitle,
      author: authorName,
      publishDate: publishDate
    };
    
    setSources(prev => [...prev, newSource]);
    
    if (citationStyle !== 'none') {
      await handleCitationStyleChange(citationStyle);
    }
    
    toast.success("Source added successfully");
  };

  const handleCitationStyleChange = async (value: CitationStyle) => {
    try {
      if (value === 'none') {
        setCitationStyle(value);
        return;
      }

      const editorContent = document.querySelector('[contenteditable]');
      if (!editorContent || sources.length === 0) {
        toast.error("Please add sources before applying citations");
        return;
      }

      setIsLoading(true);
      const text = editorContent.textContent || '';

      const { data, error } = await supabase.functions.invoke('format-citation', {
        body: { 
          text,
          style: value,
          sources,
        },
      });

      if (error) throw error;

      if (data?.formattedText && data?.sourcesPage) {
        editorContent.innerHTML = `${data.formattedText}\n\n${data.sourcesPage}`;
        setCitationStyle(value);
        toast.success(`Applied ${value.toUpperCase()} citations`);
      }
    } catch (error) {
      console.error('Error formatting citations:', error);
      toast.error('Failed to format citations');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    font,
    size,
    alignment,
    format,
    citationStyle,
    sources,
    isLoading,
    handleFormatChange,
    handleFontChange,
    handleSizeChange,
    handleAlignmentChange,
    handleCitationStyleChange,
    handleAddSourceLink,
  };
};
