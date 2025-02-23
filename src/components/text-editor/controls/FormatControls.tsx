
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
  const handleFormatClick = (formatType: FormatOption, value?: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (selectedText.length > 0) {
      if (formatType === 'bold' || formatType === 'italic') {
        document.execCommand(formatType, false);
      } else {
        const span = document.createElement('span');
        if (formatType === 'fontName') {
          span.style.fontFamily = value!;
        } else if (formatType === 'fontSize') {
          span.style.fontSize = value! + 'px';
        }
        span.appendChild(document.createTextNode(selectedText));
        range.deleteContents();
        range.insertNode(span);
      }
    } else {
      // If no text is selected, apply formatting to the whole editor
      document.execCommand(formatType, false);
    }

    const newFormat = format.includes(formatType)
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
