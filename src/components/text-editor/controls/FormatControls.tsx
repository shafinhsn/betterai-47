
import { Bold, Italic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormatOption } from '@/hooks/useTextEditor';

interface FormatControlsProps {
  format: FormatOption[];
  onFormatChange: (value: FormatOption[]) => void;
}

export const FormatControls = ({
  format,
  onFormatChange,
}: FormatControlsProps) => {
  const handleFormatClick = (formatType: FormatOption) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (formatType === 'bold' || formatType === 'italic') {
      document.execCommand(formatType, false);
      
      // Update format state after applying formatting
      const newFormat = format.includes(formatType)
        ? format.filter(f => f !== formatType)
        : [...format, formatType];
      onFormatChange(newFormat);
    }
  };

  return (
    <div className="flex gap-1">
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => handleFormatClick('bold')}
        className={`hover:bg-emerald-700/20 ${format.includes('bold') ? 'bg-emerald-700/20' : ''}`}
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline"
        size="icon"
        onClick={() => handleFormatClick('italic')}
        className={`hover:bg-emerald-700/20 ${format.includes('italic') ? 'bg-emerald-700/20' : ''}`}
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
    </div>
  );
};
