
import { useState } from 'react';
import { toast } from "sonner";

export type TextAlignment = 'left' | 'center' | 'right' | 'justify';
export type FormatOption = 'bold' | 'italic';
export type FontFamily = 'Arial' | 'Times New Roman' | 'Courier New' | 'Georgia' | 'Verdana';

export interface TextEditorState {
  font: FontFamily;
  size: string;
  alignment: TextAlignment;
  format: FormatOption[];
  isLoading: boolean;
}

export interface TextEditorActions {
  handleFormatChange: (value: FormatOption[]) => void;
  handleFontChange: (value: FontFamily) => void;
  handleSizeChange: (value: string) => void;
  handleAlignmentChange: (value: TextAlignment) => void;
}

export type TextEditorHookReturn = TextEditorState & TextEditorActions;

export const useTextEditor = (): TextEditorHookReturn => {
  const [font, setFont] = useState<FontFamily>('Arial');
  const [size, setSize] = useState('16');
  const [alignment, setAlignment] = useState<TextAlignment>('left');
  const [format, setFormat] = useState<FormatOption[]>([]);
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

  return {
    font,
    size,
    alignment,
    format,
    isLoading,
    handleFormatChange,
    handleFontChange,
    handleSizeChange,
    handleAlignmentChange,
  };
};
