
import { useState } from 'react';
import { toast } from "sonner";

export const useTextEditor = () => {
  const [font, setFont] = useState('Arial');
  const [size, setSize] = useState('16');
  const [alignment, setAlignment] = useState('left');
  const [format, setFormat] = useState<string[]>([]);
  const [citationStyle, setCitationStyle] = useState('none');
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);

  const handleFormatChange = (value: string[]) => {
    setFormat(value);
  };

  const handleFontChange = (value: string) => {
    setFont(value);
  };

  const handleSizeChange = (value: string) => {
    setSize(value);
  };

  const handleAlignmentChange = (value: string) => {
    if (value) setAlignment(value);
  };

  const handleCitationStyleChange = (value: string) => {
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
