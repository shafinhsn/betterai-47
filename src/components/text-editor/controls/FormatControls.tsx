
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
    return document.queryCommandState(formatType);
  };

  const handleFormatClick = (formatType: FormatOption) => {
    document.execCommand(formatType, false);
    const newFormat = isFormatActive(formatType) 
      ? format.filter(f => f !== formatType)
      : [...format, formatType];
    onFormatChange(newFormat);
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
