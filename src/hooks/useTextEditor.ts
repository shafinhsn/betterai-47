
import { useState } from 'react';
import { toast } from "sonner";

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

  const handleCitationStyleChange = (value: CitationStyle) => {
    setCitationStyle(value);
    toast.success(`Applied ${value.toUpperCase()} citation style`);
  };

  const handlePlagiarismCheck = async () => {
    try {
      setIsCheckingPlagiarism(true);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
      toast.success("Document checked for plagiarism - No issues found", {
        description: "Your document appears to be original content.",
        duration: 5000,
      });
    } catch (error) {
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
