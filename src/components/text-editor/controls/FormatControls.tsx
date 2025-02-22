
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
  const isFormatActive = (formatType: FormatOption) => {
    if (typeof document === 'undefined') return false;
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return format.includes(formatType);
    
    if (selection.toString().length === 0) {
      return format.includes(formatType);
    }

    switch (formatType) {
      case 'bold':
        return document.queryCommandState('bold');
      case 'italic':
        return document.queryCommandState('italic');
      default:
        return false;
    }
  };

  const handleFormatClick = (formatType: FormatOption) => {
    onFormatChange([formatType]);
  };

  return (
    <div className="flex gap-1">
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => handleFormatClick('bold')}
        className={`hover:bg-emerald-700/20 ${isFormatActive('bold') ? 'bg-emerald-700/20' : ''}`}
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline"
        size="icon"
        onClick={() => handleFormatClick('italic')}
        className={`hover:bg-emerald-700/20 ${isFormatActive('italic') ? 'bg-emerald-700/20' : ''}`}
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
    </div>
  );
};
