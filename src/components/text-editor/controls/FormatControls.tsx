
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
    const command = formatType === 'bold' ? 'bold' : 'italic';
    document.execCommand(command, false);
  };

  return (
    <div className="flex gap-1">
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => handleFormatClick('bold')}
        className={`hover:bg-emerald-700/20 ${format.includes('bold') ? 'bg-emerald-700/20' : ''}`}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline"
        size="icon"
        onClick={() => handleFormatClick('italic')}
        className={`hover:bg-emerald-700/20 ${format.includes('italic') ? 'bg-emerald-700/20' : ''}`}
      >
        <Italic className="h-4 w-4" />
      </Button>
    </div>
  );
};
