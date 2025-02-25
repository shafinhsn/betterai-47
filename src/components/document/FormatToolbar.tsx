
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  SpellCheck, 
  TextQuote, 
  Pencil, 
  Save 
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface FormatToolbarProps {
  isEditing: boolean;
  isProcessing: boolean;
  fontSize: number;
  fontFamily: string;
  alignment: 'left' | 'center' | 'right';
  setFontSize: (size: number) => void;
  setFontFamily: (font: string) => void;
  setAlignment: (align: 'left' | 'center' | 'right') => void;
  onGrammarCheck: () => Promise<void>;
  onFormatMLA: () => Promise<void>;
  onFormatAPA: () => Promise<void>;
  onEditToggle: () => void;
  onSave: () => void;
}

const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 48, 72];

export const FormatToolbar = ({
  isEditing,
  isProcessing,
  fontSize,
  fontFamily,
  alignment,
  setFontSize,
  setFontFamily,
  setAlignment,
  onGrammarCheck,
  onFormatMLA,
  onFormatAPA,
  onEditToggle,
  onSave,
}: FormatToolbarProps) => {
  return (
    <div className="sticky top-0 z-10 flex flex-col gap-2 p-2 bg-[#1a1a1a] border-b border-emerald-900/20">
      <div className="flex items-center gap-2">
        <Select
          value={fontFamily}
          onValueChange={setFontFamily}
        >
          <SelectTrigger className="w-[180px] bg-[#2a2a2a] text-emerald-50 border-emerald-800/30 hover:bg-emerald-800/30">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Inter">Inter</SelectItem>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Playfair Display">Playfair Display</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={fontSize.toString()}
          onValueChange={(value) => setFontSize(Number(value))}
        >
          <SelectTrigger className="w-[80px] bg-[#2a2a2a] text-emerald-50 border-emerald-800/30 hover:bg-emerald-800/30">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            {fontSizes.map((size) => (
              <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAlignment('left')}
            className={`p-2 ${alignment === 'left' ? 'bg-emerald-800/30' : ''}`}
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAlignment('center')}
            className={`p-2 ${alignment === 'center' ? 'bg-emerald-800/30' : ''}`}
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAlignment('right')}
            className={`p-2 ${alignment === 'right' ? 'bg-emerald-800/30' : ''}`}
          >
            <AlignRight className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <Button
          variant="outline"
          size="sm"
          onClick={onGrammarCheck}
          disabled={isProcessing}
          className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
        >
          <SpellCheck className="w-4 h-4 mr-2" />
          Check Grammar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onFormatMLA}
          disabled={isProcessing}
          className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
        >
          <TextQuote className="w-4 h-4 mr-2" />
          MLA
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onFormatAPA}
          disabled={isProcessing}
          className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
        >
          <TextQuote className="w-4 h-4 mr-2" />
          APA
        </Button>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onEditToggle}
            disabled={isProcessing}
            className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={isProcessing}
            className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>
    </div>
  );
};
